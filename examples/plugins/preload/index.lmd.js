(function (global, main, modules, modules_options, options) {
    var initialized_modules = {},
        global_eval = function (code) {
            return global.Function('return ' + code)();
        },
        global_noop = function () {},
        global_document = global.document,
        local_undefined,
        /**
         * @param {String} moduleName module name or path to file
         * @param {*}      module module content
         *
         * @returns {*}
         */
        register_module = function (moduleName, module) {
            lmd_trigger('lmd-register:before-register', moduleName, module);
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                // or load modules from nodejs/worker environment
                module = lmd_trigger('js:request-environment-module', moduleName, module)[1] || global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                var module_require = lmd_trigger('lmd-register:decorate-require', moduleName, lmd_require)[1];

                // Make sure that sandboxed modules cant require
                if (modules_options[moduleName] &&
                    modules_options[moduleName].sandbox &&
                    typeof module_require === "function") {

                    module_require = local_undefined;
                }

                module = module(module_require, output.exports, output) || output.exports;
            }

            module = lmd_trigger('lmd-register:after-register', moduleName, module)[1];
            return modules[moduleName] = module;
        },
        /**
         * List of All lmd Events
         *
         * @important Do not rename it!
         */
        lmd_events = {},
        /**
         * LMD event trigger function
         *
         * @important Do not rename it!
         */
        lmd_trigger = function (event, data, data2, data3) {
            var list = lmd_events[event],
                result;

            if (list) {
                for (var i = 0, c = list.length; i < c; i++) {
                    result = list[i](data, data2, data3) || result;
                    if (result) {
                        // enable decoration
                        data = result[0] || data;
                        data2 = result[1] || data2;
                        data3 = result[2] || data3;
                    }
                }
            }
            return result || [data, data2, data3];
        },
        /**
         * LMD event register function
         *
         * @important Do not rename it!
         */
        lmd_on = function (event, callback) {
            if (!lmd_events[event]) {
                lmd_events[event] = [];
            }
            lmd_events[event].push(callback);
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        lmd_require = function (moduleName) {
            var module = modules[moduleName];

            lmd_trigger('*:before-check', moduleName, module);
            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                return module;
            }
            var replacement = lmd_trigger('*:rewrite-shortcut', moduleName, module);
            if (replacement) {
                moduleName = replacement[0];
                module = replacement[1];
            }

            lmd_trigger('*:before-init', moduleName, module);

            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}},

        /**
         * Sandbox object for plugins
         *
         * @important Do not rename it!
         */
        sandbox = {
            global: global,
            modules: modules,
            modules_options: modules_options,
            options: options,

            eval: global_eval,
            register: register_module,
            require: lmd_require,
            initialized: initialized_modules,

            noop: global_noop,
            document: global_document,
            
            

            on: lmd_on,
            trigger: lmd_trigger,
            undefined: local_undefined
        };

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }

/**
 * @name sandbox
 */
(function (sb) {
    var domOnlyLoaders = {
        css: true,
        image: true
    };

    /**
      * Load off-package LMD module
      *
      * @param {String|Array} moduleName same origin path to LMD module
      * @param {Function}     [callback]   callback(result) undefined on error others on success
      */
    sb.on('*:preload', function (moduleName, callback, type) {
        var replacement = sb.trigger('*:request-off-package', moduleName, callback, type), // [[returnResult, moduleName, module, true], callback, type]
            returnResult = [replacement[0][0], callback, type];

        if (replacement[0][3]) { // isReturnASAP
            return returnResult;
        }

        var module = replacement[0][2],
            XMLHttpRequestConstructor = sb.global.XMLHttpRequest || sb.global.ActiveXObject;

        callback = replacement[1];
        moduleName = replacement[0][1];

        if (!XMLHttpRequestConstructor) {
            sb.trigger('preload:require-environment-file', moduleName, module, callback);
            return returnResult;
        }

        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    var contentType = xhr.getResponseHeader('content-type');
                    module = xhr.responseText;
                    if ((/script$|json$/).test(contentType)) {
                        module = sb.trigger('*:wrap-module', moduleName, module, contentType)[1];
                        if (!(/json$/).test(contentType)) {
                            module = sb.trigger('*:coverage-apply', moduleName, module)[1];
                        }

                        sb.trigger('preload:before-callback', moduleName, module);
                        module = sb.eval(module);
                    } else {
                        sb.trigger('preload:before-callback', moduleName, module);
                    }

                    if (type === 'preload') {
                        // 4. Declare it
                        sb.modules[moduleName] = module;
                        // 5. Then callback it
                        callback(moduleName);
                    } else {
                        // 4. Callback it
                        callback(sb.register(moduleName, module));
                    }
                } else {
                    sb.trigger('*:request-error', moduleName, module);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return returnResult;

    });

    /**
     * @event *:request-off-package
     *
     * @param {String}   moduleName
     * @param {Function} callback
     * @param {String}   type
     *
     * @retuns yes [asap, returnResult]
     */
    sb.on('*:request-off-package', function (moduleName, callback, type) {
        
        var returnResult = sb.require;
        callback = callback || sb.noop;

        if (typeof moduleName !== "string") {
            callback = sb.trigger('*:request-parallel', moduleName, callback, sb.require[type])[1];
            if (!callback) {
                return [[returnResult, moduleName, module, true], callback, type];
            }
        }

        var module = sb.modules[moduleName];

        var replacement = sb.trigger('*:rewrite-shortcut', moduleName, module);
        if (replacement) {
            moduleName = replacement[0];
            module = replacement[1];
        }

        sb.trigger('*:before-check', moduleName, module, type);
        // If module exists or its a node.js env
        if (module || (domOnlyLoaders[type] && !sb.document)) {
            callback(type === "preload" ? moduleName : sb.initialized[moduleName] ? module : sb.require(moduleName));
            return [[returnResult, moduleName, module, true], callback, type];
        }

        sb.trigger('*:before-init', moduleName, module);

        callback = sb.trigger('*:request-race', moduleName, callback)[1];
        // if already called
        if (!callback) {
            return [[returnResult, moduleName, module, true], callback, type]
        }

        return [[returnResult, moduleName, module, false], callback, type];
    });
}(sandbox));

/**
 * Async loader of off-package LMD modules (special LMD format file)
 *
 * @see /README.md near "LMD Modules types" for details
 *
 * Flag "async"
 *
 * This plugin provides require.preload() function
 */
/**
 * @name sandbox
 */
(function (sb) {
    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    sb.require.preload = function (moduleName, callback) {
        return sb.trigger('*:preload', moduleName, callback, 'preload')[0];
    };

}(sandbox));

/**
 * Parallel resource loader
 *
 * Flag "parallel"
 *
 * This plugin provides private "parallel" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [],
        ready;

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(sb.global, results);
            }
        }
    };

    for (; i < c; i++) {
        ready = readyFactory(i);
        method(items[i], ready);
    }
}

    /**
     * @event *:request-parallel parallel module request for require.async(['a', 'b', 'c']) etc
     *
     * @param {Array}    moduleNames list of modules to init
     * @param {Function} callback    this callback will be called when module inited
     * @param {Function} method      method to call for init
     *
     * @retuns yes empty environment
     */
sb.on('*:request-parallel', function (moduleNames, callback, method) {
    parallel(method, moduleNames, callback);
    return [];
});

}(sandbox));

/**
 * This plugin enables shortcuts
 *
 * Flag "shortcuts"
 *
 * This plugin provides private "is_shortcut" function
 */

/**
 * @name sandbox
 */
(function (sb) {

function is_shortcut(moduleName, moduleContent) {
    return !sb.initialized[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}

function rewrite_shortcut(moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        sb.trigger('shortcuts:before-resolve', moduleName, module);

        moduleName = module.replace('@', '');
        // #66 Shortcut self reference should be resolved as undefined->global name
        var newModule = sb.modules[moduleName];
        module = newModule === module ? sb.undefined : newModule;
    }
    return [moduleName, module];
}

    /**
     * @event *:rewrite-shortcut request for shortcut rewrite
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('*:rewrite-shortcut', rewrite_shortcut);

    /**
     * @event *:rewrite-shortcut fires before stats plugin counts require same as *:rewrite-shortcut
     *        but without triggering shortcuts:before-resolve event
     *
     * @param {String} moduleName race for module name
     * @param {String} module     this callback will be called when module inited
     *
     * @retuns yes returns modified moduleName and module itself
     */
sb.on('stats:before-require-count', function (moduleName, module) {
    if (is_shortcut(moduleName, module)) {
        moduleName = module.replace('@', '');
        module = sb.modules[moduleName];

        return [moduleName, module];
    }
});

}(sandbox));

/**
 * @name sandbox
 */
(function (sb) {


/**
 * @param code
 * @return {Boolean} true if it is a plain LMD module
 */
var async_is_plain_code = function (code) {
    // remove comments (bad rx - I know it, but it works for that case), spaces and ;
    code = code.replace(/\/\*.*?\*\/|\/\/.*(?=[\n\r])|\s|\;/g, '');

    // simple FD/FE parser
    if (/\(function\(|function[a-z0-9_]+\(/.test(code)) {
        var index = 0,
            length = code.length,
            is_can_return = false,
            string = false,
            parentheses = 0,
            braces = 0;

        while (index < length) {
            switch (code.charAt(index)) {
                // count braces if not in string
                case '{':
                    if (!string) {
                        is_can_return = true;
                        braces++
                    }
                    break;
                case '}':
                    if (!string) braces--;
                    break;

                case '(':
                    if (!string) parentheses++;
                    break;
                case ')':
                    if (!string) parentheses--;
                    break;

                case '\\':
                    if (string) index++; // skip next char in in string
                    break;

                case "'":
                    if (string === "'") {
                        string = false; // close string
                    } else if (string === false) {
                        string = "'"; // open string
                    }
                    break;

                case '"':
                    if (string === '"') {
                        string = false; // close string
                    } else if (string === false) {
                        string = '"'; // open string
                    }
                    break;
            }
            index++;

            if (is_can_return && !parentheses && !braces) {
                return index !== length;
            }
        }
    }
    return true;
};

var async_plain = function (module, contentTypeOrExtension) {
    // its NOT a JSON ant its a plain code
    if (!(/json$/).test(contentTypeOrExtension)/*if ($P.ASYNC_PLAIN) {*/ && async_is_plain_code(module)/*}*/) {
        // its not a JSON and its a Plain LMD module - wrap it
        module = '(function(require,exports,module){\n' + module + '\n})';
    }
    return module;
};

    /**
     * @event *:wrap-module Module wrap request
     *
     * @param {String} moduleName
     * @param {String} module this module will be wrapped
     * @param {String} contentTypeOrExtension file content type or extension to avoid wrapping json file
     *
     * @retuns yes
     */
sb.on('*:wrap-module', function (moduleName, module, contentTypeOrExtension) {
    module = async_plain(module, contentTypeOrExtension);
    return [moduleName, module, contentTypeOrExtension];
});

    /**
     * @event *:is-plain-module code type check request: plain or lmd-module
     *
     * @param {String} moduleName
     * @param {String} module
     * @param {String} isPlainCode default value
     *
     * @retuns yes
     */
sb.on('*:is-plain-module', function (moduleName, module, isPlainCode) {
    if (typeof async_is_plain_code === "function") {
        return [moduleName, module, async_is_plain_code(module)];
    }
});

}(sandbox));



    main(lmd_trigger('lmd-register:decorate-require', "main", lmd_require)[1], output.exports, output);
})/*DO NOT ADD ; !*/(this,(function (require, exports, module) { /* wrapped by builder */
/**
 * LMD require.preload() example
 */

$(function () {
    var $button = $('.b-button'),
        $result = $('.b-result'),
        $input = $('.b-input');

    function calculateSha512ofMd5(sha512, md5) {
        $result.val(sha512(md5($input.val())));
    }

    $button.click(function () {
        // using shortcuts
        // sha512 -> /js/sha512.js | LMD module
        // js/md5.js               | CommonJS Module (plain)
        // LMD will figure out type of each module using `preload_plain`
        require.preload(["sha512", "js/md5.js"], function (sha512, md5) {
            console.log(sha512, md5);
            sha512 = require(sha512);
            md5 = require(md5);

            calculateSha512ofMd5(sha512, md5);
        });
    });
});

}),{
"sha512": "@js/sha512.js"
},{},{})