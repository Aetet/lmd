(function lmd(global, main, modules, sandboxed_modules, version, coverage_options) {
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
            stats_type(moduleName, !module ? 'global' : typeof modules[moduleName] === "undefined" ? 'off-package' : 'in-package');
            // Predefine in case of recursive require
            var output = {exports: {}};
            initialized_modules[moduleName] = 1;
            modules[moduleName] = output.exports;

            if (!module) {
                // if undefined - try to pick up module from globals (like jQuery)
                module = global[moduleName];
            } else if (typeof module === "function") {
                // Ex-Lazy LMD module or unpacked module ("pack": false)
                module = module(
                    sandboxed_modules[moduleName] ?
                        {coverage_line: require.coverage_line, coverage_function: require.coverage_function, coverage_condition: require.coverage_condition} ||
                        local_undefined : require,
                    output.exports,
                    output
                ) || output.exports;
            }
            stats_initEnd(moduleName);

            return modules[moduleName] = module;
        },
        /**
         * @param {String} moduleName module name or path to file
         *
         * @returns {*}
         */
        require = function (moduleName) {
            var module = modules[moduleName];

            // Already inited - return as is
            if (initialized_modules[moduleName] && module) {
                stats_require(moduleName);
                return module;
            }

            // Do not init shortcut as module!
            // return shortcut as is
            if (is_shortcut(moduleName, module)) {
                // assign shortcut name for module
                stats_shortcut(module, moduleName);
                moduleName = module.replace('@', '');
                module = modules[moduleName];
            }

            stats_require(moduleName);
            
            stats_initStart(moduleName);
            // Lazy LMD module not a string
            if (typeof module === "string" && module.indexOf('(function(') === 0) {
                module = global_eval(module);
            }

            return register_module(moduleName, module);
        },
        output = {exports: {}};

    for (var moduleName in modules) {
        // reset module init flag in case of overwriting
        initialized_modules[moduleName] = 0;
    }



var race_callbacks = {},
    /**
     * Creates race.
     *
     * @param {String}   name     race name
     * @param {Function} callback callback
     */
    create_race = function (name, callback) {
        if (!race_callbacks[name]) {
            // create race
            race_callbacks[name] = [];
        }
        race_callbacks[name].push(callback);

        return function (result) {
            var callbacks = race_callbacks[name];
            while(callbacks && callbacks.length) {
                callbacks.shift()(result);
            }
            // reset race
            race_callbacks[name] = false;
        }
    };
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 * @name coverage_options
 */

/**
 * @name LineReport
 * @type {Object}
 *
 * @property {Boolean}  lines        if false -> not called
 * @property {Array[]}  conditions   list of unused conditions [[0, 2], [7, 0]]
 * @property {String[]} functions    list of unused functions in that line
 */

/**
 * @name TypeReport
 * @type {Object}
 *
 * @property {Number} total
 * @property {Number} covered
 * @property {Number} percentage
 */

/**
 * @name LmdCoverage
 * @type {Object}
 *
 * @property {TypeReport}   lines
 * @property {TypeReport}   conditions
 * @property {TypeReport}   functions
 *
 * @property {Object}       report        {lineNum: LineReport}
 */

/**
 * @name lmdStats
 * @type {Object}
 *
 * @property {String}   name            module name
 * @property {Number[]} accessTimes     module access times
 * @property {Number}   initTime        module init time: load+eval+call
 * @property {String[]} shortcuts       list of used shortcuts
 *
 * @property {String[]} lines           list of all statements
 * @property {String[]} conditions      list of all conditions
 * @property {String[]} functions       list of all functions
 *
 * @property {Object} runLines          {lineId: callTimes}
 * @property {Object} runConditions     {conditionId: [falseTimes, trueTimes]}
 * @property {Object} runFunctions      {functionId: callTimes}
 *
 * @property {LmdCoverage} coverage
 *
 * @example
 *  {
 *      name: "pewpew",
 *      accessTimes: [0, 5, 2715],
 *      initTime: 10,
 *      shortcuts: ["ololo"],
 *
 *      lines: ["4", "5", "8"],
 *      conditions: ["4:1", "5:2"],
 *      functions: ["FunctionName:5:1", "FunctionName2:9:1"],
 *
 *      runLines: {
 *          "4": 1
 *          "5": 0,
 *          "8": 14
 *      },
 *
 *      runConditions: {
 *          "4:1": [1, 0],
 *          "5:2": [0, 0]
 *      },
 *
 *      runFunctions: {
 *          "FunctionName:5:1": 10
 *          "FunctionName2:9:1": 0
 *      }
 *
 *      coverage: {
 *          lines: {
 *              total: 3,
 *              covered: 2,
 *              percentage: 66.66667
 *          },
 *
 *          conditions: {
 *              total: 2,
 *              covered: 0.5,
 *              percentage: 25
 *          },
 *
 *          functions: {
 *              total: 2,
 *              covered: 1,
 *              percentage: 50
 *          },
 *
 *          report: {
 *              "4": {
 *                  conditions: [[1, 0]]
 *              },
 *              "5": {
 *                  lines: false,
 *                  conditions: [[0, 0]]
 *              },
 *              "9": {
 *                  functions: ["FunctionName2"]
 *              }
 *          }
 *      }
 *  }
 */

/**
 * @type {lmdStats}
 */
var stats_results = {},
    stats_Date = global.Date,
    stats_startTime = +new stats_Date;

function stats_get(moduleName) {
    return stats_results[moduleName] ?
           stats_results[moduleName] :
           stats_results[moduleName] = {
               name: moduleName,
               accessTimes: [],
               initTime: -1
           };
}

function stats_initStart(moduleName) {
    stats_get(moduleName).initTime = +new stats_Date;
}

function stats_initEnd(moduleName) {
    var stat = stats_get(moduleName);
    stat.initTime = +new stats_Date - stat.initTime;
}

function stats_require(moduleName) {
    var stat = stats_get(moduleName);
    stat.accessTimes.push(+new stats_Date - stats_startTime);
}

function stats_type(moduleName, type) {
    var stat = stats_get(moduleName);
    stat.type = type;
}

function stats_shortcut(moduleName, shortcut) {
    var module = stats_get(moduleName.replace('@', '')),
        shortcuts = module.shortcuts,
        index;
    
    if (!shortcuts) {
        shortcuts = module.shortcuts = [];
    }

    // Link shortcut and real module
    if (!stats_results[shortcut]) {
        stats_results[shortcut] = module;
    }

    // ie6 indexOf hackz
    index = shortcuts.indexOf ? shortcuts.indexOf(shortcut):function(){for(var i=shortcuts.length;i-->0;)if(shortcuts[i]===shortcut)return i;return-1;}();

    if (index === -1) {
        shortcuts.push(shortcut);
    }
}



/**
 * Calculate coverage total
 *
 * @param moduleName
 */
function stats_calculate_coverage(moduleName) {
    var stats = stats_get(moduleName),
        total,
        covered,
        lineId,
        lineNum,
        parts;

    var lineReport = {};

    if (!stats.lines) {
        return;
    }
    stats.coverage = {};

    covered = 0;
    total = stats.lines.length;
    for (lineId in stats.runLines) {
        if (stats.runLines[lineId] > 0) {
            covered++;
        } else {
            lineNum = lineId;
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            lineReport[lineNum].lines = false;
        }
    }
    stats.coverage.lines = {
        total: total,
        covered: covered,
        percentage: 100.0 * (total ? covered / total : 1)
    };

    covered = 0;
    total = stats.functions.length;
    for (lineId in stats.runFunctions) {
        if (stats.runFunctions[lineId] > 0) {
            covered++;
        } else {
            parts = lineId.split(':');
            lineNum = parts[1];
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            if (!lineReport[lineNum].functions) {
                lineReport[lineNum].functions = [];
            }
            lineReport[lineNum].functions.push(parts[0]);
        }
    }
    stats.coverage.functions = {
        total: total,
        covered: covered,
        percentage: 100.0 * (total ? covered / total : 1)
    };

    covered = 0;
    total = stats.conditions.length;
    for (lineId in stats.runConditions) {
        if (stats.runConditions[lineId][1] > 0) {
            covered += 1;
        }

        if (stats.runConditions[lineId][1] === 0) {

            parts = lineId.split(':');
            lineNum = parts[1];
            if (!lineReport[lineNum]) {
                lineReport[lineNum] = {};
            }
            if (!lineReport[lineNum].conditions) {
                lineReport[lineNum].conditions = [];
            }
            lineReport[lineNum].conditions.push(stats.runConditions[lineId]);
        }
    }
    stats.coverage.conditions = {
        total: total,
        covered: covered,
        percentage: 100.0 * (total ? covered / total : 1)
    };
    stats.coverage.report = lineReport;
}

/**
 * Line counter
 *
 * @private
 */
require.coverage_line = function (moduleName, lineId) {
    stats_results[moduleName].runLines[lineId] += 1;
};

/**
 * Function call counter
 *
 * @private
 */
require.coverage_function = function (moduleName, lineId) {
    stats_results[moduleName].runFunctions[lineId] += 1;
};

/**
 * Condition counter
 *
 * @private
 */
require.coverage_condition = function (moduleName, lineId, condition) {
    stats_results[moduleName].runConditions[lineId][condition ? 1 : 0] += 1;
    return condition;
};

/**
 * Registers module
 *
 * @private
 */
function coverage_module(moduleName, lines, conditions, functions) {
    var stats = stats_get(moduleName);
    if (stats.lines) {
        return;
    }
    stats.lines = lines;
    stats.conditions = conditions;
    stats.functions = functions;
    stats.runLines = {};
    stats.runConditions = {};
    stats.runFunctions = {};
    for (var i = 0, c = lines.length; i < c; i += 1) {
        stats.runLines[lines[i]] = 0;
    }

    for (i = 0, c = conditions.length; i < c; i += 1) {
        stats.runConditions[conditions[i]] = [0, 0];
    }

    for (i = 0, c = functions.length; i < c; i += 1) {
        stats.runFunctions[functions[i]] = 0;
    }
}

(function () {
    var moduleOption;
    for (var moduleName in coverage_options) {
        if (coverage_options.hasOwnProperty(moduleName)) {
            moduleOption = coverage_options[moduleName];
            coverage_module(moduleName, moduleOption.lines, moduleOption.conditions, moduleOption.functions);
            stats_type(moduleName, 'in-package');
        }
    }
})();



/**
 * Returns module statistics or all statistics
 *
 * @param {String} [moduleName]
 * @return {Object}
 */
require.stats = function (moduleName) {

    if (moduleName) {
        stats_calculate_coverage(moduleName);
    } else {
        for (var moduleNameId in stats_results) {
            stats_calculate_coverage(moduleNameId);
        }
        // calculate global coverage
        var result = {
                modules: stats_results,
                global: {
                    lines: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    },

                    conditions: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    },

                    functions: {
                        total: 0,
                        covered: 0,
                        percentage: 0
                    }
                }
            },
            modulesCount = 0,
            moduleStats;

        for (var moduleName in stats_results) {
            moduleStats = stats_results[moduleName];
            // not a shortcut
            if (moduleName === moduleStats.name && moduleStats.coverage) {
                modulesCount++;
                for (var statName in moduleStats.coverage) {
                    if (statName !== "report") {
                        result.global[statName].total += moduleStats.coverage[statName].total;
                        result.global[statName].covered += moduleStats.coverage[statName].covered;
                        result.global[statName].percentage += moduleStats.coverage[statName].percentage;
                    }
                }
            }
        }
        for (statName in result.global) {
            // avg percentage
            result.global[statName].percentage /= modulesCount;
        }

        return result;
    }

    return moduleName ? stats_results[moduleName] : stats_results;
};

/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

function is_shortcut(moduleName, moduleContent) {
    return !initialized_modules[moduleName] &&
           typeof moduleContent === "string" &&
           moduleContent.charAt(0) == '@';
}
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

function parallel(method, items, callback) {
    var i = 0,
        j = 0,
        c = items.length,
        results = [];

    var readyFactory = function (index) {
        return function (data) {
            // keep the order
            results[index] = data;
            j++;
            if (j >= c) {
                callback.apply(global, results);
            }
        }
    };

    for (; i < c; i++) {
        method(items[i], readyFactory(i));
    }
}
/**
 * @name global
 * @name version
 */

function cache_async(moduleName, module) {
    if (global.localStorage && version) {
        try {
            global.localStorage['lmd:' + version + ':' + moduleName] = global.JSON.stringify(module);
        } catch(e) {}
    }
}
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name global_noop
 * @name register_module
 * @name create_race
 * @name race_callbacks
 * @name cache_async
 * @name parallel
 */


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
        if (!(/json$/).test(contentTypeOrExtension) && async_is_plain_code(module)) {
            // its not a JSON and its a Plain LMD module - wrap it
            module = '(function(require,exports,module){\n' + module + '\n})';
        }
        return module;
    };

    /**
     * Load off-package LMD module
     *
     * @param {String|Array} moduleName same origin path to LMD module
     * @param {Function}     [callback]   callback(result) undefined on error others on success
     */
    require.async = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.async, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            XMLHttpRequestConstructor = global.XMLHttpRequest || global.ActiveXObject;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // rewrite module name
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!module || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists or its a node.js env
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }


        // Optimized tiny ajax get
        // @see https://gist.github.com/1625623
        var xhr = new XMLHttpRequestConstructor("Microsoft.XMLHTTP");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                // 3. Check for correct status 200 or 0 - OK?
                if (xhr.status < 201) {
                    module = xhr.responseText;
                    if ((/script$|json$/).test(xhr.getResponseHeader('content-type'))) {
                        module = async_plain(module, xhr.getResponseHeader('content-type'));
                        module = global_eval(module);
                    }

                    cache_async(moduleName, typeof module === "function" ? xhr.responseText : module);
                    // 4. Then callback it
                    callback(register_module(moduleName, module));
                } else {
                    // stop init on error
                    stats_initEnd(moduleName);
                    callback();
                }
            }
        };
        xhr.open('get', moduleName);
        xhr.send();

        return require;

    };
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

    /**
     * Loads any JavaScript file a non-LMD module
     *
     * @param {String|Array} moduleName path to file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLScriptElement on success
     */
    require.js = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.js, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            readyState = 'readyState',
            isNotLoaded = 1,
            head;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!module || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists
        if (module) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }
        // by default return undefined
        if (!global_document) {

            callback(module);
            return require;
        }


        var script = global_document.createElement("script");
        global.setTimeout(script.onreadystatechange = script.onload = function (e) {
            e = e || global.event;
            if (isNotLoaded &&
                (!e ||
                !script[readyState] ||
                script[readyState] == "loaded" ||
                script[readyState] == "complete")) {

                isNotLoaded = 0;
                // register or cleanup
                // stop init on error
                !e && stats_initEnd(moduleName);
                callback(e ? register_module(moduleName, script) : head.removeChild(script) && local_undefined); // e === undefined if error
            }
        }, 3000, 0);

        script.src = moduleName;
        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(script, head.firstChild);

        return require;

    };
/**
 * @name global
 * @name require
 * @name initialized_modules
 * @name modules
 * @name global_eval
 * @name register_module
 * @name global_document
 * @name global_noop
 * @name local_undefined
 * @name create_race
 * @name race_callbacks
 */

    /**
     * Loads any CSS file
     *
     * Inspired by yepnope.css.js
     *
     * @see https://github.com/SlexAxton/yepnope.js/blob/master/plugins/yepnope.css.js
     *
     * @param {String|Array} moduleName path to css file
     * @param {Function}     [callback]   callback(result) undefined on error HTMLLinkElement on success
     */
    require.css = function (moduleName, callback) {
        callback = callback || global_noop;

        // expect that its an array
        if (typeof moduleName !== "string") {
            parallel(require.css, moduleName, callback);
            return require;
        }
        var module = modules[moduleName],
            isNotLoaded = 1,
            head;

        // Its an shortcut
        if (is_shortcut(moduleName, module)) {
            // assign shortcut name for module
            stats_shortcut(module, moduleName);
            // rewrite module name
            moduleName = module.replace('@', '');
            module = modules[moduleName];
        }

        if (!(module || !global_document) || initialized_modules[moduleName]) {
            stats_require(moduleName);
        }
        // If module exists or its a worker or node.js environment
        if (module || !global_document) {
            callback(initialized_modules[moduleName] ? module : require(moduleName));
            return require;
        }

        stats_initStart(moduleName);

        callback = create_race(moduleName, callback);
        // if already called
        if (race_callbacks[moduleName].length > 1) {
            return require;
        }

        // Create stylesheet link
        var link = global_document.createElement("link"),
            id = +new global.Date,
            onload = function (e) {
                if (isNotLoaded) {
                    isNotLoaded = 0;
                    // register or cleanup
                    link.removeAttribute('id');

                    // stop init on error
                    !e && stats_initEnd(moduleName);
                    callback(e ? register_module(moduleName, link) : head.removeChild(link) && local_undefined); // e === undefined if error
                }
            };

        // Add attributes
        link.href = moduleName;
        link.rel = "stylesheet";
        link.id = id;

        global.setTimeout(onload, 3000, 0);

        head = global_document.getElementsByTagName("head")[0];
        head.insertBefore(link, head.firstChild);

        (function poll() {
            if (isNotLoaded) {
                try {
                    var sheets = global_document.styleSheets;
                    for (var j = 0, k = sheets.length; j < k; j++) {
                        if((sheets[j].ownerNode || sheets[j].owningElement).id == id &&
                           (sheets[j].cssRules || sheets[j].rules).length) {
//#JSCOVERAGE_IF 0
                            return onload(1);
//#JSCOVERAGE_ENDIF
                        }
                    }
                    // if we get here, its not in document.styleSheets (we never saw the ID)
                    throw 1;
                } catch(e) {
                    // Keep polling
                    global.setTimeout(poll, 90);
                }
            }
        }());

        return require;

    };
/**
 * @name global
 * @name lmd
 * @name sandboxed_modules
 * @name modules
 * @name main
 * @name version
 */

    // If possible to dump and version passed (fallback mode)
    // then dump application source
    if (global.localStorage && version) {
        (function () {
            try {
                global.localStorage['lmd'] = global.JSON.stringify({
                    version: version,
                    modules: modules,
                    // main module function
                    main: '(' + main + ')',
                    // lmd function === arguments.callee
                    lmd: '(' + lmd + ')',
                    sandboxed: sandboxed_modules
                });
            } catch(e) {}
        }());
    }
    main(require, output.exports, output);
})(this,(function(a){a("testcase_lmd_basic_features"),a("testcase_lmd_async_require"),a("testcase_lmd_loader"),a("testcase_lmd_cache"),a("testcase_lmd_coverage")}),{
"module_as_json": {
    "ok": true
},
"module_as_string": "<div class=\"b-template\">${pewpew}</div>",
"module_function_fd": "(function(a,b,c){return a(\"ok\")(!0,\"fd should be called once\"),function(){return!0}})",
"module_function_fd2": "(function(a,b,c){return a(\"ok\")(!0,\"fd2 should be called once\"),function(){return!0}})",
"module_function_fd_sandboxed": "(function(a,b,c){if(typeof a==\"function\")throw\"require should not be a function\";b.some_function=function(){return!0}})",
"module_function_fe": "(function(a,b,c){return a(\"ok\")(!0,\"fe should be called once\"),function(){return!0}})",
"module_function_fe_sandboxed": "(function(a,b,c){if(typeof a==\"function\")throw\"require should not be a function\";b.some_function=function(){return!0}})",
"module_function_lazy": "(function(a,b,c){return a(\"ok\")(!0,\"lazy function must be evaled and called once\"),function(){return!0}})",
"module_function_plain": "(function(a,b,c){a(\"ok\")(!0,\"plain module must be called once\"),c.exports=function(){return!0}})",
"module_function_plain_sandboxed": "(function(a,b,c){if(typeof a==\"function\")throw\"require should not be a function\";b.some_function=function(){return!0}})",
"testcase_lmd_basic_features": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD basic features @ \"+k),b(\"require() globals\",function(){g(4),f(a(\"eval\"),\"should require globals as modules\"),f(typeof a(\"some_undefined\")==\"undefined\",\"if no module nor global - return undefined\"),f(!!a.stats(\"eval\"),\"should count stats: globals\"),f(!!a.stats(\"some_undefined\"),\"should count stats: undefineds\")}),b(\"require() module-functions\",function(){g(10);var b=a(\"module_function_fd\"),c=a(\"module_function_fe\"),d=a(\"module_function_plain\");f(b()===!0,\"can require function definitions\"),f(c()===!0,\"can require function expressions\"),f(d()===!0,\"can require plain modules\"),f(b===a(\"module_function_fd\"),\"require must return the same instance of fd\"),f(c===a(\"module_function_fe\"),\"require must return the same instance of fe\"),f(d===a(\"module_function_plain\"),\"require must return the same instance of plain module\"),f(!!a.stats(\"module_function_fd\"),\"should count stats: in-package modules\")}),b(\"require() sandboxed module-functions\",function(){g(3);var b=a(\"module_function_fd_sandboxed\"),c=a(\"module_function_fe_sandboxed\"),d=a(\"module_function_plain_sandboxed\");f(b.some_function()===!0,\"can require sandboxed function definitions\"),f(c.some_function()===!0,\"can require sandboxed function expressions\"),f(d.some_function()===!0,\"can require sandboxed plain modules\")}),b(\"require() lazy module-functions\",function(){g(4);var b=a(\"module_function_lazy\");f(b()===!0,\"can require lazy function definitions\"),f(typeof a(\"lazy_fd\")==\"undefined\",\"lazy function definition's name should not leak into globals\"),f(b===a(\"module_function_lazy\"),\"require must return the same instance of lazy fd\")}),b(\"require() module-objects/json\",function(){g(3);var b=a(\"module_as_json\");f(typeof b==\"object\",\"json module should be an object\"),f(b.ok===!0,\"should return content\"),f(b===a(\"module_as_json\"),\"require of json module should return the same instance\")}),b(\"require() module-strings\",function(){g(2);var b=a(\"module_as_string\");f(typeof b==\"string\",\"string module should be an string\"),f(b===a(\"module_as_string\"),\"require of string module should return the same instance\")}),b(\"require() shortcuts\",function(){g(2);var b=a(\"sk_to_global_object\");f(b.toString().replace(/\\s|\\n/g,\"\")===\"functionDate(){[nativecode]}\",\"require() should follow shortcuts: require global by shortcut\");var c=a(\"sk_to_module_as_json\");f(typeof c==\"object\"&&c.ok===!0&&c===a(\"module_as_json\"),\"require() should follow shortcuts: require in-package module by shortcut\")}),b(\"require() third party\",function(){g(2);var b=a(\"third_party_module_a\");f(typeof b==\"function\",\"require() can load plain 3-party non-lmd modules, 1 exports\"),b=a(\"third_party_module_b\"),f(typeof b==\"object\"&&typeof b.pewpew==\"function\"&&typeof b.ololo==\"function\"&&b.someVariable===\"string\",\"require() can load plain 3-party non-lmd modules, N exports\")})})",
"testcase_lmd_async_require": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD async require @ \"+k),c(\"require.async() module-functions\",function(){g(6),a.async(\"./modules/async/module_function_async.js\"+j,function(b){f(b.some_function()===!0,\"should require async module-functions\"),f(a(\"./modules/async/module_function_async.js\"+j)===b,\"can sync require, loaded async module-functions\"),a.async(\"module_function_fd2\",function(b){f(b()===!0,\"can require async in-package modules\"),f(!!a.stats(\"module_function_fd2\"),\"should count stats: async modules\"),d()})})}),c(\"require.async() module-strings\",function(){g(3),a.async(\"./modules/async/module_as_string_async.html\"+j,function(b){f(typeof b==\"string\",\"should require async module-strings\"),f(b==='<div class=\"b-template\">${pewpew}</div>',\"content ok?\"),f(a(\"./modules/async/module_as_string_async.html\"+j)===b,\"can sync require, loaded async module-strings\"),d()})}),c(\"require.async() module-objects\",function(){g(2),a.async(\"./modules/async/module_as_json_async.json\"+j,function(b){f(typeof b==\"object\",\"should require async module-object\"),f(a(\"./modules/async/module_as_json_async.json\"+j)===b,\"can sync require, loaded async module-object\"),d()})}),c(\"require.async() chain calls\",function(){g(3);var b=a.async(\"./modules/async/module_as_json_async.json\"+j).async(\"./modules/async/module_as_json_async.json\"+j,function(){f(!0,\"Callback is optional\"),f(!0,\"WeCan use chain calls\"),d()});f(b===a,\"must return require\")}),c(\"require.async():json race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_as_json_async.json\"+j,c),a.async(\"./modules/async_race/module_as_json_async.json\"+j,c)}),c(\"require.async():js race calls\",function(){g(2);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_function_async.js\"+j,c),a.async(\"./modules/async_race/module_function_async.js\"+j,c)}),c(\"require.async():string race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.async(\"./modules/async_race/module_as_string_async.html\"+j,c),a.async(\"./modules/async_race/module_as_string_async.html\"+j,c)}),c(\"require.async() errors\",function(){g(2),a.async(\"./modules/async/undefined_module.js\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error\"),a.async(\"./modules/async/undefined_module.js\"+j,function(a){f(typeof a==\"undefined\",\"should not cache errorous modules\"),d()})})}),c(\"require.async() parallel loading\",function(){g(2),a.async([\"./modules/parallel/1.js\"+j,\"./modules/parallel/2.js\"+j,\"./modules/parallel/3.js\"+j],function(a,b,c){f(!0,\"Modules executes as they are loaded - in load order\"),f(a.file===\"1.js\"&&b.file===\"2.js\"&&c.file===\"3.js\",\"Modules should be callbacked in list order\"),d()})}),c(\"require.async() shortcuts\",function(){g(10),f(typeof a(\"sk_async_html\")==\"undefined\",\"require should return undefined if shortcuts not initialized by loaders\"),f(typeof a(\"sk_async_html\")==\"undefined\",\"require should return undefined ... always\"),a.async(\"sk_async_json\",function(b){f(b.ok===!0,\"should require shortcuts: json\"),f(a(\"sk_async_json\")===b,\"if shortcut is defined require should return the same code\"),f(a(\"/modules/shortcuts/async.json\")===b,\"Module should be inited using shortcut content\"),a.async(\"sk_async_html\",function(b){f(b===\"ok\",\"should require shortcuts: html\"),a.async(\"sk_async_js\",function(b){f(b()===\"ok\",\"should require shortcuts: js\"),f(a.stats(\"sk_async_js\")===a.stats(\"/modules/shortcuts/async.js\"),\"shortcut should point to the same object as module\"),f(!!a.stats(\"/modules/shortcuts/async.js\"),\"should count stats of real file\"),f(a.stats(\"/modules/shortcuts/async.js\").shortcuts[0]===\"sk_async_js\",\"should pass shourtcuts names\"),d()})})})}),c(\"require.async() plain\",function(){g(3),a.async(\"./modules/async/module_plain_function_async.js\"+j,function(b){f(b.some_function()===!0,\"should require async module-functions\"),f(a(\"./modules/async/module_plain_function_async.js\"+j)===b,\"can async require plain modules, loaded async module-functions\"),d()})})})",
"testcase_lmd_loader": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=\"?\"+Math.random(),k=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";e(\"LMD loader @ \"+k),c(\"require.js()\",function(){g(6),a.js(\"./modules/loader/non_lmd_module.js\"+j,function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"SCRIPT\",\"should return script tag on success\"),f(a(\"some_function\")()===!0,\"we can grab content of the loaded script\"),f(a(\"./modules/loader/non_lmd_module.js\"+j)===b,\"should cache script tag on success\"),a.js(\"http://8.8.8.8:8/jquery.js\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error in 3 seconds\"),f(typeof a(\"http://8.8.8.8:8/jquery.js\"+j)==\"undefined\",\"should not cache errorous modules\"),a.js(\"module_as_string\",function(b){a.async(\"module_as_string\",function(a){f(b===a,\"require.js() acts like require.async() if in-package/declared module passed\"),d()})})})})}),c(\"require.js() JSON callback and chain calls\",function(){g(2);var b=a(\"setTimeout\")(function(){f(!1,\"JSONP call fails\"),d()},3e3);a(\"window\").someJsonHandler=function(c){f(c.ok,\"JSON called\"),a(\"window\").someJsonHandler=null,a(\"clearTimeout\")(b),d()};var c=a.js(\"./modules/loader/non_lmd_module.jsonp.js\"+j);f(c===a,\"require.js() must return require\")}),c(\"require.js() race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.js(\"./modules/loader_race/non_lmd_module.js\"+j,c),a.js(\"./modules/loader_race/non_lmd_module.js\"+j,c)}),c(\"require.css()\",function(){g(6),a.css(\"./modules/loader/some_css.css\"+j,function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"LINK\",\"should return link tag on success\"),f(h(\"#qunit-fixture\").css(\"visibility\")===\"hidden\",\"css should be applied\"),f(a(\"./modules/loader/some_css.css\"+j)===b,\"should cache link tag on success\"),a.css(\"./modules/loader/some_css_404.css\"+j,function(b){f(typeof b==\"undefined\",\"should return undefined on error in 3 seconds\"),f(typeof a(\"./modules/loader/some_css_404.css\"+j)==\"undefined\",\"should not cache errorous modules\"),a.css(\"module_as_string\",function(b){a.async(\"module_as_string\",function(a){f(b===a,\"require.css() acts like require.async() if in-package/declared module passed\"),d()})})})})}),c(\"require.css() CSS loader without callback\",function(){g(1);var b=a.css(\"./modules/loader/some_css_callbackless.css\"+j).css(\"./modules/loader/some_css_callbackless.css\"+j+1);f(b===a,\"require.css() must return require\"),d()}),c(\"require.css() race calls\",function(){g(1);var b,c=function(a){typeof b==\"undefined\"?b=a:(f(b===a,\"Must perform one call. Results must be the same\"),d())};a.css(\"./modules/loader_race/some_css.css\"+j,c),a.css(\"./modules/loader_race/some_css.css\"+j,c)}),c(\"require.css() shortcut\",function(){g(4),a.css(\"sk_css_css\",function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"LINK\",\"should return link tag on success\"),f(a(\"sk_css_css\")===b,\"require should return the same result\"),a.css(\"sk_css_css\",function(c){f(c===b,\"should load once\"),f(a(\"sk_css_css\")===a(\"/modules/shortcuts/css.css\"),\"should be defined using path-to-module\"),d()})})}),c(\"require.js() shortcut\",function(){g(5),a.js(\"sk_js_js\",function(b){f(typeof b==\"object\"&&b.nodeName.toUpperCase()===\"SCRIPT\",\"should return script tag on success\"),f(a(\"sk_js_js\")===b,\"require should return the same result\"),a.js(\"sk_js_js\",function(c){f(c===b,\"should load once\"),f(a(\"sk_js_js\")===a(\"/modules/shortcuts/js.js\"),\"should be defined using path-to-module\"),f(typeof a(\"shortcuts_js\")==\"function\",\"Should create a global function shortcuts_js as in module function\"),d()})})})})",
"testcase_lmd_coverage": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"asyncTest\"),e=a(\"start\"),f=a(\"module\"),g=a(\"ok\"),h=a(\"expect\"),i=a(\"$\"),j=a(\"raises\"),k=\"?\"+Math.random(),l=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\";f(\"LMD Stats coverage @ \"+l),b(\"Coverage\",function(){h(6),a(\"coverage_fully_covered\"),a(\"coverage_not_conditions\"),a(\"coverage_not_functions\"),a(\"coverage_not_statements\");var b=a.stats(),c;c=b.modules.coverage_fully_covered.coverage.report;for(var d in c)c.hasOwnProperty(d)&&g(!1,\"should be fully covered!\");c=b.modules.coverage_not_conditions.coverage.report,g(c[2].conditions,\"coverage_not_conditions: not 1 line\"),g(c[3].lines===!1,\"coverage_not_conditions: not 2 line\"),c=b.modules.coverage_not_functions.coverage.report,g(c[3].functions[0]===\"test\",\"coverage_not_functions: not 2 line\"),g(c[4].lines===!1,\"coverage_not_functions: not 3 line\"),c=b.modules.coverage_not_statements.coverage.report,g(c[11].lines===!1,\"coverage_not_statements: not 11 line\"),c=b.modules.coverage_not_covered.coverage.report,g(c[1]&&c[2]&&c[3]&&c[6]&&c[7],\"coverage_not_covered: not covered\")})})",
"testcase_lmd_cache": "(function(a){var b=a(\"test\"),c=a(\"asyncTest\"),d=a(\"start\"),e=a(\"module\"),f=a(\"ok\"),g=a(\"expect\"),h=a(\"$\"),i=a(\"raises\"),j=a(\"localStorage\"),k=\"?\"+Math.random(),l=a(\"worker_some_global_var\")?\"Worker\":a(\"node_some_global_var\")?\"Node\":\"DOM\",m=\"latest\";if(!j)return;e(\"LMD cache @ \"+l),c(\"localStorage cache + cache_async test\",function(){g(10),f(typeof j.lmd==\"string\",\"LMD Should create cache\");var b=JSON.parse(j.lmd);f(b.version===m,\"Should save version\"),f(typeof b.modules==\"object\",\"Should save modules\"),f(typeof b.main==\"string\",\"Should save main function as string\"),f(typeof b.lmd==\"string\",\"Should save lmd source as string\"),f(typeof b.sandboxed==\"object\",\"Should save sandboxed modules\"),a.async(\"./modules/async/module_function_async.js\",function(b){var c=\"lmd:\"+m+\":\"+\"./modules/async/module_function_async.js\";f(b.some_function()===!0,\"should require async module-functions\"),f(typeof j[c]==\"string\",\"LMD Should cache async requests\"),j.removeItem(c),a.async(\"./modules/async/module_function_async.js\"),f(!j[c],\"LMD Should not recreate cache it was manually deleted key=\"+c),d()})})})",
"sk_async_html": "@/modules/shortcuts/async.html",
"sk_async_js": "@/modules/shortcuts/async.js",
"sk_async_json": "@/modules/shortcuts/async.json",
"sk_css_css": "@/modules/shortcuts/css.css",
"sk_js_js": "@/modules/shortcuts/js.js",
"sk_to_global_object": "@Date",
"sk_to_module_as_json": "@module_as_json",
"coverage_fully_covered": "(function(a,b,c){function e(){return a.coverage_function(\"coverage_fully_covered\",\"test:2:79\"),a.coverage_line(\"coverage_fully_covered\",\"3\"),d}a.coverage_function(\"coverage_fully_covered\",\"(?):0:1\"),a.coverage_line(\"coverage_fully_covered\",\"1\");var d=\"123\";a.coverage_line(\"coverage_fully_covered\",\"2\"),a.coverage_line(\"coverage_fully_covered\",\"6\");if(a.coverage_condition(\"coverage_fully_covered\",\"if:6:118\",!0)){a.coverage_line(\"coverage_fully_covered\",\"7\");var f=e()}})",
"coverage_not_conditions": "(function(a){a.coverage_line(\"coverage_not_conditions\",\"2\");if(a.coverage_condition(\"coverage_not_conditions\",\"if:2:31\",!1)){a.coverage_line(\"coverage_not_conditions\",\"3\");var b=123}})",
"coverage_not_functions": "(function(a){function c(){return a.coverage_function(\"coverage_not_functions\",\"test:3:45\"),a.coverage_line(\"coverage_not_functions\",\"4\"),b}a.coverage_function(\"coverage_not_functions\",\"(?):1:1\"),a.coverage_line(\"coverage_not_functions\",\"2\");var b=\"123\";a.coverage_line(\"coverage_not_functions\",\"3\"),a.coverage_line(\"coverage_not_functions\",\"7\");if(a.coverage_condition(\"coverage_not_functions\",\"if:7:110\",!0)){a.coverage_line(\"coverage_not_functions\",\"8\");var d=b}})",
"coverage_not_statements": "(function(a,b,c){function f(b){return a.coverage_function(\"coverage_not_statements\",\"test:4:87\"),a.coverage_line(\"coverage_not_statements\",\"5\"),b}a.coverage_function(\"coverage_not_statements\",\"(?):0:1\"),a.coverage_line(\"coverage_not_statements\",\"1\");var d=\"123\",e;a.coverage_line(\"coverage_not_statements\",\"4\"),a.coverage_line(\"coverage_not_statements\",\"8\"),a.coverage_condition(\"coverage_not_statements\",\"if:8:127\",!0)?(a.coverage_line(\"coverage_not_statements\",\"9\"),e=f(1)):(a.coverage_line(\"coverage_not_statements\",\"11\"),e=f(2))})",
"coverage_not_covered": "(function(a,b,c){function e(){return a.coverage_function(\"coverage_not_covered\",\"test:2:88\"),a.coverage_line(\"coverage_not_covered\",\"3\"),d}a.coverage_function(\"coverage_not_covered\",\"(?):0:1\"),a.coverage_line(\"coverage_not_covered\",\"1\");var d=\"123\";a.coverage_line(\"coverage_not_covered\",\"2\"),a.coverage_line(\"coverage_not_covered\",\"6\");if(a.coverage_condition(\"coverage_not_covered\",\"if:6:145\",!0)){a.coverage_line(\"coverage_not_covered\",\"7\");var f=e()}})",
"third_party_module_a": "(function(a){return a(\"third_party_module_a_dep\"),function(a,b){a.uQuery_dep();var c=function(){var a=function(){};return a}();a.uQuery=c}(window),window.uQuery})",
"third_party_module_a_dep": "(function(a){return window.uQuery_dep=function(){return!0},window.uQuery_dep})",
"third_party_module_b": "(function(a){function d(){}function e(){}var b=a(\"Function\"),c=a(\"Date\");new c,new b(\"return true\");var f=\"string\";return{pewpew:d,ololo:e,someVariable:f}})"
},{"module_function_fd_sandboxed":true,"module_function_fe_sandboxed":true,"module_function_plain_sandboxed":true},"latest",{"coverage_fully_covered":{"lines":["1","2","3","6","7"],"conditions":["if:6:118"],"functions":["(?):0:1","test:2:79"]},"coverage_not_conditions":{"lines":["2","3"],"conditions":["if:2:31"],"functions":[]},"coverage_not_functions":{"lines":["2","3","4","7","8"],"conditions":["if:7:110"],"functions":["(?):1:1","test:3:45"]},"coverage_not_statements":{"lines":["1","4","5","8","9","11"],"conditions":["if:8:127"],"functions":["(?):0:1","test:4:87"]},"coverage_not_covered":{"lines":["1","2","3","6","7"],"conditions":["if:6:145"],"functions":["(?):0:1","test:2:88"]}})