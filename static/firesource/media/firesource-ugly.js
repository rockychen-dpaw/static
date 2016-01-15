var COMPILED = false;

var goog = goog || {};

goog.global = this;

goog.global.CLOSURE_UNCOMPILED_DEFINES;

goog.global.CLOSURE_DEFINES;

goog.isDef = function(val) {
    return val !== void 0;
};

goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
    var parts = name.split(".");
    var cur = opt_objectToExportTo || goog.global;
    if (!(parts[0] in cur) && cur.execScript) {
        cur.execScript("var " + parts[0]);
    }
    for (var part; parts.length && (part = parts.shift()); ) {
        if (!parts.length && goog.isDef(opt_object)) {
            cur[part] = opt_object;
        } else if (cur[part]) {
            cur = cur[part];
        } else {
            cur = cur[part] = {};
        }
    }
};

goog.define = function(name, defaultValue) {
    var value = defaultValue;
    if (!COMPILED) {
        if (goog.global.CLOSURE_UNCOMPILED_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
            value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
        } else if (goog.global.CLOSURE_DEFINES && Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES, name)) {
            value = goog.global.CLOSURE_DEFINES[name];
        }
    }
    goog.exportPath_(name, value);
};

goog.define("goog.DEBUG", true);

goog.define("goog.LOCALE", "en");

goog.define("goog.TRUSTED_SITE", true);

goog.define("goog.STRICT_MODE_COMPATIBLE", false);

goog.define("goog.DISALLOW_TEST_ONLY_CODE", COMPILED && !goog.DEBUG);

goog.define("goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING", false);

goog.provide = function(name) {
    if (!COMPILED) {
        if (goog.isProvided_(name)) {
            throw Error('Namespace "' + name + '" already declared.');
        }
    }
    goog.constructNamespace_(name);
};

goog.constructNamespace_ = function(name, opt_obj) {
    if (!COMPILED) {
        delete goog.implicitNamespaces_[name];
        var namespace = name;
        while (namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
            if (goog.getObjectByName(namespace)) {
                break;
            }
            goog.implicitNamespaces_[namespace] = true;
        }
    }
    goog.exportPath_(name, opt_obj);
};

goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;

goog.module = function(name) {
    if (!goog.isString(name) || !name || name.search(goog.VALID_MODULE_RE_) == -1) {
        throw Error("Invalid module identifier");
    }
    if (!goog.isInModuleLoader_()) {
        throw Error("Module " + name + " has been loaded incorrectly.");
    }
    if (goog.moduleLoaderState_.moduleName) {
        throw Error("goog.module may only be called once per module.");
    }
    goog.moduleLoaderState_.moduleName = name;
    if (!COMPILED) {
        if (goog.isProvided_(name)) {
            throw Error('Namespace "' + name + '" already declared.');
        }
        delete goog.implicitNamespaces_[name];
    }
};

goog.module.get = function(name) {
    return goog.module.getInternal_(name);
};

goog.module.getInternal_ = function(name) {
    if (!COMPILED) {
        if (goog.isProvided_(name)) {
            return name in goog.loadedModules_ ? goog.loadedModules_[name] : goog.getObjectByName(name);
        } else {
            return null;
        }
    }
};

goog.moduleLoaderState_ = null;

goog.isInModuleLoader_ = function() {
    return goog.moduleLoaderState_ != null;
};

goog.module.declareLegacyNamespace = function() {
    if (!COMPILED && !goog.isInModuleLoader_()) {
        throw new Error("goog.module.declareLegacyNamespace must be called from " + "within a goog.module");
    }
    if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
        throw Error("goog.module must be called prior to " + "goog.module.declareLegacyNamespace.");
    }
    goog.moduleLoaderState_.declareLegacyNamespace = true;
};

goog.setTestOnly = function(opt_message) {
    if (goog.DISALLOW_TEST_ONLY_CODE) {
        opt_message = opt_message || "";
        throw Error("Importing test-only code into non-debug environment" + (opt_message ? ": " + opt_message : "."));
    }
};

goog.forwardDeclare = function(name) {};

goog.forwardDeclare("Document");

goog.forwardDeclare("HTMLScriptElement");

goog.forwardDeclare("XMLHttpRequest");

if (!COMPILED) {
    goog.isProvided_ = function(name) {
        return name in goog.loadedModules_ || !goog.implicitNamespaces_[name] && goog.isDefAndNotNull(goog.getObjectByName(name));
    };
    goog.implicitNamespaces_ = {
        "goog.module": true
    };
}

goog.getObjectByName = function(name, opt_obj) {
    var parts = name.split(".");
    var cur = opt_obj || goog.global;
    for (var part; part = parts.shift(); ) {
        if (goog.isDefAndNotNull(cur[part])) {
            cur = cur[part];
        } else {
            return null;
        }
    }
    return cur;
};

goog.globalize = function(obj, opt_global) {
    var global = opt_global || goog.global;
    for (var x in obj) {
        global[x] = obj[x];
    }
};

goog.addDependency = function(relPath, provides, requires, opt_isModule) {
    if (goog.DEPENDENCIES_ENABLED) {
        var provide, require;
        var path = relPath.replace(/\\/g, "/");
        var deps = goog.dependencies_;
        for (var i = 0; provide = provides[i]; i++) {
            deps.nameToPath[provide] = path;
            deps.pathIsModule[path] = !!opt_isModule;
        }
        for (var j = 0; require = requires[j]; j++) {
            if (!(path in deps.requires)) {
                deps.requires[path] = {};
            }
            deps.requires[path][require] = true;
        }
    }
};

goog.define("goog.ENABLE_DEBUG_LOADER", true);

goog.logToConsole_ = function(msg) {
    if (goog.global.console) {
        goog.global.console["error"](msg);
    }
};

goog.require = function(name) {
    if (!COMPILED) {
        if (goog.ENABLE_DEBUG_LOADER && goog.IS_OLD_IE_) {
            goog.maybeProcessDeferredDep_(name);
        }
        if (goog.isProvided_(name)) {
            if (goog.isInModuleLoader_()) {
                return goog.module.getInternal_(name);
            } else {
                return null;
            }
        }
        if (goog.ENABLE_DEBUG_LOADER) {
            var path = goog.getPathFromDeps_(name);
            if (path) {
                goog.writeScripts_(path);
                return null;
            }
        }
        var errorMessage = "goog.require could not find: " + name;
        goog.logToConsole_(errorMessage);
        throw Error(errorMessage);
    }
};

goog.basePath = "";

goog.global.CLOSURE_BASE_PATH;

goog.global.CLOSURE_NO_DEPS;

goog.global.CLOSURE_IMPORT_SCRIPT;

goog.nullFunction = function() {};

goog.abstractMethod = function() {
    throw Error("unimplemented abstract method");
};

goog.addSingletonGetter = function(ctor) {
    ctor.getInstance = function() {
        if (ctor.instance_) {
            return ctor.instance_;
        }
        if (goog.DEBUG) {
            goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
        }
        return ctor.instance_ = new ctor();
    };
};

goog.instantiatedSingletons_ = [];

goog.define("goog.LOAD_MODULE_USING_EVAL", true);

goog.define("goog.SEAL_MODULE_EXPORTS", goog.DEBUG);

goog.loadedModules_ = {};

goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;

if (goog.DEPENDENCIES_ENABLED) {
    goog.dependencies_ = {
        pathIsModule: {},
        nameToPath: {},
        requires: {},
        visited: {},
        written: {},
        deferred: {}
    };
    goog.inHtmlDocument_ = function() {
        var doc = goog.global.document;
        return doc != null && "write" in doc;
    };
    goog.findBasePath_ = function() {
        if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
            goog.basePath = goog.global.CLOSURE_BASE_PATH;
            return;
        } else if (!goog.inHtmlDocument_()) {
            return;
        }
        var doc = goog.global.document;
        var scripts = doc.getElementsByTagName("SCRIPT");
        for (var i = scripts.length - 1; i >= 0; --i) {
            var script = scripts[i];
            var src = script.src;
            var qmark = src.lastIndexOf("?");
            var l = qmark == -1 ? src.length : qmark;
            if (src.substr(l - 7, 7) == "base.js") {
                goog.basePath = src.substr(0, l - 7);
                return;
            }
        }
    };
    goog.importScript_ = function(src, opt_sourceText) {
        var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
        if (importScript(src, opt_sourceText)) {
            goog.dependencies_.written[src] = true;
        }
    };
    goog.IS_OLD_IE_ = !!(!goog.global.atob && goog.global.document && goog.global.document.all);
    goog.importModule_ = function(src) {
        var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';
        if (goog.importScript_("", bootstrap)) {
            goog.dependencies_.written[src] = true;
        }
    };
    goog.queuedModules_ = [];
    goog.wrapModule_ = function(srcUrl, scriptText) {
        if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
            return "" + "goog.loadModule(function(exports) {" + '"use strict";' + scriptText + "\n" + ";return exports" + "});" + "\n//# sourceURL=" + srcUrl + "\n";
        } else {
            return "" + "goog.loadModule(" + goog.global.JSON.stringify(scriptText + "\n//# sourceURL=" + srcUrl + "\n") + ");";
        }
    };
    goog.loadQueuedModules_ = function() {
        var count = goog.queuedModules_.length;
        if (count > 0) {
            var queue = goog.queuedModules_;
            goog.queuedModules_ = [];
            for (var i = 0; i < count; i++) {
                var path = queue[i];
                goog.maybeProcessDeferredPath_(path);
            }
        }
    };
    goog.maybeProcessDeferredDep_ = function(name) {
        if (goog.isDeferredModule_(name) && goog.allDepsAreAvailable_(name)) {
            var path = goog.getPathFromDeps_(name);
            goog.maybeProcessDeferredPath_(goog.basePath + path);
        }
    };
    goog.isDeferredModule_ = function(name) {
        var path = goog.getPathFromDeps_(name);
        if (path && goog.dependencies_.pathIsModule[path]) {
            var abspath = goog.basePath + path;
            return abspath in goog.dependencies_.deferred;
        }
        return false;
    };
    goog.allDepsAreAvailable_ = function(name) {
        var path = goog.getPathFromDeps_(name);
        if (path && path in goog.dependencies_.requires) {
            for (var requireName in goog.dependencies_.requires[path]) {
                if (!goog.isProvided_(requireName) && !goog.isDeferredModule_(requireName)) {
                    return false;
                }
            }
        }
        return true;
    };
    goog.maybeProcessDeferredPath_ = function(abspath) {
        if (abspath in goog.dependencies_.deferred) {
            var src = goog.dependencies_.deferred[abspath];
            delete goog.dependencies_.deferred[abspath];
            goog.globalEval(src);
        }
    };
    goog.loadModuleFromUrl = function(url) {
        goog.retrieveAndExecModule_(url);
    };
    goog.loadModule = function(moduleDef) {
        var previousState = goog.moduleLoaderState_;
        try {
            goog.moduleLoaderState_ = {
                moduleName: undefined,
                declareLegacyNamespace: false
            };
            var exports;
            if (goog.isFunction(moduleDef)) {
                exports = moduleDef.call(goog.global, {});
            } else if (goog.isString(moduleDef)) {
                exports = goog.loadModuleFromSource_.call(goog.global, moduleDef);
            } else {
                throw Error("Invalid module definition");
            }
            var moduleName = goog.moduleLoaderState_.moduleName;
            if (!goog.isString(moduleName) || !moduleName) {
                throw Error('Invalid module name "' + moduleName + '"');
            }
            if (goog.moduleLoaderState_.declareLegacyNamespace) {
                goog.constructNamespace_(moduleName, exports);
            } else if (goog.SEAL_MODULE_EXPORTS && Object.seal) {
                Object.seal(exports);
            }
            goog.loadedModules_[moduleName] = exports;
        } finally {
            goog.moduleLoaderState_ = previousState;
        }
    };
    goog.loadModuleFromSource_ = function() {
        "use strict";
        var exports = {};
        eval(arguments[0]);
        return exports;
    };
    goog.writeScriptSrcNode_ = function(src) {
        goog.global.document.write('<script type="text/javascript" src="' + src + '"></' + "script>");
    };
    goog.appendScriptSrcNode_ = function(src) {
        var doc = goog.global.document;
        var scriptEl = doc.createElement("script");
        scriptEl.type = "text/javascript";
        scriptEl.src = src;
        scriptEl.defer = false;
        scriptEl.async = false;
        doc.head.appendChild(scriptEl);
    };
    goog.writeScriptTag_ = function(src, opt_sourceText) {
        if (goog.inHtmlDocument_()) {
            var doc = goog.global.document;
            if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING && doc.readyState == "complete") {
                var isDeps = /\bdeps.js$/.test(src);
                if (isDeps) {
                    return false;
                } else {
                    throw Error('Cannot write "' + src + '" after document load');
                }
            }
            var isOldIE = goog.IS_OLD_IE_;
            if (opt_sourceText === undefined) {
                if (!isOldIE) {
                    if (goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING) {
                        goog.appendScriptSrcNode_(src);
                    } else {
                        goog.writeScriptSrcNode_(src);
                    }
                } else {
                    var state = " onreadystatechange='goog.onScriptLoad_(this, " + ++goog.lastNonModuleScriptIndex_ + ")' ";
                    doc.write('<script type="text/javascript" src="' + src + '"' + state + "></" + "script>");
                }
            } else {
                doc.write('<script type="text/javascript">' + opt_sourceText + "</" + "script>");
            }
            return true;
        } else {
            return false;
        }
    };
    goog.lastNonModuleScriptIndex_ = 0;
    goog.onScriptLoad_ = function(script, scriptIndex) {
        if (script.readyState == "complete" && goog.lastNonModuleScriptIndex_ == scriptIndex) {
            goog.loadQueuedModules_();
        }
        return true;
    };
    goog.writeScripts_ = function(pathToLoad) {
        var scripts = [];
        var seenScript = {};
        var deps = goog.dependencies_;
        function visitNode(path) {
            if (path in deps.written) {
                return;
            }
            if (path in deps.visited) {
                return;
            }
            deps.visited[path] = true;
            if (path in deps.requires) {
                for (var requireName in deps.requires[path]) {
                    if (!goog.isProvided_(requireName)) {
                        if (requireName in deps.nameToPath) {
                            visitNode(deps.nameToPath[requireName]);
                        } else {
                            throw Error("Undefined nameToPath for " + requireName);
                        }
                    }
                }
            }
            if (!(path in seenScript)) {
                seenScript[path] = true;
                scripts.push(path);
            }
        }
        visitNode(pathToLoad);
        for (var i = 0; i < scripts.length; i++) {
            var path = scripts[i];
            goog.dependencies_.written[path] = true;
        }
        var moduleState = goog.moduleLoaderState_;
        goog.moduleLoaderState_ = null;
        for (var i = 0; i < scripts.length; i++) {
            var path = scripts[i];
            if (path) {
                if (!deps.pathIsModule[path]) {
                    goog.importScript_(goog.basePath + path);
                } else {
                    goog.importModule_(goog.basePath + path);
                }
            } else {
                goog.moduleLoaderState_ = moduleState;
                throw Error("Undefined script input");
            }
        }
        goog.moduleLoaderState_ = moduleState;
    };
    goog.getPathFromDeps_ = function(rule) {
        if (rule in goog.dependencies_.nameToPath) {
            return goog.dependencies_.nameToPath[rule];
        } else {
            return null;
        }
    };
    goog.findBasePath_();
    if (!goog.global.CLOSURE_NO_DEPS) {
        goog.importScript_(goog.basePath + "deps.js");
    }
}

goog.normalizePath_ = function(path) {
    var components = path.split("/");
    var i = 0;
    while (i < components.length) {
        if (components[i] == ".") {
            components.splice(i, 1);
        } else if (i && components[i] == ".." && components[i - 1] && components[i - 1] != "..") {
            components.splice(--i, 2);
        } else {
            i++;
        }
    }
    return components.join("/");
};

goog.loadFileSync_ = function(src) {
    if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
        return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
    } else {
        var xhr = new goog.global["XMLHttpRequest"]();
        xhr.open("get", src, false);
        xhr.send();
        return xhr.responseText;
    }
};

goog.retrieveAndExecModule_ = function(src) {
    if (!COMPILED) {
        var originalPath = src;
        src = goog.normalizePath_(src);
        var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
        var scriptText = goog.loadFileSync_(src);
        if (scriptText != null) {
            var execModuleScript = goog.wrapModule_(src, scriptText);
            var isOldIE = goog.IS_OLD_IE_;
            if (isOldIE) {
                goog.dependencies_.deferred[originalPath] = execModuleScript;
                goog.queuedModules_.push(originalPath);
            } else {
                importScript(src, execModuleScript);
            }
        } else {
            throw new Error("load of " + src + "failed");
        }
    }
};

goog.typeOf = function(value) {
    var s = typeof value;
    if (s == "object") {
        if (value) {
            if (value instanceof Array) {
                return "array";
            } else if (value instanceof Object) {
                return s;
            }
            var className = Object.prototype.toString.call(value);
            if (className == "[object Window]") {
                return "object";
            }
            if (className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
                return "array";
            }
            if (className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
                return "function";
            }
        } else {
            return "null";
        }
    } else if (s == "function" && typeof value.call == "undefined") {
        return "object";
    }
    return s;
};

goog.isNull = function(val) {
    return val === null;
};

goog.isDefAndNotNull = function(val) {
    return val != null;
};

goog.isArray = function(val) {
    return goog.typeOf(val) == "array";
};

goog.isArrayLike = function(val) {
    var type = goog.typeOf(val);
    return type == "array" || type == "object" && typeof val.length == "number";
};

goog.isDateLike = function(val) {
    return goog.isObject(val) && typeof val.getFullYear == "function";
};

goog.isString = function(val) {
    return typeof val == "string";
};

goog.isBoolean = function(val) {
    return typeof val == "boolean";
};

goog.isNumber = function(val) {
    return typeof val == "number";
};

goog.isFunction = function(val) {
    return goog.typeOf(val) == "function";
};

goog.isObject = function(val) {
    var type = typeof val;
    return type == "object" && val != null || type == "function";
};

goog.getUid = function(obj) {
    return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};

goog.hasUid = function(obj) {
    return !!obj[goog.UID_PROPERTY_];
};

goog.removeUid = function(obj) {
    if ("removeAttribute" in obj) {
        obj.removeAttribute(goog.UID_PROPERTY_);
    }
    try {
        delete obj[goog.UID_PROPERTY_];
    } catch (ex) {}
};

goog.UID_PROPERTY_ = "closure_uid_" + (Math.random() * 1e9 >>> 0);

goog.uidCounter_ = 0;

goog.getHashCode = goog.getUid;

goog.removeHashCode = goog.removeUid;

goog.cloneObject = function(obj) {
    var type = goog.typeOf(obj);
    if (type == "object" || type == "array") {
        if (obj.clone) {
            return obj.clone();
        }
        var clone = type == "array" ? [] : {};
        for (var key in obj) {
            clone[key] = goog.cloneObject(obj[key]);
        }
        return clone;
    }
    return obj;
};

goog.bindNative_ = function(fn, selfObj, var_args) {
    return fn.call.apply(fn.bind, arguments);
};

goog.bindJs_ = function(fn, selfObj, var_args) {
    if (!fn) {
        throw new Error();
    }
    if (arguments.length > 2) {
        var boundArgs = Array.prototype.slice.call(arguments, 2);
        return function() {
            var newArgs = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(newArgs, boundArgs);
            return fn.apply(selfObj, newArgs);
        };
    } else {
        return function() {
            return fn.apply(selfObj, arguments);
        };
    }
};

goog.bind = function(fn, selfObj, var_args) {
    if (Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
        goog.bind = goog.bindNative_;
    } else {
        goog.bind = goog.bindJs_;
    }
    return goog.bind.apply(null, arguments);
};

goog.partial = function(fn, var_args) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        var newArgs = args.slice();
        newArgs.push.apply(newArgs, arguments);
        return fn.apply(this, newArgs);
    };
};

goog.mixin = function(target, source) {
    for (var x in source) {
        target[x] = source[x];
    }
};

goog.now = goog.TRUSTED_SITE && Date.now || function() {
    return +new Date();
};

goog.globalEval = function(script) {
    if (goog.global.execScript) {
        goog.global.execScript(script, "JavaScript");
    } else if (goog.global.eval) {
        if (goog.evalWorksForGlobals_ == null) {
            goog.global.eval("var _evalTest_ = 1;");
            if (typeof goog.global["_evalTest_"] != "undefined") {
                try {
                    delete goog.global["_evalTest_"];
                } catch (ignore) {}
                goog.evalWorksForGlobals_ = true;
            } else {
                goog.evalWorksForGlobals_ = false;
            }
        }
        if (goog.evalWorksForGlobals_) {
            goog.global.eval(script);
        } else {
            var doc = goog.global.document;
            var scriptElt = doc.createElement("SCRIPT");
            scriptElt.type = "text/javascript";
            scriptElt.defer = false;
            scriptElt.appendChild(doc.createTextNode(script));
            doc.body.appendChild(scriptElt);
            doc.body.removeChild(scriptElt);
        }
    } else {
        throw Error("goog.globalEval not available");
    }
};

goog.evalWorksForGlobals_ = null;

goog.cssNameMapping_;

goog.cssNameMappingStyle_;

goog.getCssName = function(className, opt_modifier) {
    var getMapping = function(cssName) {
        return goog.cssNameMapping_[cssName] || cssName;
    };
    var renameByParts = function(cssName) {
        var parts = cssName.split("-");
        var mapped = [];
        for (var i = 0; i < parts.length; i++) {
            mapped.push(getMapping(parts[i]));
        }
        return mapped.join("-");
    };
    var rename;
    if (goog.cssNameMapping_) {
        rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts;
    } else {
        rename = function(a) {
            return a;
        };
    }
    if (opt_modifier) {
        return className + "-" + rename(opt_modifier);
    } else {
        return rename(className);
    }
};

goog.setCssNameMapping = function(mapping, opt_style) {
    goog.cssNameMapping_ = mapping;
    goog.cssNameMappingStyle_ = opt_style;
};

goog.global.CLOSURE_CSS_NAME_MAPPING;

if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
    goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}

goog.getMsg = function(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
            return opt_values != null && key in opt_values ? opt_values[key] : match;
        });
    }
    return str;
};

goog.getMsgWithFallback = function(a, b) {
    return a;
};

goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
    goog.exportPath_(publicPath, object, opt_objectToExportTo);
};

goog.exportProperty = function(object, publicName, symbol) {
    object[publicName] = symbol;
};

goog.inherits = function(childCtor, parentCtor) {
    function tempCtor() {}
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
    childCtor.base = function(me, methodName, var_args) {
        var args = new Array(arguments.length - 2);
        for (var i = 2; i < arguments.length; i++) {
            args[i - 2] = arguments[i];
        }
        return parentCtor.prototype[methodName].apply(me, args);
    };
};

goog.base = function(me, opt_methodName, var_args) {
    var caller = arguments.callee.caller;
    if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !caller) {
        throw Error("arguments.caller not defined.  goog.base() cannot be used " + "with strict mode code. See " + "http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    }
    if (caller.superClass_) {
        var ctorArgs = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++) {
            ctorArgs[i - 1] = arguments[i];
        }
        return caller.superClass_.constructor.apply(me, ctorArgs);
    }
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
        args[i - 2] = arguments[i];
    }
    var foundCaller = false;
    for (var ctor = me.constructor; ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
        if (ctor.prototype[opt_methodName] === caller) {
            foundCaller = true;
        } else if (foundCaller) {
            return ctor.prototype[opt_methodName].apply(me, args);
        }
    }
    if (me[opt_methodName] === caller) {
        return me.constructor.prototype[opt_methodName].apply(me, args);
    } else {
        throw Error("goog.base called from a method of one name " + "to a method of a different name");
    }
};

goog.scope = function(fn) {
    fn.call(goog.global);
};

if (!COMPILED) {
    goog.global["COMPILED"] = COMPILED;
}

goog.defineClass = function(superClass, def) {
    var constructor = def.constructor;
    var statics = def.statics;
    if (!constructor || constructor == Object.prototype.constructor) {
        constructor = function() {
            throw Error("cannot instantiate an interface (no constructor defined).");
        };
    }
    var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
    if (superClass) {
        goog.inherits(cls, superClass);
    }
    delete def.constructor;
    delete def.statics;
    goog.defineClass.applyProperties_(cls.prototype, def);
    if (statics != null) {
        if (statics instanceof Function) {
            statics(cls);
        } else {
            goog.defineClass.applyProperties_(cls, statics);
        }
    }
    return cls;
};

goog.defineClass.ClassDescriptor;

goog.define("goog.defineClass.SEAL_CLASS_INSTANCES", goog.DEBUG);

goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
    if (goog.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
        if (superClass && superClass.prototype && superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
            return ctr;
        }
        var wrappedCtr = function() {
            var instance = ctr.apply(this, arguments) || this;
            instance[goog.UID_PROPERTY_] = instance[goog.UID_PROPERTY_];
            if (this.constructor === wrappedCtr) {
                Object.seal(instance);
            }
            return instance;
        };
        return wrappedCtr;
    }
    return ctr;
};

goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];

goog.defineClass.applyProperties_ = function(target, source) {
    var key;
    for (key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
    for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
        key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
};

goog.tagUnsealableClass = function(ctr) {
    if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
        ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
    }
};

goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";

goog.provide("goog.string.StringBuffer");

goog.string.StringBuffer = function(opt_a1, var_args) {
    if (opt_a1 != null) {
        this.append.apply(this, arguments);
    }
};

goog.string.StringBuffer.prototype.buffer_ = "";

goog.string.StringBuffer.prototype.set = function(s) {
    this.buffer_ = "" + s;
};

goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    this.buffer_ += a1;
    if (opt_a2 != null) {
        for (var i = 1; i < arguments.length; i++) {
            this.buffer_ += arguments[i];
        }
    }
    return this;
};

goog.string.StringBuffer.prototype.clear = function() {
    this.buffer_ = "";
};

goog.string.StringBuffer.prototype.getLength = function() {
    return this.buffer_.length;
};

goog.string.StringBuffer.prototype.toString = function() {
    return this.buffer_;
};

goog.provide("goog.dom.NodeType");

goog.dom.NodeType = {
    ELEMENT: 1,
    ATTRIBUTE: 2,
    TEXT: 3,
    CDATA_SECTION: 4,
    ENTITY_REFERENCE: 5,
    ENTITY: 6,
    PROCESSING_INSTRUCTION: 7,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11,
    NOTATION: 12
};

goog.provide("goog.debug.Error");

goog.debug.Error = function(opt_msg) {
    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, goog.debug.Error);
    } else {
        var stack = new Error().stack;
        if (stack) {
            this.stack = stack;
        }
    }
    if (opt_msg) {
        this.message = String(opt_msg);
    }
    this.reportErrorToServer = true;
};

goog.inherits(goog.debug.Error, Error);

goog.debug.Error.prototype.name = "CustomError";

goog.provide("goog.string");

goog.provide("goog.string.Unicode");

goog.define("goog.string.DETECT_DOUBLE_ESCAPING", false);

goog.define("goog.string.FORCE_NON_DOM_HTML_UNESCAPING", false);

goog.string.Unicode = {
    NBSP: " "
};

goog.string.startsWith = function(str, prefix) {
    return str.lastIndexOf(prefix, 0) == 0;
};

goog.string.endsWith = function(str, suffix) {
    var l = str.length - suffix.length;
    return l >= 0 && str.indexOf(suffix, l) == l;
};

goog.string.caseInsensitiveStartsWith = function(str, prefix) {
    return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0;
};

goog.string.caseInsensitiveEndsWith = function(str, suffix) {
    return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};

goog.string.caseInsensitiveEquals = function(str1, str2) {
    return str1.toLowerCase() == str2.toLowerCase();
};

goog.string.subs = function(str, var_args) {
    var splitParts = str.split("%s");
    var returnString = "";
    var subsArguments = Array.prototype.slice.call(arguments, 1);
    while (subsArguments.length && splitParts.length > 1) {
        returnString += splitParts.shift() + subsArguments.shift();
    }
    return returnString + splitParts.join("%s");
};

goog.string.collapseWhitespace = function(str) {
    return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "");
};

goog.string.isEmptyOrWhitespace = function(str) {
    return /^[\s\xa0]*$/.test(str);
};

goog.string.isEmptyString = function(str) {
    return str.length == 0;
};

goog.string.isEmpty = goog.string.isEmptyOrWhitespace;

goog.string.isEmptyOrWhitespaceSafe = function(str) {
    return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};

goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;

goog.string.isBreakingWhitespace = function(str) {
    return !/[^\t\n\r ]/.test(str);
};

goog.string.isAlpha = function(str) {
    return !/[^a-zA-Z]/.test(str);
};

goog.string.isNumeric = function(str) {
    return !/[^0-9]/.test(str);
};

goog.string.isAlphaNumeric = function(str) {
    return !/[^a-zA-Z0-9]/.test(str);
};

goog.string.isSpace = function(ch) {
    return ch == " ";
};

goog.string.isUnicodeChar = function(ch) {
    return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "" && ch <= "�";
};

goog.string.stripNewlines = function(str) {
    return str.replace(/(\r\n|\r|\n)+/g, " ");
};

goog.string.canonicalizeNewlines = function(str) {
    return str.replace(/(\r\n|\r|\n)/g, "\n");
};

goog.string.normalizeWhitespace = function(str) {
    return str.replace(/\xa0|\s/g, " ");
};

goog.string.normalizeSpaces = function(str) {
    return str.replace(/\xa0|[ \t]+/g, " ");
};

goog.string.collapseBreakingSpaces = function(str) {
    return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "");
};

goog.string.trim = goog.TRUSTED_SITE && String.prototype.trim ? function(str) {
    return str.trim();
} : function(str) {
    return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "");
};

goog.string.trimLeft = function(str) {
    return str.replace(/^[\s\xa0]+/, "");
};

goog.string.trimRight = function(str) {
    return str.replace(/[\s\xa0]+$/, "");
};

goog.string.caseInsensitiveCompare = function(str1, str2) {
    var test1 = String(str1).toLowerCase();
    var test2 = String(str2).toLowerCase();
    if (test1 < test2) {
        return -1;
    } else if (test1 == test2) {
        return 0;
    } else {
        return 1;
    }
};

goog.string.numberAwareCompare_ = function(str1, str2, tokenizerRegExp) {
    if (str1 == str2) {
        return 0;
    }
    if (!str1) {
        return -1;
    }
    if (!str2) {
        return 1;
    }
    var tokens1 = str1.toLowerCase().match(tokenizerRegExp);
    var tokens2 = str2.toLowerCase().match(tokenizerRegExp);
    var count = Math.min(tokens1.length, tokens2.length);
    for (var i = 0; i < count; i++) {
        var a = tokens1[i];
        var b = tokens2[i];
        if (a != b) {
            var num1 = parseInt(a, 10);
            if (!isNaN(num1)) {
                var num2 = parseInt(b, 10);
                if (!isNaN(num2) && num1 - num2) {
                    return num1 - num2;
                }
            }
            return a < b ? -1 : 1;
        }
    }
    if (tokens1.length != tokens2.length) {
        return tokens1.length - tokens2.length;
    }
    return str1 < str2 ? -1 : 1;
};

goog.string.intAwareCompare = function(str1, str2) {
    return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};

goog.string.floatAwareCompare = function(str1, str2) {
    return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};

goog.string.numerateCompare = goog.string.floatAwareCompare;

goog.string.urlEncode = function(str) {
    return encodeURIComponent(String(str));
};

goog.string.urlDecode = function(str) {
    return decodeURIComponent(str.replace(/\+/g, " "));
};

goog.string.newLineToBr = function(str, opt_xml) {
    return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>");
};

goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
    if (opt_isLikelyToContainHtmlChars) {
        str = str.replace(goog.string.AMP_RE_, "&amp;").replace(goog.string.LT_RE_, "&lt;").replace(goog.string.GT_RE_, "&gt;").replace(goog.string.QUOT_RE_, "&quot;").replace(goog.string.SINGLE_QUOTE_RE_, "&#39;").replace(goog.string.NULL_RE_, "&#0;");
        if (goog.string.DETECT_DOUBLE_ESCAPING) {
            str = str.replace(goog.string.E_RE_, "&#101;");
        }
        return str;
    } else {
        if (!goog.string.ALL_RE_.test(str)) return str;
        if (str.indexOf("&") != -1) {
            str = str.replace(goog.string.AMP_RE_, "&amp;");
        }
        if (str.indexOf("<") != -1) {
            str = str.replace(goog.string.LT_RE_, "&lt;");
        }
        if (str.indexOf(">") != -1) {
            str = str.replace(goog.string.GT_RE_, "&gt;");
        }
        if (str.indexOf('"') != -1) {
            str = str.replace(goog.string.QUOT_RE_, "&quot;");
        }
        if (str.indexOf("'") != -1) {
            str = str.replace(goog.string.SINGLE_QUOTE_RE_, "&#39;");
        }
        if (str.indexOf("\x00") != -1) {
            str = str.replace(goog.string.NULL_RE_, "&#0;");
        }
        if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf("e") != -1) {
            str = str.replace(goog.string.E_RE_, "&#101;");
        }
        return str;
    }
};

goog.string.AMP_RE_ = /&/g;

goog.string.LT_RE_ = /</g;

goog.string.GT_RE_ = />/g;

goog.string.QUOT_RE_ = /"/g;

goog.string.SINGLE_QUOTE_RE_ = /'/g;

goog.string.NULL_RE_ = /\x00/g;

goog.string.E_RE_ = /e/g;

goog.string.ALL_RE_ = goog.string.DETECT_DOUBLE_ESCAPING ? /[\x00&<>"'e]/ : /[\x00&<>"']/;

goog.string.unescapeEntities = function(str) {
    if (goog.string.contains(str, "&")) {
        if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING && "document" in goog.global) {
            return goog.string.unescapeEntitiesUsingDom_(str);
        } else {
            return goog.string.unescapePureXmlEntities_(str);
        }
    }
    return str;
};

goog.string.unescapeEntitiesWithDocument = function(str, document) {
    if (goog.string.contains(str, "&")) {
        return goog.string.unescapeEntitiesUsingDom_(str, document);
    }
    return str;
};

goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
    var seen = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"'
    };
    var div;
    if (opt_document) {
        div = opt_document.createElement("div");
    } else {
        div = goog.global.document.createElement("div");
    }
    return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
        var value = seen[s];
        if (value) {
            return value;
        }
        if (entity.charAt(0) == "#") {
            var n = Number("0" + entity.substr(1));
            if (!isNaN(n)) {
                value = String.fromCharCode(n);
            }
        }
        if (!value) {
            div.innerHTML = s + " ";
            value = div.firstChild.nodeValue.slice(0, -1);
        }
        return seen[s] = value;
    });
};

goog.string.unescapePureXmlEntities_ = function(str) {
    return str.replace(/&([^;]+);/g, function(s, entity) {
        switch (entity) {
          case "amp":
            return "&";

          case "lt":
            return "<";

          case "gt":
            return ">";

          case "quot":
            return '"';

          default:
            if (entity.charAt(0) == "#") {
                var n = Number("0" + entity.substr(1));
                if (!isNaN(n)) {
                    return String.fromCharCode(n);
                }
            }
            return s;
        }
    });
};

goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;

goog.string.whitespaceEscape = function(str, opt_xml) {
    return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml);
};

goog.string.preserveSpaces = function(str) {
    return str.replace(/(^|[\n ]) /g, "$1" + goog.string.Unicode.NBSP);
};

goog.string.stripQuotes = function(str, quoteChars) {
    var length = quoteChars.length;
    for (var i = 0; i < length; i++) {
        var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
        if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
            return str.substring(1, str.length - 1);
        }
    }
    return str;
};

goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
    if (opt_protectEscapedCharacters) {
        str = goog.string.unescapeEntities(str);
    }
    if (str.length > chars) {
        str = str.substring(0, chars - 3) + "...";
    }
    if (opt_protectEscapedCharacters) {
        str = goog.string.htmlEscape(str);
    }
    return str;
};

goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
    if (opt_protectEscapedCharacters) {
        str = goog.string.unescapeEntities(str);
    }
    if (opt_trailingChars && str.length > chars) {
        if (opt_trailingChars > chars) {
            opt_trailingChars = chars;
        }
        var endPoint = str.length - opt_trailingChars;
        var startPoint = chars - opt_trailingChars;
        str = str.substring(0, startPoint) + "..." + str.substring(endPoint);
    } else if (str.length > chars) {
        var half = Math.floor(chars / 2);
        var endPos = str.length - half;
        half += chars % 2;
        str = str.substring(0, half) + "..." + str.substring(endPos);
    }
    if (opt_protectEscapedCharacters) {
        str = goog.string.htmlEscape(str);
    }
    return str;
};

goog.string.specialEscapeChars_ = {
    "\x00": "\\0",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "	": "\\t",
    "": "\\x0B",
    '"': '\\"',
    "\\": "\\\\",
    "<": "<"
};

goog.string.jsEscapeCache_ = {
    "'": "\\'"
};

goog.string.quote = function(s) {
    s = String(s);
    var sb = [ '"' ];
    for (var i = 0; i < s.length; i++) {
        var ch = s.charAt(i);
        var cc = ch.charCodeAt(0);
        sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join("");
};

goog.string.escapeString = function(str) {
    var sb = [];
    for (var i = 0; i < str.length; i++) {
        sb[i] = goog.string.escapeChar(str.charAt(i));
    }
    return sb.join("");
};

goog.string.escapeChar = function(c) {
    if (c in goog.string.jsEscapeCache_) {
        return goog.string.jsEscapeCache_[c];
    }
    if (c in goog.string.specialEscapeChars_) {
        return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
    }
    var rv = c;
    var cc = c.charCodeAt(0);
    if (cc > 31 && cc < 127) {
        rv = c;
    } else {
        if (cc < 256) {
            rv = "\\x";
            if (cc < 16 || cc > 256) {
                rv += "0";
            }
        } else {
            rv = "\\u";
            if (cc < 4096) {
                rv += "0";
            }
        }
        rv += cc.toString(16).toUpperCase();
    }
    return goog.string.jsEscapeCache_[c] = rv;
};

goog.string.contains = function(str, subString) {
    return str.indexOf(subString) != -1;
};

goog.string.caseInsensitiveContains = function(str, subString) {
    return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};

goog.string.countOf = function(s, ss) {
    return s && ss ? s.split(ss).length - 1 : 0;
};

goog.string.removeAt = function(s, index, stringLength) {
    var resultStr = s;
    if (index >= 0 && index < s.length && stringLength > 0) {
        resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength);
    }
    return resultStr;
};

goog.string.remove = function(s, ss) {
    var re = new RegExp(goog.string.regExpEscape(ss), "");
    return s.replace(re, "");
};

goog.string.removeAll = function(s, ss) {
    var re = new RegExp(goog.string.regExpEscape(ss), "g");
    return s.replace(re, "");
};

goog.string.regExpEscape = function(s) {
    return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08");
};

goog.string.repeat = String.prototype.repeat ? function(string, length) {
    return string.repeat(length);
} : function(string, length) {
    return new Array(length + 1).join(string);
};

goog.string.padNumber = function(num, length, opt_precision) {
    var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
    var index = s.indexOf(".");
    if (index == -1) {
        index = s.length;
    }
    return goog.string.repeat("0", Math.max(0, length - index)) + s;
};

goog.string.makeSafe = function(obj) {
    return obj == null ? "" : String(obj);
};

goog.string.buildString = function(var_args) {
    return Array.prototype.join.call(arguments, "");
};

goog.string.getRandomString = function() {
    var x = 2147483648;
    return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};

goog.string.compareVersions = function(version1, version2) {
    var order = 0;
    var v1Subs = goog.string.trim(String(version1)).split(".");
    var v2Subs = goog.string.trim(String(version2)).split(".");
    var subCount = Math.max(v1Subs.length, v2Subs.length);
    for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
        var v1Sub = v1Subs[subIdx] || "";
        var v2Sub = v2Subs[subIdx] || "";
        var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
        var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
        do {
            var v1Comp = v1CompParser.exec(v1Sub) || [ "", "", "" ];
            var v2Comp = v2CompParser.exec(v2Sub) || [ "", "", "" ];
            if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
                break;
            }
            var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
            var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
            order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2]);
        } while (order == 0);
    }
    return order;
};

goog.string.compareElements_ = function(left, right) {
    if (left < right) {
        return -1;
    } else if (left > right) {
        return 1;
    }
    return 0;
};

goog.string.hashCode = function(str) {
    var result = 0;
    for (var i = 0; i < str.length; ++i) {
        result = 31 * result + str.charCodeAt(i) >>> 0;
    }
    return result;
};

goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;

goog.string.createUniqueString = function() {
    return "goog_" + goog.string.uniqueStringCounter_++;
};

goog.string.toNumber = function(str) {
    var num = Number(str);
    if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
        return NaN;
    }
    return num;
};

goog.string.isLowerCamelCase = function(str) {
    return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};

goog.string.isUpperCamelCase = function(str) {
    return /^([A-Z][a-z]*)+$/.test(str);
};

goog.string.toCamelCase = function(str) {
    return String(str).replace(/\-([a-z])/g, function(all, match) {
        return match.toUpperCase();
    });
};

goog.string.toSelectorCase = function(str) {
    return String(str).replace(/([A-Z])/g, "-$1").toLowerCase();
};

goog.string.toTitleCase = function(str, opt_delimiters) {
    var delimiters = goog.isString(opt_delimiters) ? goog.string.regExpEscape(opt_delimiters) : "\\s";
    delimiters = delimiters ? "|[" + delimiters + "]+" : "";
    var regexp = new RegExp("(^" + delimiters + ")([a-z])", "g");
    return str.replace(regexp, function(all, p1, p2) {
        return p1 + p2.toUpperCase();
    });
};

goog.string.capitalize = function(str) {
    return String(str.charAt(0)).toUpperCase() + String(str.substr(1)).toLowerCase();
};

goog.string.parseInt = function(value) {
    if (isFinite(value)) {
        value = String(value);
    }
    if (goog.isString(value)) {
        return /^\s*-?0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
    }
    return NaN;
};

goog.string.splitLimit = function(str, separator, limit) {
    var parts = str.split(separator);
    var returnVal = [];
    while (limit > 0 && parts.length) {
        returnVal.push(parts.shift());
        limit--;
    }
    if (parts.length) {
        returnVal.push(parts.join(separator));
    }
    return returnVal;
};

goog.string.editDistance = function(a, b) {
    var v0 = [];
    var v1 = [];
    if (a == b) {
        return 0;
    }
    if (!a.length || !b.length) {
        return Math.max(a.length, b.length);
    }
    for (var i = 0; i < b.length + 1; i++) {
        v0[i] = i;
    }
    for (var i = 0; i < a.length; i++) {
        v1[0] = i + 1;
        for (var j = 0; j < b.length; j++) {
            var cost = a[i] != b[j];
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
        }
        for (var j = 0; j < v0.length; j++) {
            v0[j] = v1[j];
        }
    }
    return v1[b.length];
};

goog.provide("goog.asserts");

goog.provide("goog.asserts.AssertionError");

goog.require("goog.debug.Error");

goog.require("goog.dom.NodeType");

goog.require("goog.string");

goog.define("goog.asserts.ENABLE_ASSERTS", goog.DEBUG);

goog.asserts.AssertionError = function(messagePattern, messageArgs) {
    messageArgs.unshift(messagePattern);
    goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
    messageArgs.shift();
    this.messagePattern = messagePattern;
};

goog.inherits(goog.asserts.AssertionError, goog.debug.Error);

goog.asserts.AssertionError.prototype.name = "AssertionError";

goog.asserts.DEFAULT_ERROR_HANDLER = function(e) {
    throw e;
};

goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;

goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
    var message = "Assertion failed";
    if (givenMessage) {
        message += ": " + givenMessage;
        var args = givenArgs;
    } else if (defaultMessage) {
        message += ": " + defaultMessage;
        args = defaultArgs;
    }
    var e = new goog.asserts.AssertionError("" + message, args || []);
    goog.asserts.errorHandler_(e);
};

goog.asserts.setErrorHandler = function(errorHandler) {
    if (goog.asserts.ENABLE_ASSERTS) {
        goog.asserts.errorHandler_ = errorHandler;
    }
};

goog.asserts.assert = function(condition, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !condition) {
        goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return condition;
};

goog.asserts.fail = function(opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS) {
        goog.asserts.errorHandler_(new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1)));
    }
};

goog.asserts.assertNumber = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
        goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertString = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
        goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertFunction = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
        goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertObject = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
        goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertArray = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
        goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertBoolean = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
        goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertElement = function(value, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) || value.nodeType != goog.dom.NodeType.ELEMENT)) {
        goog.asserts.doAssertFailure_("Expected Element but got %s: %s.", [ goog.typeOf(value), value ], opt_message, Array.prototype.slice.call(arguments, 2));
    }
    return value;
};

goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
    if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
        goog.asserts.doAssertFailure_("Expected instanceof %s but got %s.", [ goog.asserts.getType_(type), goog.asserts.getType_(value) ], opt_message, Array.prototype.slice.call(arguments, 3));
    }
    return value;
};

goog.asserts.assertObjectPrototypeIsIntact = function() {
    for (var key in Object.prototype) {
        goog.asserts.fail(key + " should not be enumerable in Object.prototype.");
    }
};

goog.asserts.getType_ = function(value) {
    if (value instanceof Function) {
        return value.displayName || value.name || "unknown type name";
    } else if (value instanceof Object) {
        return value.constructor.displayName || value.constructor.name || Object.prototype.toString.call(value);
    } else {
        return value === null ? "null" : typeof value;
    }
};

goog.provide("goog.string.TypedString");

goog.string.TypedString = function() {};

goog.string.TypedString.prototype.implementsGoogStringTypedString;

goog.string.TypedString.prototype.getTypedStringValue;

goog.provide("goog.string.Const");

goog.require("goog.asserts");

goog.require("goog.string.TypedString");

goog.string.Const = function() {
    this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = "";
    this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ = goog.string.Const.TYPE_MARKER_;
};

goog.string.Const.prototype.implementsGoogStringTypedString = true;

goog.string.Const.prototype.getTypedStringValue = function() {
    return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};

goog.string.Const.prototype.toString = function() {
    return "Const{" + this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ + "}";
};

goog.string.Const.unwrap = function(stringConst) {
    if (stringConst instanceof goog.string.Const && stringConst.constructor === goog.string.Const && stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ === goog.string.Const.TYPE_MARKER_) {
        return stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
    } else {
        goog.asserts.fail("expected object of type Const, got '" + stringConst + "'");
        return "type_error:Const";
    }
};

goog.string.Const.from = function(s) {
    return goog.string.Const.create__googStringSecurityPrivate_(s);
};

goog.string.Const.TYPE_MARKER_ = {};

goog.string.Const.create__googStringSecurityPrivate_ = function(s) {
    var stringConst = new goog.string.Const();
    stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = s;
    return stringConst;
};

goog.provide("goog.fs.url");

goog.fs.url.createObjectUrl = function(blob) {
    return goog.fs.url.getUrlObject_().createObjectURL(blob);
};

goog.fs.url.revokeObjectUrl = function(url) {
    goog.fs.url.getUrlObject_().revokeObjectURL(url);
};

goog.fs.url.UrlObject_;

goog.fs.url.getUrlObject_ = function() {
    var urlObject = goog.fs.url.findUrlObject_();
    if (urlObject != null) {
        return urlObject;
    } else {
        throw Error("This browser doesn't seem to support blob URLs");
    }
};

goog.fs.url.findUrlObject_ = function() {
    if (goog.isDef(goog.global.URL) && goog.isDef(goog.global.URL.createObjectURL)) {
        return goog.global.URL;
    } else if (goog.isDef(goog.global.webkitURL) && goog.isDef(goog.global.webkitURL.createObjectURL)) {
        return goog.global.webkitURL;
    } else if (goog.isDef(goog.global.createObjectURL)) {
        return goog.global;
    } else {
        return null;
    }
};

goog.fs.url.browserSupportsObjectUrls = function() {
    return goog.fs.url.findUrlObject_() != null;
};

goog.provide("goog.i18n.bidi");

goog.provide("goog.i18n.bidi.Dir");

goog.provide("goog.i18n.bidi.DirectionalString");

goog.provide("goog.i18n.bidi.Format");

goog.define("goog.i18n.bidi.FORCE_RTL", false);

goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL || (goog.LOCALE.substring(0, 2).toLowerCase() == "ar" || goog.LOCALE.substring(0, 2).toLowerCase() == "fa" || goog.LOCALE.substring(0, 2).toLowerCase() == "he" || goog.LOCALE.substring(0, 2).toLowerCase() == "iw" || goog.LOCALE.substring(0, 2).toLowerCase() == "ps" || goog.LOCALE.substring(0, 2).toLowerCase() == "sd" || goog.LOCALE.substring(0, 2).toLowerCase() == "ug" || goog.LOCALE.substring(0, 2).toLowerCase() == "ur" || goog.LOCALE.substring(0, 2).toLowerCase() == "yi") && (goog.LOCALE.length == 2 || goog.LOCALE.substring(2, 3) == "-" || goog.LOCALE.substring(2, 3) == "_") || goog.LOCALE.length >= 3 && goog.LOCALE.substring(0, 3).toLowerCase() == "ckb" && (goog.LOCALE.length == 3 || goog.LOCALE.substring(3, 4) == "-" || goog.LOCALE.substring(3, 4) == "_");

goog.i18n.bidi.Format = {
    LRE: "‪",
    RLE: "‫",
    PDF: "‬",
    LRM: "‎",
    RLM: "‏"
};

goog.i18n.bidi.Dir = {
    LTR: 1,
    RTL: -1,
    NEUTRAL: 0
};

goog.i18n.bidi.RIGHT = "right";

goog.i18n.bidi.LEFT = "left";

goog.i18n.bidi.I18N_RIGHT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;

goog.i18n.bidi.I18N_LEFT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;

goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
    if (typeof givenDir == "number") {
        return givenDir > 0 ? goog.i18n.bidi.Dir.LTR : givenDir < 0 ? goog.i18n.bidi.Dir.RTL : opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL;
    } else if (givenDir == null) {
        return null;
    } else {
        return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
    }
};

goog.i18n.bidi.ltrChars_ = "A-Za-zÀ-ÖØ-öø-ʸ̀-֐ࠀ-῿" + "‎Ⰰ-﬜︀-﹯﻽-￿";

goog.i18n.bidi.rtlChars_ = "֑-ۯۺ-߿‏יִ-﷿ﹰ-ﻼ";

goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;

goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
    return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, "") : str;
};

goog.i18n.bidi.rtlCharReg_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "]");

goog.i18n.bidi.ltrCharReg_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "]");

goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
    return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;

goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
    return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.ltrRe_ = new RegExp("^[" + goog.i18n.bidi.ltrChars_ + "]");

goog.i18n.bidi.rtlRe_ = new RegExp("^[" + goog.i18n.bidi.rtlChars_ + "]");

goog.i18n.bidi.isRtlChar = function(str) {
    return goog.i18n.bidi.rtlRe_.test(str);
};

goog.i18n.bidi.isLtrChar = function(str) {
    return goog.i18n.bidi.ltrRe_.test(str);
};

goog.i18n.bidi.isNeutralChar = function(str) {
    return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};

goog.i18n.bidi.ltrDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.rtlChars_ + "]*[" + goog.i18n.bidi.ltrChars_ + "]");

goog.i18n.bidi.rtlDirCheckRe_ = new RegExp("^[^" + goog.i18n.bidi.ltrChars_ + "]*[" + goog.i18n.bidi.rtlChars_ + "]");

goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
    return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;

goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
    return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;

goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;

goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
    str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
    return goog.i18n.bidi.isRequiredLtrRe_.test(str) || !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};

goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.ltrChars_ + "][^" + goog.i18n.bidi.rtlChars_ + "]*$");

goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp("[" + goog.i18n.bidi.rtlChars_ + "][^" + goog.i18n.bidi.ltrChars_ + "]*$");

goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
    return goog.i18n.bidi.ltrExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;

goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
    return goog.i18n.bidi.rtlExitDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};

goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;

goog.i18n.bidi.rtlLocalesRe_ = new RegExp("^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|" + ".*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))" + "(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)", "i");

goog.i18n.bidi.isRtlLanguage = function(lang) {
    return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};

goog.i18n.bidi.bracketGuardHtmlRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(&lt;.*?(&gt;)+)/g;

goog.i18n.bidi.bracketGuardTextRe_ = /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;

goog.i18n.bidi.guardBracketInHtml = function(s, opt_isRtlContext) {
    var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
    if (useRtl) {
        return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_, "<span dir=rtl>$&</span>");
    }
    return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_, "<span dir=ltr>$&</span>");
};

goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
    var useRtl = opt_isRtlContext === undefined ? goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
    var mark = useRtl ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
    return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + "$&" + mark);
};

goog.i18n.bidi.enforceRtlInHtml = function(html) {
    if (html.charAt(0) == "<") {
        return html.replace(/<\w+/, "$& dir=rtl");
    }
    return "\n<span dir=rtl>" + html + "</span>";
};

goog.i18n.bidi.enforceRtlInText = function(text) {
    return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};

goog.i18n.bidi.enforceLtrInHtml = function(html) {
    if (html.charAt(0) == "<") {
        return html.replace(/<\w+/, "$& dir=ltr");
    }
    return "\n<span dir=ltr>" + html + "</span>";
};

goog.i18n.bidi.enforceLtrInText = function(text) {
    return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};

goog.i18n.bidi.dimensionsRe_ = /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;

goog.i18n.bidi.leftRe_ = /left/gi;

goog.i18n.bidi.rightRe_ = /right/gi;

goog.i18n.bidi.tempRe_ = /%%%%/g;

goog.i18n.bidi.mirrorCSS = function(cssStr) {
    return cssStr.replace(goog.i18n.bidi.dimensionsRe_, ":$1 $4 $3 $2").replace(goog.i18n.bidi.leftRe_, "%%%%").replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};

goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;

goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;

goog.i18n.bidi.normalizeHebrewQuote = function(str) {
    return str.replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, "$1״").replace(goog.i18n.bidi.singleQuoteSubstituteRe_, "$1׳");
};

goog.i18n.bidi.wordSeparatorRe_ = /\s+/;

goog.i18n.bidi.hasNumeralsRe_ = /[\d\u06f0-\u06f9]/;

goog.i18n.bidi.rtlDetectionThreshold_ = .4;

goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
    var rtlCount = 0;
    var totalCount = 0;
    var hasWeaklyLtr = false;
    var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).split(goog.i18n.bidi.wordSeparatorRe_);
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (goog.i18n.bidi.startsWithRtl(token)) {
            rtlCount++;
            totalCount++;
        } else if (goog.i18n.bidi.isRequiredLtrRe_.test(token)) {
            hasWeaklyLtr = true;
        } else if (goog.i18n.bidi.hasAnyLtr(token)) {
            totalCount++;
        } else if (goog.i18n.bidi.hasNumeralsRe_.test(token)) {
            hasWeaklyLtr = true;
        }
    }
    return totalCount == 0 ? hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL : rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
};

goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
    return goog.i18n.bidi.estimateDirection(str, opt_isHtml) == goog.i18n.bidi.Dir.RTL;
};

goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
    if (element) {
        dir = goog.i18n.bidi.toDir(dir);
        if (dir) {
            element.style.textAlign = dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
            element.dir = dir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr";
        }
    }
};

goog.i18n.bidi.setElementDirByTextDirectionality = function(element, text) {
    switch (goog.i18n.bidi.estimateDirection(text)) {
      case goog.i18n.bidi.Dir.LTR:
        element.dir = "ltr";
        break;

      case goog.i18n.bidi.Dir.RTL:
        element.dir = "rtl";
        break;

      default:
        element.removeAttribute("dir");
    }
};

goog.i18n.bidi.DirectionalString = function() {};

goog.i18n.bidi.DirectionalString.prototype.implementsGoogI18nBidiDirectionalString;

goog.i18n.bidi.DirectionalString.prototype.getDirection;

goog.provide("goog.html.SafeUrl");

goog.require("goog.asserts");

goog.require("goog.fs.url");

goog.require("goog.i18n.bidi.Dir");

goog.require("goog.i18n.bidi.DirectionalString");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.SafeUrl = function() {
    this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = "";
    this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};

goog.html.SafeUrl.INNOCUOUS_STRING = "about:invalid#zClosurez";

goog.html.SafeUrl.prototype.implementsGoogStringTypedString = true;

goog.html.SafeUrl.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};

goog.html.SafeUrl.prototype.implementsGoogI18nBidiDirectionalString = true;

goog.html.SafeUrl.prototype.getDirection = function() {
    return goog.i18n.bidi.Dir.LTR;
};

if (goog.DEBUG) {
    goog.html.SafeUrl.prototype.toString = function() {
        return "SafeUrl{" + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ + "}";
    };
}

goog.html.SafeUrl.unwrap = function(safeUrl) {
    if (safeUrl instanceof goog.html.SafeUrl && safeUrl.constructor === goog.html.SafeUrl && safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type SafeUrl, got '" + safeUrl + "'");
        return "type_error:SafeUrl";
    }
};

goog.html.SafeUrl.fromConstant = function(url) {
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};

goog.html.SAFE_MIME_TYPE_PATTERN_ = /^(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm))$/i;

goog.html.SafeUrl.fromBlob = function(blob) {
    var url = goog.html.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ? goog.fs.url.createObjectUrl(blob) : goog.html.SafeUrl.INNOCUOUS_STRING;
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.html.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;

goog.html.SafeUrl.fromDataUrl = function(dataUrl) {
    var match = dataUrl.match(goog.html.DATA_URL_PATTERN_);
    var valid = match && goog.html.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(valid ? dataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
};

goog.html.SAFE_URL_PATTERN_ = /^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i;

goog.html.SafeUrl.sanitize = function(url) {
    if (url instanceof goog.html.SafeUrl) {
        return url;
    } else if (url.implementsGoogStringTypedString) {
        url = url.getTypedStringValue();
    } else {
        url = String(url);
    }
    if (!goog.html.SAFE_URL_PATTERN_.test(url)) {
        url = goog.html.SafeUrl.INNOCUOUS_STRING;
    }
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse = function(url) {
    var safeUrl = new goog.html.SafeUrl();
    safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = url;
    return safeUrl;
};

goog.provide("goog.array");

goog.provide("goog.array.ArrayLike");

goog.require("goog.asserts");

goog.define("goog.NATIVE_ARRAY_PROTOTYPES", goog.TRUSTED_SITE);

goog.define("goog.array.ASSUME_NATIVE_FUNCTIONS", false);

goog.array.ArrayLike;

goog.array.peek = function(array) {
    return array[array.length - 1];
};

goog.array.last = goog.array.peek;

goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.indexOf) ? function(arr, obj, opt_fromIndex) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.indexOf.call(arr, obj, opt_fromIndex);
} : function(arr, obj, opt_fromIndex) {
    var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
    if (goog.isString(arr)) {
        if (!goog.isString(obj) || obj.length != 1) {
            return -1;
        }
        return arr.indexOf(obj, fromIndex);
    }
    for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj) return i;
    }
    return -1;
};

goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.lastIndexOf) ? function(arr, obj, opt_fromIndex) {
    goog.asserts.assert(arr.length != null);
    var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
    return Array.prototype.lastIndexOf.call(arr, obj, fromIndex);
} : function(arr, obj, opt_fromIndex) {
    var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
    if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
    }
    if (goog.isString(arr)) {
        if (!goog.isString(obj) || obj.length != 1) {
            return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
    }
    for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj) return i;
    }
    return -1;
};

goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.forEach) ? function(arr, f, opt_obj) {
    goog.asserts.assert(arr.length != null);
    Array.prototype.forEach.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2) {
            f.call(opt_obj, arr2[i], i, arr);
        }
    }
};

goog.array.forEachRight = function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = l - 1; i >= 0; --i) {
        if (i in arr2) {
            f.call(opt_obj, arr2[i], i, arr);
        }
    }
};

goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.filter) ? function(arr, f, opt_obj) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.filter.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
    var l = arr.length;
    var res = [];
    var resLength = 0;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2) {
            var val = arr2[i];
            if (f.call(opt_obj, val, i, arr)) {
                res[resLength++] = val;
            }
        }
    }
    return res;
};

goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.map) ? function(arr, f, opt_obj) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.map.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
    var l = arr.length;
    var res = new Array(l);
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2) {
            res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
    }
    return res;
};

goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduce) ? function(arr, f, val, opt_obj) {
    goog.asserts.assert(arr.length != null);
    if (opt_obj) {
        f = goog.bind(f, opt_obj);
    }
    return Array.prototype.reduce.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
    var rval = val;
    goog.array.forEach(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
    });
    return rval;
};

goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.reduceRight) ? function(arr, f, val, opt_obj) {
    goog.asserts.assert(arr.length != null);
    if (opt_obj) {
        f = goog.bind(f, opt_obj);
    }
    return Array.prototype.reduceRight.call(arr, f, val);
} : function(arr, f, val, opt_obj) {
    var rval = val;
    goog.array.forEachRight(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
    });
    return rval;
};

goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.some) ? function(arr, f, opt_obj) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.some.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
            return true;
        }
    }
    return false;
};

goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && (goog.array.ASSUME_NATIVE_FUNCTIONS || Array.prototype.every) ? function(arr, f, opt_obj) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.every.call(arr, f, opt_obj);
} : function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
            return false;
        }
    }
    return true;
};

goog.array.count = function(arr, f, opt_obj) {
    var count = 0;
    goog.array.forEach(arr, function(element, index, arr) {
        if (f.call(opt_obj, element, index, arr)) {
            ++count;
        }
    }, opt_obj);
    return count;
};

goog.array.find = function(arr, f, opt_obj) {
    var i = goog.array.findIndex(arr, f, opt_obj);
    return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};

goog.array.findIndex = function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
            return i;
        }
    }
    return -1;
};

goog.array.findRight = function(arr, f, opt_obj) {
    var i = goog.array.findIndexRight(arr, f, opt_obj);
    return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};

goog.array.findIndexRight = function(arr, f, opt_obj) {
    var l = arr.length;
    var arr2 = goog.isString(arr) ? arr.split("") : arr;
    for (var i = l - 1; i >= 0; i--) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
            return i;
        }
    }
    return -1;
};

goog.array.contains = function(arr, obj) {
    return goog.array.indexOf(arr, obj) >= 0;
};

goog.array.isEmpty = function(arr) {
    return arr.length == 0;
};

goog.array.clear = function(arr) {
    if (!goog.isArray(arr)) {
        for (var i = arr.length - 1; i >= 0; i--) {
            delete arr[i];
        }
    }
    arr.length = 0;
};

goog.array.insert = function(arr, obj) {
    if (!goog.array.contains(arr, obj)) {
        arr.push(obj);
    }
};

goog.array.insertAt = function(arr, obj, opt_i) {
    goog.array.splice(arr, opt_i, 0, obj);
};

goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
    goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};

goog.array.insertBefore = function(arr, obj, opt_obj2) {
    var i;
    if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
        arr.push(obj);
    } else {
        goog.array.insertAt(arr, obj, i);
    }
};

goog.array.remove = function(arr, obj) {
    var i = goog.array.indexOf(arr, obj);
    var rv;
    if (rv = i >= 0) {
        goog.array.removeAt(arr, i);
    }
    return rv;
};

goog.array.removeAt = function(arr, i) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.splice.call(arr, i, 1).length == 1;
};

goog.array.removeIf = function(arr, f, opt_obj) {
    var i = goog.array.findIndex(arr, f, opt_obj);
    if (i >= 0) {
        goog.array.removeAt(arr, i);
        return true;
    }
    return false;
};

goog.array.removeAllIf = function(arr, f, opt_obj) {
    var removedCount = 0;
    goog.array.forEachRight(arr, function(val, index) {
        if (f.call(opt_obj, val, index, arr)) {
            if (goog.array.removeAt(arr, index)) {
                removedCount++;
            }
        }
    });
    return removedCount;
};

goog.array.concat = function(var_args) {
    return Array.prototype.concat.apply(Array.prototype, arguments);
};

goog.array.join = function(var_args) {
    return Array.prototype.concat.apply(Array.prototype, arguments);
};

goog.array.toArray = function(object) {
    var length = object.length;
    if (length > 0) {
        var rv = new Array(length);
        for (var i = 0; i < length; i++) {
            rv[i] = object[i];
        }
        return rv;
    }
    return [];
};

goog.array.clone = goog.array.toArray;

goog.array.extend = function(arr1, var_args) {
    for (var i = 1; i < arguments.length; i++) {
        var arr2 = arguments[i];
        if (goog.isArrayLike(arr2)) {
            var len1 = arr1.length || 0;
            var len2 = arr2.length || 0;
            arr1.length = len1 + len2;
            for (var j = 0; j < len2; j++) {
                arr1[len1 + j] = arr2[j];
            }
        } else {
            arr1.push(arr2);
        }
    }
};

goog.array.splice = function(arr, index, howMany, var_args) {
    goog.asserts.assert(arr.length != null);
    return Array.prototype.splice.apply(arr, goog.array.slice(arguments, 1));
};

goog.array.slice = function(arr, start, opt_end) {
    goog.asserts.assert(arr.length != null);
    if (arguments.length <= 2) {
        return Array.prototype.slice.call(arr, start);
    } else {
        return Array.prototype.slice.call(arr, start, opt_end);
    }
};

goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
    var returnArray = opt_rv || arr;
    var defaultHashFn = function(item) {
        return goog.isObject(item) ? "o" + goog.getUid(item) : (typeof item).charAt(0) + item;
    };
    var hashFn = opt_hashFn || defaultHashFn;
    var seen = {}, cursorInsert = 0, cursorRead = 0;
    while (cursorRead < arr.length) {
        var current = arr[cursorRead++];
        var key = hashFn(current);
        if (!Object.prototype.hasOwnProperty.call(seen, key)) {
            seen[key] = true;
            returnArray[cursorInsert++] = current;
        }
    }
    returnArray.length = cursorInsert;
};

goog.array.binarySearch = function(arr, target, opt_compareFn) {
    return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target);
};

goog.array.binarySelect = function(arr, evaluator, opt_obj) {
    return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj);
};

goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
    var left = 0;
    var right = arr.length;
    var found;
    while (left < right) {
        var middle = left + right >> 1;
        var compareResult;
        if (isEvaluator) {
            compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
        } else {
            compareResult = compareFn(opt_target, arr[middle]);
        }
        if (compareResult > 0) {
            left = middle + 1;
        } else {
            right = middle;
            found = !compareResult;
        }
    }
    return found ? left : ~left;
};

goog.array.sort = function(arr, opt_compareFn) {
    arr.sort(opt_compareFn || goog.array.defaultCompare);
};

goog.array.stableSort = function(arr, opt_compareFn) {
    for (var i = 0; i < arr.length; i++) {
        arr[i] = {
            index: i,
            value: arr[i]
        };
    }
    var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
    function stableCompareFn(obj1, obj2) {
        return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
    }
    goog.array.sort(arr, stableCompareFn);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].value;
    }
};

goog.array.sortByKey = function(arr, keyFn, opt_compareFn) {
    var keyCompareFn = opt_compareFn || goog.array.defaultCompare;
    goog.array.sort(arr, function(a, b) {
        return keyCompareFn(keyFn(a), keyFn(b));
    });
};

goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
    goog.array.sortByKey(arr, function(obj) {
        return obj[key];
    }, opt_compareFn);
};

goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
    var compare = opt_compareFn || goog.array.defaultCompare;
    for (var i = 1; i < arr.length; i++) {
        var compareResult = compare(arr[i - 1], arr[i]);
        if (compareResult > 0 || compareResult == 0 && opt_strict) {
            return false;
        }
    }
    return true;
};

goog.array.equals = function(arr1, arr2, opt_equalsFn) {
    if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
        return false;
    }
    var l = arr1.length;
    var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
    for (var i = 0; i < l; i++) {
        if (!equalsFn(arr1[i], arr2[i])) {
            return false;
        }
    }
    return true;
};

goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
    var compare = opt_compareFn || goog.array.defaultCompare;
    var l = Math.min(arr1.length, arr2.length);
    for (var i = 0; i < l; i++) {
        var result = compare(arr1[i], arr2[i]);
        if (result != 0) {
            return result;
        }
    }
    return goog.array.defaultCompare(arr1.length, arr2.length);
};

goog.array.defaultCompare = function(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
};

goog.array.inverseDefaultCompare = function(a, b) {
    return -goog.array.defaultCompare(a, b);
};

goog.array.defaultCompareEquality = function(a, b) {
    return a === b;
};

goog.array.binaryInsert = function(array, value, opt_compareFn) {
    var index = goog.array.binarySearch(array, value, opt_compareFn);
    if (index < 0) {
        goog.array.insertAt(array, value, -(index + 1));
        return true;
    }
    return false;
};

goog.array.binaryRemove = function(array, value, opt_compareFn) {
    var index = goog.array.binarySearch(array, value, opt_compareFn);
    return index >= 0 ? goog.array.removeAt(array, index) : false;
};

goog.array.bucket = function(array, sorter, opt_obj) {
    var buckets = {};
    for (var i = 0; i < array.length; i++) {
        var value = array[i];
        var key = sorter.call(opt_obj, value, i, array);
        if (goog.isDef(key)) {
            var bucket = buckets[key] || (buckets[key] = []);
            bucket.push(value);
        }
    }
    return buckets;
};

goog.array.toObject = function(arr, keyFunc, opt_obj) {
    var ret = {};
    goog.array.forEach(arr, function(element, index) {
        ret[keyFunc.call(opt_obj, element, index, arr)] = element;
    });
    return ret;
};

goog.array.range = function(startOrEnd, opt_end, opt_step) {
    var array = [];
    var start = 0;
    var end = startOrEnd;
    var step = opt_step || 1;
    if (opt_end !== undefined) {
        start = startOrEnd;
        end = opt_end;
    }
    if (step * (end - start) < 0) {
        return [];
    }
    if (step > 0) {
        for (var i = start; i < end; i += step) {
            array.push(i);
        }
    } else {
        for (var i = start; i > end; i += step) {
            array.push(i);
        }
    }
    return array;
};

goog.array.repeat = function(value, n) {
    var array = [];
    for (var i = 0; i < n; i++) {
        array[i] = value;
    }
    return array;
};

goog.array.flatten = function(var_args) {
    var CHUNK_SIZE = 8192;
    var result = [];
    for (var i = 0; i < arguments.length; i++) {
        var element = arguments[i];
        if (goog.isArray(element)) {
            for (var c = 0; c < element.length; c += CHUNK_SIZE) {
                var chunk = goog.array.slice(element, c, c + CHUNK_SIZE);
                var recurseResult = goog.array.flatten.apply(null, chunk);
                for (var r = 0; r < recurseResult.length; r++) {
                    result.push(recurseResult[r]);
                }
            }
        } else {
            result.push(element);
        }
    }
    return result;
};

goog.array.rotate = function(array, n) {
    goog.asserts.assert(array.length != null);
    if (array.length) {
        n %= array.length;
        if (n > 0) {
            Array.prototype.unshift.apply(array, array.splice(-n, n));
        } else if (n < 0) {
            Array.prototype.push.apply(array, array.splice(0, -n));
        }
    }
    return array;
};

goog.array.moveItem = function(arr, fromIndex, toIndex) {
    goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
    goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
    var removedItems = Array.prototype.splice.call(arr, fromIndex, 1);
    Array.prototype.splice.call(arr, toIndex, 0, removedItems[0]);
};

goog.array.zip = function(var_args) {
    if (!arguments.length) {
        return [];
    }
    var result = [];
    var minLen = arguments[0].length;
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i].length < minLen) {
            minLen = arguments[i].length;
        }
    }
    for (var i = 0; i < minLen; i++) {
        var value = [];
        for (var j = 0; j < arguments.length; j++) {
            value.push(arguments[j][i]);
        }
        result.push(value);
    }
    return result;
};

goog.array.shuffle = function(arr, opt_randFn) {
    var randFn = opt_randFn || Math.random;
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(randFn() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
};

goog.array.copyByIndex = function(arr, index_arr) {
    var result = [];
    goog.array.forEach(index_arr, function(index) {
        result.push(arr[index]);
    });
    return result;
};

goog.provide("goog.html.SafeStyle");

goog.require("goog.array");

goog.require("goog.asserts");

goog.require("goog.string");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.SafeStyle = function() {
    this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = "";
    this.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};

goog.html.SafeStyle.prototype.implementsGoogStringTypedString = true;

goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.SafeStyle.fromConstant = function(style) {
    var styleString = goog.string.Const.unwrap(style);
    if (styleString.length === 0) {
        return goog.html.SafeStyle.EMPTY;
    }
    goog.html.SafeStyle.checkStyle_(styleString);
    goog.asserts.assert(goog.string.endsWith(styleString, ";"), "Last character of style string is not ';': " + styleString);
    goog.asserts.assert(goog.string.contains(styleString, ":"), "Style string must contain at least one ':', to " + 'specify a "name: value" pair: ' + styleString);
    return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(styleString);
};

goog.html.SafeStyle.checkStyle_ = function(style) {
    goog.asserts.assert(!/[<>]/.test(style), "Forbidden characters in style string: " + style);
};

goog.html.SafeStyle.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
};

if (goog.DEBUG) {
    goog.html.SafeStyle.prototype.toString = function() {
        return "SafeStyle{" + this.privateDoNotAccessOrElseSafeStyleWrappedValue_ + "}";
    };
}

goog.html.SafeStyle.unwrap = function(safeStyle) {
    if (safeStyle instanceof goog.html.SafeStyle && safeStyle.constructor === goog.html.SafeStyle && safeStyle.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type SafeStyle, got '" + safeStyle + "'");
        return "type_error:SafeStyle";
    }
};

goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse = function(style) {
    return new goog.html.SafeStyle().initSecurityPrivateDoNotAccessOrElse_(style);
};

goog.html.SafeStyle.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(style) {
    this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = style;
    return this;
};

goog.html.SafeStyle.EMPTY = goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse("");

goog.html.SafeStyle.INNOCUOUS_STRING = "zClosurez";

goog.html.SafeStyle.PropertyMap;

goog.html.SafeStyle.create = function(map) {
    var style = "";
    for (var name in map) {
        if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
            throw Error("Name allows only [-_a-zA-Z0-9], got: " + name);
        }
        var value = map[name];
        if (value == null) {
            continue;
        }
        if (value instanceof goog.string.Const) {
            value = goog.string.Const.unwrap(value);
            goog.asserts.assert(!/[{;}]/.test(value), "Value does not allow [{;}].");
        } else if (!goog.html.SafeStyle.VALUE_RE_.test(value)) {
            goog.asserts.fail("String value allows only [-,.\"'%_!# a-zA-Z0-9], got: " + value);
            value = goog.html.SafeStyle.INNOCUOUS_STRING;
        } else if (!goog.html.SafeStyle.hasBalancedQuotes_(value)) {
            goog.asserts.fail("String value requires balanced quotes, got: " + value);
            value = goog.html.SafeStyle.INNOCUOUS_STRING;
        }
        style += name + ":" + value + ";";
    }
    if (!style) {
        return goog.html.SafeStyle.EMPTY;
    }
    goog.html.SafeStyle.checkStyle_(style);
    return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};

goog.html.SafeStyle.hasBalancedQuotes_ = function(value) {
    var outsideSingle = true;
    var outsideDouble = true;
    for (var i = 0; i < value.length; i++) {
        var c = value.charAt(i);
        if (c == "'" && outsideDouble) {
            outsideSingle = !outsideSingle;
        } else if (c == '"' && outsideSingle) {
            outsideDouble = !outsideDouble;
        }
    }
    return outsideSingle && outsideDouble;
};

goog.html.SafeStyle.VALUE_RE_ = /^[-,."'%_!# a-zA-Z0-9]+$/;

goog.html.SafeStyle.concat = function(var_args) {
    var style = "";
    var addArgument = function(argument) {
        if (goog.isArray(argument)) {
            goog.array.forEach(argument, addArgument);
        } else {
            style += goog.html.SafeStyle.unwrap(argument);
        }
    };
    goog.array.forEach(arguments, addArgument);
    if (!style) {
        return goog.html.SafeStyle.EMPTY;
    }
    return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};

goog.provide("goog.html.SafeScript");

goog.require("goog.asserts");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.SafeScript = function() {
    this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = "";
    this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};

goog.html.SafeScript.prototype.implementsGoogStringTypedString = true;

goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.SafeScript.fromConstant = function(script) {
    var scriptString = goog.string.Const.unwrap(script);
    if (scriptString.length === 0) {
        return goog.html.SafeScript.EMPTY;
    }
    return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(scriptString);
};

goog.html.SafeScript.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseSafeScriptWrappedValue_;
};

if (goog.DEBUG) {
    goog.html.SafeScript.prototype.toString = function() {
        return "SafeScript{" + this.privateDoNotAccessOrElseSafeScriptWrappedValue_ + "}";
    };
}

goog.html.SafeScript.unwrap = function(safeScript) {
    if (safeScript instanceof goog.html.SafeScript && safeScript.constructor === goog.html.SafeScript && safeScript.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type SafeScript, got '" + safeScript + "'");
        return "type_error:SafeScript";
    }
};

goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse = function(script) {
    return new goog.html.SafeScript().initSecurityPrivateDoNotAccessOrElse_(script);
};

goog.html.SafeScript.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(script) {
    this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = script;
    return this;
};

goog.html.SafeScript.EMPTY = goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse("");

goog.provide("goog.html.TrustedResourceUrl");

goog.require("goog.asserts");

goog.require("goog.i18n.bidi.Dir");

goog.require("goog.i18n.bidi.DirectionalString");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.TrustedResourceUrl = function() {
    this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = "";
    this.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};

goog.html.TrustedResourceUrl.prototype.implementsGoogStringTypedString = true;

goog.html.TrustedResourceUrl.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
};

goog.html.TrustedResourceUrl.prototype.implementsGoogI18nBidiDirectionalString = true;

goog.html.TrustedResourceUrl.prototype.getDirection = function() {
    return goog.i18n.bidi.Dir.LTR;
};

if (goog.DEBUG) {
    goog.html.TrustedResourceUrl.prototype.toString = function() {
        return "TrustedResourceUrl{" + this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ + "}";
    };
}

goog.html.TrustedResourceUrl.unwrap = function(trustedResourceUrl) {
    if (trustedResourceUrl instanceof goog.html.TrustedResourceUrl && trustedResourceUrl.constructor === goog.html.TrustedResourceUrl && trustedResourceUrl.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type TrustedResourceUrl, got '" + trustedResourceUrl + "'");
        return "type_error:TrustedResourceUrl";
    }
};

goog.html.TrustedResourceUrl.fromConstant = function(url) {
    return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(goog.string.Const.unwrap(url));
};

goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse = function(url) {
    var trustedResourceUrl = new goog.html.TrustedResourceUrl();
    trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = url;
    return trustedResourceUrl;
};

goog.provide("goog.html.SafeStyleSheet");

goog.require("goog.array");

goog.require("goog.asserts");

goog.require("goog.string");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.SafeStyleSheet = function() {
    this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = "";
    this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};

goog.html.SafeStyleSheet.prototype.implementsGoogStringTypedString = true;

goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.SafeStyleSheet.concat = function(var_args) {
    var result = "";
    var addArgument = function(argument) {
        if (goog.isArray(argument)) {
            goog.array.forEach(argument, addArgument);
        } else {
            result += goog.html.SafeStyleSheet.unwrap(argument);
        }
    };
    goog.array.forEach(arguments, addArgument);
    return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);
};

goog.html.SafeStyleSheet.fromConstant = function(styleSheet) {
    var styleSheetString = goog.string.Const.unwrap(styleSheet);
    if (styleSheetString.length === 0) {
        return goog.html.SafeStyleSheet.EMPTY;
    }
    goog.asserts.assert(!goog.string.contains(styleSheetString, "<"), "Forbidden '<' character in style sheet string: " + styleSheetString);
    return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);
};

goog.html.SafeStyleSheet.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
};

if (goog.DEBUG) {
    goog.html.SafeStyleSheet.prototype.toString = function() {
        return "SafeStyleSheet{" + this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ + "}";
    };
}

goog.html.SafeStyleSheet.unwrap = function(safeStyleSheet) {
    if (safeStyleSheet instanceof goog.html.SafeStyleSheet && safeStyleSheet.constructor === goog.html.SafeStyleSheet && safeStyleSheet.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type SafeStyleSheet, got '" + safeStyleSheet + "'");
        return "type_error:SafeStyleSheet";
    }
};

goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse = function(styleSheet) {
    return new goog.html.SafeStyleSheet().initSecurityPrivateDoNotAccessOrElse_(styleSheet);
};

goog.html.SafeStyleSheet.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(styleSheet) {
    this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = styleSheet;
    return this;
};

goog.html.SafeStyleSheet.EMPTY = goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse("");

goog.provide("goog.object");

goog.object.forEach = function(obj, f, opt_obj) {
    for (var key in obj) {
        f.call(opt_obj, obj[key], key, obj);
    }
};

goog.object.filter = function(obj, f, opt_obj) {
    var res = {};
    for (var key in obj) {
        if (f.call(opt_obj, obj[key], key, obj)) {
            res[key] = obj[key];
        }
    }
    return res;
};

goog.object.map = function(obj, f, opt_obj) {
    var res = {};
    for (var key in obj) {
        res[key] = f.call(opt_obj, obj[key], key, obj);
    }
    return res;
};

goog.object.some = function(obj, f, opt_obj) {
    for (var key in obj) {
        if (f.call(opt_obj, obj[key], key, obj)) {
            return true;
        }
    }
    return false;
};

goog.object.every = function(obj, f, opt_obj) {
    for (var key in obj) {
        if (!f.call(opt_obj, obj[key], key, obj)) {
            return false;
        }
    }
    return true;
};

goog.object.getCount = function(obj) {
    var rv = 0;
    for (var key in obj) {
        rv++;
    }
    return rv;
};

goog.object.getAnyKey = function(obj) {
    for (var key in obj) {
        return key;
    }
};

goog.object.getAnyValue = function(obj) {
    for (var key in obj) {
        return obj[key];
    }
};

goog.object.contains = function(obj, val) {
    return goog.object.containsValue(obj, val);
};

goog.object.getValues = function(obj) {
    var res = [];
    var i = 0;
    for (var key in obj) {
        res[i++] = obj[key];
    }
    return res;
};

goog.object.getKeys = function(obj) {
    var res = [];
    var i = 0;
    for (var key in obj) {
        res[i++] = key;
    }
    return res;
};

goog.object.getValueByKeys = function(obj, var_args) {
    var isArrayLike = goog.isArrayLike(var_args);
    var keys = isArrayLike ? var_args : arguments;
    for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
        obj = obj[keys[i]];
        if (!goog.isDef(obj)) {
            break;
        }
    }
    return obj;
};

goog.object.containsKey = function(obj, key) {
    return obj !== null && key in obj;
};

goog.object.containsValue = function(obj, val) {
    for (var key in obj) {
        if (obj[key] == val) {
            return true;
        }
    }
    return false;
};

goog.object.findKey = function(obj, f, opt_this) {
    for (var key in obj) {
        if (f.call(opt_this, obj[key], key, obj)) {
            return key;
        }
    }
    return undefined;
};

goog.object.findValue = function(obj, f, opt_this) {
    var key = goog.object.findKey(obj, f, opt_this);
    return key && obj[key];
};

goog.object.isEmpty = function(obj) {
    for (var key in obj) {
        return false;
    }
    return true;
};

goog.object.clear = function(obj) {
    for (var i in obj) {
        delete obj[i];
    }
};

goog.object.remove = function(obj, key) {
    var rv;
    if (rv = key in obj) {
        delete obj[key];
    }
    return rv;
};

goog.object.add = function(obj, key, val) {
    if (obj !== null && key in obj) {
        throw Error('The object already contains the key "' + key + '"');
    }
    goog.object.set(obj, key, val);
};

goog.object.get = function(obj, key, opt_val) {
    if (obj !== null && key in obj) {
        return obj[key];
    }
    return opt_val;
};

goog.object.set = function(obj, key, value) {
    obj[key] = value;
};

goog.object.setIfUndefined = function(obj, key, value) {
    return key in obj ? obj[key] : obj[key] = value;
};

goog.object.setWithReturnValueIfNotSet = function(obj, key, f) {
    if (key in obj) {
        return obj[key];
    }
    var val = f();
    obj[key] = val;
    return val;
};

goog.object.equals = function(a, b) {
    for (var k in a) {
        if (!(k in b) || a[k] !== b[k]) {
            return false;
        }
    }
    for (var k in b) {
        if (!(k in a)) {
            return false;
        }
    }
    return true;
};

goog.object.clone = function(obj) {
    var res = {};
    for (var key in obj) {
        res[key] = obj[key];
    }
    return res;
};

goog.object.unsafeClone = function(obj) {
    var type = goog.typeOf(obj);
    if (type == "object" || type == "array") {
        if (goog.isFunction(obj.clone)) {
            return obj.clone();
        }
        var clone = type == "array" ? [] : {};
        for (var key in obj) {
            clone[key] = goog.object.unsafeClone(obj[key]);
        }
        return clone;
    }
    return obj;
};

goog.object.transpose = function(obj) {
    var transposed = {};
    for (var key in obj) {
        transposed[obj[key]] = key;
    }
    return transposed;
};

goog.object.PROTOTYPE_FIELDS_ = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];

goog.object.extend = function(target, var_args) {
    var key, source;
    for (var i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (key in source) {
            target[key] = source[key];
        }
        for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
            key = goog.object.PROTOTYPE_FIELDS_[j];
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
};

goog.object.create = function(var_args) {
    var argLength = arguments.length;
    if (argLength == 1 && goog.isArray(arguments[0])) {
        return goog.object.create.apply(null, arguments[0]);
    }
    if (argLength % 2) {
        throw Error("Uneven number of arguments");
    }
    var rv = {};
    for (var i = 0; i < argLength; i += 2) {
        rv[arguments[i]] = arguments[i + 1];
    }
    return rv;
};

goog.object.createSet = function(var_args) {
    var argLength = arguments.length;
    if (argLength == 1 && goog.isArray(arguments[0])) {
        return goog.object.createSet.apply(null, arguments[0]);
    }
    var rv = {};
    for (var i = 0; i < argLength; i++) {
        rv[arguments[i]] = true;
    }
    return rv;
};

goog.object.createImmutableView = function(obj) {
    var result = obj;
    if (Object.isFrozen && !Object.isFrozen(obj)) {
        result = Object.create(obj);
        Object.freeze(result);
    }
    return result;
};

goog.object.isImmutableView = function(obj) {
    return !!Object.isFrozen && Object.isFrozen(obj);
};

goog.provide("goog.dom.tags");

goog.require("goog.object");

goog.dom.tags.VOID_TAGS_ = goog.object.createSet("area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr");

goog.dom.tags.isVoidTag = function(tagName) {
    return goog.dom.tags.VOID_TAGS_[tagName] === true;
};

goog.provide("goog.dom.TagName");

goog.dom.TagName = {
    A: "A",
    ABBR: "ABBR",
    ACRONYM: "ACRONYM",
    ADDRESS: "ADDRESS",
    APPLET: "APPLET",
    AREA: "AREA",
    ARTICLE: "ARTICLE",
    ASIDE: "ASIDE",
    AUDIO: "AUDIO",
    B: "B",
    BASE: "BASE",
    BASEFONT: "BASEFONT",
    BDI: "BDI",
    BDO: "BDO",
    BIG: "BIG",
    BLOCKQUOTE: "BLOCKQUOTE",
    BODY: "BODY",
    BR: "BR",
    BUTTON: "BUTTON",
    CANVAS: "CANVAS",
    CAPTION: "CAPTION",
    CENTER: "CENTER",
    CITE: "CITE",
    CODE: "CODE",
    COL: "COL",
    COLGROUP: "COLGROUP",
    COMMAND: "COMMAND",
    DATA: "DATA",
    DATALIST: "DATALIST",
    DD: "DD",
    DEL: "DEL",
    DETAILS: "DETAILS",
    DFN: "DFN",
    DIALOG: "DIALOG",
    DIR: "DIR",
    DIV: "DIV",
    DL: "DL",
    DT: "DT",
    EM: "EM",
    EMBED: "EMBED",
    FIELDSET: "FIELDSET",
    FIGCAPTION: "FIGCAPTION",
    FIGURE: "FIGURE",
    FONT: "FONT",
    FOOTER: "FOOTER",
    FORM: "FORM",
    FRAME: "FRAME",
    FRAMESET: "FRAMESET",
    H1: "H1",
    H2: "H2",
    H3: "H3",
    H4: "H4",
    H5: "H5",
    H6: "H6",
    HEAD: "HEAD",
    HEADER: "HEADER",
    HGROUP: "HGROUP",
    HR: "HR",
    HTML: "HTML",
    I: "I",
    IFRAME: "IFRAME",
    IMG: "IMG",
    INPUT: "INPUT",
    INS: "INS",
    ISINDEX: "ISINDEX",
    KBD: "KBD",
    KEYGEN: "KEYGEN",
    LABEL: "LABEL",
    LEGEND: "LEGEND",
    LI: "LI",
    LINK: "LINK",
    MAP: "MAP",
    MARK: "MARK",
    MATH: "MATH",
    MENU: "MENU",
    META: "META",
    METER: "METER",
    NAV: "NAV",
    NOFRAMES: "NOFRAMES",
    NOSCRIPT: "NOSCRIPT",
    OBJECT: "OBJECT",
    OL: "OL",
    OPTGROUP: "OPTGROUP",
    OPTION: "OPTION",
    OUTPUT: "OUTPUT",
    P: "P",
    PARAM: "PARAM",
    PRE: "PRE",
    PROGRESS: "PROGRESS",
    Q: "Q",
    RP: "RP",
    RT: "RT",
    RUBY: "RUBY",
    S: "S",
    SAMP: "SAMP",
    SCRIPT: "SCRIPT",
    SECTION: "SECTION",
    SELECT: "SELECT",
    SMALL: "SMALL",
    SOURCE: "SOURCE",
    SPAN: "SPAN",
    STRIKE: "STRIKE",
    STRONG: "STRONG",
    STYLE: "STYLE",
    SUB: "SUB",
    SUMMARY: "SUMMARY",
    SUP: "SUP",
    SVG: "SVG",
    TABLE: "TABLE",
    TBODY: "TBODY",
    TD: "TD",
    TEMPLATE: "TEMPLATE",
    TEXTAREA: "TEXTAREA",
    TFOOT: "TFOOT",
    TH: "TH",
    THEAD: "THEAD",
    TIME: "TIME",
    TITLE: "TITLE",
    TR: "TR",
    TRACK: "TRACK",
    TT: "TT",
    U: "U",
    UL: "UL",
    VAR: "VAR",
    VIDEO: "VIDEO",
    WBR: "WBR"
};

goog.provide("goog.html.SafeHtml");

goog.require("goog.array");

goog.require("goog.asserts");

goog.require("goog.dom.TagName");

goog.require("goog.dom.tags");

goog.require("goog.html.SafeStyle");

goog.require("goog.html.SafeStyleSheet");

goog.require("goog.html.SafeUrl");

goog.require("goog.html.TrustedResourceUrl");

goog.require("goog.i18n.bidi.Dir");

goog.require("goog.i18n.bidi.DirectionalString");

goog.require("goog.object");

goog.require("goog.string");

goog.require("goog.string.Const");

goog.require("goog.string.TypedString");

goog.html.SafeHtml = function() {
    this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = "";
    this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
    this.dir_ = null;
};

goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = true;

goog.html.SafeHtml.prototype.getDirection = function() {
    return this.dir_;
};

goog.html.SafeHtml.prototype.implementsGoogStringTypedString = true;

goog.html.SafeHtml.prototype.getTypedStringValue = function() {
    return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};

if (goog.DEBUG) {
    goog.html.SafeHtml.prototype.toString = function() {
        return "SafeHtml{" + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ + "}";
    };
}

goog.html.SafeHtml.unwrap = function(safeHtml) {
    if (safeHtml instanceof goog.html.SafeHtml && safeHtml.constructor === goog.html.SafeHtml && safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ === goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
        return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
    } else {
        goog.asserts.fail("expected object of type SafeHtml, got '" + safeHtml + "'");
        return "type_error:SafeHtml";
    }
};

goog.html.SafeHtml.TextOrHtml_;

goog.html.SafeHtml.htmlEscape = function(textOrHtml) {
    if (textOrHtml instanceof goog.html.SafeHtml) {
        return textOrHtml;
    }
    var dir = null;
    if (textOrHtml.implementsGoogI18nBidiDirectionalString) {
        dir = textOrHtml.getDirection();
    }
    var textAsString;
    if (textOrHtml.implementsGoogStringTypedString) {
        textAsString = textOrHtml.getTypedStringValue();
    } else {
        textAsString = String(textOrHtml);
    }
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.htmlEscape(textAsString), dir);
};

goog.html.SafeHtml.htmlEscapePreservingNewlines = function(textOrHtml) {
    if (textOrHtml instanceof goog.html.SafeHtml) {
        return textOrHtml;
    }
    var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.newLineToBr(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};

goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces = function(textOrHtml) {
    if (textOrHtml instanceof goog.html.SafeHtml) {
        return textOrHtml;
    }
    var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(goog.string.whitespaceEscape(goog.html.SafeHtml.unwrap(html)), html.getDirection());
};

goog.html.SafeHtml.from = goog.html.SafeHtml.htmlEscape;

goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;

goog.html.SafeHtml.URL_ATTRIBUTES_ = goog.object.createSet("action", "cite", "data", "formaction", "href", "manifest", "poster", "src");

goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = goog.object.createSet(goog.dom.TagName.EMBED, goog.dom.TagName.IFRAME, goog.dom.TagName.LINK, goog.dom.TagName.OBJECT, goog.dom.TagName.SCRIPT, goog.dom.TagName.STYLE, goog.dom.TagName.TEMPLATE);

goog.html.SafeHtml.AttributeValue_;

goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
    if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
        throw Error("Invalid tag name <" + tagName + ">.");
    }
    if (tagName.toUpperCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
        throw Error("Tag name <" + tagName + "> is not allowed for SafeHtml.");
    }
    return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(tagName, opt_attributes, opt_content);
};

goog.html.SafeHtml.createIframe = function(opt_src, opt_srcdoc, opt_attributes, opt_content) {
    var fixedAttributes = {};
    fixedAttributes["src"] = opt_src || null;
    fixedAttributes["srcdoc"] = opt_srcdoc || null;
    var defaultAttributes = {
        sandbox: ""
    };
    var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, defaultAttributes, opt_attributes);
    return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("iframe", attributes, opt_content);
};

goog.html.SafeHtml.createStyle = function(styleSheet, opt_attributes) {
    var fixedAttributes = {
        type: "text/css"
    };
    var defaultAttributes = {};
    var attributes = goog.html.SafeHtml.combineAttributes(fixedAttributes, defaultAttributes, opt_attributes);
    var content = "";
    styleSheet = goog.array.concat(styleSheet);
    for (var i = 0; i < styleSheet.length; i++) {
        content += goog.html.SafeStyleSheet.unwrap(styleSheet[i]);
    }
    var htmlContent = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, goog.i18n.bidi.Dir.NEUTRAL);
    return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse("style", attributes, htmlContent);
};

goog.html.SafeHtml.getAttrNameAndValue_ = function(tagName, name, value) {
    if (value instanceof goog.string.Const) {
        value = goog.string.Const.unwrap(value);
    } else if (name.toLowerCase() == "style") {
        value = goog.html.SafeHtml.getStyleValue_(value);
    } else if (/^on/i.test(name)) {
        throw Error('Attribute "' + name + '" requires goog.string.Const value, "' + value + '" given.');
    } else if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
        if (value instanceof goog.html.TrustedResourceUrl) {
            value = goog.html.TrustedResourceUrl.unwrap(value);
        } else if (value instanceof goog.html.SafeUrl) {
            value = goog.html.SafeUrl.unwrap(value);
        } else if (goog.isString(value)) {
            value = goog.html.SafeUrl.sanitize(value).getTypedStringValue();
        } else {
            throw Error('Attribute "' + name + '" on tag "' + tagName + '" requires goog.html.SafeUrl, goog.string.Const, or string,' + ' value "' + value + '" given.');
        }
    }
    if (value.implementsGoogStringTypedString) {
        value = value.getTypedStringValue();
    }
    goog.asserts.assert(goog.isString(value) || goog.isNumber(value), "String or number value expected, got " + typeof value + " with value: " + value);
    return name + '="' + goog.string.htmlEscape(String(value)) + '"';
};

goog.html.SafeHtml.getStyleValue_ = function(value) {
    if (!goog.isObject(value)) {
        throw Error('The "style" attribute requires goog.html.SafeStyle or map ' + "of style properties, " + typeof value + " given: " + value);
    }
    if (!(value instanceof goog.html.SafeStyle)) {
        value = goog.html.SafeStyle.create(value);
    }
    return goog.html.SafeStyle.unwrap(value);
};

goog.html.SafeHtml.createWithDir = function(dir, tagName, opt_attributes, opt_content) {
    var html = goog.html.SafeHtml.create(tagName, opt_attributes, opt_content);
    html.dir_ = dir;
    return html;
};

goog.html.SafeHtml.concat = function(var_args) {
    var dir = goog.i18n.bidi.Dir.NEUTRAL;
    var content = "";
    var addArgument = function(argument) {
        if (goog.isArray(argument)) {
            goog.array.forEach(argument, addArgument);
        } else {
            var html = goog.html.SafeHtml.htmlEscape(argument);
            content += goog.html.SafeHtml.unwrap(html);
            var htmlDir = html.getDirection();
            if (dir == goog.i18n.bidi.Dir.NEUTRAL) {
                dir = htmlDir;
            } else if (htmlDir != goog.i18n.bidi.Dir.NEUTRAL && dir != htmlDir) {
                dir = null;
            }
        }
    };
    goog.array.forEach(arguments, addArgument);
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(content, dir);
};

goog.html.SafeHtml.concatWithDir = function(dir, var_args) {
    var html = goog.html.SafeHtml.concat(goog.array.slice(arguments, 1));
    html.dir_ = dir;
    return html;
};

goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};

goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse = function(html, dir) {
    return new goog.html.SafeHtml().initSecurityPrivateDoNotAccessOrElse_(html, dir);
};

goog.html.SafeHtml.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(html, dir) {
    this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = html;
    this.dir_ = dir;
    return this;
};

goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse = function(tagName, opt_attributes, opt_content) {
    var dir = null;
    var result = "<" + tagName;
    if (opt_attributes) {
        for (var name in opt_attributes) {
            if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
                throw Error('Invalid attribute name "' + name + '".');
            }
            var value = opt_attributes[name];
            if (!goog.isDefAndNotNull(value)) {
                continue;
            }
            result += " " + goog.html.SafeHtml.getAttrNameAndValue_(tagName, name, value);
        }
    }
    var content = opt_content;
    if (!goog.isDefAndNotNull(content)) {
        content = [];
    } else if (!goog.isArray(content)) {
        content = [ content ];
    }
    if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
        goog.asserts.assert(!content.length, "Void tag <" + tagName + "> does not allow content.");
        result += ">";
    } else {
        var html = goog.html.SafeHtml.concat(content);
        result += ">" + goog.html.SafeHtml.unwrap(html) + "</" + tagName + ">";
        dir = html.getDirection();
    }
    var dirAttribute = opt_attributes && opt_attributes["dir"];
    if (dirAttribute) {
        if (/^(ltr|rtl|auto)$/i.test(dirAttribute)) {
            dir = goog.i18n.bidi.Dir.NEUTRAL;
        } else {
            dir = null;
        }
    }
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(result, dir);
};

goog.html.SafeHtml.combineAttributes = function(fixedAttributes, defaultAttributes, opt_attributes) {
    var combinedAttributes = {};
    var name;
    for (name in fixedAttributes) {
        goog.asserts.assert(name.toLowerCase() == name, "Must be lower case");
        combinedAttributes[name] = fixedAttributes[name];
    }
    for (name in defaultAttributes) {
        goog.asserts.assert(name.toLowerCase() == name, "Must be lower case");
        combinedAttributes[name] = defaultAttributes[name];
    }
    for (name in opt_attributes) {
        var nameLower = name.toLowerCase();
        if (nameLower in fixedAttributes) {
            throw Error('Cannot override "' + nameLower + '" attribute, got "' + name + '" with value "' + opt_attributes[name] + '"');
        }
        if (nameLower in defaultAttributes) {
            delete combinedAttributes[nameLower];
        }
        combinedAttributes[name] = opt_attributes[name];
    }
    return combinedAttributes;
};

goog.html.SafeHtml.DOCTYPE_HTML = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("<!DOCTYPE html>", goog.i18n.bidi.Dir.NEUTRAL);

goog.html.SafeHtml.EMPTY = goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse("", goog.i18n.bidi.Dir.NEUTRAL);

goog.provide("goog.html.uncheckedconversions");

goog.require("goog.asserts");

goog.require("goog.html.SafeHtml");

goog.require("goog.html.SafeScript");

goog.require("goog.html.SafeStyle");

goog.require("goog.html.SafeStyleSheet");

goog.require("goog.html.SafeUrl");

goog.require("goog.html.TrustedResourceUrl");

goog.require("goog.string");

goog.require("goog.string.Const");

goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract = function(justification, html, opt_dir) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(html, opt_dir || null);
};

goog.html.uncheckedconversions.safeScriptFromStringKnownToSatisfyTypeContract = function(justification, script) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmpty(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(script);
};

goog.html.uncheckedconversions.safeStyleFromStringKnownToSatisfyTypeContract = function(justification, style) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};

goog.html.uncheckedconversions.safeStyleSheetFromStringKnownToSatisfyTypeContract = function(justification, styleSheet) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};

goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.html.uncheckedconversions.trustedResourceUrlFromStringKnownToSatisfyTypeContract = function(justification, url) {
    goog.asserts.assertString(goog.string.Const.unwrap(justification), "must provide justification");
    goog.asserts.assert(!goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)), "must provide non-empty justification");
    return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.provide("goog.soy.data.SanitizedContent");

goog.provide("goog.soy.data.SanitizedContentKind");

goog.provide("goog.soy.data.UnsanitizedText");

goog.require("goog.html.SafeHtml");

goog.require("goog.html.uncheckedconversions");

goog.require("goog.string.Const");

goog.soy.data.SanitizedContentKind = {
    HTML: goog.DEBUG ? {
        sanitizedContentKindHtml: true
    } : {},
    JS: goog.DEBUG ? {
        sanitizedContentJsChars: true
    } : {},
    URI: goog.DEBUG ? {
        sanitizedContentUri: true
    } : {},
    TRUSTED_RESOURCE_URI: goog.DEBUG ? {
        sanitizedContentTrustedResourceUri: true
    } : {},
    ATTRIBUTES: goog.DEBUG ? {
        sanitizedContentHtmlAttribute: true
    } : {},
    CSS: goog.DEBUG ? {
        sanitizedContentCss: true
    } : {},
    TEXT: goog.DEBUG ? {
        sanitizedContentKindText: true
    } : {}
};

goog.soy.data.SanitizedContent = function() {
    throw Error("Do not instantiate directly");
};

goog.soy.data.SanitizedContent.prototype.contentKind;

goog.soy.data.SanitizedContent.prototype.contentDir = null;

goog.soy.data.SanitizedContent.prototype.content;

goog.soy.data.SanitizedContent.prototype.getContent = function() {
    return this.content;
};

goog.soy.data.SanitizedContent.prototype.toString = function() {
    return this.content;
};

goog.soy.data.SanitizedContent.prototype.toSafeHtml = function() {
    if (this.contentKind === goog.soy.data.SanitizedContentKind.TEXT) {
        return goog.html.SafeHtml.htmlEscape(this.toString());
    }
    if (this.contentKind !== goog.soy.data.SanitizedContentKind.HTML) {
        throw Error("Sanitized content was not of kind TEXT or HTML.");
    }
    return goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract(goog.string.Const.from("Soy SanitizedContent of kind HTML produces " + "SafeHtml-contract-compliant value."), this.toString(), this.contentDir);
};

goog.soy.data.UnsanitizedText = function() {
    goog.soy.data.UnsanitizedText.base(this, "constructor");
};

goog.inherits(goog.soy.data.UnsanitizedText, goog.soy.data.SanitizedContent);

goog.provide("goog.labs.userAgent.util");

goog.require("goog.string");

goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
    var navigator = goog.labs.userAgent.util.getNavigator_();
    if (navigator) {
        var userAgent = navigator.userAgent;
        if (userAgent) {
            return userAgent;
        }
    }
    return "";
};

goog.labs.userAgent.util.getNavigator_ = function() {
    return goog.global.navigator;
};

goog.labs.userAgent.util.userAgent_ = goog.labs.userAgent.util.getNativeUserAgentString_();

goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
    goog.labs.userAgent.util.userAgent_ = opt_userAgent || goog.labs.userAgent.util.getNativeUserAgentString_();
};

goog.labs.userAgent.util.getUserAgent = function() {
    return goog.labs.userAgent.util.userAgent_;
};

goog.labs.userAgent.util.matchUserAgent = function(str) {
    var userAgent = goog.labs.userAgent.util.getUserAgent();
    return goog.string.contains(userAgent, str);
};

goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
    var userAgent = goog.labs.userAgent.util.getUserAgent();
    return goog.string.caseInsensitiveContains(userAgent, str);
};

goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
    var versionRegExp = new RegExp("(\\w[\\w ]+)" + "/" + "([^\\s]+)" + "\\s*" + "(?:\\((.*?)\\))?", "g");
    var data = [];
    var match;
    while (match = versionRegExp.exec(userAgent)) {
        data.push([ match[1], match[2], match[3] || undefined ]);
    }
    return data;
};

goog.provide("goog.labs.userAgent.platform");

goog.require("goog.labs.userAgent.util");

goog.require("goog.string");

goog.labs.userAgent.platform.isAndroid = function() {
    return goog.labs.userAgent.util.matchUserAgent("Android");
};

goog.labs.userAgent.platform.isIpod = function() {
    return goog.labs.userAgent.util.matchUserAgent("iPod");
};

goog.labs.userAgent.platform.isIphone = function() {
    return goog.labs.userAgent.util.matchUserAgent("iPhone") && !goog.labs.userAgent.util.matchUserAgent("iPod") && !goog.labs.userAgent.util.matchUserAgent("iPad");
};

goog.labs.userAgent.platform.isIpad = function() {
    return goog.labs.userAgent.util.matchUserAgent("iPad");
};

goog.labs.userAgent.platform.isIos = function() {
    return goog.labs.userAgent.platform.isIphone() || goog.labs.userAgent.platform.isIpad() || goog.labs.userAgent.platform.isIpod();
};

goog.labs.userAgent.platform.isMacintosh = function() {
    return goog.labs.userAgent.util.matchUserAgent("Macintosh");
};

goog.labs.userAgent.platform.isLinux = function() {
    return goog.labs.userAgent.util.matchUserAgent("Linux");
};

goog.labs.userAgent.platform.isWindows = function() {
    return goog.labs.userAgent.util.matchUserAgent("Windows");
};

goog.labs.userAgent.platform.isChromeOS = function() {
    return goog.labs.userAgent.util.matchUserAgent("CrOS");
};

goog.labs.userAgent.platform.getVersion = function() {
    var userAgentString = goog.labs.userAgent.util.getUserAgent();
    var version = "", re;
    if (goog.labs.userAgent.platform.isWindows()) {
        re = /Windows (?:NT|Phone) ([0-9.]+)/;
        var match = re.exec(userAgentString);
        if (match) {
            version = match[1];
        } else {
            version = "0.0";
        }
    } else if (goog.labs.userAgent.platform.isIos()) {
        re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
        var match = re.exec(userAgentString);
        version = match && match[1].replace(/_/g, ".");
    } else if (goog.labs.userAgent.platform.isMacintosh()) {
        re = /Mac OS X ([0-9_.]+)/;
        var match = re.exec(userAgentString);
        version = match ? match[1].replace(/_/g, ".") : "10";
    } else if (goog.labs.userAgent.platform.isAndroid()) {
        re = /Android\s+([^\);]+)(\)|;)/;
        var match = re.exec(userAgentString);
        version = match && match[1];
    } else if (goog.labs.userAgent.platform.isChromeOS()) {
        re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
        var match = re.exec(userAgentString);
        version = match && match[1];
    }
    return version || "";
};

goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
    return goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(), version) >= 0;
};

goog.provide("goog.labs.userAgent.browser");

goog.require("goog.array");

goog.require("goog.labs.userAgent.util");

goog.require("goog.object");

goog.require("goog.string");

goog.labs.userAgent.browser.matchOpera_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Opera") || goog.labs.userAgent.util.matchUserAgent("OPR");
};

goog.labs.userAgent.browser.matchIE_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};

goog.labs.userAgent.browser.matchEdge_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Edge");
};

goog.labs.userAgent.browser.matchFirefox_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Firefox");
};

goog.labs.userAgent.browser.matchSafari_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Safari") && !(goog.labs.userAgent.browser.matchChrome_() || goog.labs.userAgent.browser.matchCoast_() || goog.labs.userAgent.browser.matchOpera_() || goog.labs.userAgent.browser.matchEdge_() || goog.labs.userAgent.browser.isSilk() || goog.labs.userAgent.util.matchUserAgent("Android"));
};

goog.labs.userAgent.browser.matchCoast_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Coast");
};

goog.labs.userAgent.browser.matchIosWebview_ = function() {
    return (goog.labs.userAgent.util.matchUserAgent("iPad") || goog.labs.userAgent.util.matchUserAgent("iPhone")) && !goog.labs.userAgent.browser.matchSafari_() && !goog.labs.userAgent.browser.matchChrome_() && !goog.labs.userAgent.browser.matchCoast_() && goog.labs.userAgent.util.matchUserAgent("AppleWebKit");
};

goog.labs.userAgent.browser.matchChrome_ = function() {
    return (goog.labs.userAgent.util.matchUserAgent("Chrome") || goog.labs.userAgent.util.matchUserAgent("CriOS")) && !goog.labs.userAgent.browser.matchOpera_() && !goog.labs.userAgent.browser.matchEdge_();
};

goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
    return goog.labs.userAgent.util.matchUserAgent("Android") && !(goog.labs.userAgent.browser.isChrome() || goog.labs.userAgent.browser.isFirefox() || goog.labs.userAgent.browser.isOpera() || goog.labs.userAgent.browser.isSilk());
};

goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;

goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;

goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;

goog.labs.userAgent.browser.isFirefox = goog.labs.userAgent.browser.matchFirefox_;

goog.labs.userAgent.browser.isSafari = goog.labs.userAgent.browser.matchSafari_;

goog.labs.userAgent.browser.isCoast = goog.labs.userAgent.browser.matchCoast_;

goog.labs.userAgent.browser.isIosWebview = goog.labs.userAgent.browser.matchIosWebview_;

goog.labs.userAgent.browser.isChrome = goog.labs.userAgent.browser.matchChrome_;

goog.labs.userAgent.browser.isAndroidBrowser = goog.labs.userAgent.browser.matchAndroidBrowser_;

goog.labs.userAgent.browser.isSilk = function() {
    return goog.labs.userAgent.util.matchUserAgent("Silk");
};

goog.labs.userAgent.browser.getVersion = function() {
    var userAgentString = goog.labs.userAgent.util.getUserAgent();
    if (goog.labs.userAgent.browser.isIE()) {
        return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
    }
    var versionTuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString);
    var versionMap = {};
    goog.array.forEach(versionTuples, function(tuple) {
        var key = tuple[0];
        var value = tuple[1];
        versionMap[key] = value;
    });
    var versionMapHasKey = goog.partial(goog.object.containsKey, versionMap);
    function lookUpValueWithKeys(keys) {
        var key = goog.array.find(keys, versionMapHasKey);
        return versionMap[key] || "";
    }
    if (goog.labs.userAgent.browser.isOpera()) {
        return lookUpValueWithKeys([ "Version", "Opera", "OPR" ]);
    }
    if (goog.labs.userAgent.browser.isEdge()) {
        return lookUpValueWithKeys([ "Edge" ]);
    }
    if (goog.labs.userAgent.browser.isChrome()) {
        return lookUpValueWithKeys([ "Chrome", "CriOS" ]);
    }
    var tuple = versionTuples[2];
    return tuple && tuple[1] || "";
};

goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
    return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(), version) >= 0;
};

goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
    var rv = /rv: *([\d\.]*)/.exec(userAgent);
    if (rv && rv[1]) {
        return rv[1];
    }
    var version = "";
    var msie = /MSIE +([\d\.]+)/.exec(userAgent);
    if (msie && msie[1]) {
        var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
        if (msie[1] == "7.0") {
            if (tridentVersion && tridentVersion[1]) {
                switch (tridentVersion[1]) {
                  case "4.0":
                    version = "8.0";
                    break;

                  case "5.0":
                    version = "9.0";
                    break;

                  case "6.0":
                    version = "10.0";
                    break;

                  case "7.0":
                    version = "11.0";
                    break;
                }
            } else {
                version = "7.0";
            }
        } else {
            version = msie[1];
        }
    }
    return version;
};

goog.provide("goog.labs.userAgent.engine");

goog.require("goog.array");

goog.require("goog.labs.userAgent.util");

goog.require("goog.string");

goog.labs.userAgent.engine.isPresto = function() {
    return goog.labs.userAgent.util.matchUserAgent("Presto");
};

goog.labs.userAgent.engine.isTrident = function() {
    return goog.labs.userAgent.util.matchUserAgent("Trident") || goog.labs.userAgent.util.matchUserAgent("MSIE");
};

goog.labs.userAgent.engine.isEdge = function() {
    return goog.labs.userAgent.util.matchUserAgent("Edge");
};

goog.labs.userAgent.engine.isWebKit = function() {
    return goog.labs.userAgent.util.matchUserAgentIgnoreCase("WebKit") && !goog.labs.userAgent.engine.isEdge();
};

goog.labs.userAgent.engine.isGecko = function() {
    return goog.labs.userAgent.util.matchUserAgent("Gecko") && !goog.labs.userAgent.engine.isWebKit() && !goog.labs.userAgent.engine.isTrident() && !goog.labs.userAgent.engine.isEdge();
};

goog.labs.userAgent.engine.getVersion = function() {
    var userAgentString = goog.labs.userAgent.util.getUserAgent();
    if (userAgentString) {
        var tuples = goog.labs.userAgent.util.extractVersionTuples(userAgentString);
        var engineTuple = goog.labs.userAgent.engine.getEngineTuple_(tuples);
        if (engineTuple) {
            if (engineTuple[0] == "Gecko") {
                return goog.labs.userAgent.engine.getVersionForKey_(tuples, "Firefox");
            }
            return engineTuple[1];
        }
        var browserTuple = tuples[0];
        var info;
        if (browserTuple && (info = browserTuple[2])) {
            var match = /Trident\/([^\s;]+)/.exec(info);
            if (match) {
                return match[1];
            }
        }
    }
    return "";
};

goog.labs.userAgent.engine.getEngineTuple_ = function(tuples) {
    if (!goog.labs.userAgent.engine.isEdge()) {
        return tuples[1];
    }
    for (var i = 0; i < tuples.length; i++) {
        var tuple = tuples[i];
        if (tuple[0] == "Edge") {
            return tuple;
        }
    }
};

goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
    return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(), version) >= 0;
};

goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
    var pair = goog.array.find(tuples, function(pair) {
        return key == pair[0];
    });
    return pair && pair[1] || "";
};

goog.provide("goog.userAgent");

goog.require("goog.labs.userAgent.browser");

goog.require("goog.labs.userAgent.engine");

goog.require("goog.labs.userAgent.platform");

goog.require("goog.labs.userAgent.util");

goog.require("goog.string");

goog.define("goog.userAgent.ASSUME_IE", false);

goog.define("goog.userAgent.ASSUME_EDGE", false);

goog.define("goog.userAgent.ASSUME_GECKO", false);

goog.define("goog.userAgent.ASSUME_WEBKIT", false);

goog.define("goog.userAgent.ASSUME_MOBILE_WEBKIT", false);

goog.define("goog.userAgent.ASSUME_OPERA", false);

goog.define("goog.userAgent.ASSUME_ANY_VERSION", false);

goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_EDGE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;

goog.userAgent.getUserAgentString = function() {
    return goog.labs.userAgent.util.getUserAgent();
};

goog.userAgent.getNavigator = function() {
    return goog.global["navigator"] || null;
};

goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.labs.userAgent.browser.isOpera();

goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.labs.userAgent.browser.isIE();

goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_EDGE : goog.labs.userAgent.engine.isEdge();

goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;

goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.labs.userAgent.engine.isGecko();

goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.labs.userAgent.engine.isWebKit();

goog.userAgent.isMobile_ = function() {
    return goog.userAgent.WEBKIT && goog.labs.userAgent.util.matchUserAgent("Mobile");
};

goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.isMobile_();

goog.userAgent.SAFARI = goog.userAgent.WEBKIT;

goog.userAgent.determinePlatform_ = function() {
    var navigator = goog.userAgent.getNavigator();
    return navigator && navigator.platform || "";
};

goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();

goog.define("goog.userAgent.ASSUME_MAC", false);

goog.define("goog.userAgent.ASSUME_WINDOWS", false);

goog.define("goog.userAgent.ASSUME_LINUX", false);

goog.define("goog.userAgent.ASSUME_X11", false);

goog.define("goog.userAgent.ASSUME_ANDROID", false);

goog.define("goog.userAgent.ASSUME_IPHONE", false);

goog.define("goog.userAgent.ASSUME_IPAD", false);

goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11 || goog.userAgent.ASSUME_ANDROID || goog.userAgent.ASSUME_IPHONE || goog.userAgent.ASSUME_IPAD;

goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();

goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.labs.userAgent.platform.isWindows();

goog.userAgent.isLegacyLinux_ = function() {
    return goog.labs.userAgent.platform.isLinux() || goog.labs.userAgent.platform.isChromeOS();
};

goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.isLegacyLinux_();

goog.userAgent.isX11_ = function() {
    var navigator = goog.userAgent.getNavigator();
    return !!navigator && goog.string.contains(navigator["appVersion"] || "", "X11");
};

goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.isX11_();

goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_ANDROID : goog.labs.userAgent.platform.isAndroid();

goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPHONE : goog.labs.userAgent.platform.isIphone();

goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_IPAD : goog.labs.userAgent.platform.isIpad();

goog.userAgent.operaVersion_ = function() {
    var version = goog.global.opera.version;
    try {
        return version();
    } catch (e) {
        return version;
    }
};

goog.userAgent.determineVersion_ = function() {
    if (goog.userAgent.OPERA && goog.global["opera"]) {
        return goog.userAgent.operaVersion_();
    }
    var version = "";
    var arr = goog.userAgent.getVersionRegexResult_();
    if (arr) {
        version = arr ? arr[1] : "";
    }
    if (goog.userAgent.IE) {
        var docMode = goog.userAgent.getDocumentMode_();
        if (docMode > parseFloat(version)) {
            return String(docMode);
        }
    }
    return version;
};

goog.userAgent.getVersionRegexResult_ = function() {
    var userAgent = goog.userAgent.getUserAgentString();
    if (goog.userAgent.GECKO) {
        return /rv\:([^\);]+)(\)|;)/.exec(userAgent);
    }
    if (goog.userAgent.EDGE) {
        return /Edge\/([\d\.]+)/.exec(userAgent);
    }
    if (goog.userAgent.IE) {
        return /\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(userAgent);
    }
    if (goog.userAgent.WEBKIT) {
        return /WebKit\/(\S+)/.exec(userAgent);
    }
};

goog.userAgent.getDocumentMode_ = function() {
    var doc = goog.global["document"];
    return doc ? doc["documentMode"] : undefined;
};

goog.userAgent.VERSION = goog.userAgent.determineVersion_();

goog.userAgent.compare = function(v1, v2) {
    return goog.string.compareVersions(v1, v2);
};

goog.userAgent.isVersionOrHigherCache_ = {};

goog.userAgent.isVersionOrHigher = function(version) {
    return goog.userAgent.ASSUME_ANY_VERSION || goog.userAgent.isVersionOrHigherCache_[version] || (goog.userAgent.isVersionOrHigherCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};

goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;

goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
    return goog.userAgent.DOCUMENT_MODE >= documentMode;
};

goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;

goog.userAgent.DOCUMENT_MODE = function() {
    var doc = goog.global["document"];
    var mode = goog.userAgent.getDocumentMode_();
    if (!doc || !goog.userAgent.IE) {
        return undefined;
    }
    return mode || (doc["compatMode"] == "CSS1Compat" ? parseInt(goog.userAgent.VERSION, 10) : 5);
}();

goog.provide("goog.math.Size");

goog.math.Size = function(width, height) {
    this.width = width;
    this.height = height;
};

goog.math.Size.equals = function(a, b) {
    if (a == b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return a.width == b.width && a.height == b.height;
};

goog.math.Size.prototype.clone = function() {
    return new goog.math.Size(this.width, this.height);
};

if (goog.DEBUG) {
    goog.math.Size.prototype.toString = function() {
        return "(" + this.width + " x " + this.height + ")";
    };
}

goog.math.Size.prototype.getLongest = function() {
    return Math.max(this.width, this.height);
};

goog.math.Size.prototype.getShortest = function() {
    return Math.min(this.width, this.height);
};

goog.math.Size.prototype.area = function() {
    return this.width * this.height;
};

goog.math.Size.prototype.perimeter = function() {
    return (this.width + this.height) * 2;
};

goog.math.Size.prototype.aspectRatio = function() {
    return this.width / this.height;
};

goog.math.Size.prototype.isEmpty = function() {
    return !this.area();
};

goog.math.Size.prototype.ceil = function() {
    this.width = Math.ceil(this.width);
    this.height = Math.ceil(this.height);
    return this;
};

goog.math.Size.prototype.fitsInside = function(target) {
    return this.width <= target.width && this.height <= target.height;
};

goog.math.Size.prototype.floor = function() {
    this.width = Math.floor(this.width);
    this.height = Math.floor(this.height);
    return this;
};

goog.math.Size.prototype.round = function() {
    this.width = Math.round(this.width);
    this.height = Math.round(this.height);
    return this;
};

goog.math.Size.prototype.scale = function(sx, opt_sy) {
    var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
    this.width *= sx;
    this.height *= sy;
    return this;
};

goog.math.Size.prototype.scaleToCover = function(target) {
    var s = this.aspectRatio() <= target.aspectRatio() ? target.width / this.width : target.height / this.height;
    return this.scale(s);
};

goog.math.Size.prototype.scaleToFit = function(target) {
    var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
    return this.scale(s);
};

goog.provide("goog.dom.safe");

goog.provide("goog.dom.safe.InsertAdjacentHtmlPosition");

goog.require("goog.asserts");

goog.require("goog.html.SafeHtml");

goog.require("goog.html.SafeUrl");

goog.require("goog.html.TrustedResourceUrl");

goog.require("goog.string");

goog.require("goog.string.Const");

goog.dom.safe.InsertAdjacentHtmlPosition = {
    AFTERBEGIN: "afterbegin",
    AFTEREND: "afterend",
    BEFOREBEGIN: "beforebegin",
    BEFOREEND: "beforeend"
};

goog.dom.safe.insertAdjacentHtml = function(node, position, html) {
    node.insertAdjacentHTML(position, goog.html.SafeHtml.unwrap(html));
};

goog.dom.safe.setInnerHtml = function(elem, html) {
    elem.innerHTML = goog.html.SafeHtml.unwrap(html);
};

goog.dom.safe.setOuterHtml = function(elem, html) {
    elem.outerHTML = goog.html.SafeHtml.unwrap(html);
};

goog.dom.safe.documentWrite = function(doc, html) {
    doc.write(goog.html.SafeHtml.unwrap(html));
};

goog.dom.safe.setAnchorHref = function(anchor, url) {
    var safeUrl;
    if (url instanceof goog.html.SafeUrl) {
        safeUrl = url;
    } else {
        safeUrl = goog.html.SafeUrl.sanitize(url);
    }
    anchor.href = goog.html.SafeUrl.unwrap(safeUrl);
};

goog.dom.safe.setEmbedSrc = function(embed, url) {
    embed.src = goog.html.TrustedResourceUrl.unwrap(url);
};

goog.dom.safe.setFrameSrc = function(frame, url) {
    frame.src = goog.html.TrustedResourceUrl.unwrap(url);
};

goog.dom.safe.setIframeSrc = function(iframe, url) {
    iframe.src = goog.html.TrustedResourceUrl.unwrap(url);
};

goog.dom.safe.setLinkHrefAndRel = function(link, url, rel) {
    link.rel = rel;
    if (goog.string.caseInsensitiveContains(rel, "stylesheet")) {
        goog.asserts.assert(url instanceof goog.html.TrustedResourceUrl, 'URL must be TrustedResourceUrl because "rel" contains "stylesheet"');
        link.href = goog.html.TrustedResourceUrl.unwrap(url);
    } else if (url instanceof goog.html.TrustedResourceUrl) {
        link.href = goog.html.TrustedResourceUrl.unwrap(url);
    } else if (url instanceof goog.html.SafeUrl) {
        link.href = goog.html.SafeUrl.unwrap(url);
    } else {
        link.href = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
    }
};

goog.dom.safe.setObjectData = function(object, url) {
    object.data = goog.html.TrustedResourceUrl.unwrap(url);
};

goog.dom.safe.setScriptSrc = function(script, url) {
    script.src = goog.html.TrustedResourceUrl.unwrap(url);
};

goog.dom.safe.setLocationHref = function(loc, url) {
    var safeUrl;
    if (url instanceof goog.html.SafeUrl) {
        safeUrl = url;
    } else {
        safeUrl = goog.html.SafeUrl.sanitize(url);
    }
    loc.href = goog.html.SafeUrl.unwrap(safeUrl);
};

goog.dom.safe.openInWindow = function(url, opt_openerWin, opt_name, opt_specs, opt_replace) {
    var safeUrl;
    if (url instanceof goog.html.SafeUrl) {
        safeUrl = url;
    } else {
        safeUrl = goog.html.SafeUrl.sanitize(url);
    }
    var win = opt_openerWin || window;
    return win.open(goog.html.SafeUrl.unwrap(safeUrl), opt_name ? goog.string.Const.unwrap(opt_name) : "", opt_specs, opt_replace);
};

goog.provide("goog.dom.BrowserFeature");

goog.require("goog.userAgent");

goog.dom.BrowserFeature = {
    CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE || goog.userAgent.isDocumentModeOrHigher(9),
    CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) || goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher("1.9.1"),
    CAN_USE_INNER_TEXT: goog.userAgent.IE && !goog.userAgent.isVersionOrHigher("9"),
    CAN_USE_PARENT_ELEMENT_PROPERTY: goog.userAgent.IE || goog.userAgent.OPERA || goog.userAgent.WEBKIT,
    INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE,
    LEGACY_IE_RANGES: goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)
};

goog.provide("goog.math");

goog.require("goog.array");

goog.require("goog.asserts");

goog.math.randomInt = function(a) {
    return Math.floor(Math.random() * a);
};

goog.math.uniformRandom = function(a, b) {
    return a + Math.random() * (b - a);
};

goog.math.clamp = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
};

goog.math.modulo = function(a, b) {
    var r = a % b;
    return r * b < 0 ? r + b : r;
};

goog.math.lerp = function(a, b, x) {
    return a + x * (b - a);
};

goog.math.nearlyEquals = function(a, b, opt_tolerance) {
    return Math.abs(a - b) <= (opt_tolerance || 1e-6);
};

goog.math.standardAngle = function(angle) {
    return goog.math.modulo(angle, 360);
};

goog.math.standardAngleInRadians = function(angle) {
    return goog.math.modulo(angle, 2 * Math.PI);
};

goog.math.toRadians = function(angleDegrees) {
    return angleDegrees * Math.PI / 180;
};

goog.math.toDegrees = function(angleRadians) {
    return angleRadians * 180 / Math.PI;
};

goog.math.angleDx = function(degrees, radius) {
    return radius * Math.cos(goog.math.toRadians(degrees));
};

goog.math.angleDy = function(degrees, radius) {
    return radius * Math.sin(goog.math.toRadians(degrees));
};

goog.math.angle = function(x1, y1, x2, y2) {
    return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1, x2 - x1)));
};

goog.math.angleDifference = function(startAngle, endAngle) {
    var d = goog.math.standardAngle(endAngle) - goog.math.standardAngle(startAngle);
    if (d > 180) {
        d = d - 360;
    } else if (d <= -180) {
        d = 360 + d;
    }
    return d;
};

goog.math.sign = Math.sign || function(x) {
    if (x > 0) {
        return 1;
    }
    if (x < 0) {
        return -1;
    }
    return x;
};

goog.math.longestCommonSubsequence = function(array1, array2, opt_compareFn, opt_collectorFn) {
    var compare = opt_compareFn || function(a, b) {
        return a == b;
    };
    var collect = opt_collectorFn || function(i1, i2) {
        return array1[i1];
    };
    var length1 = array1.length;
    var length2 = array2.length;
    var arr = [];
    for (var i = 0; i < length1 + 1; i++) {
        arr[i] = [];
        arr[i][0] = 0;
    }
    for (var j = 0; j < length2 + 1; j++) {
        arr[0][j] = 0;
    }
    for (i = 1; i <= length1; i++) {
        for (j = 1; j <= length2; j++) {
            if (compare(array1[i - 1], array2[j - 1])) {
                arr[i][j] = arr[i - 1][j - 1] + 1;
            } else {
                arr[i][j] = Math.max(arr[i - 1][j], arr[i][j - 1]);
            }
        }
    }
    var result = [];
    var i = length1, j = length2;
    while (i > 0 && j > 0) {
        if (compare(array1[i - 1], array2[j - 1])) {
            result.unshift(collect(i - 1, j - 1));
            i--;
            j--;
        } else {
            if (arr[i - 1][j] > arr[i][j - 1]) {
                i--;
            } else {
                j--;
            }
        }
    }
    return result;
};

goog.math.sum = function(var_args) {
    return goog.array.reduce(arguments, function(sum, value) {
        return sum + value;
    }, 0);
};

goog.math.average = function(var_args) {
    return goog.math.sum.apply(null, arguments) / arguments.length;
};

goog.math.sampleVariance = function(var_args) {
    var sampleSize = arguments.length;
    if (sampleSize < 2) {
        return 0;
    }
    var mean = goog.math.average.apply(null, arguments);
    var variance = goog.math.sum.apply(null, goog.array.map(arguments, function(val) {
        return Math.pow(val - mean, 2);
    })) / (sampleSize - 1);
    return variance;
};

goog.math.standardDeviation = function(var_args) {
    return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};

goog.math.isInt = function(num) {
    return isFinite(num) && num % 1 == 0;
};

goog.math.isFiniteNumber = function(num) {
    return isFinite(num) && !isNaN(num);
};

goog.math.isNegativeZero = function(num) {
    return num == 0 && 1 / num < 0;
};

goog.math.log10Floor = function(num) {
    if (num > 0) {
        var x = Math.round(Math.log(num) * Math.LOG10E);
        return x - (parseFloat("1e" + x) > num ? 1 : 0);
    }
    return num == 0 ? -Infinity : NaN;
};

goog.math.safeFloor = function(num, opt_epsilon) {
    goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
    return Math.floor(num + (opt_epsilon || 2e-15));
};

goog.math.safeCeil = function(num, opt_epsilon) {
    goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
    return Math.ceil(num - (opt_epsilon || 2e-15));
};

goog.provide("goog.math.Coordinate");

goog.require("goog.math");

goog.math.Coordinate = function(opt_x, opt_y) {
    this.x = goog.isDef(opt_x) ? opt_x : 0;
    this.y = goog.isDef(opt_y) ? opt_y : 0;
};

goog.math.Coordinate.prototype.clone = function() {
    return new goog.math.Coordinate(this.x, this.y);
};

if (goog.DEBUG) {
    goog.math.Coordinate.prototype.toString = function() {
        return "(" + this.x + ", " + this.y + ")";
    };
}

goog.math.Coordinate.equals = function(a, b) {
    if (a == b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return a.x == b.x && a.y == b.y;
};

goog.math.Coordinate.distance = function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};

goog.math.Coordinate.magnitude = function(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
};

goog.math.Coordinate.azimuth = function(a) {
    return goog.math.angle(0, 0, a.x, a.y);
};

goog.math.Coordinate.squaredDistance = function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
};

goog.math.Coordinate.difference = function(a, b) {
    return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};

goog.math.Coordinate.sum = function(a, b) {
    return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};

goog.math.Coordinate.prototype.ceil = function() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
};

goog.math.Coordinate.prototype.floor = function() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
};

goog.math.Coordinate.prototype.round = function() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

goog.math.Coordinate.prototype.translate = function(tx, opt_ty) {
    if (tx instanceof goog.math.Coordinate) {
        this.x += tx.x;
        this.y += tx.y;
    } else {
        this.x += tx;
        if (goog.isNumber(opt_ty)) {
            this.y += opt_ty;
        }
    }
    return this;
};

goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
    var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
    this.x *= sx;
    this.y *= sy;
    return this;
};

goog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {
    var center = opt_center || new goog.math.Coordinate(0, 0);
    var x = this.x;
    var y = this.y;
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);
    this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
    this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;
};

goog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {
    this.rotateRadians(goog.math.toRadians(degrees), opt_center);
};

goog.provide("goog.dom");

goog.provide("goog.dom.Appendable");

goog.provide("goog.dom.DomHelper");

goog.require("goog.array");

goog.require("goog.asserts");

goog.require("goog.dom.BrowserFeature");

goog.require("goog.dom.NodeType");

goog.require("goog.dom.TagName");

goog.require("goog.dom.safe");

goog.require("goog.html.SafeHtml");

goog.require("goog.math.Coordinate");

goog.require("goog.math.Size");

goog.require("goog.object");

goog.require("goog.string");

goog.require("goog.string.Unicode");

goog.require("goog.userAgent");

goog.define("goog.dom.ASSUME_QUIRKS_MODE", false);

goog.define("goog.dom.ASSUME_STANDARDS_MODE", false);

goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;

goog.dom.getDomHelper = function(opt_element) {
    return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper());
};

goog.dom.defaultDomHelper_;

goog.dom.getDocument = function() {
    return document;
};

goog.dom.getElement = function(element) {
    return goog.dom.getElementHelper_(document, element);
};

goog.dom.getElementHelper_ = function(doc, element) {
    return goog.isString(element) ? doc.getElementById(element) : element;
};

goog.dom.getRequiredElement = function(id) {
    return goog.dom.getRequiredElementHelper_(document, id);
};

goog.dom.getRequiredElementHelper_ = function(doc, id) {
    goog.asserts.assertString(id);
    var element = goog.dom.getElementHelper_(doc, id);
    element = goog.asserts.assertElement(element, "No element found with id: " + id);
    return element;
};

goog.dom.$ = goog.dom.getElement;

goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
    return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el);
};

goog.dom.getElementsByClass = function(className, opt_el) {
    var parent = opt_el || document;
    if (goog.dom.canUseQuerySelector_(parent)) {
        return parent.querySelectorAll("." + className);
    }
    return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el);
};

goog.dom.getElementByClass = function(className, opt_el) {
    var parent = opt_el || document;
    var retVal = null;
    if (parent.getElementsByClassName) {
        retVal = parent.getElementsByClassName(className)[0];
    } else if (goog.dom.canUseQuerySelector_(parent)) {
        retVal = parent.querySelector("." + className);
    } else {
        retVal = goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)[0];
    }
    return retVal || null;
};

goog.dom.getRequiredElementByClass = function(className, opt_root) {
    var retValue = goog.dom.getElementByClass(className, opt_root);
    return goog.asserts.assert(retValue, "No element found with className: " + className);
};

goog.dom.canUseQuerySelector_ = function(parent) {
    return !!(parent.querySelectorAll && parent.querySelector);
};

goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
    var parent = opt_el || doc;
    var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
    if (goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
        var query = tagName + (opt_class ? "." + opt_class : "");
        return parent.querySelectorAll(query);
    }
    if (opt_class && parent.getElementsByClassName) {
        var els = parent.getElementsByClassName(opt_class);
        if (tagName) {
            var arrayLike = {};
            var len = 0;
            for (var i = 0, el; el = els[i]; i++) {
                if (tagName == el.nodeName) {
                    arrayLike[len++] = el;
                }
            }
            arrayLike.length = len;
            return arrayLike;
        } else {
            return els;
        }
    }
    var els = parent.getElementsByTagName(tagName || "*");
    if (opt_class) {
        var arrayLike = {};
        var len = 0;
        for (var i = 0, el; el = els[i]; i++) {
            var className = el.className;
            if (typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
                arrayLike[len++] = el;
            }
        }
        arrayLike.length = len;
        return arrayLike;
    } else {
        return els;
    }
};

goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;

goog.dom.setProperties = function(element, properties) {
    goog.object.forEach(properties, function(val, key) {
        if (key == "style") {
            element.style.cssText = val;
        } else if (key == "class") {
            element.className = val;
        } else if (key == "for") {
            element.htmlFor = val;
        } else if (goog.dom.DIRECT_ATTRIBUTE_MAP_.hasOwnProperty(key)) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
        } else if (goog.string.startsWith(key, "aria-") || goog.string.startsWith(key, "data-")) {
            element.setAttribute(key, val);
        } else {
            element[key] = val;
        }
    });
};

goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
    cellpadding: "cellPadding",
    cellspacing: "cellSpacing",
    colspan: "colSpan",
    frameborder: "frameBorder",
    height: "height",
    maxlength: "maxLength",
    role: "role",
    rowspan: "rowSpan",
    type: "type",
    usemap: "useMap",
    valign: "vAlign",
    width: "width"
};

goog.dom.getViewportSize = function(opt_window) {
    return goog.dom.getViewportSize_(opt_window || window);
};

goog.dom.getViewportSize_ = function(win) {
    var doc = win.document;
    var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
    return new goog.math.Size(el.clientWidth, el.clientHeight);
};

goog.dom.getDocumentHeight = function() {
    return goog.dom.getDocumentHeight_(window);
};

goog.dom.getDocumentHeight_ = function(win) {
    var doc = win.document;
    var height = 0;
    if (doc) {
        var body = doc.body;
        var docEl = doc.documentElement;
        if (!(docEl && body)) {
            return 0;
        }
        var vh = goog.dom.getViewportSize_(win).height;
        if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
            height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight;
        } else {
            var sh = docEl.scrollHeight;
            var oh = docEl.offsetHeight;
            if (docEl.clientHeight != oh) {
                sh = body.scrollHeight;
                oh = body.offsetHeight;
            }
            if (sh > vh) {
                height = sh > oh ? sh : oh;
            } else {
                height = sh < oh ? sh : oh;
            }
        }
    }
    return height;
};

goog.dom.getPageScroll = function(opt_window) {
    var win = opt_window || goog.global || window;
    return goog.dom.getDomHelper(win.document).getDocumentScroll();
};

goog.dom.getDocumentScroll = function() {
    return goog.dom.getDocumentScroll_(document);
};

goog.dom.getDocumentScroll_ = function(doc) {
    var el = goog.dom.getDocumentScrollElement_(doc);
    var win = goog.dom.getWindow_(doc);
    if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher("10") && win.pageYOffset != el.scrollTop) {
        return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
    }
    return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
};

goog.dom.getDocumentScrollElement = function() {
    return goog.dom.getDocumentScrollElement_(document);
};

goog.dom.getDocumentScrollElement_ = function(doc) {
    if (doc.scrollingElement) {
        return doc.scrollingElement;
    }
    if (!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
        return doc.documentElement;
    }
    return doc.body || doc.documentElement;
};

goog.dom.getWindow = function(opt_doc) {
    return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};

goog.dom.getWindow_ = function(doc) {
    return doc.parentWindow || doc.defaultView;
};

goog.dom.createDom = function(tagName, opt_attributes, var_args) {
    return goog.dom.createDom_(document, arguments);
};

goog.dom.createDom_ = function(doc, args) {
    var tagName = args[0];
    var attributes = args[1];
    if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
        var tagNameArr = [ "<", tagName ];
        if (attributes.name) {
            tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"');
        }
        if (attributes.type) {
            tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
            var clone = {};
            goog.object.extend(clone, attributes);
            delete clone["type"];
            attributes = clone;
        }
        tagNameArr.push(">");
        tagName = tagNameArr.join("");
    }
    var element = doc.createElement(tagName);
    if (attributes) {
        if (goog.isString(attributes)) {
            element.className = attributes;
        } else if (goog.isArray(attributes)) {
            element.className = attributes.join(" ");
        } else {
            goog.dom.setProperties(element, attributes);
        }
    }
    if (args.length > 2) {
        goog.dom.append_(doc, element, args, 2);
    }
    return element;
};

goog.dom.append_ = function(doc, parent, args, startIndex) {
    function childHandler(child) {
        if (child) {
            parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child);
        }
    }
    for (var i = startIndex; i < args.length; i++) {
        var arg = args[i];
        if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
            goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.toArray(arg) : arg, childHandler);
        } else {
            childHandler(arg);
        }
    }
};

goog.dom.$dom = goog.dom.createDom;

goog.dom.createElement = function(name) {
    return document.createElement(name);
};

goog.dom.createTextNode = function(content) {
    return document.createTextNode(String(content));
};

goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
    return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};

goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
    var table = doc.createElement(goog.dom.TagName.TABLE);
    var tbody = table.appendChild(doc.createElement(goog.dom.TagName.TBODY));
    for (var i = 0; i < rows; i++) {
        var tr = doc.createElement(goog.dom.TagName.TR);
        for (var j = 0; j < columns; j++) {
            var td = doc.createElement(goog.dom.TagName.TD);
            if (fillWithNbsp) {
                goog.dom.setTextContent(td, goog.string.Unicode.NBSP);
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    return table;
};

goog.dom.safeHtmlToNode = function(html) {
    return goog.dom.safeHtmlToNode_(document, html);
};

goog.dom.safeHtmlToNode_ = function(doc, html) {
    var tempDiv = doc.createElement(goog.dom.TagName.DIV);
    if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
        goog.dom.safe.setInnerHtml(tempDiv, goog.html.SafeHtml.concat(goog.html.SafeHtml.create("br"), html));
        tempDiv.removeChild(tempDiv.firstChild);
    } else {
        goog.dom.safe.setInnerHtml(tempDiv, html);
    }
    return goog.dom.childrenToNode_(doc, tempDiv);
};

goog.dom.htmlToDocumentFragment = function(htmlString) {
    return goog.dom.htmlToDocumentFragment_(document, htmlString);
};

goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
    var tempDiv = doc.createElement(goog.dom.TagName.DIV);
    if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
        tempDiv.innerHTML = "<br>" + htmlString;
        tempDiv.removeChild(tempDiv.firstChild);
    } else {
        tempDiv.innerHTML = htmlString;
    }
    return goog.dom.childrenToNode_(doc, tempDiv);
};

goog.dom.childrenToNode_ = function(doc, tempDiv) {
    if (tempDiv.childNodes.length == 1) {
        return tempDiv.removeChild(tempDiv.firstChild);
    } else {
        var fragment = doc.createDocumentFragment();
        while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
        }
        return fragment;
    }
};

goog.dom.isCss1CompatMode = function() {
    return goog.dom.isCss1CompatMode_(document);
};

goog.dom.isCss1CompatMode_ = function(doc) {
    if (goog.dom.COMPAT_MODE_KNOWN_) {
        return goog.dom.ASSUME_STANDARDS_MODE;
    }
    return doc.compatMode == "CSS1Compat";
};

goog.dom.canHaveChildren = function(node) {
    if (node.nodeType != goog.dom.NodeType.ELEMENT) {
        return false;
    }
    switch (node.tagName) {
      case goog.dom.TagName.APPLET:
      case goog.dom.TagName.AREA:
      case goog.dom.TagName.BASE:
      case goog.dom.TagName.BR:
      case goog.dom.TagName.COL:
      case goog.dom.TagName.COMMAND:
      case goog.dom.TagName.EMBED:
      case goog.dom.TagName.FRAME:
      case goog.dom.TagName.HR:
      case goog.dom.TagName.IMG:
      case goog.dom.TagName.INPUT:
      case goog.dom.TagName.IFRAME:
      case goog.dom.TagName.ISINDEX:
      case goog.dom.TagName.KEYGEN:
      case goog.dom.TagName.LINK:
      case goog.dom.TagName.NOFRAMES:
      case goog.dom.TagName.NOSCRIPT:
      case goog.dom.TagName.META:
      case goog.dom.TagName.OBJECT:
      case goog.dom.TagName.PARAM:
      case goog.dom.TagName.SCRIPT:
      case goog.dom.TagName.SOURCE:
      case goog.dom.TagName.STYLE:
      case goog.dom.TagName.TRACK:
      case goog.dom.TagName.WBR:
        return false;
    }
    return true;
};

goog.dom.appendChild = function(parent, child) {
    parent.appendChild(child);
};

goog.dom.append = function(parent, var_args) {
    goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};

goog.dom.removeChildren = function(node) {
    var child;
    while (child = node.firstChild) {
        node.removeChild(child);
    }
};

goog.dom.insertSiblingBefore = function(newNode, refNode) {
    if (refNode.parentNode) {
        refNode.parentNode.insertBefore(newNode, refNode);
    }
};

goog.dom.insertSiblingAfter = function(newNode, refNode) {
    if (refNode.parentNode) {
        refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
    }
};

goog.dom.insertChildAt = function(parent, child, index) {
    parent.insertBefore(child, parent.childNodes[index] || null);
};

goog.dom.removeNode = function(node) {
    return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};

goog.dom.replaceNode = function(newNode, oldNode) {
    var parent = oldNode.parentNode;
    if (parent) {
        parent.replaceChild(newNode, oldNode);
    }
};

goog.dom.flattenElement = function(element) {
    var child, parent = element.parentNode;
    if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
        if (element.removeNode) {
            return element.removeNode(false);
        } else {
            while (child = element.firstChild) {
                parent.insertBefore(child, element);
            }
            return goog.dom.removeNode(element);
        }
    }
};

goog.dom.getChildren = function(element) {
    if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
        return element.children;
    }
    return goog.array.filter(element.childNodes, function(node) {
        return node.nodeType == goog.dom.NodeType.ELEMENT;
    });
};

goog.dom.getFirstElementChild = function(node) {
    if (goog.isDef(node.firstElementChild)) {
        return node.firstElementChild;
    }
    return goog.dom.getNextElementNode_(node.firstChild, true);
};

goog.dom.getLastElementChild = function(node) {
    if (goog.isDef(node.lastElementChild)) {
        return node.lastElementChild;
    }
    return goog.dom.getNextElementNode_(node.lastChild, false);
};

goog.dom.getNextElementSibling = function(node) {
    if (goog.isDef(node.nextElementSibling)) {
        return node.nextElementSibling;
    }
    return goog.dom.getNextElementNode_(node.nextSibling, true);
};

goog.dom.getPreviousElementSibling = function(node) {
    if (goog.isDef(node.previousElementSibling)) {
        return node.previousElementSibling;
    }
    return goog.dom.getNextElementNode_(node.previousSibling, false);
};

goog.dom.getNextElementNode_ = function(node, forward) {
    while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
        node = forward ? node.nextSibling : node.previousSibling;
    }
    return node;
};

goog.dom.getNextNode = function(node) {
    if (!node) {
        return null;
    }
    if (node.firstChild) {
        return node.firstChild;
    }
    while (node && !node.nextSibling) {
        node = node.parentNode;
    }
    return node ? node.nextSibling : null;
};

goog.dom.getPreviousNode = function(node) {
    if (!node) {
        return null;
    }
    if (!node.previousSibling) {
        return node.parentNode;
    }
    node = node.previousSibling;
    while (node && node.lastChild) {
        node = node.lastChild;
    }
    return node;
};

goog.dom.isNodeLike = function(obj) {
    return goog.isObject(obj) && obj.nodeType > 0;
};

goog.dom.isElement = function(obj) {
    return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};

goog.dom.isWindow = function(obj) {
    return goog.isObject(obj) && obj["window"] == obj;
};

goog.dom.getParentElement = function(element) {
    var parent;
    if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
        var isIe9 = goog.userAgent.IE && goog.userAgent.isVersionOrHigher("9") && !goog.userAgent.isVersionOrHigher("10");
        if (!(isIe9 && goog.global["SVGElement"] && element instanceof goog.global["SVGElement"])) {
            parent = element.parentElement;
            if (parent) {
                return parent;
            }
        }
    }
    parent = element.parentNode;
    return goog.dom.isElement(parent) ? parent : null;
};

goog.dom.contains = function(parent, descendant) {
    if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
        return parent == descendant || parent.contains(descendant);
    }
    if (typeof parent.compareDocumentPosition != "undefined") {
        return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16);
    }
    while (descendant && parent != descendant) {
        descendant = descendant.parentNode;
    }
    return descendant == parent;
};

goog.dom.compareNodeOrder = function(node1, node2) {
    if (node1 == node2) {
        return 0;
    }
    if (node1.compareDocumentPosition) {
        return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
    }
    if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
        if (node1.nodeType == goog.dom.NodeType.DOCUMENT) {
            return -1;
        }
        if (node2.nodeType == goog.dom.NodeType.DOCUMENT) {
            return 1;
        }
    }
    if ("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
        var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
        var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
        if (isElement1 && isElement2) {
            return node1.sourceIndex - node2.sourceIndex;
        } else {
            var parent1 = node1.parentNode;
            var parent2 = node2.parentNode;
            if (parent1 == parent2) {
                return goog.dom.compareSiblingOrder_(node1, node2);
            }
            if (!isElement1 && goog.dom.contains(parent1, node2)) {
                return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
            }
            if (!isElement2 && goog.dom.contains(parent2, node1)) {
                return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
            }
            return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
        }
    }
    var doc = goog.dom.getOwnerDocument(node1);
    var range1, range2;
    range1 = doc.createRange();
    range1.selectNode(node1);
    range1.collapse(true);
    range2 = doc.createRange();
    range2.selectNode(node2);
    range2.collapse(true);
    return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2);
};

goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
    var parent = textNode.parentNode;
    if (parent == node) {
        return -1;
    }
    var sibling = node;
    while (sibling.parentNode != parent) {
        sibling = sibling.parentNode;
    }
    return goog.dom.compareSiblingOrder_(sibling, textNode);
};

goog.dom.compareSiblingOrder_ = function(node1, node2) {
    var s = node2;
    while (s = s.previousSibling) {
        if (s == node1) {
            return -1;
        }
    }
    return 1;
};

goog.dom.findCommonAncestor = function(var_args) {
    var i, count = arguments.length;
    if (!count) {
        return null;
    } else if (count == 1) {
        return arguments[0];
    }
    var paths = [];
    var minLength = Infinity;
    for (i = 0; i < count; i++) {
        var ancestors = [];
        var node = arguments[i];
        while (node) {
            ancestors.unshift(node);
            node = node.parentNode;
        }
        paths.push(ancestors);
        minLength = Math.min(minLength, ancestors.length);
    }
    var output = null;
    for (i = 0; i < minLength; i++) {
        var first = paths[0][i];
        for (var j = 1; j < count; j++) {
            if (first != paths[j][i]) {
                return output;
            }
        }
        output = first;
    }
    return output;
};

goog.dom.getOwnerDocument = function(node) {
    goog.asserts.assert(node, "Node cannot be null or undefined.");
    return node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document;
};

goog.dom.getFrameContentDocument = function(frame) {
    return frame.contentDocument || frame.contentWindow.document;
};

goog.dom.getFrameContentWindow = function(frame) {
    try {
        return frame.contentWindow || (frame.contentDocument ? goog.dom.getWindow(frame.contentDocument) : null);
    } catch (e) {}
    return null;
};

goog.dom.setTextContent = function(node, text) {
    goog.asserts.assert(node != null, "goog.dom.setTextContent expects a non-null value for node");
    if ("textContent" in node) {
        node.textContent = text;
    } else if (node.nodeType == goog.dom.NodeType.TEXT) {
        node.data = text;
    } else if (node.firstChild && node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
        while (node.lastChild != node.firstChild) {
            node.removeChild(node.lastChild);
        }
        node.firstChild.data = text;
    } else {
        goog.dom.removeChildren(node);
        var doc = goog.dom.getOwnerDocument(node);
        node.appendChild(doc.createTextNode(String(text)));
    }
};

goog.dom.getOuterHtml = function(element) {
    if ("outerHTML" in element) {
        return element.outerHTML;
    } else {
        var doc = goog.dom.getOwnerDocument(element);
        var div = doc.createElement(goog.dom.TagName.DIV);
        div.appendChild(element.cloneNode(true));
        return div.innerHTML;
    }
};

goog.dom.findNode = function(root, p) {
    var rv = [];
    var found = goog.dom.findNodes_(root, p, rv, true);
    return found ? rv[0] : undefined;
};

goog.dom.findNodes = function(root, p) {
    var rv = [];
    goog.dom.findNodes_(root, p, rv, false);
    return rv;
};

goog.dom.findNodes_ = function(root, p, rv, findOne) {
    if (root != null) {
        var child = root.firstChild;
        while (child) {
            if (p(child)) {
                rv.push(child);
                if (findOne) {
                    return true;
                }
            }
            if (goog.dom.findNodes_(child, p, rv, findOne)) {
                return true;
            }
            child = child.nextSibling;
        }
    }
    return false;
};

goog.dom.TAGS_TO_IGNORE_ = {
    SCRIPT: 1,
    STYLE: 1,
    HEAD: 1,
    IFRAME: 1,
    OBJECT: 1
};

goog.dom.PREDEFINED_TAG_VALUES_ = {
    IMG: " ",
    BR: "\n"
};

goog.dom.isFocusableTabIndex = function(element) {
    return goog.dom.hasSpecifiedTabIndex_(element) && goog.dom.isTabIndexFocusable_(element);
};

goog.dom.setFocusableTabIndex = function(element, enable) {
    if (enable) {
        element.tabIndex = 0;
    } else {
        element.tabIndex = -1;
        element.removeAttribute("tabIndex");
    }
};

goog.dom.isFocusable = function(element) {
    var focusable;
    if (goog.dom.nativelySupportsFocus_(element)) {
        focusable = !element.disabled && (!goog.dom.hasSpecifiedTabIndex_(element) || goog.dom.isTabIndexFocusable_(element));
    } else {
        focusable = goog.dom.isFocusableTabIndex(element);
    }
    return focusable && goog.userAgent.IE ? goog.dom.hasNonZeroBoundingRect_(element) : focusable;
};

goog.dom.hasSpecifiedTabIndex_ = function(element) {
    var attrNode = element.getAttributeNode("tabindex");
    return goog.isDefAndNotNull(attrNode) && attrNode.specified;
};

goog.dom.isTabIndexFocusable_ = function(element) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0 && index < 32768;
};

goog.dom.nativelySupportsFocus_ = function(element) {
    return element.tagName == goog.dom.TagName.A || element.tagName == goog.dom.TagName.INPUT || element.tagName == goog.dom.TagName.TEXTAREA || element.tagName == goog.dom.TagName.SELECT || element.tagName == goog.dom.TagName.BUTTON;
};

goog.dom.hasNonZeroBoundingRect_ = function(element) {
    var rect = goog.isFunction(element["getBoundingClientRect"]) ? element.getBoundingClientRect() : {
        height: element.offsetHeight,
        width: element.offsetWidth
    };
    return goog.isDefAndNotNull(rect) && rect.height > 0 && rect.width > 0;
};

goog.dom.getTextContent = function(node) {
    var textContent;
    if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
        textContent = goog.string.canonicalizeNewlines(node.innerText);
    } else {
        var buf = [];
        goog.dom.getTextContent_(node, buf, true);
        textContent = buf.join("");
    }
    textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
    textContent = textContent.replace(/\u200B/g, "");
    if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
        textContent = textContent.replace(/ +/g, " ");
    }
    if (textContent != " ") {
        textContent = textContent.replace(/^\s*/, "");
    }
    return textContent;
};

goog.dom.getRawTextContent = function(node) {
    var buf = [];
    goog.dom.getTextContent_(node, buf, false);
    return buf.join("");
};

goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
    if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {} else if (node.nodeType == goog.dom.NodeType.TEXT) {
        if (normalizeWhitespace) {
            buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""));
        } else {
            buf.push(node.nodeValue);
        }
    } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
    } else {
        var child = node.firstChild;
        while (child) {
            goog.dom.getTextContent_(child, buf, normalizeWhitespace);
            child = child.nextSibling;
        }
    }
};

goog.dom.getNodeTextLength = function(node) {
    return goog.dom.getTextContent(node).length;
};

goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
    var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
    var buf = [];
    while (node && node != root) {
        var cur = node;
        while (cur = cur.previousSibling) {
            buf.unshift(goog.dom.getTextContent(cur));
        }
        node = node.parentNode;
    }
    return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length;
};

goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
    var stack = [ parent ], pos = 0, cur = null;
    while (stack.length > 0 && pos < offset) {
        cur = stack.pop();
        if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {} else if (cur.nodeType == goog.dom.NodeType.TEXT) {
            var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
            pos += text.length;
        } else if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
            pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
        } else {
            for (var i = cur.childNodes.length - 1; i >= 0; i--) {
                stack.push(cur.childNodes[i]);
            }
        }
    }
    if (goog.isObject(opt_result)) {
        opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
        opt_result.node = cur;
    }
    return cur;
};

goog.dom.isNodeList = function(val) {
    if (val && typeof val.length == "number") {
        if (goog.isObject(val)) {
            return typeof val.item == "function" || typeof val.item == "string";
        } else if (goog.isFunction(val)) {
            return typeof val.item == "function";
        }
    }
    return false;
};

goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class, opt_maxSearchSteps) {
    if (!opt_tag && !opt_class) {
        return null;
    }
    var tagName = opt_tag ? opt_tag.toUpperCase() : null;
    return goog.dom.getAncestor(element, function(node) {
        return (!tagName || node.nodeName == tagName) && (!opt_class || goog.isString(node.className) && goog.array.contains(node.className.split(/\s+/), opt_class));
    }, true, opt_maxSearchSteps);
};

goog.dom.getAncestorByClass = function(element, className, opt_maxSearchSteps) {
    return goog.dom.getAncestorByTagNameAndClass(element, null, className, opt_maxSearchSteps);
};

goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
    if (!opt_includeNode) {
        element = element.parentNode;
    }
    var ignoreSearchSteps = opt_maxSearchSteps == null;
    var steps = 0;
    while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
        goog.asserts.assert(element.name != "parentNode");
        if (matcher(element)) {
            return element;
        }
        element = element.parentNode;
        steps++;
    }
    return null;
};

goog.dom.getActiveElement = function(doc) {
    try {
        return doc && doc.activeElement;
    } catch (e) {}
    return null;
};

goog.dom.getPixelRatio = function() {
    var win = goog.dom.getWindow();
    if (goog.isDef(win.devicePixelRatio)) {
        return win.devicePixelRatio;
    } else if (win.matchMedia) {
        return goog.dom.matchesPixelRatio_(.75) || goog.dom.matchesPixelRatio_(1.5) || goog.dom.matchesPixelRatio_(2) || goog.dom.matchesPixelRatio_(3) || 1;
    }
    return 1;
};

goog.dom.matchesPixelRatio_ = function(pixelRatio) {
    var win = goog.dom.getWindow();
    var query = "(-webkit-min-device-pixel-ratio: " + pixelRatio + ")," + "(min--moz-device-pixel-ratio: " + pixelRatio + ")," + "(min-resolution: " + pixelRatio + "dppx)";
    return win.matchMedia(query).matches ? pixelRatio : 0;
};

goog.dom.DomHelper = function(opt_document) {
    this.document_ = opt_document || goog.global.document || document;
};

goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;

goog.dom.DomHelper.prototype.setDocument = function(document) {
    this.document_ = document;
};

goog.dom.DomHelper.prototype.getDocument = function() {
    return this.document_;
};

goog.dom.DomHelper.prototype.getElement = function(element) {
    return goog.dom.getElementHelper_(this.document_, element);
};

goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
    return goog.dom.getRequiredElementHelper_(this.document_, id);
};

goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;

goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
    return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el);
};

goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
    var doc = opt_el || this.document_;
    return goog.dom.getElementsByClass(className, doc);
};

goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
    var doc = opt_el || this.document_;
    return goog.dom.getElementByClass(className, doc);
};

goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className, opt_root) {
    var root = opt_root || this.document_;
    return goog.dom.getRequiredElementByClass(className, root);
};

goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;

goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;

goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
    return goog.dom.getViewportSize(opt_window || this.getWindow());
};

goog.dom.DomHelper.prototype.getDocumentHeight = function() {
    return goog.dom.getDocumentHeight_(this.getWindow());
};

goog.dom.Appendable;

goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
    return goog.dom.createDom_(this.document_, arguments);
};

goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;

goog.dom.DomHelper.prototype.createElement = function(name) {
    return this.document_.createElement(name);
};

goog.dom.DomHelper.prototype.createTextNode = function(content) {
    return this.document_.createTextNode(String(content));
};

goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
    return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp);
};

goog.dom.DomHelper.prototype.safeHtmlToNode = function(html) {
    return goog.dom.safeHtmlToNode_(this.document_, html);
};

goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
    return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};

goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
    return goog.dom.isCss1CompatMode_(this.document_);
};

goog.dom.DomHelper.prototype.getWindow = function() {
    return goog.dom.getWindow_(this.document_);
};

goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
    return goog.dom.getDocumentScrollElement_(this.document_);
};

goog.dom.DomHelper.prototype.getDocumentScroll = function() {
    return goog.dom.getDocumentScroll_(this.document_);
};

goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
    return goog.dom.getActiveElement(opt_doc || this.document_);
};

goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;

goog.dom.DomHelper.prototype.append = goog.dom.append;

goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;

goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;

goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;

goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;

goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;

goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;

goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;

goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;

goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;

goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;

goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;

goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;

goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;

goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;

goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;

goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;

goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;

goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;

goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;

goog.dom.DomHelper.prototype.contains = goog.dom.contains;

goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;

goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;

goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;

goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;

goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;

goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;

goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;

goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;

goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;

goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;

goog.dom.DomHelper.prototype.setFocusableTabIndex = goog.dom.setFocusableTabIndex;

goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;

goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;

goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;

goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;

goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;

goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;

goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;

goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;

goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;

goog.provide("goog.soy");

goog.require("goog.asserts");

goog.require("goog.dom");

goog.require("goog.dom.NodeType");

goog.require("goog.dom.TagName");

goog.require("goog.soy.data.SanitizedContent");

goog.require("goog.soy.data.SanitizedContentKind");

goog.require("goog.string");

goog.define("goog.soy.REQUIRE_STRICT_AUTOESCAPE", false);

goog.soy.renderHtml = function(element, templateResult) {
    element.innerHTML = goog.soy.ensureTemplateOutputHtml_(templateResult);
};

goog.soy.renderElement = function(element, template, opt_templateData, opt_injectedData) {
    goog.asserts.assert(template, "Soy template may not be null.");
    element.innerHTML = goog.soy.ensureTemplateOutputHtml_(template(opt_templateData || goog.soy.defaultTemplateData_, undefined, opt_injectedData));
};

goog.soy.renderAsFragment = function(template, opt_templateData, opt_injectedData, opt_domHelper) {
    goog.asserts.assert(template, "Soy template may not be null.");
    var dom = opt_domHelper || goog.dom.getDomHelper();
    var html = goog.soy.ensureTemplateOutputHtml_(template(opt_templateData || goog.soy.defaultTemplateData_, undefined, opt_injectedData));
    goog.soy.assertFirstTagValid_(html);
    return dom.htmlToDocumentFragment(html);
};

goog.soy.renderAsElement = function(template, opt_templateData, opt_injectedData, opt_domHelper) {
    goog.asserts.assert(template, "Soy template may not be null.");
    return goog.soy.convertToElement_(template(opt_templateData || goog.soy.defaultTemplateData_, undefined, opt_injectedData), opt_domHelper);
};

goog.soy.convertToElement = function(templateResult, opt_domHelper) {
    return goog.soy.convertToElement_(templateResult, opt_domHelper);
};

goog.soy.convertToElement_ = function(templateResult, opt_domHelper) {
    var dom = opt_domHelper || goog.dom.getDomHelper();
    var wrapper = dom.createElement(goog.dom.TagName.DIV);
    var html = goog.soy.ensureTemplateOutputHtml_(templateResult);
    goog.soy.assertFirstTagValid_(html);
    wrapper.innerHTML = html;
    if (wrapper.childNodes.length == 1) {
        var firstChild = wrapper.firstChild;
        if (firstChild.nodeType == goog.dom.NodeType.ELEMENT) {
            return firstChild;
        }
    }
    return wrapper;
};

goog.soy.ensureTemplateOutputHtml_ = function(templateResult) {
    if (!goog.soy.REQUIRE_STRICT_AUTOESCAPE && !goog.isObject(templateResult)) {
        return String(templateResult);
    }
    if (templateResult instanceof goog.soy.data.SanitizedContent) {
        templateResult = templateResult;
        var ContentKind = goog.soy.data.SanitizedContentKind;
        if (templateResult.contentKind === ContentKind.HTML) {
            return goog.asserts.assertString(templateResult.getContent());
        }
        if (templateResult.contentKind === ContentKind.TEXT) {
            return goog.string.htmlEscape(templateResult.getContent());
        }
    }
    goog.asserts.fail("Soy template output is unsafe for use as HTML: " + templateResult);
    return "zSoyz";
};

goog.soy.assertFirstTagValid_ = function(html) {
    if (goog.asserts.ENABLE_ASSERTS) {
        var matches = html.match(goog.soy.INVALID_TAG_TO_RENDER_);
        goog.asserts.assert(!matches, "This template starts with a %s, which " + "cannot be a child of a <div>, as required by soy internals. " + "Consider using goog.soy.renderElement instead.\nTemplate output: %s", matches && matches[0], html);
    }
};

goog.soy.INVALID_TAG_TO_RENDER_ = /^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i;

goog.soy.defaultTemplateData_ = {};

goog.provide("goog.structs.InversionMap");

goog.require("goog.array");

goog.structs.InversionMap = function(rangeArray, valueArray, opt_delta) {
    this.rangeArray = null;
    if (rangeArray.length != valueArray.length) {
        return null;
    }
    this.storeInversion_(rangeArray, opt_delta);
    this.values = valueArray;
};

goog.structs.InversionMap.prototype.storeInversion_ = function(rangeArray, opt_delta) {
    this.rangeArray = rangeArray;
    for (var i = 1; i < rangeArray.length; i++) {
        if (rangeArray[i] == null) {
            rangeArray[i] = rangeArray[i - 1] + 1;
        } else if (opt_delta) {
            rangeArray[i] += rangeArray[i - 1];
        }
    }
};

goog.structs.InversionMap.prototype.spliceInversion = function(rangeArray, valueArray, opt_delta) {
    var otherMap = new goog.structs.InversionMap(rangeArray, valueArray, opt_delta);
    var startRange = otherMap.rangeArray[0];
    var endRange = goog.array.peek(otherMap.rangeArray);
    var startSplice = this.getLeast(startRange);
    var endSplice = this.getLeast(endRange);
    if (startRange != this.rangeArray[startSplice]) {
        startSplice++;
    }
    var spliceLength = endSplice - startSplice + 1;
    goog.partial(goog.array.splice, this.rangeArray, startSplice, spliceLength).apply(null, otherMap.rangeArray);
    goog.partial(goog.array.splice, this.values, startSplice, spliceLength).apply(null, otherMap.values);
};

goog.structs.InversionMap.prototype.at = function(intKey) {
    var index = this.getLeast(intKey);
    if (index < 0) {
        return null;
    }
    return this.values[index];
};

goog.structs.InversionMap.prototype.getLeast = function(intKey) {
    var arr = this.rangeArray;
    var low = 0;
    var high = arr.length;
    while (high - low > 8) {
        var mid = high + low >> 1;
        if (arr[mid] <= intKey) {
            low = mid;
        } else {
            high = mid;
        }
    }
    for (;low < high; ++low) {
        if (intKey < arr[low]) {
            break;
        }
    }
    return low - 1;
};

goog.provide("goog.i18n.GraphemeBreak");

goog.require("goog.structs.InversionMap");

goog.i18n.GraphemeBreak.property = {
    ANY: 0,
    CONTROL: 1,
    EXTEND: 2,
    PREPEND: 3,
    SPACING_MARK: 4,
    INDIC_CONSONANT: 5,
    VIRAMA: 6,
    L: 7,
    V: 8,
    T: 9,
    LV: 10,
    LVT: 11,
    CR: 12,
    LF: 13,
    REGIONAL_INDICATOR: 14
};

goog.i18n.GraphemeBreak.inversions_ = null;

goog.i18n.GraphemeBreak.applyLegacyBreakRules_ = function(prop_a, prop_b) {
    var prop = goog.i18n.GraphemeBreak.property;
    if (prop_a == prop.CR && prop_b == prop.LF) {
        return false;
    }
    if (prop_a == prop.CONTROL || prop_a == prop.CR || prop_a == prop.LF) {
        return true;
    }
    if (prop_b == prop.CONTROL || prop_b == prop.CR || prop_b == prop.LF) {
        return true;
    }
    if (prop_a == prop.L && (prop_b == prop.L || prop_b == prop.V || prop_b == prop.LV || prop_b == prop.LVT)) {
        return false;
    }
    if ((prop_a == prop.LV || prop_a == prop.V) && (prop_b == prop.V || prop_b == prop.T)) {
        return false;
    }
    if ((prop_a == prop.LVT || prop_a == prop.T) && prop_b == prop.T) {
        return false;
    }
    if (prop_b == prop.EXTEND || prop_b == prop.VIRAMA) {
        return false;
    }
    if (prop_a == prop.VIRAMA && prop_b == prop.INDIC_CONSONANT) {
        return false;
    }
    return true;
};

goog.i18n.GraphemeBreak.getBreakProp_ = function(acode) {
    if (44032 <= acode && acode <= 55203) {
        var prop = goog.i18n.GraphemeBreak.property;
        if (acode % 28 == 16) {
            return prop.LV;
        }
        return prop.LVT;
    } else {
        if (!goog.i18n.GraphemeBreak.inversions_) {
            goog.i18n.GraphemeBreak.inversions_ = new goog.structs.InversionMap([ 0, 10, 1, 2, 1, 18, 95, 33, 13, 1, 594, 112, 275, 7, 263, 45, 1, 1, 1, 2, 1, 2, 1, 1, 56, 5, 11, 11, 48, 21, 16, 1, 101, 7, 1, 1, 6, 2, 2, 1, 4, 33, 1, 1, 1, 30, 27, 91, 11, 58, 9, 34, 4, 1, 9, 1, 3, 1, 5, 43, 3, 136, 31, 1, 17, 37, 1, 1, 1, 1, 3, 8, 4, 1, 2, 1, 7, 8, 2, 2, 21, 8, 1, 2, 17, 39, 1, 1, 1, 2, 6, 6, 1, 9, 5, 4, 2, 2, 12, 2, 15, 2, 1, 17, 39, 2, 3, 12, 4, 8, 6, 17, 2, 3, 14, 1, 17, 39, 1, 1, 3, 8, 4, 1, 20, 2, 29, 1, 2, 17, 39, 1, 1, 2, 1, 6, 6, 9, 6, 4, 2, 2, 13, 1, 16, 1, 18, 41, 1, 1, 1, 12, 1, 9, 1, 41, 3, 17, 37, 4, 3, 5, 7, 8, 3, 2, 8, 2, 30, 2, 17, 39, 1, 1, 1, 1, 2, 1, 3, 1, 5, 1, 8, 9, 1, 3, 2, 30, 2, 17, 38, 3, 1, 2, 5, 7, 1, 9, 1, 10, 2, 30, 2, 22, 48, 5, 1, 2, 6, 7, 19, 2, 13, 46, 2, 1, 1, 1, 6, 1, 12, 8, 50, 46, 2, 1, 1, 1, 9, 11, 6, 14, 2, 58, 2, 27, 1, 1, 1, 1, 1, 4, 2, 49, 14, 1, 4, 1, 1, 2, 5, 48, 9, 1, 57, 33, 12, 4, 1, 6, 1, 2, 2, 2, 1, 16, 2, 4, 2, 2, 4, 3, 1, 3, 2, 7, 3, 4, 13, 1, 1, 1, 2, 6, 1, 1, 14, 1, 98, 96, 72, 88, 349, 3, 931, 15, 2, 1, 14, 15, 2, 1, 14, 15, 2, 15, 15, 14, 35, 17, 2, 1, 7, 8, 1, 2, 9, 1, 1, 9, 1, 45, 3, 155, 1, 87, 31, 3, 4, 2, 9, 1, 6, 3, 20, 19, 29, 44, 9, 3, 2, 1, 69, 23, 2, 3, 4, 45, 6, 2, 1, 1, 1, 8, 1, 1, 1, 2, 8, 6, 13, 128, 4, 1, 14, 33, 1, 1, 5, 1, 1, 5, 1, 1, 1, 7, 31, 9, 12, 2, 1, 7, 23, 1, 4, 2, 2, 2, 2, 2, 11, 3, 2, 36, 2, 1, 1, 2, 3, 1, 1, 3, 2, 12, 36, 8, 8, 2, 2, 21, 3, 128, 3, 1, 13, 1, 7, 4, 1, 4, 2, 1, 203, 64, 523, 1, 2, 2, 24, 7, 49, 16, 96, 33, 3070, 3, 141, 1, 96, 32, 554, 6, 105, 2, 30164, 4, 1, 10, 33, 1, 80, 2, 272, 1, 3, 1, 4, 1, 23, 2, 2, 1, 24, 30, 4, 4, 3, 8, 1, 1, 13, 2, 16, 34, 16, 1, 27, 18, 24, 24, 4, 8, 2, 23, 11, 1, 1, 12, 32, 3, 1, 5, 3, 3, 36, 1, 2, 4, 2, 1, 3, 1, 69, 35, 6, 2, 2, 2, 2, 12, 1, 8, 1, 1, 18, 16, 1, 3, 6, 1, 5, 48, 1, 1, 3, 2, 2, 5, 2, 1, 1, 32, 9, 1, 2, 2, 5, 1, 1, 201, 14, 2, 1, 1, 9, 8, 2, 1, 2, 1, 2, 1, 1, 1, 18, 11184, 27, 49, 1028, 1024, 6942, 1, 737, 16, 16, 7, 216, 1, 158, 2, 89, 3, 513, 1, 2051, 15, 40, 7, 1, 1472, 1, 1, 1, 53, 14, 1, 57, 2, 1, 45, 3, 4, 2, 1, 1, 2, 1, 66, 3, 36, 5, 1, 6, 2, 75, 2, 1, 48, 3, 9, 1, 1, 1258, 1, 1, 1, 2, 6, 1, 1, 22681, 62, 4, 25042, 1, 1, 3, 3, 1, 5, 8, 8, 2, 7, 30, 4, 148, 3, 8097, 26, 790017, 255 ], [ 1, 13, 1, 12, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 4, 0, 5, 2, 4, 2, 0, 4, 2, 4, 6, 4, 0, 2, 5, 0, 2, 0, 5, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4, 6, 0, 2, 5, 0, 2, 0, 5, 0, 2, 4, 0, 5, 2, 4, 2, 6, 2, 5, 0, 2, 0, 2, 4, 0, 5, 2, 0, 4, 2, 4, 6, 0, 2, 0, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4, 6, 2, 5, 0, 2, 0, 5, 0, 2, 0, 5, 2, 4, 2, 4, 6, 0, 2, 0, 4, 0, 5, 0, 2, 4, 2, 6, 2, 5, 0, 2, 0, 4, 0, 5, 2, 0, 4, 2, 4, 2, 4, 2, 4, 2, 6, 2, 5, 0, 2, 0, 4, 0, 5, 0, 2, 4, 2, 4, 6, 0, 2, 0, 2, 0, 4, 0, 5, 6, 2, 4, 2, 4, 2, 4, 0, 5, 0, 2, 0, 4, 2, 6, 0, 2, 0, 5, 0, 2, 0, 4, 2, 0, 2, 0, 5, 0, 2, 0, 2, 0, 2, 0, 2, 0, 4, 5, 2, 4, 2, 6, 0, 2, 0, 2, 0, 2, 0, 5, 0, 2, 4, 2, 0, 6, 4, 2, 5, 0, 5, 0, 4, 2, 5, 2, 5, 0, 5, 0, 5, 2, 5, 2, 0, 4, 2, 0, 2, 5, 0, 2, 0, 7, 8, 9, 0, 2, 0, 5, 2, 6, 0, 5, 2, 6, 0, 5, 2, 0, 5, 2, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 2, 0, 2, 0, 2, 0, 2, 0, 5, 2, 4, 2, 4, 2, 4, 2, 0, 5, 0, 5, 0, 4, 0, 4, 0, 5, 2, 4, 0, 5, 0, 5, 4, 2, 4, 2, 6, 0, 2, 0, 2, 4, 2, 0, 2, 4, 0, 5, 2, 4, 2, 4, 2, 4, 2, 4, 6, 5, 0, 2, 0, 2, 4, 0, 5, 4, 2, 4, 2, 6, 4, 5, 0, 5, 0, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 0, 5, 4, 2, 4, 2, 0, 5, 0, 2, 0, 2, 4, 2, 0, 2, 0, 4, 2, 0, 2, 0, 1, 2, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 6, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 6, 5, 2, 5, 4, 2, 4, 0, 5, 0, 5, 0, 5, 0, 5, 0, 4, 0, 5, 4, 6, 0, 2, 0, 5, 0, 2, 0, 5, 2, 4, 6, 0, 7, 2, 4, 0, 5, 0, 5, 2, 4, 2, 4, 2, 4, 6, 0, 5, 2, 4, 2, 4, 2, 0, 2, 0, 2, 4, 0, 5, 0, 5, 0, 5, 0, 5, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 5, 4, 2, 4, 0, 4, 6, 0, 5, 0, 5, 0, 5, 0, 4, 2, 4, 2, 4, 0, 4, 6, 0, 11, 8, 9, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 2, 0, 2, 6, 0, 4, 2, 4, 0, 2, 6, 0, 2, 4, 0, 4, 2, 4, 6, 2, 0, 1, 0, 2, 0, 2, 4, 2, 6, 0, 2, 4, 0, 4, 2, 4, 6, 0, 2, 4, 2, 4, 2, 6, 2, 0, 4, 2, 0, 2, 4, 2, 0, 4, 2, 1, 2, 0, 2, 0, 2, 0, 2, 0, 14, 0, 1, 2 ], true);
        }
        return goog.i18n.GraphemeBreak.inversions_.at(acode);
    }
};

goog.i18n.GraphemeBreak.hasGraphemeBreak = function(a, b, opt_extended) {
    var prop_a = goog.i18n.GraphemeBreak.getBreakProp_(a);
    var prop_b = goog.i18n.GraphemeBreak.getBreakProp_(b);
    var prop = goog.i18n.GraphemeBreak.property;
    return goog.i18n.GraphemeBreak.applyLegacyBreakRules_(prop_a, prop_b) && !(opt_extended && (prop_a == prop.PREPEND || prop_b == prop.SPACING_MARK));
};

goog.provide("goog.format");

goog.require("goog.i18n.GraphemeBreak");

goog.require("goog.string");

goog.require("goog.userAgent");

goog.format.fileSize = function(bytes, opt_decimals) {
    return goog.format.numBytesToString(bytes, opt_decimals, false);
};

goog.format.isConvertableScaledNumber = function(val) {
    return goog.format.SCALED_NUMERIC_RE_.test(val);
};

goog.format.stringToNumericValue = function(stringValue) {
    if (goog.string.endsWith(stringValue, "B")) {
        return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_);
    }
    return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_SI_);
};

goog.format.stringToNumBytes = function(stringValue) {
    return goog.format.stringToNumericValue_(stringValue, goog.format.NUMERIC_SCALES_BINARY_);
};

goog.format.numericValueToString = function(val, opt_decimals) {
    return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_SI_, opt_decimals);
};

goog.format.numBytesToString = function(val, opt_decimals, opt_suffix, opt_useSeparator) {
    var suffix = "";
    if (!goog.isDef(opt_suffix) || opt_suffix) {
        suffix = "B";
    }
    return goog.format.numericValueToString_(val, goog.format.NUMERIC_SCALES_BINARY_, opt_decimals, suffix, opt_useSeparator);
};

goog.format.stringToNumericValue_ = function(stringValue, conversion) {
    var match = stringValue.match(goog.format.SCALED_NUMERIC_RE_);
    if (!match) {
        return NaN;
    }
    var val = match[1] * conversion[match[2]];
    return val;
};

goog.format.numericValueToString_ = function(val, conversion, opt_decimals, opt_suffix, opt_useSeparator) {
    var prefixes = goog.format.NUMERIC_SCALE_PREFIXES_;
    var orig_val = val;
    var symbol = "";
    var separator = "";
    var scale = 1;
    if (val < 0) {
        val = -val;
    }
    for (var i = 0; i < prefixes.length; i++) {
        var unit = prefixes[i];
        scale = conversion[unit];
        if (val >= scale || scale <= 1 && val > .1 * scale) {
            symbol = unit;
            break;
        }
    }
    if (!symbol) {
        scale = 1;
    } else {
        if (opt_suffix) {
            symbol += opt_suffix;
        }
        if (opt_useSeparator) {
            separator = " ";
        }
    }
    var ex = Math.pow(10, goog.isDef(opt_decimals) ? opt_decimals : 2);
    return Math.round(orig_val / scale * ex) / ex + separator + symbol;
};

goog.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)([K,M,G,T,P,k,m,u,n]?)[B]?$/;

goog.format.NUMERIC_SCALE_PREFIXES_ = [ "P", "T", "G", "M", "K", "", "m", "u", "n" ];

goog.format.NUMERIC_SCALES_SI_ = {
    "": 1,
    n: 1e-9,
    u: 1e-6,
    m: .001,
    k: 1e3,
    K: 1e3,
    M: 1e6,
    G: 1e9,
    T: 1e12,
    P: 1e15
};

goog.format.NUMERIC_SCALES_BINARY_ = {
    "": 1,
    n: Math.pow(1024, -3),
    u: Math.pow(1024, -2),
    m: 1 / 1024,
    k: 1024,
    K: 1024,
    M: Math.pow(1024, 2),
    G: Math.pow(1024, 3),
    T: Math.pow(1024, 4),
    P: Math.pow(1024, 5)
};

goog.format.FIRST_GRAPHEME_EXTEND_ = 768;

goog.format.isTreatedAsBreakingSpace_ = function(charCode) {
    return charCode <= goog.format.WbrToken_.SPACE || charCode >= 4096 && (charCode >= 8192 && charCode <= 8198 || charCode >= 8200 && charCode <= 8203 || charCode == 5760 || charCode == 6158 || charCode == 8232 || charCode == 8233 || charCode == 8287 || charCode == 12288);
};

goog.format.isInvisibleFormattingCharacter_ = function(charCode) {
    return charCode >= 8204 && charCode <= 8207 || charCode >= 8234 && charCode <= 8238;
};

goog.format.insertWordBreaksGeneric_ = function(str, hasGraphemeBreak, opt_maxlen) {
    var maxlen = opt_maxlen || 10;
    if (maxlen > str.length) return str;
    var rv = [];
    var n = 0;
    var nestingCharCode = 0;
    var lastDumpPosition = 0;
    var charCode = 0;
    for (var i = 0; i < str.length; i++) {
        var lastCharCode = charCode;
        charCode = str.charCodeAt(i);
        var isPotentiallyGraphemeExtending = charCode >= goog.format.FIRST_GRAPHEME_EXTEND_ && !hasGraphemeBreak(lastCharCode, charCode, true);
        if (n >= maxlen && !goog.format.isTreatedAsBreakingSpace_(charCode) && !isPotentiallyGraphemeExtending) {
            rv.push(str.substring(lastDumpPosition, i), goog.format.WORD_BREAK_HTML);
            lastDumpPosition = i;
            n = 0;
        }
        if (!nestingCharCode) {
            if (charCode == goog.format.WbrToken_.LT || charCode == goog.format.WbrToken_.AMP) {
                nestingCharCode = charCode;
            } else if (goog.format.isTreatedAsBreakingSpace_(charCode)) {
                n = 0;
            } else if (!goog.format.isInvisibleFormattingCharacter_(charCode)) {
                n++;
            }
        } else if (charCode == goog.format.WbrToken_.GT && nestingCharCode == goog.format.WbrToken_.LT) {
            nestingCharCode = 0;
        } else if (charCode == goog.format.WbrToken_.SEMI_COLON && nestingCharCode == goog.format.WbrToken_.AMP) {
            nestingCharCode = 0;
            n++;
        }
    }
    rv.push(str.substr(lastDumpPosition));
    return rv.join("");
};

goog.format.insertWordBreaks = function(str, opt_maxlen) {
    return goog.format.insertWordBreaksGeneric_(str, goog.i18n.GraphemeBreak.hasGraphemeBreak, opt_maxlen);
};

goog.format.conservativelyHasGraphemeBreak_ = function(lastCharCode, charCode, opt_extended) {
    return charCode >= 1024 && charCode < 1315;
};

goog.format.insertWordBreaksBasic = function(str, opt_maxlen) {
    return goog.format.insertWordBreaksGeneric_(str, goog.format.conservativelyHasGraphemeBreak_, opt_maxlen);
};

goog.format.IS_IE8_OR_ABOVE_ = goog.userAgent.IE && goog.userAgent.isVersionOrHigher(8);

goog.format.WORD_BREAK_HTML = goog.userAgent.WEBKIT ? "<wbr></wbr>" : goog.userAgent.OPERA ? "&shy;" : goog.format.IS_IE8_OR_ABOVE_ ? "&#8203;" : "<wbr>";

goog.format.WbrToken_ = {
    LT: 60,
    GT: 62,
    AMP: 38,
    SEMI_COLON: 59,
    SPACE: 32
};

goog.provide("goog.html.legacyconversions");

goog.require("goog.html.SafeHtml");

goog.require("goog.html.SafeStyle");

goog.require("goog.html.SafeUrl");

goog.require("goog.html.TrustedResourceUrl");

goog.define("goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS", true);

goog.html.legacyconversions.safeHtmlFromString = function(html) {
    goog.html.legacyconversions.throwIfConversionsDisallowed();
    return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(html, null);
};

goog.html.legacyconversions.safeStyleFromString = function(style) {
    goog.html.legacyconversions.throwIfConversionsDisallowed();
    return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(style);
};

goog.html.legacyconversions.trustedResourceUrlFromString = function(url) {
    goog.html.legacyconversions.throwIfConversionsDisallowed();
    return goog.html.TrustedResourceUrl.createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.html.legacyconversions.safeUrlFromString = function(url) {
    goog.html.legacyconversions.throwIfConversionsDisallowed();
    return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};

goog.html.legacyconversions.reportCallback_ = goog.nullFunction;

goog.html.legacyconversions.setReportCallback = function(callback) {
    goog.html.legacyconversions.reportCallback_ = callback;
};

goog.html.legacyconversions.throwIfConversionsDisallowed = function() {
    if (!goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS) {
        throw Error("Error: Legacy conversion from string to goog.html types is disabled");
    }
    goog.html.legacyconversions.reportCallback_();
};

goog.provide("goog.i18n.BidiFormatter");

goog.require("goog.html.SafeHtml");

goog.require("goog.html.legacyconversions");

goog.require("goog.i18n.bidi");

goog.require("goog.i18n.bidi.Dir");

goog.require("goog.i18n.bidi.Format");

goog.i18n.BidiFormatter = function(contextDir, opt_alwaysSpan) {
    this.contextDir_ = goog.i18n.bidi.toDir(contextDir, true);
    this.alwaysSpan_ = !!opt_alwaysSpan;
};

goog.i18n.BidiFormatter.prototype.getContextDir = function() {
    return this.contextDir_;
};

goog.i18n.BidiFormatter.prototype.getAlwaysSpan = function() {
    return this.alwaysSpan_;
};

goog.i18n.BidiFormatter.prototype.setContextDir = function(contextDir) {
    this.contextDir_ = goog.i18n.bidi.toDir(contextDir, true);
};

goog.i18n.BidiFormatter.prototype.setAlwaysSpan = function(alwaysSpan) {
    this.alwaysSpan_ = alwaysSpan;
};

goog.i18n.BidiFormatter.prototype.estimateDirection = goog.i18n.bidi.estimateDirection;

goog.i18n.BidiFormatter.prototype.areDirectionalitiesOpposite_ = function(dir1, dir2) {
    return dir1 * dir2 < 0;
};

goog.i18n.BidiFormatter.prototype.dirResetIfNeeded_ = function(str, dir, opt_isHtml, opt_dirReset) {
    if (opt_dirReset && (this.areDirectionalitiesOpposite_(dir, this.contextDir_) || this.contextDir_ == goog.i18n.bidi.Dir.LTR && goog.i18n.bidi.endsWithRtl(str, opt_isHtml) || this.contextDir_ == goog.i18n.bidi.Dir.RTL && goog.i18n.bidi.endsWithLtr(str, opt_isHtml))) {
        return this.contextDir_ == goog.i18n.bidi.Dir.LTR ? goog.i18n.bidi.Format.LRM : goog.i18n.bidi.Format.RLM;
    } else {
        return "";
    }
};

goog.i18n.BidiFormatter.prototype.dirAttrValue = function(str, opt_isHtml) {
    return this.knownDirAttrValue(this.estimateDirection(str, opt_isHtml));
};

goog.i18n.BidiFormatter.prototype.knownDirAttrValue = function(dir) {
    var resolvedDir = dir == goog.i18n.bidi.Dir.NEUTRAL ? this.contextDir_ : dir;
    return resolvedDir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr";
};

goog.i18n.BidiFormatter.prototype.dirAttr = function(str, opt_isHtml) {
    return this.knownDirAttr(this.estimateDirection(str, opt_isHtml));
};

goog.i18n.BidiFormatter.prototype.knownDirAttr = function(dir) {
    if (dir != this.contextDir_) {
        return dir == goog.i18n.bidi.Dir.RTL ? 'dir="rtl"' : dir == goog.i18n.bidi.Dir.LTR ? 'dir="ltr"' : "";
    }
    return "";
};

goog.i18n.BidiFormatter.prototype.spanWrapSafeHtml = function(html, opt_dirReset) {
    return this.spanWrapSafeHtmlWithKnownDir(null, html, opt_dirReset);
};

goog.i18n.BidiFormatter.prototype.spanWrap = function(str, opt_isHtml, opt_dirReset) {
    return this.spanWrapWithKnownDir(null, str, opt_isHtml, opt_dirReset);
};

goog.i18n.BidiFormatter.prototype.spanWrapSafeHtmlWithKnownDir = function(dir, html, opt_dirReset) {
    if (dir == null) {
        dir = this.estimateDirection(goog.html.SafeHtml.unwrap(html), true);
    }
    return this.spanWrapWithKnownDir_(dir, html, opt_dirReset);
};

goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir = function(dir, str, opt_isHtml, opt_dirReset) {
    var html = opt_isHtml ? goog.html.legacyconversions.safeHtmlFromString(str) : goog.html.SafeHtml.htmlEscape(str);
    return goog.html.SafeHtml.unwrap(this.spanWrapSafeHtmlWithKnownDir(dir, html, opt_dirReset));
};

goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir_ = function(dir, html, opt_dirReset) {
    opt_dirReset = opt_dirReset || opt_dirReset == undefined;
    var result;
    var dirCondition = dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_;
    if (this.alwaysSpan_ || dirCondition) {
        var dirAttribute;
        if (dirCondition) {
            dirAttribute = dir == goog.i18n.bidi.Dir.RTL ? "rtl" : "ltr";
        }
        result = goog.html.SafeHtml.create("span", {
            dir: dirAttribute
        }, html);
    } else {
        result = html;
    }
    var str = goog.html.SafeHtml.unwrap(html);
    result = goog.html.SafeHtml.concatWithDir(goog.i18n.bidi.Dir.NEUTRAL, result, this.dirResetIfNeeded_(str, dir, true, opt_dirReset));
    return result;
};

goog.i18n.BidiFormatter.prototype.unicodeWrap = function(str, opt_isHtml, opt_dirReset) {
    return this.unicodeWrapWithKnownDir(null, str, opt_isHtml, opt_dirReset);
};

goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir = function(dir, str, opt_isHtml, opt_dirReset) {
    if (dir == null) {
        dir = this.estimateDirection(str, opt_isHtml);
    }
    return this.unicodeWrapWithKnownDir_(dir, str, opt_isHtml, opt_dirReset);
};

goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir_ = function(dir, str, opt_isHtml, opt_dirReset) {
    opt_dirReset = opt_dirReset || opt_dirReset == undefined;
    var result = [];
    if (dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_) {
        result.push(dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.Format.RLE : goog.i18n.bidi.Format.LRE);
        result.push(str);
        result.push(goog.i18n.bidi.Format.PDF);
    } else {
        result.push(str);
    }
    result.push(this.dirResetIfNeeded_(str, dir, opt_isHtml, opt_dirReset));
    return result.join("");
};

goog.i18n.BidiFormatter.prototype.markAfter = function(str, opt_isHtml) {
    return this.markAfterKnownDir(null, str, opt_isHtml);
};

goog.i18n.BidiFormatter.prototype.markAfterKnownDir = function(dir, str, opt_isHtml) {
    if (dir == null) {
        dir = this.estimateDirection(str, opt_isHtml);
    }
    return this.dirResetIfNeeded_(str, dir, opt_isHtml, true);
};

goog.i18n.BidiFormatter.prototype.mark = function() {
    switch (this.contextDir_) {
      case goog.i18n.bidi.Dir.LTR:
        return goog.i18n.bidi.Format.LRM;

      case goog.i18n.bidi.Dir.RTL:
        return goog.i18n.bidi.Format.RLM;

      default:
        return "";
    }
};

goog.i18n.BidiFormatter.prototype.startEdge = function() {
    return this.contextDir_ == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
};

goog.i18n.BidiFormatter.prototype.endEdge = function() {
    return this.contextDir_ == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;
};

goog.provide("soy");

goog.provide("soy.StringBuilder");

goog.provide("soy.esc");

goog.provide("soydata");

goog.provide("soydata.SanitizedHtml");

goog.provide("soydata.SanitizedHtmlAttribute");

goog.provide("soydata.SanitizedJs");

goog.provide("soydata.SanitizedJsStrChars");

goog.provide("soydata.SanitizedUri");

goog.provide("soydata.VERY_UNSAFE");

goog.require("goog.asserts");

goog.require("goog.dom.DomHelper");

goog.require("goog.format");

goog.require("goog.i18n.BidiFormatter");

goog.require("goog.i18n.bidi");

goog.require("goog.soy");

goog.require("goog.soy.data.SanitizedContentKind");

goog.require("goog.string");

goog.require("goog.string.StringBuffer");

soy.StringBuilder = goog.string.StringBuffer;

soydata.SanitizedContentKind = goog.soy.data.SanitizedContentKind;

soydata.isContentKind = function(value, contentKind) {
    return value != null && value.contentKind === contentKind;
};

soydata.getContentDir = function(value) {
    if (value != null) {
        switch (value.contentDir) {
          case goog.i18n.bidi.Dir.LTR:
            return goog.i18n.bidi.Dir.LTR;

          case goog.i18n.bidi.Dir.RTL:
            return goog.i18n.bidi.Dir.RTL;

          case goog.i18n.bidi.Dir.NEUTRAL:
            return goog.i18n.bidi.Dir.NEUTRAL;
        }
    }
    return null;
};

soydata.SanitizedHtml = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedHtml, goog.soy.data.SanitizedContent);

soydata.SanitizedHtml.prototype.contentKind = soydata.SanitizedContentKind.HTML;

soydata.SanitizedHtml.from = function(value) {
    if (value != null && value.contentKind === soydata.SanitizedContentKind.HTML) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
        return value;
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.esc.$$escapeHtmlHelper(String(value)), soydata.getContentDir(value));
};

soydata.SanitizedJs = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedJs, goog.soy.data.SanitizedContent);

soydata.SanitizedJs.prototype.contentKind = soydata.SanitizedContentKind.JS;

soydata.SanitizedJs.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

soydata.SanitizedJsStrChars = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedJsStrChars, goog.soy.data.SanitizedContent);

soydata.SanitizedJsStrChars.prototype.contentKind = soydata.SanitizedContentKind.JS_STR_CHARS;

soydata.SanitizedUri = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedUri, goog.soy.data.SanitizedContent);

soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;

soydata.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

soydata.SanitizedHtmlAttribute = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedHtmlAttribute, goog.soy.data.SanitizedContent);

soydata.SanitizedHtmlAttribute.prototype.contentKind = soydata.SanitizedContentKind.ATTRIBUTES;

soydata.SanitizedHtmlAttribute.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

soydata.SanitizedCss = function() {
    goog.soy.data.SanitizedContent.call(this);
};

goog.inherits(soydata.SanitizedCss, goog.soy.data.SanitizedContent);

soydata.SanitizedCss.prototype.contentKind = soydata.SanitizedContentKind.CSS;

soydata.SanitizedCss.prototype.contentDir = goog.i18n.bidi.Dir.LTR;

soydata.UnsanitizedText = function(content, opt_contentDir) {
    this.content = String(content);
    this.contentDir = opt_contentDir != null ? opt_contentDir : null;
};

goog.inherits(soydata.UnsanitizedText, goog.soy.data.SanitizedContent);

soydata.UnsanitizedText.prototype.contentKind = soydata.SanitizedContentKind.TEXT;

soydata.$$EMPTY_STRING_ = {
    VALUE: ""
};

soydata.$$makeSanitizedContentFactory_ = function(ctor) {
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    function sanitizedContentFactory(content, opt_contentDir) {
        var result = new InstantiableCtor();
        result.content = String(content);
        if (opt_contentDir !== undefined) {
            result.contentDir = opt_contentDir;
        }
        return result;
    }
    return sanitizedContentFactory;
};

soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_ = function(ctor) {
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    function sanitizedContentFactory(content) {
        var result = new InstantiableCtor();
        result.content = String(content);
        return result;
    }
    return sanitizedContentFactory;
};

soydata.markUnsanitizedText = function(content, opt_contentDir) {
    return new soydata.UnsanitizedText(content, opt_contentDir);
};

soydata.VERY_UNSAFE.ordainSanitizedHtml = soydata.$$makeSanitizedContentFactory_(soydata.SanitizedHtml);

soydata.VERY_UNSAFE.ordainSanitizedJs = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(soydata.SanitizedJs);

soydata.VERY_UNSAFE.ordainSanitizedJsStrChars = soydata.$$makeSanitizedContentFactory_(soydata.SanitizedJsStrChars);

soydata.VERY_UNSAFE.ordainSanitizedUri = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(soydata.SanitizedUri);

soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(soydata.SanitizedHtmlAttribute);

soydata.VERY_UNSAFE.ordainSanitizedCss = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(soydata.SanitizedCss);

soy.renderElement = goog.soy.renderElement;

soy.renderAsFragment = function(template, opt_templateData, opt_document, opt_injectedData) {
    return goog.soy.renderAsFragment(template, opt_templateData, opt_injectedData, new goog.dom.DomHelper(opt_document));
};

soy.renderAsElement = function(template, opt_templateData, opt_document, opt_injectedData) {
    return goog.soy.renderAsElement(template, opt_templateData, opt_injectedData, new goog.dom.DomHelper(opt_document));
};

soy.$$IS_LOCALE_RTL = goog.i18n.bidi.IS_RTL;

soy.$$augmentMap = function(baseMap, additionalMap) {
    function TempCtor() {}
    TempCtor.prototype = baseMap;
    var augmentedMap = new TempCtor();
    for (var key in additionalMap) {
        augmentedMap[key] = additionalMap[key];
    }
    return augmentedMap;
};

soy.$$checkMapKey = function(key) {
    if (typeof key != "string") {
        throw Error("Map literal's key expression must evaluate to string" + ' (encountered type "' + typeof key + '").');
    }
    return key;
};

soy.$$getMapKeys = function(map) {
    var mapKeys = [];
    for (var key in map) {
        mapKeys.push(key);
    }
    return mapKeys;
};

soy.$$getDelTemplateId = function(delTemplateName) {
    return delTemplateName;
};

soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};

soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};

soy.$$registerDelegateFn = function(delTemplateId, delTemplateVariant, delPriority, delFn) {
    var mapKey = "key_" + delTemplateId + ":" + delTemplateVariant;
    var currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
    if (currPriority === undefined || delPriority > currPriority) {
        soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority;
        soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
    } else if (delPriority == currPriority) {
        throw Error('Encountered two active delegates with the same priority ("' + delTemplateId + ":" + delTemplateVariant + '").');
    } else {}
};

soy.$$getDelegateFn = function(delTemplateId, delTemplateVariant, allowsEmptyDefault) {
    var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_["key_" + delTemplateId + ":" + delTemplateVariant];
    if (!delFn && delTemplateVariant != "") {
        delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_["key_" + delTemplateId + ":"];
    }
    if (delFn) {
        return delFn;
    } else if (allowsEmptyDefault) {
        return soy.$$EMPTY_TEMPLATE_FN_;
    } else {
        throw Error('Found no active impl for delegate call to "' + delTemplateId + ":" + delTemplateVariant + '" (and not allowemptydefault="true").');
    }
};

soy.$$EMPTY_TEMPLATE_FN_ = function(opt_data, opt_sb, opt_ijData) {
    return "";
};

soydata.$$makeSanitizedContentFactoryForInternalBlocks_ = function(ctor) {
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    function sanitizedContentFactory(content, opt_contentDir) {
        var contentString = String(content);
        if (!contentString) {
            return soydata.$$EMPTY_STRING_.VALUE;
        }
        var result = new InstantiableCtor();
        result.content = String(content);
        if (opt_contentDir !== undefined) {
            result.contentDir = opt_contentDir;
        }
        return result;
    }
    return sanitizedContentFactory;
};

soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_ = function(ctor) {
    function InstantiableCtor() {}
    InstantiableCtor.prototype = ctor.prototype;
    function sanitizedContentFactory(content) {
        var contentString = String(content);
        if (!contentString) {
            return soydata.$$EMPTY_STRING_.VALUE;
        }
        var result = new InstantiableCtor();
        result.content = String(content);
        return result;
    }
    return sanitizedContentFactory;
};

soydata.$$markUnsanitizedTextForInternalBlocks = function(content, opt_contentDir) {
    var contentString = String(content);
    if (!contentString) {
        return soydata.$$EMPTY_STRING_.VALUE;
    }
    return new soydata.UnsanitizedText(contentString, opt_contentDir);
};

soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks = soydata.$$makeSanitizedContentFactoryForInternalBlocks_(soydata.SanitizedHtml);

soydata.VERY_UNSAFE.$$ordainSanitizedJsForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(soydata.SanitizedJs);

soydata.VERY_UNSAFE.$$ordainSanitizedUriForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(soydata.SanitizedUri);

soydata.VERY_UNSAFE.$$ordainSanitizedAttributesForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(soydata.SanitizedHtmlAttribute);

soydata.VERY_UNSAFE.$$ordainSanitizedCssForInternalBlocks = soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(soydata.SanitizedCss);

soy.$$escapeHtml = function(value) {
    return soydata.SanitizedHtml.from(value);
};

soy.$$cleanHtml = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
        return value;
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(soy.$$stripHtmlTags(value, soy.esc.$$SAFE_TAG_WHITELIST_), soydata.getContentDir(value));
};

soy.$$escapeHtmlRcdata = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
        return soy.esc.$$normalizeHtmlHelper(value.content);
    }
    return soy.esc.$$escapeHtmlHelper(value);
};

soy.$$HTML5_VOID_ELEMENTS_ = new RegExp("^<(?:area|base|br|col|command|embed|hr|img|input" + "|keygen|link|meta|param|source|track|wbr)\\b");

soy.$$stripHtmlTags = function(value, opt_tagWhitelist) {
    if (!opt_tagWhitelist) {
        return String(value).replace(soy.esc.$$HTML_TAG_REGEX_, "").replace(soy.esc.$$LT_REGEX_, "&lt;");
    }
    var html = String(value).replace(/\[/g, "&#91;");
    var tags = [];
    html = html.replace(soy.esc.$$HTML_TAG_REGEX_, function(tok, tagName) {
        if (tagName) {
            tagName = tagName.toLowerCase();
            if (opt_tagWhitelist.hasOwnProperty(tagName) && opt_tagWhitelist[tagName]) {
                var start = tok.charAt(1) === "/" ? "</" : "<";
                var index = tags.length;
                tags[index] = start + tagName + ">";
                return "[" + index + "]";
            }
        }
        return "";
    });
    html = soy.esc.$$normalizeHtmlHelper(html);
    var finalCloseTags = soy.$$balanceTags_(tags);
    html = html.replace(/\[(\d+)\]/g, function(_, index) {
        return tags[index];
    });
    return html + finalCloseTags;
};

soy.$$balanceTags_ = function(tags) {
    var open = [];
    for (var i = 0, n = tags.length; i < n; ++i) {
        var tag = tags[i];
        if (tag.charAt(1) === "/") {
            var openTagIndex = open.length - 1;
            while (openTagIndex >= 0 && open[openTagIndex] != tag) {
                openTagIndex--;
            }
            if (openTagIndex < 0) {
                tags[i] = "";
            } else {
                tags[i] = open.slice(openTagIndex).reverse().join("");
                open.length = openTagIndex;
            }
        } else if (!soy.$$HTML5_VOID_ELEMENTS_.test(tag)) {
            open.push("</" + tag.substring(1));
        }
    }
    return open.reverse().join("");
};

soy.$$escapeHtmlAttribute = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
        return soy.esc.$$normalizeHtmlHelper(soy.$$stripHtmlTags(value.content));
    }
    return soy.esc.$$escapeHtmlHelper(value);
};

soy.$$escapeHtmlAttributeNospace = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
        return soy.esc.$$normalizeHtmlNospaceHelper(soy.$$stripHtmlTags(value.content));
    }
    return soy.esc.$$escapeHtmlNospaceHelper(value);
};

soy.$$filterHtmlAttributes = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.ATTRIBUTES)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedHtmlAttribute);
        return value.content.replace(/([^"'\s])$/, "$1 ");
    }
    return soy.esc.$$filterHtmlAttributesHelper(value);
};

soy.$$filterHtmlElementName = function(value) {
    return soy.esc.$$filterHtmlElementNameHelper(value);
};

soy.$$escapeJs = function(value) {
    return soy.$$escapeJsString(value);
};

soy.$$escapeJsString = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS_STR_CHARS)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedJsStrChars);
        return value.content;
    }
    return soy.esc.$$escapeJsStringHelper(value);
};

soy.$$escapeJsValue = function(value) {
    if (value == null) {
        return " null ";
    }
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedJs);
        return value.content;
    }
    switch (typeof value) {
      case "boolean":
      case "number":
        return " " + value + " ";

      default:
        return "'" + soy.esc.$$escapeJsStringHelper(String(value)) + "'";
    }
};

soy.$$escapeJsRegex = function(value) {
    return soy.esc.$$escapeJsRegexHelper(value);
};

soy.$$problematicUriMarks_ = /['()]/g;

soy.$$pctEncode_ = function(ch) {
    return "%" + ch.charCodeAt(0).toString(16);
};

soy.$$escapeUri = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedUri);
        return soy.$$normalizeUri(value);
    }
    var encoded = soy.esc.$$escapeUriHelper(value);
    soy.$$problematicUriMarks_.lastIndex = 0;
    if (soy.$$problematicUriMarks_.test(encoded)) {
        return encoded.replace(soy.$$problematicUriMarks_, soy.$$pctEncode_);
    }
    return encoded;
};

soy.$$normalizeUri = function(value) {
    return soy.esc.$$normalizeUriHelper(value);
};

soy.$$filterNormalizeUri = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedUri);
        return soy.$$normalizeUri(value);
    }
    return soy.esc.$$filterNormalizeUriHelper(value);
};

soy.$$filterImageDataUri = function(value) {
    return soydata.VERY_UNSAFE.ordainSanitizedUri(soy.esc.$$filterImageDataUriHelper(value));
};

soy.$$escapeCssString = function(value) {
    return soy.esc.$$escapeCssStringHelper(value);
};

soy.$$filterCssValue = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.CSS)) {
        goog.asserts.assert(value.constructor === soydata.SanitizedCss);
        return value.content;
    }
    if (value == null) {
        return "";
    }
    return soy.esc.$$filterCssValueHelper(value);
};

soy.$$filterNoAutoescape = function(value) {
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.TEXT)) {
        goog.asserts.fail("Tainted SanitizedContentKind.TEXT for |noAutoescape: `%s`", [ value.content ]);
        return "zSoyz";
    }
    return value;
};

soy.$$changeNewlineToBr = function(value) {
    var result = goog.string.newLineToBr(String(value), false);
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        return soydata.VERY_UNSAFE.ordainSanitizedHtml(result, soydata.getContentDir(value));
    }
    return result;
};

soy.$$insertWordBreaks = function(value, maxCharsBetweenWordBreaks) {
    var result = goog.format.insertWordBreaks(String(value), maxCharsBetweenWordBreaks);
    if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
        return soydata.VERY_UNSAFE.ordainSanitizedHtml(result, soydata.getContentDir(value));
    }
    return result;
};

soy.$$truncate = function(str, maxLen, doAddEllipsis) {
    str = String(str);
    if (str.length <= maxLen) {
        return str;
    }
    if (doAddEllipsis) {
        if (maxLen > 3) {
            maxLen -= 3;
        } else {
            doAddEllipsis = false;
        }
    }
    if (soy.$$isHighSurrogate_(str.charAt(maxLen - 1)) && soy.$$isLowSurrogate_(str.charAt(maxLen))) {
        maxLen -= 1;
    }
    str = str.substring(0, maxLen);
    if (doAddEllipsis) {
        str += "...";
    }
    return str;
};

soy.$$isHighSurrogate_ = function(ch) {
    return 55296 <= ch && ch <= 56319;
};

soy.$$isLowSurrogate_ = function(ch) {
    return 56320 <= ch && ch <= 57343;
};

soy.$$bidiFormatterCache_ = {};

soy.$$getBidiFormatterInstance_ = function(bidiGlobalDir) {
    return soy.$$bidiFormatterCache_[bidiGlobalDir] || (soy.$$bidiFormatterCache_[bidiGlobalDir] = new goog.i18n.BidiFormatter(bidiGlobalDir));
};

soy.$$bidiTextDir = function(text, opt_isHtml) {
    var contentDir = soydata.getContentDir(text);
    if (contentDir != null) {
        return contentDir;
    }
    var isHtml = opt_isHtml || soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    return goog.i18n.bidi.estimateDirection(text + "", isHtml);
};

soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var contentDir = soydata.getContentDir(text);
    if (contentDir == null) {
        var isHtml = opt_isHtml || soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
        contentDir = goog.i18n.bidi.estimateDirection(text + "", isHtml);
    }
    return soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute(formatter.knownDirAttr(contentDir));
};

soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var isHtml = opt_isHtml || soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    return formatter.markAfterKnownDir(soydata.getContentDir(text), text + "", isHtml);
};

soy.$$bidiSpanWrap = function(bidiGlobalDir, text) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var wrappedText = formatter.spanWrapWithKnownDir(soydata.getContentDir(text), text + "", true);
    return wrappedText;
};

soy.$$bidiUnicodeWrap = function(bidiGlobalDir, text) {
    var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
    var isHtml = soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    var wrappedText = formatter.unicodeWrapWithKnownDir(soydata.getContentDir(text), text + "", isHtml);
    var wrappedTextDir = formatter.getContextDir();
    if (soydata.isContentKind(text, soydata.SanitizedContentKind.TEXT)) {
        return new soydata.UnsanitizedText(wrappedText, wrappedTextDir);
    }
    if (isHtml) {
        return soydata.VERY_UNSAFE.ordainSanitizedHtml(wrappedText, wrappedTextDir);
    }
    if (soydata.isContentKind(text, soydata.SanitizedContentKind.JS_STR_CHARS)) {
        return soydata.VERY_UNSAFE.ordainSanitizedJsStrChars(wrappedText, wrappedTextDir);
    }
    return wrappedText;
};

soy.esc.$$escapeUriHelper = function(v) {
    return goog.string.urlEncode(String(v));
};

soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = {
    "\x00": "&#0;",
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#39;",
    "<": "&lt;",
    ">": "&gt;",
    "	": "&#9;",
    "\n": "&#10;",
    "": "&#11;",
    "\f": "&#12;",
    "\r": "&#13;",
    " ": "&#32;",
    "-": "&#45;",
    "/": "&#47;",
    "=": "&#61;",
    "`": "&#96;",
    "": "&#133;",
    " ": "&#160;",
    "\u2028": "&#8232;",
    "\u2029": "&#8233;"
};

soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_[ch];
};

soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = {
    "\x00": "\\x00",
    "\b": "\\x08",
    "	": "\\t",
    "\n": "\\n",
    "": "\\x0b",
    "\f": "\\f",
    "\r": "\\r",
    '"': "\\x22",
    "&": "\\x26",
    "'": "\\x27",
    "/": "\\/",
    "<": "\\x3c",
    "=": "\\x3d",
    ">": "\\x3e",
    "\\": "\\\\",
    "": "\\x85",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
    $: "\\x24",
    "(": "\\x28",
    ")": "\\x29",
    "*": "\\x2a",
    "+": "\\x2b",
    ",": "\\x2c",
    "-": "\\x2d",
    ".": "\\x2e",
    ":": "\\x3a",
    "?": "\\x3f",
    "[": "\\x5b",
    "]": "\\x5d",
    "^": "\\x5e",
    "{": "\\x7b",
    "|": "\\x7c",
    "}": "\\x7d"
};

soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_[ch];
};

soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_ = {
    "\x00": "\\0 ",
    "\b": "\\8 ",
    "	": "\\9 ",
    "\n": "\\a ",
    "": "\\b ",
    "\f": "\\c ",
    "\r": "\\d ",
    '"': "\\22 ",
    "&": "\\26 ",
    "'": "\\27 ",
    "(": "\\28 ",
    ")": "\\29 ",
    "*": "\\2a ",
    "/": "\\2f ",
    ":": "\\3a ",
    ";": "\\3b ",
    "<": "\\3c ",
    "=": "\\3d ",
    ">": "\\3e ",
    "@": "\\40 ",
    "\\": "\\5c ",
    "{": "\\7b ",
    "}": "\\7d ",
    "": "\\85 ",
    " ": "\\a0 ",
    "\u2028": "\\2028 ",
    "\u2029": "\\2029 "
};

soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_[ch];
};

soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = {
    "\x00": "%00",
    "": "%01",
    "": "%02",
    "": "%03",
    "": "%04",
    "": "%05",
    "": "%06",
    "": "%07",
    "\b": "%08",
    "	": "%09",
    "\n": "%0A",
    "": "%0B",
    "\f": "%0C",
    "\r": "%0D",
    "": "%0E",
    "": "%0F",
    "": "%10",
    "": "%11",
    "": "%12",
    "": "%13",
    "": "%14",
    "": "%15",
    "": "%16",
    "": "%17",
    "": "%18",
    "": "%19",
    "": "%1A",
    "": "%1B",
    "": "%1C",
    "": "%1D",
    "": "%1E",
    "": "%1F",
    " ": "%20",
    '"': "%22",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "<": "%3C",
    ">": "%3E",
    "\\": "%5C",
    "{": "%7B",
    "}": "%7D",
    "": "%7F",
    "": "%C2%85",
    " ": "%C2%A0",
    "\u2028": "%E2%80%A8",
    "\u2029": "%E2%80%A9",
    "！": "%EF%BC%81",
    "＃": "%EF%BC%83",
    "＄": "%EF%BC%84",
    "＆": "%EF%BC%86",
    "＇": "%EF%BC%87",
    "（": "%EF%BC%88",
    "）": "%EF%BC%89",
    "＊": "%EF%BC%8A",
    "＋": "%EF%BC%8B",
    "，": "%EF%BC%8C",
    "／": "%EF%BC%8F",
    "：": "%EF%BC%9A",
    "；": "%EF%BC%9B",
    "＝": "%EF%BC%9D",
    "？": "%EF%BC%9F",
    "＠": "%EF%BC%A0",
    "［": "%EF%BC%BB",
    "］": "%EF%BC%BD"
};

soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = function(ch) {
    return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_[ch];
};

soy.esc.$$MATCHER_FOR_ESCAPE_HTML_ = /[\x00\x22\x26\x27\x3c\x3e]/g;

soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_ = /[\x00\x22\x27\x3c\x3e]/g;

soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x26\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_ = /[\x00\x08-\x0d\x22\x26\x27\/\x3c-\x3e\\\x85\u2028\u2029]/g;

soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_ = /[\x00\x08-\x0d\x22\x24\x26-\/\x3a\x3c-\x3f\x5b-\x5e\x7b-\x7d\x85\u2028\u2029]/g;

soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_ = /[\x00\x08-\x0d\x22\x26-\x2a\/\x3a-\x3e@\\\x7b\x7d\x85\xa0\u2028\u2029]/g;

soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g;

soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_ = /^(?!-*(?:expression|(?:moz-)?binding))(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,2}|%)?|!important|)$/i;

soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_ = /^(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i;

soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_ = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+\/]+=*$/i;

soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_ = /^(?!style|on|action|archive|background|cite|classid|codebase|data|dsync|href|longdesc|src|usemap)(?:[a-z0-9_$:-]*)$/i;

soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_ = /^(?!script|style|title|textarea|xmp|no)[a-z0-9_$:-]*$/i;

soy.esc.$$escapeHtmlHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_ESCAPE_HTML_, soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

soy.esc.$$normalizeHtmlHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_, soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

soy.esc.$$escapeHtmlNospaceHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_, soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

soy.esc.$$normalizeHtmlNospaceHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_, soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

soy.esc.$$escapeJsStringHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_, soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

soy.esc.$$escapeJsRegexHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_, soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

soy.esc.$$escapeCssStringHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_, soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_);
};

soy.esc.$$filterCssValueHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_.test(str)) {
        goog.asserts.fail("Bad value `%s` for |filterCssValue", [ str ]);
        return "zSoyz";
    }
    return str;
};

soy.esc.$$normalizeUriHelper = function(value) {
    var str = String(value);
    return str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_, soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

soy.esc.$$filterNormalizeUriHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_.test(str)) {
        goog.asserts.fail("Bad value `%s` for |filterNormalizeUri", [ str ]);
        return "#zSoyz";
    }
    return str.replace(soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_, soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

soy.esc.$$filterImageDataUriHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_.test(str)) {
        goog.asserts.fail("Bad value `%s` for |filterImageDataUri", [ str ]);
        return "data:image/gif;base64,zSoyz";
    }
    return str;
};

soy.esc.$$filterHtmlAttributesHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_.test(str)) {
        goog.asserts.fail("Bad value `%s` for |filterHtmlAttributes", [ str ]);
        return "zSoyz";
    }
    return str;
};

soy.esc.$$filterHtmlElementNameHelper = function(value) {
    var str = String(value);
    if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_.test(str)) {
        goog.asserts.fail("Bad value `%s` for |filterHtmlElementName", [ str ]);
        return "zSoyz";
    }
    return str;
};

soy.esc.$$HTML_TAG_REGEX_ = /<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g;

soy.esc.$$LT_REGEX_ = /</g;

soy.esc.$$SAFE_TAG_WHITELIST_ = {
    b: 1,
    br: 1,
    em: 1,
    i: 1,
    s: 1,
    sub: 1,
    sup: 1,
    u: 1
};

goog.require("soy");

goog.provide("fssoy");

if (typeof fssoy == "undefined") {
    var fssoy = {};
}

fssoy.layerdetaildiv = function(opt_data, opt_ignored) {
    return "<div>" + (opt_data.item.details.updated ? "<b>Updated:</b> " + opt_data.item.details.updated : "") + (opt_data.item.details.source ? "<br><b>Source:</b> " + opt_data.item.details.source : "") + (opt_data.item.details.custodian ? "<br><b>Custodian:</b> " + opt_data.item.details.custodian : "") + (opt_data.item.details.positionalaccuracy ? "<br><b>Positional Accuracy:</b> " + opt_data.item.details.positionalaccuracy : "") + (opt_data.item.details.scaledependancy ? "<br><b>Scale Dependancy:</b> " + opt_data.item.details.scaledependancy : "") + (opt_data.item.details.labels ? "<br><b>Labels:</b> " + opt_data.item.details.labels : "") + (opt_data.item.details.labelscaledependancy ? "<br><b>Label Scale Dependancy:</b> " + opt_data.item.details.labelscaledependancy : "") + (opt_data.item.details.description ? "<br><b>Description:</b> " + opt_data.item.details.description : "") + (opt_data.item.details.metadata ? "<br><b>Metadata:</b> " + opt_data.item.details.metadata : "") + "</div>";
};

if (goog.DEBUG) {
    fssoy.layerdetaildiv.soyTemplateName = "fssoy.layerdetaildiv";
}

fssoy.resourcedetaildiv = function(opt_data, opt_ignored) {
    return '<div class="float-left" style="padding-top: 5px; width: 77%;"><b>' + soy.$$escapeHtml(opt_data.item.callsign) + "</b> - " + soy.$$escapeHtml(opt_data.item.name) + "<br><b>Device ID:</b> " + soy.$$escapeHtml(opt_data.item.deviceid) + "<br><b>Last Logged:</b> " + soy.$$escapeHtml(opt_data.item.logged_time_str) + "<br><b>Heading: </b>" + soy.$$escapeHtml(opt_data.item.heading) + '<br></div><div class="float-right" style="width: 65px;"><p align="center" style="font-size:10px; line-height:10px;"><img width=50% src="//static.dpaw.wa.gov.au/static/firesource/static/build/symbols/' + soy.$$escapeHtml(opt_data.item.symbol) + '_64.png"><br>' + soy.$$escapeHtml(opt_data.item.symboltext) + "</p></div>";
};

if (goog.DEBUG) {
    fssoy.resourcedetaildiv.soyTemplateName = "fssoy.resourcedetaildiv";
}

fssoy.viewItem = function(opt_data, opt_ignored) {
    return '<li class="listitem view-immutable" itemid="' + soy.$$escapeHtml(opt_data.item.map_id) + '"><div class="itemtitle"><label class="itemname" >' + soy.$$escapeHtml(opt_data.item.name) + " (" + soy.$$escapeHtml(opt_data.item.type) + ')</label></div><div class="buttonset-view"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to load this view" class="ui-state-default ui-corner-all ui-button-text-only">Load</a></div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.item.tags) + '</p><div class="details-view" style="font-size:10px; display:none"></div><div class="edit-view" style="font-size:10px; display:none"></div></li>';
};

if (goog.DEBUG) {
    fssoy.viewItem.soyTemplateName = "fssoy.viewItem";
}

fssoy.layerItem = function(opt_data, opt_ignored) {
    return '<li class="listitem" itemid="' + soy.$$escapeHtml(opt_data.item.id) + '" itemtype="' + soy.$$escapeHtml(opt_data.item.type) + '"><div class="itemtitle">' + (opt_data.item.type == "imagery" ? '<input title="Click to select this layer as base layer" type="radio" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + "-" + soy.$$escapeHtml(opt_data.item.id) + '" name="imagerylayers" class="float-left" />' : '<input title="Click to turn this layer on/off" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + "-" + soy.$$escapeHtml(opt_data.item.id) + '" class="float-left" />') + '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.item.type) + "-" + soy.$$escapeHtml(opt_data.item.id) + '">' + soy.$$escapeHtml(opt_data.item.name) + '</label></div><div class="buttonset-layer showonselect hideonselect" style="display:none;"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Layer Details" class="ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + (opt_data.item.refreshable ? '<a title="Click to refresh the Layer" class="ui-state-default ui-corner-all ui-button-text-only">Refresh</a>' : "") + (opt_data.item.type == "point" || opt_data.item.type == "line" || opt_data.item.type == "polygon" ? '<button title="Inspect features" role="button" class="ui-button ui-widget ui-corner-all ui-state-default ui-button-text-only inspect-features"><span class="ui-button-icon-primary ui-icon gisicon-inspect gis-icon"></span></button>' : "") + '<span class="float-right latest_data">' + soy.$$escapeHtml(opt_data.item.latest_data) + '</span><span style="position: relative; font-size: 7px; font-weight: bold; float: left; width: 95%; top: 2px; text-align: center;"><span style="float: left;">&nbsp;0</span>Opacity %<span style="float: right;">100&nbsp;</span></span></div><div id="slider-' + soy.$$escapeHtml(opt_data.item.type) + "-" + soy.$$escapeHtml(opt_data.item.id) + '" class="showonselect hideonselect" style="display:none;"></div><p class="tags hideonselect" style="display:none"><b>Search Tags: </b>id:' + soy.$$escapeHtml(opt_data.item.id) + ", type:" + soy.$$escapeHtml(opt_data.item.type) + ", " + soy.$$escapeHtml(opt_data.item.tags) + '</p><a href="' + soy.$$escapeHtml(opt_data.item.legend) + '" target="_blank"><img class="legend-layer hideonselect contain float-right" style="display:none;" src="' + soy.$$escapeHtml(opt_data.item.legend) + '"/></a><div class="details-layer hideonselect" style="font-size:10px; display:none"></div></li>';
};

if (goog.DEBUG) {
    fssoy.layerItem.soyTemplateName = "fssoy.layerItem";
}

fssoy.vectorItem = function(opt_data, opt_ignored) {
    return '<li class="listitem" featureid="' + soy.$$escapeHtml(opt_data.id) + '"><div class="itemtitle"><input title="Click to select/unselect this vector" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.id) + '" class="float-left" />' + (opt_data.attributes.name ? opt_data.attributes.callsign ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.callsign) + " - " + soy.$$escapeHtml(opt_data.attributes.name) + "</label>" : '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.name) + "</label>" : opt_data.attributes.deviceid ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.deviceid) + "</label>" : "") + '</div><div class="buttonset-vector"><a title="Click to view searchable tags" class="tags ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Device Details" class="details ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + (opt_data.attributes.age <= 1 ? '<span style="color:#008800"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + "</span>" : opt_data.attributes.age <= 3 ? '<span style="color:#CCCC00"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + "</span>" : opt_data.attributes.age > 3 ? '<span style="color:#CC0000"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + "</span>" : '<b> Updated: </b><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.age) + " - " + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + "</span>") + '</div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.searchtags) + '</p><div class="details-vector" style="font-size:10px; display:none"></div><div class="edit-vector" style="font-size:10px; display:none"></div></li>';
};

if (goog.DEBUG) {
    fssoy.vectorItem.soyTemplateName = "fssoy.vectorItem";
}

fssoy.listTags = function(opt_data, opt_ignored) {
    var output = "";
    var itemList169 = opt_data.items;
    var itemListLen169 = itemList169.length;
    for (var itemIndex169 = 0; itemIndex169 < itemListLen169; itemIndex169++) {
        var itemData169 = itemList169[itemIndex169];
        output += '<li class="listitem"><a searchid="' + soy.$$escapeHtml(itemData169.id) + '">' + soy.$$escapeHtml(itemData169.name) + "</a></li>";
    }
    return output;
};

if (goog.DEBUG) {
    fssoy.listTags.soyTemplateName = "fssoy.listTags";
}

fssoy.helloWorld = function(opt_data, opt_ignored) {
    return "Hello world!";
};

if (goog.DEBUG) {
    fssoy.helloWorld.soyTemplateName = "fssoy.helloWorld";
}

fssoy.ollayerwms = function(opt_data, opt_ignored) {
    return 'new OpenLayers.Layer.WMS("' + opt_data.id + '", "' + opt_data.url + '", {layers:"' + opt_data.layers + '", tiled:true, transparent:' + opt_data.transparent + "}, {buffer:0} );";
};

if (goog.DEBUG) {
    fssoy.ollayerwms.soyTemplateName = "fssoy.ollayerwms";
}

fssoy.ollayertms = function(opt_data, opt_ignored) {
    return 'new OpenLayers.Layer.TMS("' + opt_data.id + '", "' + opt_data.url + '", {layername:"' + opt_data.layers + "@gda94@" + (opt_data.transparent ? "png" : "jpeg") + '", type:"' + (opt_data.transparent ? "png" : "jpeg") + '"} );';
};

if (goog.DEBUG) {
    fssoy.ollayertms.soyTemplateName = "fssoy.ollayertms";
}

goog.provide("firesource.session");

goog.require("fssoy");

var s = {};

s.ui = {};

s.ui.dialogs = {};

s.ui.menus = {};

s.ui.buttons = {};

s.ui.states = {};

s.ol = {};

s.ol.controls = {};

s.queries = {};

s.callbacks = {};

s.results = {};

$.fn.reverse = [].reverse;

$.ajaxSetup({
    timeout: 3e4
});

var sigFigs = function(n, sig) {
    var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * mult) / mult;
};

var escapecss = function(text) {
    return text.replace(/(:|\.)/g, "\\$1");
};

var timezoneDate = function(utcisostring) {
    return new Date(Date.parse(utcisostring) - new Date().getTimezoneOffset() * 60 * 1e3);
};

jQuery.fromXMLString = function(strXML) {
    if (window.DOMParser) {
        return jQuery(new DOMParser().parseFromString(strXML, "text/xml"));
    } else if (window.ActiveXObject) {
        var doc = new ActiveXObject("Microsoft.XMLDOM");
        doc.async = "false";
        doc.loadXML(strXML);
        return jQuery(doc);
    } else {
        return jQuery(strXML);
    }
};

s.callbacks.resourcegroups = function(data) {
    $("#resources-div-west ul.list").empty().append(fssoy.listTags({
        items: data
    }));
};

s.callbacks.layergroups = function(data) {
    $("div#layers-div-west .list").append(fssoy.listTags({
        items: data
    }));
    $("input#layersearchtext").keyup();
};

s.callbacks.layers = function(data) {
    var ullayers = $("ul#layers");
    firesource.ol.populateLayers(s.ol.olmap, data, s.ol.layers);
    ullayers.empty();
    $.each(data, function(index, layer) {
        if (layer.latest_data) {
            layer.latest_data = dateFormat(timezoneDate(layer.latest_data), "dd/mm/yyyy HH:MM");
        } else {
            if (layer.details.updated) {
                layer.latest_data = layer.details.updated;
            } else {
                layer.latest_data = "Unknown";
            }
        }
        layer.refreshable = true;
        if (layer.details.updated != "Live") {
            layer.refreshable = false;
        }
        if (layer.type[0] != "_" && layer.type != "vectortemplate") {
            ullayers.append(fssoy.layerItem({
                item: layer
            }));
        }
    });
    if (!s.ui.states.built) {
        firesource.ol.buildMap();
    }
    firesource.ui.restoreLayerState();
    if (!s.ui.states.navigationHistoryActive) {
        s.ol.olmap.addControl(s.ol.navigationHistory);
        s.ol.olmap.addControl(s.ol.navigationHistory.next);
        s.ol.olmap.addControl(s.ol.navigationHistory.previous);
        s.ol.navigationHistory.jump = function(direction, times) {
            for (i = 0; i < times; i++) {
                var stack = s.ol.navigationHistory[direction + "Stack"];
                while (stack[1] && stack[0].center.lon == stack[1].center.lon && stack[0].center.lat == stack[1].center.lat && stack[0].resolution == stack[1].resolution) {
                    s.ol.navigationHistory[direction + "Trigger"]();
                }
                s.ol.navigationHistory[direction + "Trigger"]();
            }
        };
        s.ui.states.navigationHistoryActive = true;
    }
    s.ol.olmap.addControl(s.ol.controls.mouseposition);
    $("div#views-div-west").find("a:contains(Saved)").click();
    firesource.ol.loadState(null, function() {
        if (django_query.layersearch) {
            $("input#layersearchtext").val(django_query.layersearch[0]).keyup();
        } else {
            $("input#layersearchtext").keyup();
        }
        s.ol.olmap.events.on({
            zoomend: firesource["ol"]["mapZoomEnd"],
            moveend: firesource["ol"]["saveState"],
            changelayer: firesource["ol"]["saveState"],
            changebaselayer: firesource["ol"]["saveState"]
        });
        s.ol.olmap.events.triggerEvent("zoomend");
    });
};

s.callbacks.maps = function(data) {
    var ulviews = $("ul#views");
    ulviews.empty();
    $.each(data, function(index, view) {
        ulviews.append(fssoy.viewItem({
            item: view
        }));
        s.ol.userviews[view["map_id"]] = view;
    });
};

firesource.session.updateResults = function(data) {
    $.each(data, function(key, value) {
        s.results[key] = value;
        s.callbacks[key](s.results[key]);
    });
};

goog.require("firesource.session");

goog.provide("firesource.forms");

s.ui.forms = {};

firesource.forms.presubmit = function(formData, jqForm, options) {
    var form = jqForm[0];
    $.merge(formData, [ {
        name: "mod",
        value: form.className.split(" ")[1] + "_formpost"
    }, {
        name: "formid",
        value: form.id
    } ]);
    return true;
};

firesource.forms.postsubmit = function(responseText, statusText, xhr, $form) {};

firesource.forms.decorate = function() {
    var options = {
        url: "/json",
        dataType: "json",
        success: null,
        beforeSubmit: firesource["forms"]["presubmit"],
        afterSubmit: firesource["forms"]["postsubmit"]
    };
    $("form.uniForm").ajaxForm(options);
    $("a:visible").each(function(i, e) {
        $(this).attr("tabindex", -1);
    });
};

goog.provide("firesource.ol.loadingpanel");

OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {
    counter: 0,
    maximized: false,
    visible: true,
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [ options ]);
    },
    setVisible: function(visible) {
        this.visible = visible;
    },
    getVisible: function() {
        return this.visible;
    },
    hide: function() {
        this.setVisible(false);
    },
    show: function() {
        this.setVisible(true);
    },
    toggle: function() {
        this.setVisible(!this.getVisible());
    },
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register("loadstart", this, this.increaseCounter);
            evt.layer.events.register("loadend", this, this.decreaseCounter);
            evt.layer.events.register("loadcancel", this, this.clear);
            evt.layer.events.register("visibilitychanged", this, this.clear);
        }
    },
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register("preaddlayer", this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register("loadstart", this, this.increaseCounter);
            layer.events.register("loadend", this, this.decreaseCounter);
            layer.events.register("loadcancel", this, this.clear);
            layer.events.register("visibilitychanged", this, this.clear);
        }
    },
    clear: function(evt) {
        if (evt.object.visibility == false) {
            var lyrli = $("ul#layers").find("li[itemid=" + evt.object.name + "]");
            lyrli.removeClass("loaded-tiles loading-tiles");
        }
    },
    increaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid=" + evt.object.name + "]");
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        lyrli.removeClass("loaded-tiles broken-tiles").addClass("loading-tiles");
    },
    decreaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid=" + evt.object.name + "]");
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        if (evt.object.grid && $(evt.object.grid[0][0].imgDiv).hasClass("olImageLoadError")) {
            if (evt.object.isBaseLayer) {
                window.alert('Base Imagery "' + lyrli.find("label").text() + '" (' + evt.object.grid[0][0].imgDiv.src.split("?")[0] + ") doesn't seem to be loading properly, try switching to another.");
            } else if (window.confirm('Layer "' + lyrli.find("label").text() + '" (' + evt.object.grid[0][0].imgDiv.src.split("?")[0] + ") doesn't seem to be loading properly, would you like to disable it?")) {
                lyrli.find("input").attr("checked", false).change();
            }
            lyrli.removeClass("loading-tiles").addClass("broken-tiles");
        } else {
            if (evt.object.grid && lyrli.find("a:contains('Refresh')").length == 1) {
                lyrli.find("span.latest_data").text(dateFormat(new Date(), "dd/mm/yyyy HH:MM"));
            }
            lyrli.removeClass("loading-tiles").addClass("loaded-tiles");
        }
    },
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },
    minimizeControl: function(evt) {
        $("#map").loading(false);
        this.maximized = false;
        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },
    maximizeControl: function(evt) {
        $("#map").loading(true, {
            pulse: "ellipsis",
            align: "center"
        });
        this.maximized = true;
        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },
    destroy: function() {
        if (this.map) {
            this.map.events.unregister("preaddlayer", this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister("loadstart", this, this.increaseCounter);
                    layer.events.unregister("loadend", this, this.decreaseCounter);
                    layer.events.unregister("clear", this, this.clear);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Control.LoadingPanel"
});

goog.require("firesource.session");

goog.require("firesource.ol.loadingpanel");

goog.provide("firesource.ol");

s.ol.controls = {};

s.ol.symbolizers = {};

s.ol.styles = {};

s.ol.styleMaps = {};

s.ol.layers = {};

s.ol.layers.vector = {};

s.ol.layers.vectoroverlay = {};

s.ol.layers.point = {};

s.ol.layers.line = {};

s.ol.layers.polygon = {};

s.ol.layers.overlay = {};

s.ol.layers.imagery = {};

s.ol.userviews = {};

firesource.ol.interact = {};

firesource.ol.events = {};

firesource.ol.maps = {};

OpenLayers.Control.Inspect = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        single: true,
        double: false,
        pixelTolerance: 0,
        stopSingle: false,
        stopDouble: false
    },
    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Click(this, {
            click: this.trigger
        }, this.handlerOptions);
    },
    trigger: function(e) {
        if (s.inspect) {
            s.inspect(e.xy);
        }
    }
});

$.ajaxSetup({
    xhrFields: {
        withCredentials: true
    }
});

firesource.ol.updateLayer = function(features, layer, ollayer) {
    listitem = $("ul#layers").find("li.listitem[itemid=" + layer.id + "]");
    listitem.find("span.latest_data").text("...");
    ollayer.destroyFeatures();
    ollayer.addFeatures(features);
    ollayer.redraw();
    var latest_data = timezoneDate(jLinq.from(jLinq.from(features).select(function(r) {
        return r.attributes;
    })).orderBy("-logged_time").select(function(r) {
        return r.logged_time;
    })[0]);
    listitem.find("span.latest_data").text(dateFormat(latest_data, "dd/mm/yyyy HH:MM"));
    s.ui.states.vectorsBuilt = false;
    $("select#vectors-select").change();
};

firesource.ol.buildHistory = function(layer, features) {
    if (s.ol.layers.vector.history && s.ol.layers.vector.history_lines) {
        s.ol.layers.vector.history.destroy();
        delete s.ol.layers.vector.history;
        s.ol.layers.vector.history_lines.destroy();
        delete s.ol.layers.vector.history_lines;
    }
    s.ol.layers.vector.history = new OpenLayers.Layer.Vector("history", {
        strategies: [ new OpenLayers.Strategy.Cluster({
            distance: 16,
            threshold: 2
        }) ]
    });
    s.ol.layers.vector.history_lines = new OpenLayers.Layer.Vector("history_lines");
    var history_layer = s.ol.layers.vector.history;
    var history_lines_layer = s.ol.layers.vector.history_lines;
    s.ol.olmap.addLayer(history_lines_layer);
    s.ol.olmap.addLayer(history_layer);
    s.ol.olmap.setLayerIndex(history_layer, s.ol.historyLayerIndex);
    s.ol.olmap.setLayerIndex(history_lines_layer, s.ol.historyLayerIndex);
    s.ol.olmap.resetLayersZIndex();
    lineFeatures = [];
    var unique = "attributes." + layer.unique;
    $.each(jLinq.from(s.results.vectorHistory).distinct(unique), function(index, id) {
        var points = [];
        var curpoint = [ firesource.ol.getFeaturesBy(unique, s.ol.activeVector, id)[0].geometry ];
        $.merge(points, curpoint);
        $.merge(points, jLinq.from(features).equals(unique, id).select(function(r) {
            return r.geometry;
        }));
        var lineString = new OpenLayers.Geometry.LineString(points);
        lineFeatures.push(new OpenLayers.Feature.Vector(lineString));
    });
    history_layer.addFeatures(features);
    history_lines_layer.addFeatures(lineFeatures);
    history_layer.setVisibility(true);
    history_lines_layer.setVisibility(true);
    if (layer.style_history) {
        var style = layer.style_history;
    } else {
        var style = layer.style;
    }
    $.get("//static.dpaw.wa.gov.au/static/firesource/static/styles/" + style + ".xml", function(data) {
        var styles = s.ol.sldformat.read(data).namedLayers;
        s.hstyles = styles;
        if (styles["default"]) {
            defaultstyle = styles["default"].userStyles[0];
            history_layer.styleMap.styles["default"] = defaultstyle;
            history_lines_layer.styleMap.styles["default"] = defaultstyle;
        }
        history_layer.redraw();
        history_lines_layer.redraw();
    });
};

firesource.ol.buildVectorLayer = function(layer, layerType) {
    if (layer.cluster) {
        layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id, {
            strategies: [ new OpenLayers.Strategy.Cluster({
                distance: layer.cluster,
                threshold: 2
            }) ]
        });
    } else {
        layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id);
    }
    var ollayer = layerType[layer.id];
    ollayer.search_filters = layer.filters;
    $.get("//static.dpaw.wa.gov.au/static/firesource/static/styles/" + layer.style + ".xml", function(data) {
        var styles = s.ol.sldformat.read(data).namedLayers;
        if (styles["default"]) {
            defaultstyle = styles["default"].userStyles[0];
            if (defaultstyle.rules[0].name == "Cluster") {
                defaultstyle.rules[0].symbolizer.Point.label = "${count}";
                defaultstyle.rules[0].symbolizer.Point.fontSize = 10;
                defaultstyle.rules[0].symbolizer.Point.fontWeight = "bold";
                delete defaultstyle.rules[0].symbolizer.Text;
            }
            ollayer.styleMap.styles["default"] = defaultstyle;
        }
        if (styles["select"]) {
            selectstyle = styles["select"].userStyles[0];
            if (selectstyle.rules[0].name == "Cluster") {
                selectstyle.rules[0].symbolizer.Point.label = "${count}";
                selectstyle.rules[0].symbolizer.Point.fontSize = 10;
                selectstyle.rules[0].symbolizer.Point.fontWeight = "bold";
                delete selectstyle.rules[0].symbolizer.Text;
            }
            ollayer.styleMap.styles["select"] = selectstyle;
        }
        ollayer.redraw();
    });
    ollayer.query_vector = function() {
        if (layer.unsaved) {
            return;
        }
        s.ol.loading_view = true;
        ollayer.events.triggerEvent("loadstart");
        $.get("/apps/spatial/query_vector/" + layer.query + ".json", function(data) {
            if (layer) {
                firesource.ol.updateLayer(s.ol.geojsonformat.read(data), layer, ollayer);
            }
            s.ol.loading_view = false;
            ollayer.events.triggerEvent("loadend");
        });
    };
    ollayer.query_history = function(datefrom, dateto, selectedVectors) {
        $.post("/apps/spatial/query_vector/" + layer.query + ".json", JSON.stringify({
            from_date: datefrom,
            to_date: dateto,
            unique_list: selectedVectors
        }), function(data) {
            s.results.vectorHistory = s.ol.geojsonformat.read(data);
            firesource.ol.buildHistory(layer, s.results.vectorHistory);
        });
    };
    return ollayer;
};

firesource.ol.populateLayers = function(olmap, layers, root) {
    var lyrs = layers.slice(0);
    lyrs.reverse();
    $.each(lyrs, function(index, layer) {
        if (layer.type == "vectortemplate") {
            return;
        }
        if (layer.type.search("vector") > -1) {
            ollayer = firesource.ol.buildVectorLayer(layer, root[layer.type]);
        } else {
            root[layer.type][layer.id] = eval(fssoy.ollayerwms(layer));
            ollayer = root[layer.type][layer.id];
        }
        olmap.addLayer(ollayer);
        if (layer.shown) {
            ollayer.shown = true;
        } else {
            ollayer.setVisibility(false);
        }
    });
};

firesource.ol.getFeaturesBy = function(field, layer, featureid) {
    var features = jLinq.from(layer.features).contains(field, featureid).select();
    if (features.length != 1) {
        $.each(layer.features, function(index, f) {
            $.merge(features, jLinq.from(f.cluster).contains(field, featureid).select());
            if (features.length == 1) {
                return false;
            }
        });
    }
    return features;
};

firesource.ol.jiggleMap = function(map) {
    if (map.getCenter()) {
        map.updateSize();
        firesource.ol.saveState();
        return true;
    } else {
        return false;
    }
};

firesource.ol.mapZoomEnd = function(e) {
    $('#vectors li.listitem input[id^="toggle-"]:checked').change();
    s.ui.zoomslider.children(".slider").slider("value", s.ol.olmap.zoom);
    $("div#hoverdetails").hide();
};

firesource.ol.currentState = function(extraLayers) {
    var layerlist = jLinq.from(s.ol.olmap.layers).equals("visibility", true).select();
    var printablelayers = [];
    $.each(layerlist, function(index, value) {
        if (value.name.slice(0, 11) != "OpenLayers." && value.name.slice(0, 7) != "history") {
            if (value.opacity === null) {
                value.opacity = 1;
            }
            printablelayers.push({
                layer_id: value.name,
                opacity: value.opacity
            });
        }
        return true;
    });
    if (extraLayers && extraLayers.length > 0) {
        $.each(extraLayers, function(index, layer) {
            printablelayers.push(layer);
            return true;
        });
    }
    center = s.ol.olmap.getCenter();
    return {
        layers: printablelayers,
        center: {
            type: "Point",
            coordinates: [ center.lon, center.lat ]
        },
        scale: Math.round(s.ol.olmap.getScale())
    };
};

firesource.ol.saveState = function(e, callback) {
    if (e) {
        var layers = e.layers;
    } else {
        var layers = false;
    }
    if (!s.ol.loading_view && s.loaded) {
        s.saved_state = JSON.stringify(firesource.ol.currentState(layers));
        localStorage.setItem("ss", s.saved_state);
        document.location.hash = $.param({
            ss: s.saved_state
        });
        if (callback) {
            callback();
        }
        return true;
    } else {
        return false;
    }
};

firesource.ol.loadState = function(e, callback) {
    var tempview, hashview, localview;
    tempview = hashview = localview = false;
    if (document.location.hash.length > 10) {
        var hashview = decodeURIComponent(document.location.hash.slice(1)).slice(3);
    }
    if (localStorage.getItem("ss")) {
        var localview = localStorage.getItem("ss");
    }
    if (hashview && localview && hashview != localview) {
        if (window.confirm("Load state from url? If you cancel the map will return to your previous state.")) {
            tempview = hashview;
        } else {
            tempview = localview;
        }
    } else {
        tempview = hashview || localview;
    }
    if (tempview) {
        tempview = JSON.parse(tempview);
        s.ol.loading_view = false;
        firesource.ol.loadView(tempview);
    }
    s.loaded = true;
    if (callback) {
        callback();
    }
    return true;
};

window.addEventListener("hashchange", function() {
    var hashview = decodeURIComponent(document.location.hash.slice(1)).slice(3);
    var localview = localStorage.getItem("ss");
    if (hashview != localview) {
        if (window.confirm("Load state from url?")) {
            firesource.ol.loadView(JSON.parse(decodeURIComponent(document.location.hash.slice(1)).slice(3)));
        }
    }
}, false);

firesource.ol.loadView = function(viewobject) {
    if (s.ol.loading_view || viewobject == null) {
        return false;
    }
    s.ol.loading_view = true;
    layers = $("ul#layers");
    layers.find("input[type!=radio][id^=toggle-]:checked").prop("checked", false).change();
    var maxIndex = 0;
    $.each(viewobject.layers, function(index, layer) {
        var ollayer = s.ol.olmap.getLayersByName(layer.layer_id);
        if (ollayer.length != 1) {
            return true;
        } else {
            ollayer = ollayer[0];
        }
        if (s.ol.olmap.getLayerIndex(ollayer) < maxIndex) {
            maxIndex += 1;
            s.ol.olmap.setLayerIndex(ollayer, maxIndex);
        }
        layers.find("li[itemid=" + layer.layer_id + "] input[id^=toggle-]").prop("checked", true).change();
        ollayer.setOpacity(layer.opacity);
        layers.find("li[itemid=" + layer.layer_id + "] div[id^=slider-]").slider("value", layer.opacity * 100);
    });
    s.ol.olmap.resetLayersZIndex();
    if (viewobject.type != "theme" && s.ol.olmap.baseLayer) {
        s.ol.olmap.zoomToScale(viewobject.scale);
        var center = new OpenLayers.LonLat(viewobject.center.coordinates[0], viewobject.center.coordinates[1]);
        s.ol.olmap.setCenter(center);
    }
    s.ol.loading_view = false;
    return true;
};

firesource.ol.maps.overMap = function(selector) {
    divsize = new OpenLayers.Size($(selector).width(), $(selector).height());
    return new OpenLayers.Control.OverviewMap({
        div: $(selector)[0],
        size: divsize,
        autoPan: true,
        mapOptions: {
            projection: new OpenLayers.Projection("EPSG:4326"),
            tileSize: new OpenLayers.Size(1024, 1024),
            resolutions: [ .17578125, .087890625, .0439453125, .02197265625, .010986328125, .0054931640625, .00274658203125, .001373291015625, .0006866455078125, .0003433227539062, .0001716613769531, 858306884766e-16, 429153442383e-16, 214576721191e-16, 107288360596e-16, 53644180298e-16, 26822090149e-16, 13411045074e-16 ]
        }
    });
};

firesource.ol.maps.gda94 = function(div, bounds) {
    OpenLayers.DOTS_PER_INCH = 90.71428571428572;
    var options = {
        controls: [],
        projection: new OpenLayers.Projection("EPSG:4326"),
        maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
        tileSize: new OpenLayers.Size(1024, 1024),
        resolutions: [ .17578125, .087890625, .0439453125, .02197265625, .010986328125, .0054931640625, .00274658203125, .001373291015625, .0006866455078125, .0003433227539062, .0001716613769531, 858306884766e-16, 429153442383e-16, 214576721191e-16, 107288360596e-16, 53644180298e-16, 26822090149e-16, 13411045074e-16 ],
        units: "degrees",
        fractionalZoom: false
    };
    olmap = new OpenLayers.Map(div, options);
    s.ol.controls.mouseposition = new OpenLayers.Control.MousePosition({
        element: $("#mouseposition")[0],
        formatOutput: function(lonLat) {
            lon = OpenLayers.Util.getFormattedLonLat(lonLat.lon, "lon", "dms");
            lat = OpenLayers.Util.getFormattedLonLat(lonLat.lat, "lat", "dms");
            return lon + ", " + lat + "</br><span>" + lonLat.lon + ", " + lonLat.lat + "</span>";
        }
    });
    olmap.addControl(new OpenLayers.Control.ScaleLine({
        geodesic: true
    }));
    olmap.addControl(new OpenLayers.Control.Scale());
    olmap.addControl(new OpenLayers.Control.LoadingPanel());
    return olmap;
};

firesource.ol.buildMap = function() {
    s.ol.olmap.zoomToExtent(s.ol.bounds);
    s.ol.olmap.addControl(s.ol.controls.navigate);
    s.ol.olmap.addControl(s.ol.controls.measureLine);
    s.ol.olmap.addControl(s.ol.controls.measureArea);
    s.ol.inspect = new OpenLayers.Control.Inspect();
    s.ol.olmap.addControl(s.ol.inspect);
    s.ol.inspect.activate();
    s.ui.states.built = true;
    $("#controlpan").click();
};

firesource.ol.hoverdetails = function(feature) {
    hoverdetails = $("div#hoverdetails");
    map = $("div#map");
    if (feature === null || !feature.geometry.bounds.centerLonLat) {
        hoverdetails.hide();
        return;
    } else {
        var attributes = feature.attributes;
        featurex = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).x;
        featurey = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).y;
        attributes.logged_time_str = dateFormat(timezoneDate(attributes.logged_time), "dd/mm/yyyy HH:MM");
        attributes.symboltext = attributes.symbol.split("/")[1].replace(/_/g, " ");
        var content = fssoy.resourcedetaildiv({
            item: attributes
        });
        hoverdetails.empty().append(content).show();
        var hoverx = hoverdetails.width();
        var hovery = hoverdetails.height();
        var posx = 0;
        var posy = 0;
        if (featurex + hoverx > map.width() - 50) {
            posx = featurex - hoverx - 30;
        } else {
            posx = featurex + 30;
        }
        if (featurey - hovery < 25) {
            posy = featurey + 30;
        } else {
            posy = featurey - hovery - 30;
        }
        hoverdetails.css({
            top: posy,
            left: posx
        });
    }
};

firesource.ol.events.select = function(feature, state) {
    if (!feature) {
        return;
    }
    var vectors = $("ul#vectors");
    if (s.ol.activeVector.selectedFeatures.length == 0 && state === false) {
        vectors.find("li.listitem").find("input[id^=toggle-]:checked").attr("checked", false);
        return;
    }
    if (feature.cluster) {
        $.each(feature.cluster, function(index, subfeature) {
            vectors.find("li.listitem[featureid=" + subfeature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr("checked", state);
        });
    } else {
        vectors.find("li.listitem[featureid=" + feature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr("checked", state);
    }
    $("#vectorsearchtext").keyup();
};

firesource.ol.events.selectupdate = function(feature, label) {
    var prefill = feature.attributes[label];
    if (prefill == undefined) {
        prefill = "";
    }
    var attr = window.prompt("Please enter a " + label + " for feature " + feature.fid.split(".")[1], prefill);
    if (!attr) {
        return false;
    }
    feature.attributes[label] = attr;
    feature.state = OpenLayers.State.UPDATE;
    s.ol.SaveStrategy.save();
};

firesource.ol.interact.selectupdate = function(layer, label) {
    return new OpenLayers.Control.SelectFeature(layer, {
        multiple: false,
        onSelect: function(f) {
            firesource.ol.events.selectupdate(f, label);
        }
    });
};

firesource.ol.interact.select = function(layer) {
    return new OpenLayers.Control.SelectFeature(layer, {
        clickout: true,
        toggle: false,
        multiple: false,
        hover: false,
        toggleKey: "ctrlKey",
        multipleKey: "shiftKey",
        box: true,
        onSelect: function(f) {
            firesource.ol.events.select(f, true);
        },
        onUnselect: function(f) {
            firesource.ol.events.select(f, false), $("#vectorsearchtext").keyup();
        }
    });
};

s.ol.controls.navigate = new OpenLayers.Control.Navigation();

s.ol.navigationHistory = new OpenLayers.Control.NavigationHistory({
    trackBaseLayerChange: true
});

s.ol.controls.measureLine = new OpenLayers.Control.Measure(OpenLayers.Handler.Path, {
    persist: true,
    geodesic: true,
    handlerOptions: {
        layerOptions: {
            styleMap: s.ol.styleMaps.sketch
        }
    }
});

s.ol.controls.measureArea = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
    persist: true,
    geodesic: true,
    handlerOptions: {
        layerOptions: {
            styleMap: s.ol.styleMaps.sketch
        }
    }
});

firesource.ol.toggleControl = function(id) {
    $.each(s.ol.controls, function(key, control) {
        if (key != "mouseposition") {
            control.deactivate();
            return true;
        }
    });
    s.ol.controls[id].activate();
    if (id.search("measure") == -1) {
        $("span#messagetext").stop(true).fadeTo(400, 0);
    }
    if (id == "navigate" && s.ol.SaveStrategy && s.ol.SaveStrategy.active) {
        firesource.ui.updateDataTable(s.ui.dtable, s.ol.activeVector);
    }
};

firesource.ol.toggleLabels = function(layer, labeledStyleMap, unlabeledStyleMap) {
    if (layer.styleMap == labeledStyleMap) {
        layer.styleMap = unlabeledStyleMap;
    } else {
        layer.styleMap = labeledStyleMap;
    }
    layer.redraw(true);
};

firesource.ol.zoomToSelected = function() {
    var feature_ids = $.map($('#vectors input[id^="toggle-"]:checked'), function(i) {
        return i.id.slice(7);
    });
    var features = $.grep(s.ol.activeVector.strategies[0].features, function(e) {
        return $.inArray(e.id, feature_ids) > -1;
    });
    if (features.length > 0) {
        var bounds = false;
        $.each(features, function(index, feature) {
            if (!bounds) {
                bounds = feature.geometry.getBounds().clone();
            } else {
                bounds.extend(feature.geometry.getBounds());
            }
        });
        s.ol.olmap.zoomToExtent(bounds, true);
        s.ol.navigationHistory.previousStack.unshift(s.ol.navigationHistory.getState());
    }
};

firesource.ol.handleMeasurements = function(event) {
    var geometry = event.geometry;
    var units = event.units;
    var order = event.order;
    var measure = event.measure;
    var nautmiles;
    var ha;
    if (order == 1) {
        if (units == "m") {
            nautmiles = measure * .0005399568034557236;
        } else if (units == "km") {
            nautmiles = measure * .5399568034557235;
        }
        $("span#messagetext").text("Distance: " + measure.toFixed(3) + " " + units + " / " + nautmiles.toFixed(3) + " Nm").stop(true).fadeTo(0, 1);
    } else {
        if (units == "m") {
            ha = measure * 1e-4;
        } else if (units == "km") {
            ha = measure * 100;
        }
        $("span#messagetext").text("Area: " + ha.toFixed(3) + " ha").stop(true).fadeTo(0, 1);
    }
};

firesource.ol.lineDistance = function(linefeature) {
    var distance = 0;
    var previous = null;
    $.each(linefeature.geometry.getVertices(), function(index, value) {
        if (index == 0) {
            previous = new OpenLayers.LonLat(value.x, value.y);
        } else {
            distance += OpenLayers.Util.distVincenty(previous, new OpenLayers.LonLat(value.x, value.y));
            previous = new OpenLayers.LonLat(value.x, value.y);
        }
    });
    return distance;
};

firesource.ol.zoomToFid = function(fid) {
    var feature = s.ol.activeVector.getFeatureByFid(fid);
    var lonlat = new OpenLayers.LonLat(feature.geometry.getCentroid().x, feature.geometry.getCentroid().y);
    s.ol.olmap.panTo(lonlat);
};

goog.provide("firesource.ui");

goog.require("firesource.session");

firesource.ui.actions = {};

s.ui.global = {};

firesource.ui.geocode = function(query) {
    var lon = Math.round(s.ol.olmap.getCenter().lon * 10) / 10;
    var lat = Math.round(s.ol.olmap.getCenter().lat * 10) / 10;
    var mapcenter = new OpenLayers.Geometry.Point(lat, lon);
    var lonlat = lon + "," + lat;
    var mapbox_apikey = "pk.eyJ1IjoiZHBhd2FzaSIsImEiOiJtVjY5WmlFIn0.whc76euXLk2PkyxOkZ5xlQ";
    s.last_geocode = query;
    $.ajax({
        url: "https://api.mapbox.com/geocoding/v5/mapbox.places/" + query + "+wa+au.json?" + $.param({
            proximity: lonlat,
            access_token: mapbox_apikey
        }),
        xhrFields: {
            withCredentials: false
        },
        success: function(data) {
            s.geocode_results = data;
            var feature = data.features[0];
            var closest = mapcenter.distanceTo(new OpenLayers.Geometry.Point(feature.center[1], feature.center[0]));
            $.each(data.features, function(index, f) {
                var fpoint = new OpenLayers.Geometry.Point(f.center[1], f.center[0]);
                if (closest - mapcenter.distanceTo(fpoint) > 20) {
                    feature = f;
                    closest = mapcenter.distanceTo(fpoint);
                }
            });
            if (closest < 20 && feature.place_name != "Western Australia, Australia") {
                firesource.ui.setMessageText("Panning to " + feature.place_name);
                s.ol.olmap.panTo(feature.center);
            } else {
                firesource.ui.setMessageText("No results found in 2000km radius from centre of map.");
            }
        }
    });
};

firesource.ui.geocodeSetup = function() {
    var typingTimer;
    var doneTypingInterval = 1e3;
    var ginput = $("#geocodequery");
    ginput.keyup(function() {
        clearTimeout(typingTimer);
        if (ginput.val() != "" && ginput.val() != s.last_geocode) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });
    function doneTyping() {
        firesource.ui.geocode(ginput.val());
    }
};

firesource.ui.geocodeSetup();

firesource.ui.setMessageText = function(text) {
    $("span#messagetext").text(text).stop(true).fadeTo(0, 1, function() {
        $(this).delay(4e3).fadeOut(1e3);
    });
    return true;
};

$("span#messagetext").ajaxError(function(e, xhr, settings, exception) {
    firesource.ui.setMessageText("Error loading " + settings.url + ": " + exception);
});

firesource.ui.actions.layerChange = function(e) {
    var toggle = $(e.target);
    var listitem = toggle.parents("li.listitem");
    var layerid = listitem.attr("itemid");
    var type = listitem.attr("itemtype");
    var lyr = s.ol.layers[type][layerid];
    var vectorselector = $("select#vectors-select");
    var current = vectorselector.val();
    if (type == "vector") {
        vectorselector.empty();
        var newval = false;
        $("ul#layers").find("li[itemtype=vector]").find("[id^=toggle]:checked").parents("li.listitem").each(function() {
            layerid = $(this).attr("itemid");
            if (current == layerid) {
                newval = layerid;
            }
            vectorselector.append('<option value="' + $(this).attr("itemid") + '">' + $(this).find("label.itemname").text() + "</option>");
        });
        if (newval) {
            s.ui.states.vectorsBuilt = true;
            vectorselector.val(newval);
            s.ui.states.selectedVector = newval;
        } else {
            s.ui.states.vectorsBuilt = false;
        }
        vectorselector.change();
    }
    if (type == "imagery") {
        var prevstack = s.ol.navigationHistory.previousStack;
        var nextstack = s.ol.navigationHistory.nextStack;
        $.each(s.ol.olmap.getControlsByClass("OpenLayers.Control.OverviewMap"), function(index, ovmap) {
            s.ol.olmap.removeControl(ovmap);
            ovmap.destroy();
        });
        s.ol.olmap.setBaseLayer(lyr);
        s.ol.olmap.addControl(firesource.ol.maps.overMap("#overviewmapdiv"));
        $("div.olControlOverviewMapElement").height("100%").css("padding", "0px");
        $("div.olControlOverviewMapElement").children("div.olMap").width("auto").height("100%");
        firesource.ol.jiggleMap(s.ol.olmap);
        s.ol.navigationHistory.previousStack = prevstack;
        s.ol.navigationHistory.nextStack = nextstack;
        $("ul#layers").find("li[itemtype=imagery]").find(".hideonselect").hide();
    } else if (toggle[0].checked) {
        lyr.setVisibility(true);
        if (lyr.query_vector) {
            if (lyr.name != current || !s.ui.states.vectorsBuilt) {
                lyr.query_vector();
            }
        }
    } else {
        lyr.setVisibility(false);
    }
    if (toggle[0].checked) {
        listitem.find("div.showonselect").show();
    } else {
        listitem.find(".hideonselect").hide();
    }
};

firesource.ui.actions.layerSlide = function(e, ui) {
    var listitem = $(e.target).parents("li.listitem");
    var layerid = listitem.attr("itemid");
    var type = listitem.attr("itemtype");
    var lyr = s.ol.layers[type][layerid];
    lyr.setOpacity(ui.value / 100);
};

firesource.ui.actions.layerMouseUp = function(e) {
    var item = $(e.target);
    var listitem = item.parents("li.listitem");
    var layerid = listitem.attr("itemid");
    if (item.text() == "Tags") {
        var tagsp = listitem.find("p.tags");
        if (tagsp.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            tagsp.hide();
        } else {
            item.removeClass("ui-state-default").addClass("ui-state-active");
            tagsp.show();
        }
    } else if (item.text() == "Detail") {
        var detailsdiv = listitem.find("div.details-layer");
        var legend = listitem.find(".legend-layer");
        var layeritem = jLinq.from(s.results.layers).equals("id", layerid).select();
        if (detailsdiv.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            detailsdiv.hide();
            legend.hide();
        } else {
            item.removeClass("ui-state-default").addClass("ui-state-active");
            detailsdiv.empty().append(fssoy.layerdetaildiv({
                item: layeritem[0]
            })).show();
            legend.show();
        }
    } else if (item.text() == "Refresh") {
        var type = listitem.attr("itemtype");
        var layer = s.ol.layers[type][layerid];
        if (layer.query_vector) {
            layer.query_vector();
        } else {
            layer.redraw(true);
        }
    } else if ($(item).hasClass("inspect-features")) {
        if (item.hasClass("ui-state-active")) {
            s.inspect = false;
            item.removeClass("ui-state-active").addClass("ui-state-default");
        } else {
            $(".inspect-features.ui-state-active").removeClass("ui-state-active").addClass("ui-state-default");
            item.removeClass("ui-state-default").addClass("ui-state-active");
            var type = listitem.attr("itemtype");
            var layer = s.ol.layers[type][layerid];
            s.inspect = function(xy) {
                $.get(layer.url + "?" + $.param({
                    LAYERS: layer.params.LAYERS,
                    SRS: layer.params.SRS,
                    SERVICE: layer.params.SERVICE,
                    VERSION: layer.params.VERSION,
                    REQUEST: "GetFeatureInfo",
                    BBOX: s.ol.olmap.getExtent().toBBOX(),
                    INFO_FORMAT: "text/plain",
                    X: xy.x,
                    Y: xy.y,
                    HEIGHT: $(s.ol.olmap.div).height(),
                    WIDTH: $(s.ol.olmap.div).width()
                }), function(data) {
                    if (data.slice(0, 2) == "no") {
                        alert(data);
                    } else {
                        alert(s.ol.olmap.getLonLatFromPixel(xy) + "\n" + data.split("\n").slice(1).join("\n"));
                    }
                });
            };
        }
    }
};

firesource.ui.layerSliderOpacity = function(element) {
    var listitem = $(element).parents("li.listitem");
    var layerid = listitem.attr("itemid");
    var type = listitem.attr("itemtype");
    var layer = s.ol.layers[type][layerid];
    if (layer.shown) {
        listitem.find("input[id^=toggle-]").prop("checked", true).change();
    }
    if (layer.opacity != undefined) {
        return layer.opacity;
    } else {
        return 1;
    }
};

$("ul#layers").live("change", firesource.ui.actions.layerChange).live("slide", firesource.ui.actions.layerSlide).live("mouseup", firesource.ui.actions.layerMouseUp);

firesource.ui.actions.contentSearch = function(e) {
    var tags = $(e.target).attr("searchid");
    $("div#contents input[id*=searchtext]:visible").val(tags).keyup();
};

$("div.listtags ul.list a").live("click", firesource.ui.actions.contentSearch);

firesource.ui.mapMouseOver = function(e) {
    if (e.target._featureId) {
        var layerid = $(e.target).parents("div.olLayerDiv").attr("id");
        var layer = s.ol.olmap.getLayersBy("id", layerid)[0];
        var feature = layer.getFeatureById(e.target._featureId);
        firesource.ol.hoverdetails(feature);
    } else {
        firesource.ol.hoverdetails(null);
    }
};

$("div#map").live("mouseover", firesource.ui.mapMouseOver);

firesource.ui.restoreLayerState = function(layerid) {
    var layers = $("ul#layers");
    var activelayerstoggle = layers.find("input[id^=toggle-]:checked");
    if (layerid) {
        layersliders = layers.find("li.listitem[itemid^=" + layerid + "]").find('div[id^="slider-"]');
    } else {
        layersliders = layers.children("li.listitem").find('div[id^="slider-"]').reverse();
    }
    layersliders.each(function() {
        var slider = $(this);
        slider.slider({
            range: "min",
            value: Math.round(firesource.ui.layerSliderOpacity(slider) * 100)
        });
    });
    s.ol.olmap.resetLayersZIndex();
    if (!layerid) {
        $.each(activelayerstoggle, function(index, layertoggle) {
            layertoggle.checked = true;
        });
        activelayerstoggle.change();
        layers.sortable({
            placeholder: "ui-state-highlight",
            update: function(e, ui) {
                var listitem = ui.item;
                var newindex = listitem.siblings().length - listitem.index();
                var layerid = listitem.attr("itemid");
                var type = listitem.attr("itemtype");
                var layer = s.ol.layers[type][layerid];
                s.ol.olmap.setLayerIndex(layer, newindex);
                s.ol.olmap.resetLayersZIndex();
            }
        });
    }
};

firesource.ui.actions.vectorChange = function(e) {
    var toggle = $(e.target);
    if (!toggle.is("input[id^=toggle-]")) {
        return;
    }
    var listitem = toggle.parents("li.listitem");
    var featureid = listitem.attr("featureid");
    var feature = s.ol.activeVector.getFeatureById("OpenLayers.Feature." + featureid);
    if (feature) {
        if (toggle[0].checked) {
            s.ol.controls.select.select(feature);
        } else {
            s.ol.controls.select.unselect(feature);
        }
    }
};

firesource.ui.actions.vectorMouseUp = function(e) {
    var item = $(e.target);
    var listitem = item.parents("li.listitem");
    var featureid = listitem.attr("featureid");
    var editdiv = listitem.find("div.edit-vector");
    var othereditdivs = listitem.siblings().find("div.edit-vector");
    var detailsdiv = listitem.find("div.details-vector");
    var tagsp = listitem.find("p.tags");
    if (item.text() == "Tags") {
        if (tagsp.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            tagsp.hide();
        } else {
            if (editdiv.is(":visible")) {
                item.siblings("a.edit").removeClass("ui-state-active").addClass("ui-state-default");
                editdiv.hide();
            }
            item.removeClass("ui-state-default").addClass("ui-state-active");
            tagsp.show();
        }
    } else if (item.text() == "Detail") {
        if (detailsdiv.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            detailsdiv.hide();
        } else {
            if (editdiv.is(":visible")) {
                item.siblings("a.edit").removeClass("ui-state-active").addClass("ui-state-default");
                editdiv.hide();
            }
            item.removeClass("ui-state-default").addClass("ui-state-active");
            var feature = firesource.ol.getFeaturesBy("id", s.ol.activeVector, featureid)[0];
            feature.attributes.symboltext = feature.attributes.symbol.split("/")[1].replace(/_/g, " ");
            detailsdiv.empty().append(fssoy.resourcedetaildiv({
                item: feature.attributes
            })).show();
        }
    }
};

$("ul#vectors").live("change", firesource.ui.actions.vectorChange).live("mouseup", firesource.ui.actions.vectorMouseUp);

firesource.ui.returnFeatureData = function(feature) {
    var searchtags = "";
    $.each(feature.attributes, function(key, value) {
        if (value && key[0] != "_") {
            value = value + "";
            if (key == "tags") {
                searchtags += value;
            } else {
                searchtags += key.replace(/\W+/g, "_") + ":" + value.replace(/\W+/g, "_") + ", ";
            }
        }
    });
    searchtags = searchtags.toLowerCase().slice(0, -2);
    feature.attributes.logged_time_str = dateFormat(timezoneDate(feature.attributes.logged_time), "dd/mm/yyyy HH:MM");
    var data = {
        attributes: feature.attributes,
        id: feature.id.split(".").pop(),
        searchtags: searchtags,
        is_staff: django_permissions.is_staff
    };
    return data;
};

firesource.ui.updateDataTable = function(table, layer) {
    if (!layer.features || layer.features.length == 0) {
        return false;
    } else {
        firesource.ui.setMessageText("Updating attributes...");
    }
    table.fnClearTable();
    var columns = [];
    table.find("th").each(function() {
        columns.push($(this).text());
    });
    var rows = jLinq.from(layer.features).select(function(f) {
        var row = [];
        if (f.fid == null) {
            f.fid = layer.name + ".-1";
        }
        $.each(columns, function(index, value) {
            if (value == "fid") {
                row.push("<a onclick=\"firesource.ol.zoomToFid('" + f.fid + "'); return false;\">" + f.fid.split(".")[1] + "</a>");
            } else {
                row.push(f.attributes[value]);
            }
        });
        return row;
    });
    s.ui.dtable.fnAddData(rows);
    return true;
};

firesource.ui.actions.viewsMouseUp = function(e) {
    var item = $(e.target);
    var listitem = item.parents("li.listitem");
    var viewid = listitem.attr("itemid");
    var editdiv = listitem.find("div.edit-view");
    var othereditdivs = listitem.siblings().find("div.edit-view");
    var detailsdiv = listitem.find("div.details-view");
    var tagsp = listitem.find("p.tags");
    var viewobject = s.ol.userviews[viewid];
    if (item.text() == "Tags") {
        if (tagsp.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            tagsp.hide();
        } else {
            if (editdiv.is(":visible")) {
                item.siblings("a.edit").removeClass("ui-state-active").addClass("ui-state-default");
                editdiv.hide();
            }
            item.removeClass("ui-state-default").addClass("ui-state-active");
            tagsp.show();
        }
    } else if (item.text() == "Detail") {
        if (detailsdiv.is(":visible")) {
            item.removeClass("ui-state-active").addClass("ui-state-default");
            detailsdiv.hide();
        } else {
            if (editdiv.is(":visible")) {
                item.siblings("a.edit").removeClass("ui-state-active").addClass("ui-state-default");
                editdiv.hide();
            }
            item.removeClass("ui-state-default").addClass("ui-state-active");
            detailsdiv.empty().append("details div").show();
        }
    } else if (item.text() == "Load") {
        firesource.ol.loadView(viewobject);
    } else if (item.text() == "Update") {
        firesource.ui.createView(viewobject.type, viewobject.name);
    }
};

$("ul#views").live("mouseup", firesource.ui.actions.viewsMouseUp);

firesource.ui.renderVectors = function(layer) {
    var vectors = $("ul#vectors");
    vectors.empty();
    if (layer.features.length > 0) {
        $.each(layer.features, function(index, feature) {
            if (feature.cluster) {
                $.each(feature.cluster, function(index, f) {
                    if (f.cluster == undefined) {
                        vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(f)));
                    }
                });
            } else if (feature.cluster == undefined) {
                vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(feature)));
            }
        });
        if (!django_permissions.is_staff) {
            vectors.find("a[text=Edit]").remove();
        }
    }
};

jQuery.expr[":"].regex = function(elem, index, match) {
    regexFlags = "ig", regex = new RegExp(match[3], regexFlags);
    return regex.test(jQuery(elem).text());
};

jQuery.expr[":"].toggled = function(elem, index, match) {
    return jQuery(elem).find("input[id^=toggle]:checked").length == 1;
};

firesource.ui.search = function(search, list) {
    if (search == "") {
        list.find("li.listitem").show();
        return true;
    } else {
        list.find("li.listitem").hide();
        if (search.search("regex:") == 0) {
            list.find('li.listitem:regex("' + search.slice(6) + '")').show();
            return true;
        } else {
            var terms = search.split(" ");
            var andstring = "";
            var orstring = "";
            var extras = "";
            $.each(terms, function(index, term) {
                if (term == "checked") {
                    extras += ":toggled";
                } else {
                    orstring += term + "|";
                    andstring += "(?=.*" + term + ")";
                }
            });
            if (orstring != "") {
                orstring = ':regex("' + orstring.slice(0, -1) + '")';
            }
            if (andstring != "") {
                andstring = ':regex("' + andstring + '")';
            }
            var results = list.find("li.listitem" + andstring + extras);
            if (results.length > 0) {
                results.show();
            } else {
                list.find("li.listitem" + orstring + extras).show();
            }
            return true;
        }
    }
};

firesource.ui.setHistoryFields = function(milliseconds) {
    now = new Date();
    $("input#vector-history-to-date").val(now.format("dd/mm/yyyy"));
    $("input#vector-history-to-time").val(now.format("HH:MM"));
    from = new Date(now.getTime() - milliseconds);
    $("input#vector-history-from-date").val(from.format("dd/mm/yyyy"));
    $("input#vector-history-from-time").val(from.format("HH:MM"));
};

firesource.ui.renderMapControls = function() {
    s.ui.zoomslider = $("div.slider-ui-zoom");
    s.ui.zoomslider.children(".slider").slider({
        range: "min",
        min: 0,
        max: 17,
        orientation: "vertical",
        stop: function(event, ui) {
            s.ol.olmap.zoomTo(ui.value);
        }
    });
    s.ui.zoomslider.children(".gisicon-zoomin").button({
        text: false,
        icons: {
            primary: "gisicon-zoomin"
        }
    }).click(function() {
        s.ol.olmap.zoomIn();
    });
    s.ui.zoomslider.children(".gisicon-zoomout").button({
        text: false,
        icons: {
            primary: "gisicon-zoomout"
        }
    }).click(function() {
        s.ol.olmap.zoomOut();
    });
    s.ui.bodyLayout = $("body").layout({
        fxName: "none",
        north__size: 26,
        north__resizable: false,
        west__size: 420,
        west__minSize: 360,
        west__maxSize: $(window).width() * .5,
        west__onresize: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()",
        west__onopen: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()",
        west__onclose: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()",
        south__initHidden: true,
        south__size: $(window).height() * .3,
        south__maxSize: $(window).height() * .5,
        south__minSize: $(window).height() * .1,
        south__onresize: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()",
        south__onopen: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()",
        south__onclose: "firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()"
    });
    s.ui.contentsLayout = $("div#contents").layout({
        fxName: "none",
        north__size: 30,
        north__closable: false,
        north__resizable: false,
        center__onresize: "s.ui.contentdivLayout.resizeAll",
        center__onopen: "s.ui.contentdivLayout.resizeAll",
        south__size: $(window).height() * .3,
        south__maxSize: $(window).height() * .5,
        south__minSize: $(window).height() * .1
    });
    s.ui.contentdivLayout = $("div#contents").children(".ui-layout-center").layout({
        fxName: "none",
        north__size: 28,
        north__closable: false,
        north__resizable: false,
        west__size: 120,
        west__resizable: false,
        south__initHidden: true,
        south__resizable: false,
        south__size: 150
    });
    $("input#controlpan").button({
        text: false,
        icons: {
            primary: "gisicon-pan"
        }
    }).click(function() {
        firesource.ol.toggleControl("navigate");
        s.ol.olmap.resetLayersZIndex();
    });
    $("input#controlselect").button({
        text: false,
        icons: {
            primary: "gisicon-select"
        }
    }).click(function() {
        firesource.ol.toggleControl("select");
        s.ol.olmap.resetLayersZIndex();
    });
    $("button#controldeselect").button({
        text: false,
        icons: {
            primary: "gisicon-deselect"
        }
    }).click(function() {
        while (s.ol.activeVector.selectedFeatures.length > 0) {
            s.ol.controls.select.unselect(s.ol.activeVector.selectedFeatures[0]);
        }
        $("ul#vectors").find("li.listitem").find("input[id^=toggle-]").attr("checked", false);
    });
    $("input#controlmline").button({
        text: false,
        icons: {
            primary: "gisicon-mline"
        }
    }).click(function() {
        firesource.ol.toggleControl("measureLine");
    });
    s.ol.controls.measureLine.events.on({
        measure: firesource.ol.handleMeasurements,
        measurepartial: firesource.ol.handleMeasurements
    });
    $("input#controlmarea").button({
        text: false,
        icons: {
            primary: "gisicon-marea"
        }
    }).click(function() {
        firesource.ol.toggleControl("measureArea");
    });
    s.ol.controls.measureArea.events.on({
        measure: firesource.ol.handleMeasurements,
        measurepartial: firesource.ol.handleMeasurements
    });
    $("button#controlnewdrawing").button({
        text: false,
        icons: {
            primary: "gisicon-new"
        }
    }).click(function() {
        var drawingname = window.prompt("Please enter a name for your new drawing");
        if (drawingname == null || drawingname == "") {
            firesource.ui.setMessageText("Can't create a drawing with no name!");
        } else {
            firesource.ui.createDrawing(drawingname);
        }
    });
    $("button#controlnewview").button({
        text: false,
        icons: {
            primary: "gisicon-newview"
        }
    }).click(function() {
        $("div#createviewdialog").dialog("open");
    });
    $("button#controlquickpdf").button({
        text: false,
        icons: {
            primary: "gisicon-quickpdf"
        }
    }).click(function() {
        var name = window.prompt("Map title?", "Quick Print");
        url = "/apps/spatial/print.pdf?" + $.param({
            name: name
        }) + "&" + document.location.hash.slice(1);
        window.open(url);
    });
    $("button#controlquickjpg").button({
        text: false,
        icons: {
            primary: "gisicon-quickjpg"
        }
    }).click(function() {
        var name = window.prompt("Map title?", "Quick Print");
        url = "/apps/spatial/print.jpg?" + $.param({
            name: name
        }) + "&" + document.location.hash.slice(1);
        window.open(url);
    });
    $("#controlzoomselect").button({
        text: false,
        icons: {
            primary: "gisicon-zoomselect"
        }
    }).click(function() {
        firesource.ol.zoomToSelected();
    });
    $("#controlzoomdefault").button({
        text: false,
        icons: {
            primary: "gisicon-zoomdefault"
        }
    }).click(function() {
        s.ol.olmap.zoomToExtent(s.ol.bounds);
    });
    $("#controlprevview").button({
        text: false,
        icons: {
            primary: "gisicon-prevview"
        }
    }).click(function() {
        s.ol.navigationHistory.jump("previous", 1);
    });
    $("#controlnextview").button({
        text: false,
        icons: {
            primary: "gisicon-nextview"
        }
    }).click(function() {
        s.ol.navigationHistory.jump("next", 1);
    });
    $("input#toggletools").button().toggle(function() {
        s.ui.zoomslider.hide();
        $("div#declogo").hide();
        $("div#openlogo").hide();
        $("div#mouseposition").hide();
        $("span.tools").hide();
        $("input#toggletools")[0].checked = false;
        $("input#toggletools").button("refresh");
    }, function() {
        s.ui.zoomslider.show();
        $("div#declogo").show();
        $("div#openlogo").show();
        $("div#mouseposition").show();
        $("span.tools").show();
        $("input#toggletools")[0].checked = true;
        $("input#toggletools").button("refresh");
    }).attr("checked", true).button("refresh");
    $("label[for=toggletools]").mouseenter(function() {
        if (!$(this).is(".ui-state-active")) {
            $("span.tools").fadeIn();
        }
    });
    $("span#toolset").buttonset();
    $("span#viewset").buttonset();
    $("input#toggletools").attr("checked", true);
    $("input#toggletools").change();
    $("span.tools").fadeIn();
    $("span#editset").buttonset().hide();
    $("button#buttonrefresh").button({
        text: false,
        icons: {
            primary: "ui-icon-refresh"
        }
    }).click(function() {
        $("ul#layers li.listitem input:checked").parents("li.listitem").find("a:contains(Refresh)").mouseup();
    });
    $("#refreshset").buttonset();
    $("span[class*='gisicon']").addClass("gis-icon");
    $("div#aboutdialog").dialog({
        resizable: false
    }).bind("dialogclose", function(event, ui) {
        $("input#toggleabout").attr("checked", false).button("refresh");
    }).bind("dialogopen", function(event, ui) {
        $("input#toggleabout").attr("checked", true).button("refresh");
    });
    var aboutlabel = $("label[for=toggleabout]");
    var aboutx = aboutlabel.position()["left"] + aboutlabel.width();
    var abouty = aboutlabel.position()["top"] + aboutlabel.height() + 6;
    firesource.ui.anchor({
        x: aboutx,
        y: abouty
    }, $("div#aboutdialog"), "top-right");
    $("input#vector-history-from-date").datepicker({
        dateFormat: "dd/mm/yy",
        showAnim: "",
        maxDate: "+0d"
    });
    $("input#vector-history-to-date").datepicker({
        dateFormat: "dd/mm/yy",
        showAnim: "",
        maxDate: "+0d"
    });
    $("a#clear-history-button").click(function() {
        s.ol.layers.vector.history.destroyFeatures();
        s.ol.layers.vector.history_lines.destroyFeatures();
        s.ol.layers.vector.history_lines.setVisibility(false);
        s.ol.layers.vector.history.setVisibility(false);
    });
    $("a#go-history-button").click(function() {
        var selectedVectors = new Array();
        $("ul#vectors").find("input[id^=toggle-]:checked").parents("li.listitem").each(function() {
            selectedVectors.push(firesource.ol.getFeaturesBy("id", s.ol.activeVector, $(this).attr("featureid"))[0].attributes.deviceid);
        });
        if (selectedVectors.length < 1) {
            firesource.ui.setMessageText("Please select one or more vectors.");
        }
        if (!firesource.ui.checkTimeField($("input#vector-history-from-time")) || !firesource.ui.checkTimeField($("input#vector-history-to-time"))) {
            firesource.ui.setMessageText("Validate time fields");
            return;
        }
        var offset = new Date().getTimezoneOffset() * 6e4;
        var datefrom = $("input#vector-history-from-date").val();
        datefrom = datefrom.split("/");
        var timefrom = $("input#vector-history-from-time").val();
        var datefrom = datefrom[1] + "/" + datefrom[0] + "/" + datefrom[2] + " " + timefrom + ":00";
        var unixdatefrom = new Date(datefrom).getTime();
        unixdatefrom += offset;
        datefrom = new Date(unixdatefrom).format("yyyy-mm-dd HH:MM");
        var dateto = $("input#vector-history-to-date").val();
        dateto = dateto.split("/");
        var timeto = $("input#vector-history-to-time").val();
        var dateto = dateto[1] + "/" + dateto[0] + "/" + dateto[2] + " " + timeto + ":00";
        var unixdateto = new Date(dateto).getTime();
        unixdateto += offset;
        dateto = new Date(unixdateto).format("yyyy-mm-dd HH:MM");
        s.ol.historyLayerIndex = s.ol.olmap.getLayerIndex(s.ol.activeVector) - 1;
        s.ol.activeVector.query_history(datefrom, dateto, selectedVectors);
    });
    $("label[for=views-tab]").mouseup(function() {
        $("div#views-div").siblings().each(function() {
            $(this).append($("div[id^=" + this.id + "-]"));
        });
        var pane = $("#contents").children("div.ui-layout-center");
        pane.children("div.ui-layout-north").append($("div#views-div-north"));
        pane.children("div.ui-layout-west").append($("div#views-div-west"));
        pane.children("div.ui-layout-center").append($("div#views-div-center"));
        s.ui.contentdivLayout.hide("south");
        $("select#vectors-select").removeClass("ui-state-active").addClass("ui-state-default");
    });
    $("label[for=layers-tab]").mouseup(function() {
        $("div#layers-div").siblings().each(function() {
            $(this).append($("div[id^=" + this.id + "-]"));
        });
        var pane = $("#contents").children("div.ui-layout-center");
        pane.children("div.ui-layout-north").append($("div#layers-div-north"));
        pane.children("div.ui-layout-west").append($("div#layers-div-west"));
        pane.children("div.ui-layout-center").append($("div#layers-div-center"));
        s.ui.contentdivLayout.hide("south");
        s.ui.contentdivLayout.show("west");
        $("select#vectors-select").removeClass("ui-state-active").addClass("ui-state-default");
    });
    $("label[for=vectors-tab]").mouseup(function() {
        $("div#vectors-div").siblings().each(function() {
            $(this).append($("div[id^=" + this.id + "-]"));
        });
        var pane = $("#contents").children("div.ui-layout-center");
        pane.children("div.ui-layout-north").append($("div#vectors-div-north"));
        pane.children("div.ui-layout-west").append($("div#vectors-div-west"));
        pane.children("div.ui-layout-center").append($("div#vectors-div-center"));
        pane.children("div.ui-layout-south").append($("div#vectors-div-south"));
        s.ui.contentdivLayout.show("south");
        s.ui.contentdivLayout.show("west");
        s.ui.contentdivLayout.sizePane("south", 150);
        $("select#vectors-select").removeClass("ui-state-default").addClass("ui-state-active");
    });
    $("div#contentstabs").buttonset();
    $("input#viewsearchtext").keyup(function() {
        firesource.ui.search($(this).val(), $("ul#views"));
    });
    $("label[for=layers-tab]").click().mouseup();
    $("input#layersearchtoggle").change(function() {
        var state = this.checked;
        $("ul#layers").find("input[type!=radio][id^=toggle-]:visible").each(function() {
            this.checked = state;
            $(this).change();
        });
    });
    $("input#layersearchtext").keyup(function() {
        firesource.ui.search($(this).val(), $("ul#layers"));
    });
    $("input#vectorsearchtoggle").change(function() {
        var state = this.checked;
        $("ul#vectors").find("input[id^=toggle-]:visible").each(function() {
            this.checked = state;
            $(this).change();
        });
    });
    $("input#vectorsearchtext").keyup(function() {
        firesource.ui.search($(this).val(), $("ul#vectors"));
    });
    $("select#vectors-select").change(function() {
        if (s.ol.activeVector && s.ol.activeVector.protocol && s.ol.activeVector.protocol.CLASS_NAME == "OpenLayers.Protocol.WFS.v1_1_0") {
            return;
        }
        var layerid = $(this).val();
        if (layerid != s.ui.states.selectedVector) {
            s.ui.states.vectorsBuilt = false;
            s.ui.states.selectedVector = layerid;
            s.ol.activeVector = s.ol.layers.vector[layerid];
        }
        if (!s.ui.states.vectorsBuilt && s.ol.activeVector) {
            if ($("ul#vectors").find("input[id^=toggle-]:checked").length > 0) {
                firesource.ui.setMessageText("Refreshing Vectors - selections have been cleared");
            }
            if (s.ol.controls.select) {
                s.ol.controls.select.setLayer(s.ol.activeVector);
            } else {
                s.ol.controls.select = firesource.ol.interact.select(s.ol.activeVector);
                s.ol.olmap.addControl(s.ol.controls.select);
            }
            if (s.ol.activeVector) {
                firesource.ui.renderVectors(s.ol.activeVector);
                s.ui.states.vectorsBuilt = true;
            }
        }
        s.ol.olmap.resetLayersZIndex();
        if ($("ul#vectors").is(":visible")) {
            $("label[for=vectors-tab]").mouseup();
        }
        $("input#vectorsearchtext").keyup();
    });
    $("input#controlcreatemap").click(firesource.ui.createMap);
    $("input#controlcreatetheme").click(firesource.ui.createTheme);
    $("form#layerlegendform a").click(firesource.ui.createLayerLegend);
    $("a#lasthour-history").click(function() {
        firesource.ui.setHistoryFields(60 * 60 * 1e3);
    }).click();
    $("a#last3hours-history").click(function() {
        firesource.ui.setHistoryFields(3 * 60 * 60 * 1e3);
    });
    $("a#lastday-history").click(function() {
        firesource.ui.setHistoryFields(24 * 60 * 60 * 1e3);
    });
    $("a#lastweek-history").click(function() {
        firesource.ui.setHistoryFields(7 * 24 * 60 * 60 * 1e3);
    });
    $("a#lastmonth-history").click(function() {
        firesource.ui.setHistoryFields(31 * 24 * 60 * 60 * 1e3);
    });
    $("a#allvectors").click(function() {
        $("input#vectorsearchtext").val("").keyup();
    });
    $("a#selectedvectors").click(function() {
        $("input#vectorsearchtext").val("checked").keyup();
    });
    $("div#createviewdialog").dialog({
        modal: true,
        draggable: false,
        resizable: false,
        width: "auto",
        height: "auto"
    }).dialog("close");
    $("div#aboutdialog").dialog("close");
    $("input#toggleabout").button().toggle(function() {
        $("div#aboutdialog").dialog("open");
        $(e.target).attr("checked", true).button("refresh");
    }, function() {
        $("div#aboutdialog").dialog("close");
        $(e.target).attr("checked", false).button("refresh");
    });
    $("div#settingsdialog").dialog("close");
    $("input#togglesettings").button().toggle(function(e) {
        $("div#settingsdialog").dialog("open");
        $(e.target).attr("checked", true).button("refresh");
    }, function(e) {
        $("div#settingsdialog").dialog("close");
        $(e.target).attr("checked", false).button("refresh");
    });
    $("input#togglecontents").button().toggle(function(e) {
        s.ui.bodyLayout.close("west");
        $(e.target).attr("checked", false).button("refresh");
    }, function(e) {
        s.ui.bodyLayout.open("west");
        $(e.target).attr("checked", true).button("refresh");
    }).attr("checked", true).button("refresh");
};

firesource.ui.anchor = function(position, dialog_box, corner) {
    x = position["x"];
    y = position["y"];
    if (corner == "top-left") {
        dialog_box.dialog("option", "position", [ x, y ]);
    } else if (corner == "top-right") {
        x -= dialog_box.width();
        dialog_box.dialog("option", "position", [ x, y ]);
    } else if (corner == "bottom-left") {
        y -= dialog_box.height();
        dialog_box.dialog("option", "position", [ x, y ]);
    } else if (corner == "bottom-right") {
        x -= dialog_box.width();
        y -= dialog_box.height();
        dialog_box.dialog("option", "position", [ x, y ]);
    }
};

firesource.ui.checkTimeField = function(field) {
    if (field.val) {
        value = field.val();
    } else {
        value = field.value;
    }
    re = /^(\d{1,2}):(\d{2})$/;
    if (value != "") {
        if (regs = value.match(re)) {
            if (regs[1] > 23) {
                return false;
            }
            if (regs[2] > 59) {
                return false;
            }
        } else {
            return false;
        }
    }
    return true;
};

goog.provide("firesource");

goog.require("firesource.session");

goog.require("firesource.ui");

goog.require("firesource.forms");

goog.require("firesource.ol");

firesource.setupmap = function() {
    firesource.ui.renderMapControls();
    s.ol.bounds = new OpenLayers.Bounds(115.866, -38.242, 132.001, -16.51);
    s.ol.olmap = firesource.ol.maps.gda94(document.getElementById("map"), s.ol.bounds);
    s.ol.sldformat = new OpenLayers.Format.SLD.v1();
    s.ol.geojsonformat = new OpenLayers.Format.GeoJSON();
    $(window).resize(function() {
        firesource.ol.jiggleMap(s.ol.olmap);
    });
    $.loading({
        onAjax: true,
        delay: 100,
        pulse: "ellipsis"
    });
    var trackingUpdate = function() {
        $("li[itemid^=resource_tracking] a:contains(Refresh)").mouseup();
    };
    setInterval(trackingUpdate, 6e4);
    $.get("/apps/spatial/layers.json", function(data) {
        firesource.session.updateResults(data);
    });
};

$(document).ready(function() {
    if ($("#map").length) {
        firesource.setupmap();
    } else {
        firesource.forms.decorate();
    }
});