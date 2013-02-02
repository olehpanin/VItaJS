!function(document, window, undefined) {;

    var a = {
        config : {
            waitSeconds : 3,
            urls : {},
            baseUrl : '',
            optimize : false,
            optimizeUrl : ''
        },
        context : {},
        modules : {},
        scripts : {},
        loaded : [],
        loading : [],
        waiting : {},
        webSiteURLDocsErrors : 'http://heavyskyjs.org/docs#error-',
        isOpera : typeof opera !== "undefined" && opera.toString() === "[object Opera]",
        head : ('querySelector' in document) ? document.querySelector('head')
            : document.getElementsByTagName('head')[0]};

    a.mixin = function(target, source, force) {
        var prop;

        for (prop in source) {
            if (!(prop in target) || force) {
                target[prop] = source[prop];
            }
        }

        return target;
    }

    a.makeError = function(id, msg, err) {

        var e = new Error(msg + '\n' + a.webSiteURLDocsErrors + id);

        if (err) {
            e.originalError = err;
        }

        return e;
    }

    a.trim = function(s) {
        s = s.replace( /^\s+/g, '');
        return s.replace( /\s+$/g, '');
    }

    function isScriptInDom(url) {
        var scripts = document.querySelectorAll('head script[src="' + url + '"]');

        if (0 === scripts.length) {
            return false;
        } else {
            return true;
        }
    }

    a.inArray = function(array, value) {
        var i;

        for (i = 0; i < array.length; i++) {
            if (array.hasOwnProperty(i)) {
                if (array[i] === value) {
                    return i;
                }
            }
        }

        return -1;
    }

    a.getContextObserver = function(deps) {
        var contObj = {},
            contextObserver,
            depsArr = [],
            i,
            optimizeString,
            url,
            value;

        for (i in deps) {
            if (deps.hasOwnProperty(i)) {
                if (Object.prototype.toString.call(deps[i]) === '[object Object]') {
                    url = deps[i].url;
                } else {
                    url = deps[i];
                }
                if (a.config.optimize) {
                    if (!(url in context)) {
                        depsArr.push(url);
                    }
                } else {
                    depsArr.push(url);
                }
            }
        }
        if (a.config.optimize) {
            optimizeString = config.optimizeUrl + '?concat=' + depsArr.join(',');
            console.log(optimizeString);
            depsArr = [optimizeString];
        }
        contextObserver = (function(depsArr) {

            var loaded = [];

            var subscribers = {};

            var loadScript = function(params) {
                loaded.push(params);
                checkLoadAll();
            };

            var checkLoadAll = function() {
                if (loaded.length === depsArr.length) {
                    contextObserver.publish('all-loaded', depsArr);
                }
            };

            return {
                publish : function(event, params) {
                    if ('script-load' === event) {
                        loadScript(params);
                    }
                    if (event in subscribers) {
                        for (var i in subscribers[event]) {
                            if (subscribers[event].hasOwnProperty(i)) {
                                subscribers[event][i]();
                            }
                        }
                    }
                },
                subscribe : function(event, callback) {
                    subscribers[event] = subscribers[event] || [];
                    subscribers[event].push(callback)
                    checkLoadAll();
                }
            }
        })(depsArr);

        if (a.config.optimize) {
            load(optimizeString, function() {
                contextObserver.publish('script-load', optimizeString);
            });
        } else {
            for(value in deps) !function(value) {
                load(value, function() {
                    contextObserver.publish('script-load', value)
                });
            }(deps[value]);
        }

        return contextObserver;
    }

    function getAskModule(url) {
        var i,
            urlArr,
            baseUrl;

        function getBaseUrl(url) {
            var urlArr,
                baseUrl;
            if (url.indexOf('^') !== -1) {
                urlArr = url.split('^');
                baseUrl = a.config.urls[urlArr[0]];
                if (!baseUrl) {
                    a.makeError('wrong-base-url', 'Base url "' + urlArr[0] + '" is not set');
                }
                return {
                    baseUrl : baseUrl,
                    moduleName : urlArr[1]
                };
            } else {
                return {
                    baseUrl : undefined,
                    moduleName : url
                }
            }
        }

        if (url.indexOf('#') !== -1) {
            urlArr = url.split('#');
            for (i in a.modules) {
                if (a.modules[i].short === urlArr[0] + '#') {
                    baseUrl = getBaseUrl(urlArr[1]);
                    return {
                        url : baseUrl.moduleName,
                        baseUrl : baseUrl.baseUrl,
                        name : a.modules[i]
                    };
                }
            }
        }

        baseUrl = getBaseUrl(url);
        return {
            url : baseUrl.moduleName,
            baseUrl : baseUrl.baseUrl,
            name : undefined
        };
    }

    function load(module, callback) {
        var obs,
            askModule,
            loadScript;

        if (Object.prototype.toString.call(module) === '[object Object]') {
            askModule = getAskModule(module.url);
            loadScript = askModule.name && askModule.name.load ? askModule.name.load : loadScriptAsync;
            if (module.deps.length > 0) {
                obs = a.getContextObserver(module.deps);
                obs.subscribe('all-loaded', function() {
                    loadScript.call(a, askModule.url, callback, askModule.name, askModule.baseUrl);
                });
            } else {
                loadScript.call(a, askModule.url, callback, askModule.name, askModule.baseUrl);
            }
        } else {
            askModule = getAskModule(module);
            loadScript = askModule.load ? askModule.load : loadScriptAsync;
            loadScript.call(a, askModule.url, callback, askModule.name, askModule.baseUrl);
        }
    }

    function loadScriptAsync(moduleUrl, callback, askModule, baseUrl) {
        var script = document.createElement('script'),
            fileType,
            src,
            clbk;

        if ((moduleUrl in a.scripts) && (-1 === a.inArray(a.loaded, moduleUrl))) {
            if (!a.waiting[moduleUrl]) {
                a.waiting[moduleUrl] = [];
            }
            a.waiting[moduleUrl].push(callback);
            return false;
        }

        if (moduleUrl in a.context) {
            callback();
            return false;
        }

        a.scripts[moduleUrl] = script;
        fileType = askModule ? '.' + askModule.fileType : '.js';
        src = baseUrl ? baseUrl + moduleUrl + fileType : a.config.baseUrl + moduleUrl + fileType;
        src = a.trim(src);
        a.loading.push(moduleUrl);

        script.type = askModule ? askModule.scriptType : 'text/javascript';
        script.src = src;
        script.charset = "utf-8";
        script.async = "";

        function onload(callback) {
            var obs;
            a.loaded.push(moduleUrl);

            if ((moduleUrl in a.context) && (a.context[moduleUrl].deps.length > 0)) {
                obs = a.getContextObserver(a.context[moduleUrl].deps);
                obs.subscribe('all-loaded', function() {
                    callback();
                });
            } else {
                callback();
            }

            if (moduleUrl in a.waiting) {
                while (clbk = a.waiting[moduleUrl].shift()) {
                    clbk();
                }
            }

            if (script.detachEvent && !isOpera) {
                script.detachEvent('onreadystatechange', onReadyStateChange);
            } else {
                script.removeEventListener('load', onload, false);
            }
        }

        function onReadyStateChange(callback) {
            if (('complete' === script.readyState) || ('loaded' === script.readyState)) {
                setTimeout(function() { onload(callback);}, 0);
            }
        }

        function addEvent(script, callback) {
            if (script.attachEvent && !isOpera) {
                script.attachEvent('onreadystatechange', function() {
                    onReadyStateChange(callback);
                });
            } else {
                script.addEventListener('load', function() {
                    onload(callback);
                }, false);
            }
        }

        addEvent(script, callback);
        a.head.appendChild(script);

        setTimeout(function() {
            if (-1 === a.inArray(a.loaded, moduleUrl)) {
                err = a.makeError('timeout-loading', 'Script ' + script.src + ' Timeout loading');
                throw err;
            }
        }, a.config.waitSeconds * 1000);
    }

    function getAnswers(deps) {
        var contextArr = [],
            i,
            contextValue,
            contextAnswers,
            askModule;

        for (i in deps) {
            if (deps.hasOwnProperty(i)) {
                if (Object.prototype.toString.call(deps[i]) === '[object Object]') {
                    askModule = getAskModule(deps[i].url);
                    if (a.context[askModule.url]) {
                            contextAnswers = getAnswers(a.context[askModule.url].deps);
                            //console.log(askModule, contextAnswers, a);
                            contextValue = askModule.name ?
                                askModule.name.callback.call(this, askModule.url,
                                    a.context[askModule.url].callback, contextAnswers)
                                :
                                a.context[askModule.url].callback.apply(this, contextAnswers);

                    } else {
                        contextValue = undefined;
                    }
                } else {
                    askModule = getAskModule(deps[i]);
                    if (a.context[askModule.url] && a.context[askModule.url].deps && (a.context[askModule.url].deps.length > 0)) {
                        contextAnswers = getAnswers(a.context[askModule.url].deps);
                        contextValue = a.context[askModule.url] ?
                            askModule.name ?
                                askModule.name.callback.call(this, askModule.url,
                            a.context[askModule.url].callback, contextAnswers)
                                :
                            a.context[askModule.url].callback.apply(this, contextAnswers)
                        : undefined;
                    } else {
                        contextValue = a.context[askModule.url] ? askModule.name.callback.call(this, askModule.url,
                            a.context[askModule.url].callback) : undefined;
                    }
                }
                contextArr.push(contextValue);
            }
        }
        return contextArr;
    }

    function getDepsArr(deps) {
        var i,
            depsArr = [],
            url,
            dependences = [],
            splitArr = [];

        for (i in deps) {
            if (deps.hasOwnProperty(i)) {
                if (deps[i].indexOf('!') !== -1) {
                    splitArr = deps[i].split('!');
                    url = splitArr[0];
                    dependences = splitArr[1].split(',');
                } else {
                    url = deps[i];
                    dependences = []
                }

                depsArr.push({
                    url : url,
                    deps : dependences
                });
            }
        }
        return depsArr;
    }

    function answer(name, deps, callback) {
        a.context[name] = {
            deps : deps,
            callback : callback
        };
    }

    function ask(deps, callback) {
        var depsArr = getDepsArr(deps),
            obs = a.getContextObserver(depsArr);

        obs.subscribe('all-loaded', function() {
            callback.apply(this, getAnswers(depsArr));
        });
    }

    ask.config = function(initObj) {
        a.mixin(a.config, initObj, true);
        return a.config;
    };

    ask.module = function(name, short, scriptType, fileType,callback, load) {
        a.modules[name] = {
            short : short,
            scriptType : scriptType,
            fileType : fileType,
            callback : callback,
            load : load
        };
    };

    //ask module that load locale strings from the server
    ask.module('locale', 'l#', 'text/locale', 'txt', function(url, callback, deps) {

    });

    //ask.module that load config file from the server
    ask.module('config', 'c#', 'text/ask-config', 'conf', function(url, callback, deps) {

    });

    window.ask = ask;
    window.answer = answer;

}(document, window);