// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * @provideGoog
 */


/**
 * @define {boolean} Overridden to true by the compiler when
 *     --process_closure_primitives is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is already
 * defined in the current scope before assigning to prevent clobbering if
 * base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {};


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * A hook for overriding the define values in uncompiled mode.
 *
 * In uncompiled mode, {@code CLOSURE_UNCOMPILED_DEFINES} may be defined before
 * loading base.js.  If a key is defined in {@code CLOSURE_UNCOMPILED_DEFINES},
 * {@code goog.define} will use the value instead of the default value.  This
 * allows flags to be overwritten without compilation (this is normally
 * accomplished with the compiler's "define" flag).
 *
 * Example:
 * <pre>
 *   var CLOSURE_UNCOMPILED_DEFINES = {'goog.DEBUG': false};
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_UNCOMPILED_DEFINES;


/**
 * A hook for overriding the define values in uncompiled or compiled mode,
 * like CLOSURE_UNCOMPILED_DEFINES but effective in compiled code.  In
 * uncompiled code CLOSURE_UNCOMPILED_DEFINES takes precedence.
 *
 * Also unlike CLOSURE_UNCOMPILED_DEFINES the values must be number, boolean or
 * string literals or the compiler will emit an error.
 *
 * While any @define value may be set, only those set with goog.define will be
 * effective for uncompiled code.
 *
 * Example:
 * <pre>
 *   var CLOSURE_DEFINES = {'goog.DEBUG': false} ;
 * </pre>
 *
 * @type {Object<string, (string|number|boolean)>|undefined}
 */
goog.global.CLOSURE_DEFINES;


/**
 * Returns true if the specified value is not undefined.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.
 *
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  // void 0 always evaluates to undefined and hence we do not need to depend on
  // the definition of the global variable named 'undefined'.
  return val !== void 0;
};


/**
 * Builds an object structure for the provided namespace path, ensuring that
 * names that already exist are not overwritten. For example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Defines a named value. In uncompiled mode, the value is retrieved from
 * CLOSURE_DEFINES or CLOSURE_UNCOMPILED_DEFINES if the object is defined and
 * has the property specified, and otherwise used the defined defaultValue.
 * When compiled the default can be overridden using the compiler
 * options or the value set in the CLOSURE_DEFINES object.
 *
 * @param {string} name The distinguished name to provide.
 * @param {string|number|boolean} defaultValue
 */
goog.define = function(name, defaultValue) {
  var value = defaultValue;
  if (!COMPILED) {
    if (goog.global.CLOSURE_UNCOMPILED_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_UNCOMPILED_DEFINES, name)) {
      value = goog.global.CLOSURE_UNCOMPILED_DEFINES[name];
    } else if (goog.global.CLOSURE_DEFINES &&
        Object.prototype.hasOwnProperty.call(
            goog.global.CLOSURE_DEFINES, name)) {
      value = goog.global.CLOSURE_DEFINES[name];
    }
  }
  goog.exportPath_(name, value);
};


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.define('goog.DEBUG', true);


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.define('goog.LOCALE', 'en');  // default to en


/**
 * @define {boolean} Whether this code is running on trusted sites.
 *
 * On untrusted sites, several native functions can be defined or overridden by
 * external libraries like Prototype, Datejs, and JQuery and setting this flag
 * to false forces closure to use its own implementations when possible.
 *
 * If your JavaScript can be loaded by a third party site and you are wary about
 * relying on non-standard implementations, specify
 * "--define goog.TRUSTED_SITE=false" to the JSCompiler.
 */
goog.define('goog.TRUSTED_SITE', true);


/**
 * @define {boolean} Whether a project is expected to be running in strict mode.
 *
 * This define can be used to trigger alternate implementations compatible with
 * running in EcmaScript Strict mode or warn about unavailable functionality.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
 *
 */
goog.define('goog.STRICT_MODE_COMPATIBLE', false);


/**
 * @define {boolean} Whether code that calls {@link goog.setTestOnly} should
 *     be disallowed in the compilation unit.
 */
goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);


/**
 * @define {boolean} Whether to use a Chrome app CSP-compliant method for
 *     loading scripts via goog.require. @see appendScriptSrcNode_.
 */
goog.define('goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING', false);


/**
 * Defines a namespace in Closure.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * The presence of one or more goog.provide() calls in a file indicates
 * that the file defines the given objects/namespaces.
 * Provided symbols must not be null or undefined.
 *
 * In addition, goog.provide() creates the object stubs for a namespace
 * (for example, goog.provide("goog.foo.bar") will create the object
 * goog.foo.bar if it does not already exist).
 *
 * Build tools also scan for provide/require/module statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 *
 * @see goog.require
 * @see goog.module
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
  }

  goog.constructNamespace_(name);
};


/**
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 * @param {Object=} opt_obj The object to embed in the namespace.
 * @private
 */
goog.constructNamespace_ = function(name, opt_obj) {
  if (!COMPILED) {
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name, opt_obj);
};


/**
 * Module identifier validation regexp.
 * Note: This is a conservative check, it is very possible to be more lenient,
 *   the primary exclusion here is "/" and "\" and a leading ".", these
 *   restrictions are intended to leave the door open for using goog.require
 *   with relative file paths rather than module identifiers.
 * @private
 */
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;


/**
 * Defines a module in Closure.
 *
 * Marks that this file must be loaded as a module and claims the namespace.
 *
 * A namespace may only be defined once in a codebase. It may be defined using
 * goog.provide() or goog.module().
 *
 * goog.module() has three requirements:
 * - goog.module may not be used in the same file as goog.provide.
 * - goog.module must be the first statement in the file.
 * - only one goog.module is allowed per file.
 *
 * When a goog.module annotated file is loaded, it is enclosed in
 * a strict function closure. This means that:
 * - any variables declared in a goog.module file are private to the file
 * (not global), though the compiler is expected to inline the module.
 * - The code must obey all the rules of "strict" JavaScript.
 * - the file will be marked as "use strict"
 *
 * NOTE: unlike goog.provide, goog.module does not declare any symbols by
 * itself. If declared symbols are desired, use
 * goog.module.declareLegacyNamespace().
 *
 *
 * See the public goog.module proposal: http://goo.gl/Va1hin
 *
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part", is expected but not required.
 */
goog.module = function(name) {
  if (!goog.isString(name) ||
      !name ||
      name.search(goog.VALID_MODULE_RE_) == -1) {
    throw Error('Invalid module identifier');
  }
  if (!goog.isInModuleLoader_()) {
    throw Error('Module ' + name + ' has been loaded incorrectly.');
  }
  if (goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module may only be called once per module.');
  }

  // Store the module name for the loader.
  goog.moduleLoaderState_.moduleName = name;
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice.
    // A goog.module/goog.provide maps a goog.require to a specific file
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
  }
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 *
 * Note: This is not an alternative to goog.require, it does not
 * indicate a hard dependency, instead it is used to indicate
 * an optional dependency or to access the exports of a module
 * that has already been loaded.
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {
  return goog.module.getInternal_(name);
};


/**
 * @param {string} name The module identifier.
 * @return {?} The module exports for an already loaded module or null.
 * @private
 */
goog.module.getInternal_ = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      // goog.require only return a value with-in goog.module files.
      return name in goog.loadedModules_ ?
          goog.loadedModules_[name] :
          goog.getObjectByName(name);
    } else {
      return null;
    }
  }
};


/**
 * @private {?{moduleName: (string|undefined), declareLegacyNamespace:boolean}}
 */
goog.moduleLoaderState_ = null;


/**
 * @private
 * @return {boolean} Whether a goog.module is currently being initialized.
 */
goog.isInModuleLoader_ = function() {
  return goog.moduleLoaderState_ != null;
};


/**
 * Provide the module's exports as a globally accessible object under the
 * module's declared name.  This is intended to ease migration to goog.module
 * for files that have existing usages.
 * @suppress {missingProvide}
 */
goog.module.declareLegacyNamespace = function() {
  if (!COMPILED && !goog.isInModuleLoader_()) {
    throw new Error('goog.module.declareLegacyNamespace must be called from ' +
        'within a goog.module');
  }
  if (!COMPILED && !goog.moduleLoaderState_.moduleName) {
    throw Error('goog.module must be called prior to ' +
        'goog.module.declareLegacyNamespace.');
  }
  goog.moduleLoaderState_.declareLegacyNamespace = true;
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                (opt_message ? ': ' + opt_message : '.'));
  }
};


/**
 * Forward declares a symbol. This is an indication to the compiler that the
 * symbol may be used in the source yet is not required and may not be provided
 * in compilation.
 *
 * The most common usage of forward declaration is code that takes a type as a
 * function parameter but does not need to require it. By forward declaring
 * instead of requiring, no hard dependency is made, and (if not required
 * elsewhere) the namespace may never be required and thus, not be pulled
 * into the JavaScript binary. If it is required elsewhere, it will be type
 * checked as normal.
 *
 *
 * @param {string} name The namespace to forward declare in the form of
 *     "goog.package.part".
 */
goog.forwardDeclare = function(name) {};


/**
 * Forward declare type information. Used to assign types to goog.global
 * referenced object that would otherwise result in unknown type references
 * and thus block property disambiguation.
 */
goog.forwardDeclare('Document');
goog.forwardDeclare('HTMLScriptElement');
goog.forwardDeclare('XMLHttpRequest');


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return (name in goog.loadedModules_) ||
        (!goog.implicitNamespaces_[name] &&
            goog.isDefAndNotNull(goog.getObjectByName(name)));
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares that 'goog' and
   * 'goog.events' must be namespaces.
   *
   * @type {!Object<string, (boolean|undefined)>}
   * @private
   */
  goog.implicitNamespaces_ = {'goog.module': true};

  // NOTE: We add goog.module as an implicit namespace as goog.module is defined
  // here and because the existing module package has not been moved yet out of
  // the goog.module namespace. This satisifies both the debug loader and
  // ahead-of-time dependency management.
}


/**
 * Returns an object based on its fully qualified external name.  The object
 * is not found if null or undefined.  If you are using a compilation pass that
 * renames property names beware that using this function will not find renamed
 * properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
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


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {!Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {!Array<string>} provides An array of strings with
 *     the names of the objects this file provides.
 * @param {!Array<string>} requires An array of strings with
 *     the names of the objects this file requires.
 * @param {boolean=} opt_isModule Whether this dependency must be loaded as
 *     a module as declared by goog.module.
 */
goog.addDependency = function(relPath, provides, requires, opt_isModule) {
  if (goog.DEPENDENCIES_ENABLED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
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




// NOTE(nnaze): The debug DOM loader was included in base.js as an original way
// to do "debug-mode" development.  The dependency system can sometimes be
// confusing, as can the debug DOM loader's asynchronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the script
// will not load until some point after the current script.  If a namespace is
// needed at runtime, it needs to be defined in a previous script, or loaded via
// require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// https://developers.google.com/closure/library/docs/depswriter
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.define('goog.ENABLE_DEBUG_LOADER', true);


/**
 * @param {string} msg
 * @private
 */
goog.logToConsole_ = function(msg) {
  if (goog.global.console) {
    goog.global.console['error'](msg);
  }
};


/**
 * Implements a system for the dynamic resolution of dependencies that works in
 * parallel with the BUILD system. Note that all calls to goog.require will be
 * stripped by the JSCompiler when the --process_closure_primitives option is
 * used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide()) in
 *     the form "goog.package.part".
 * @return {?} If called within a goog.module file, the associated namespace or
 *     module otherwise null.
 */
goog.require = function(name) {
  // If the object already exists we do not need do do anything.
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

    var errorMessage = 'goog.require could not find: ' + name;
    goog.logToConsole_(errorMessage);

    throw Error(errorMessage);
  }
};


/**
 * Path for included scripts.
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default, the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 * @type {(function(string): boolean)|undefined}
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error will be thrown
 * when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as an argument
 * because that would make it more difficult to obfuscate our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always returns the same
 * instance object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


/**
 * @define {boolean} Whether to load goog.modules using {@code eval} when using
 * the debug loader.  This provides a better debugging experience as the
 * source is unmodified and can be edited using Chrome Workspaces or similar.
 * However in some environments the use of {@code eval} is banned
 * so we provide an alternative.
 */
goog.define('goog.LOAD_MODULE_USING_EVAL', true);


/**
 * @define {boolean} Whether the exports of goog.modules should be sealed when
 * possible.
 */
goog.define('goog.SEAL_MODULE_EXPORTS', goog.DEBUG);


/**
 * The registry of initialized modules:
 * the module identifier to module exports map.
 * @private @const {!Object<string, ?>}
 */
goog.loadedModules_ = {};


/**
 * True if goog.dependencies_ is available.
 * @const {boolean}
 */
goog.DEPENDENCIES_ENABLED = !COMPILED && goog.ENABLE_DEBUG_LOADER;


if (goog.DEPENDENCIES_ENABLED) {

  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts.
   * @private
   * @type {{
   *   pathIsModule: !Object<string, boolean>,
   *   nameToPath: !Object<string, string>,
   *   requires: !Object<string, !Object<string, boolean>>,
   *   visited: !Object<string, boolean>,
   *   written: !Object<string, boolean>,
   *   deferred: !Object<string, string>
   * }}
   */
  goog.dependencies_ = {
    pathIsModule: {}, // 1 to 1

    nameToPath: {}, // 1 to 1

    requires: {}, // 1 to many

    // Used when resolving dependencies to prevent us from visiting file twice.
    visited: {},

    written: {}, // Used to keep track of script files we have written.

    deferred: {} // Used to track deferred module evaluations in old IEs
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    /** @type {Document} */
    var doc = goog.global.document;
    return doc != null && 'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of base.js script that bootstraps Closure.
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.isDef(goog.global.CLOSURE_BASE_PATH)) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    /** @type {Document} */
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('SCRIPT');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var script = /** @type {!HTMLScriptElement} */ (scripts[i]);
      var src = script.src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @private
   */
  goog.importScript_ = function(src, opt_sourceText) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (importScript(src, opt_sourceText)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @const @private {boolean} */
  goog.IS_OLD_IE_ = !!(!goog.global.atob && goog.global.document &&
      goog.global.document.all);


  /**
   * Given a URL initiate retrieval and execution of the module.
   * @param {string} src Script source URL.
   * @private
   */
  goog.importModule_ = function(src) {
    // In an attempt to keep browsers from timing out loading scripts using
    // synchronous XHRs, put each load in its own script block.
    var bootstrap = 'goog.retrieveAndExecModule_("' + src + '");';

    if (goog.importScript_('', bootstrap)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /** @private {!Array<string>} */
  goog.queuedModules_ = [];


  /**
   * Return an appropriate module text. Suitable to insert into
   * a script tag (that is unescaped).
   * @param {string} srcUrl
   * @param {string} scriptText
   * @return {string}
   * @private
   */
  goog.wrapModule_ = function(srcUrl, scriptText) {
    if (!goog.LOAD_MODULE_USING_EVAL || !goog.isDef(goog.global.JSON)) {
      return '' +
          'goog.loadModule(function(exports) {' +
          '"use strict";' +
          scriptText +
          '\n' + // terminate any trailing single line comment.
          ';return exports' +
          '});' +
          '\n//# sourceURL=' + srcUrl + '\n';
    } else {
      return '' +
          'goog.loadModule(' +
          goog.global.JSON.stringify(
              scriptText + '\n//# sourceURL=' + srcUrl + '\n') +
          ');';
    }
  };

  // On IE9 and earlier, it is necessary to handle
  // deferred module loads. In later browsers, the
  // code to be evaluated is simply inserted as a script
  // block in the correct order. To eval deferred
  // code at the right time, we piggy back on goog.require to call
  // goog.maybeProcessDeferredDep_.
  //
  // The goog.requires are used both to bootstrap
  // the loading process (when no deps are available) and
  // declare that they should be available.
  //
  // Here we eval the sources, if all the deps are available
  // either already eval'd or goog.require'd.  This will
  // be the case when all the dependencies have already
  // been loaded, and the dependent module is loaded.
  //
  // But this alone isn't sufficient because it is also
  // necessary to handle the case where there is no root
  // that is not deferred.  For that there we register for an event
  // and trigger goog.loadQueuedModules_ handle any remaining deferred
  // evaluations.

  /**
   * Handle any remaining deferred goog.module evals.
   * @private
   */
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


  /**
   * Eval the named module if its dependencies are
   * available.
   * @param {string} name The module to load.
   * @private
   */
  goog.maybeProcessDeferredDep_ = function(name) {
    if (goog.isDeferredModule_(name) &&
        goog.allDepsAreAvailable_(name)) {
      var path = goog.getPathFromDeps_(name);
      goog.maybeProcessDeferredPath_(goog.basePath + path);
    }
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose evaluation has been deferred.
   * @private
   */
  goog.isDeferredModule_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && goog.dependencies_.pathIsModule[path]) {
      var abspath = goog.basePath + path;
      return (abspath) in goog.dependencies_.deferred;
    }
    return false;
  };

  /**
   * @param {string} name The module to check.
   * @return {boolean} Whether the name represents a
   *     module whose declared dependencies have all been loaded
   *     (eval'd or a deferred module load)
   * @private
   */
  goog.allDepsAreAvailable_ = function(name) {
    var path = goog.getPathFromDeps_(name);
    if (path && (path in goog.dependencies_.requires)) {
      for (var requireName in goog.dependencies_.requires[path]) {
        if (!goog.isProvided_(requireName) &&
            !goog.isDeferredModule_(requireName)) {
          return false;
        }
      }
    }
    return true;
  };


  /**
   * @param {string} abspath
   * @private
   */
  goog.maybeProcessDeferredPath_ = function(abspath) {
    if (abspath in goog.dependencies_.deferred) {
      var src = goog.dependencies_.deferred[abspath];
      delete goog.dependencies_.deferred[abspath];
      goog.globalEval(src);
    }
  };


  /**
   * Load a goog.module from the provided URL.  This is not a general purpose
   * code loader and does not support late loading code, that is it should only
   * be used during page load. This method exists to support unit tests and
   * "debug" loaders that would otherwise have inserted script tags. Under the
   * hood this needs to use a synchronous XHR and is not recommeneded for
   * production code.
   *
   * The module's goog.requires must have already been satisified; an exception
   * will be thrown if this is not the case. This assumption is that no
   * "deps.js" file exists, so there is no way to discover and locate the
   * module-to-be-loaded's dependencies and no attempt is made to do so.
   *
   * There should only be one attempt to load a module.  If
   * "goog.loadModuleFromUrl" is called for an already loaded module, an
   * exception will be throw.
   *
   * @param {string} url The URL from which to attempt to load the goog.module.
   */
  goog.loadModuleFromUrl = function(url) {
    // Because this executes synchronously, we don't need to do any additional
    // bookkeeping. When "goog.loadModule" the namespace will be marked as
    // having been provided which is sufficient.
    goog.retrieveAndExecModule_(url);
  };


  /**
   * @param {function(?):?|string} moduleDef The module definition.
   */
  goog.loadModule = function(moduleDef) {
    // NOTE: we allow function definitions to be either in the from
    // of a string to eval (which keeps the original source intact) or
    // in a eval forbidden environment (CSP) we allow a function definition
    // which in its body must call {@code goog.module}, and return the exports
    // of the module.
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
        throw Error('Invalid module definition');
      }

      var moduleName = goog.moduleLoaderState_.moduleName;
      if (!goog.isString(moduleName) || !moduleName) {
        throw Error('Invalid module name \"' + moduleName + '\"');
      }

      // Don't seal legacy namespaces as they may be uses as a parent of
      // another namespace
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


  /**
   * @private @const {function(string):?}
   *
   * The new type inference warns because this function has no formal
   * parameters, but its jsdoc says that it takes one argument.
   * (The argument is used via arguments[0], but NTI does not detect this.)
   * @suppress {newCheckTypes}
   */
  goog.loadModuleFromSource_ = function() {
    // NOTE: we avoid declaring parameters or local variables here to avoid
    // masking globals or leaking values into the module definition.
    'use strict';
    var exports = {};
    eval(arguments[0]);
    return exports;
  };


  /**
   * Writes a new script pointing to {@code src} directly into the DOM.
   *
   * NOTE: This method is not CSP-compliant. @see goog.appendScriptSrcNode_ for
   * the fallback mechanism.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.writeScriptSrcNode_ = function(src) {
    goog.global.document.write(
        '<script type="text/javascript" src="' + src + '"></' + 'script>');
  };


  /**
   * Appends a new script node to the DOM using a CSP-compliant mechanism. This
   * method exists as a fallback for document.write (which is not allowed in a
   * strict CSP context, e.g., Chrome apps).
   *
   * NOTE: This method is not analogous to using document.write to insert a
   * <script> tag; specifically, the user agent will execute a script added by
   * document.write immediately after the current script block finishes
   * executing, whereas the DOM-appended script node will not be executed until
   * the entire document is parsed and executed. That is to say, this script is
   * added to the end of the script execution queue.
   *
   * The page must not attempt to call goog.required entities until after the
   * document has loaded, e.g., in or after the window.onload callback.
   *
   * @param {string} src The script URL.
   * @private
   */
  goog.appendScriptSrcNode_ = function(src) {
    /** @type {Document} */
    var doc = goog.global.document;
    var scriptEl = /** @type {HTMLScriptElement} */ (
        doc.createElement('script'));
    scriptEl.type = 'text/javascript';
    scriptEl.src = src;
    scriptEl.defer = false;
    scriptEl.async = false;
    doc.head.appendChild(scriptEl);
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script url.
   * @param {string=} opt_sourceText The optionally source text to evaluate
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src, opt_sourceText) {
    if (goog.inHtmlDocument_()) {
      /** @type {Document} */
      var doc = goog.global.document;

      // If the user tries to require a new symbol after document load,
      // something has gone terribly wrong. Doing a document.write would
      // wipe out the page. This does not apply to the CSP-compliant method
      // of writing script tags.
      if (!goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING &&
          doc.readyState == 'complete') {
        // Certain test frameworks load base.js multiple times, which tries
        // to write deps.js each time. If that happens, just fail silently.
        // These frameworks wipe the page between each load of base.js, so this
        // is OK.
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
          var state = " onreadystatechange='goog.onScriptLoad_(this, " +
              ++goog.lastNonModuleScriptIndex_ + ")' ";
          doc.write(
              '<script type="text/javascript" src="' +
                  src + '"' + state + '></' + 'script>');
        }
      } else {
        doc.write(
            '<script type="text/javascript">' +
            opt_sourceText +
            '</' + 'script>');
      }
      return true;
    } else {
      return false;
    }
  };


  /** @private {number} */
  goog.lastNonModuleScriptIndex_ = 0;


  /**
   * A readystatechange handler for legacy IE
   * @param {!HTMLScriptElement} script
   * @param {number} scriptIndex
   * @return {boolean}
   * @private
   */
  goog.onScriptLoad_ = function(script, scriptIndex) {
    // for now load the modules when we reach the last script,
    // later allow more inter-mingling.
    if (script.readyState == 'complete' &&
        goog.lastNonModuleScriptIndex_ == scriptIndex) {
      goog.loadQueuedModules_();
    }
    return true;
  };

  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @param {string} pathToLoad The path from which to start discovering
   *     dependencies.
   * @private
   */
  goog.writeScripts_ = function(pathToLoad) {
    /** @type {!Array<string>} The scripts we need to write this time. */
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    /** @param {string} path */
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // We have already visited this one. We can get here if we have cyclic
      // dependencies.
      if (path in deps.visited) {
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
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

    // record that we are going to load all these scripts.
    for (var i = 0; i < scripts.length; i++) {
      var path = scripts[i];
      goog.dependencies_.written[path] = true;
    }

    // If a module is loaded synchronously then we need to
    // clear the current inModuleLoader value, and restore it when we are
    // done loading the current "requires".
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
        throw Error('Undefined script input');
      }
    }

    // restore the current "module loading state"
    goog.moduleLoaderState_ = moduleState;
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}


/**
 * Normalize a file path by removing redundant ".." and extraneous "." file
 * path components.
 * @param {string} path
 * @return {string}
 * @private
 */
goog.normalizePath_ = function(path) {
  var components = path.split('/');
  var i = 0;
  while (i < components.length) {
    if (components[i] == '.') {
      components.splice(i, 1);
    } else if (i && components[i] == '..' &&
        components[i - 1] && components[i - 1] != '..') {
      components.splice(--i, 2);
    } else {
      i++;
    }
  }
  return components.join('/');
};


/**
 * Loads file by synchronous XHR. Should not be used in production environments.
 * @param {string} src Source URL.
 * @return {string} File contents.
 * @private
 */
goog.loadFileSync_ = function(src) {
  if (goog.global.CLOSURE_LOAD_FILE_SYNC) {
    return goog.global.CLOSURE_LOAD_FILE_SYNC(src);
  } else {
    /** @type {XMLHttpRequest} */
    var xhr = new goog.global['XMLHttpRequest']();
    xhr.open('get', src, false);
    xhr.send();
    return xhr.responseText;
  }
};


/**
 * Retrieve and execute a module.
 * @param {string} src Script source URL.
 * @private
 */
goog.retrieveAndExecModule_ = function(src) {
  if (!COMPILED) {
    // The full but non-canonicalized URL for later use.
    var originalPath = src;
    // Canonicalize the path, removing any /./ or /../ since Chrome's debugging
    // console doesn't auto-canonicalize XHR loads as it does <script> srcs.
    src = goog.normalizePath_(src);

    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;

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
      throw new Error('load of ' + src + 'failed');
    }
  }
};


//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {?} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {!Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case.
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox typeof
    // behaves similarly for HTML{Applet,Embed,Object}, Elements and RegExps. We
    // would like to return object for those and we can detect an invalid
    // function by making sure that the function object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property. As a special case, a function value is not array like, because its
 * length property is fixed to correspond to the number of expected arguments.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  // We do not use goog.isObject here in order to exclude function values.
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like the
 * value needs to be an object and have a getFullYear() function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays and
 * functions.
 * @param {?} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further calls
 * with the same object as a parameter returns the same value. The unique ID is
 * guaranteed to be unique across the current session amongst objects that are
 * passed into {@code getUid}. There is no guarantee that the ID is unique or
 * consistent across sessions. It is unsafe to generate unique ID for function
 * prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Whether the given object is already assigned a unique ID.
 *
 * This does not modify the object.
 *
 * @param {!Object} obj The object to check.
 * @return {boolean} Whether there is an assigned unique id for the object.
 */
goog.hasUid = function(obj) {
  return !!obj[goog.UID_PROPERTY_];
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In IE, DOM nodes are not instances of Object and throw an exception if we
  // try to delete.  Instead we try to use removeAttribute.
  if ('removeAttribute' in /** @type {!Object} */ (obj)) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure JavaScript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' + ((Math.random() * 1e9) >>> 0);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind is
 *     deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which this should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
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


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of this 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-specified
 * ones.
 *
 * Also see: {@link #partial}.
 *
 * Usage:
 * <pre>var barMethBound = goog.bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {?function(this:T, ...)} fn A function to partially apply.
 * @param {T} selfObj Specifies the object which this should point to when the
 *     function is run.
 * @param {...*} var_args Additional arguments that are partially applied to the
 *     function.
 * @return {!Function} A partially-applied form of the function goog.bind() was
 *     invoked as a method of.
 * @template T
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default Chrome
      // extension environment. This means that for Chrome extensions, they get
      // the implementation of Function.prototype.bind that calls goog.bind
      // instead of the native one. Even worse, we don't want to introduce a
      // circular dependency between goog.bind and Function.prototype.bind, so
      // we have to hack this to make sure it works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like goog.bind(), except that a 'this object' is not required. Useful when
 * the target function is already bound.
 *
 * Usage:
 * var g = goog.partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially applied to fn.
 * @return {!Function} A partially-applied form of the function goog.partial()
 *     was invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Clone the array (with slice()) and append additional arguments
    // to the existing arguments.
    var newArgs = args.slice();
    newArgs.push.apply(newArgs, arguments);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = (goog.TRUSTED_SITE && Date.now) || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _evalTest_ = 1;');
      if (typeof goog.global['_evalTest_'] != 'undefined') {
        try {
          delete goog.global['_evalTest_'];
        } catch (ignore) {
          // Microsoft edge fails the deletion above in strict mode.
        }
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      /** @type {Document} */
      var doc = goog.global.document;
      var scriptElt = /** @type {!HTMLScriptElement} */ (
          doc.createElement('SCRIPT'));
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @private {!Object<string, string>|undefined}
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a hyphen and
 * passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which these
 * mappings are used. In the BY_PART style, each part (i.e. in between hyphens)
 * of the passed in css name is rewritten according to the map. In the BY_WHOLE
 * style, the full css name is looked up in the map directly. If a rewrite is
 * not specified by the map, the compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls to
 * goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x = 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed only the
 * modifier will be processed, as it is assumed the first argument was generated
 * as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --process_closure_primitives flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {!Object<string, string>|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Gets a localized message.
 *
 * This function is a compiler primitive. If you give the compiler a localized
 * message bundle, it will replace the string at compile-time with a localized
 * version, and expand goog.getMsg call to a concatenated string.
 *
 * Messages must be initialized in the form:
 * <code>
 * var MSG_NAME = goog.getMsg('Hello {$placeholder}', {'placeholder': 'world'});
 * </code>
 *
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object<string, string>=} opt_values Maps place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  if (opt_values) {
    str = str.replace(/\{\$([^}]+)}/g, function(match, key) {
      return (opt_values != null && key in opt_values) ?
          opt_values[key] : match;
    });
  }
  return str;
};


/**
 * Gets a localized message. If the message does not have a translation, gives a
 * fallback message.
 *
 * This is useful when introducing a new message that has not yet been
 * translated into all languages.
 *
 * This function is a compiler primitive. Must be used in the form:
 * <code>var x = goog.getMsgWithFallback(MSG_A, MSG_B);</code>
 * where MSG_A and MSG_B were initialized with goog.getMsg.
 *
 * @param {string} a The preferred message.
 * @param {string} b The fallback message.
 * @return {string} The best translated message.
 */
goog.getMsgWithFallback = function(a, b) {
  return a;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated, unless they are
 * exported in turn via this function or goog.exportProperty.
 *
 * Also handy for making public items that are defined in anonymous closures.
 *
 * ex. goog.exportSymbol('public.path.Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction', Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is goog.global.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {!Function} childCtor Child class.
 * @param {!Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  /**
   * Calls superclass constructor/method.
   *
   * This function is only available if you use goog.inherits to
   * express inheritance relationships between classes.
   *
   * NOTE: This is a replacement for goog.base and for superClass_
   * property defined in childCtor.
   *
   * @param {!Object} me Should always be "this".
   * @param {string} methodName The method name to call. Calling
   *     superclass constructor can be done with the special string
   *     'constructor'.
   * @param {...*} var_args The arguments to pass to superclass
   *     method/constructor.
   * @return {*} The return value of the superclass method/constructor.
   */
  childCtor.base = function(me, methodName, var_args) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
      args[i - 2] = arguments[i];
    }
    return parentCtor.prototype[methodName].apply(me, args);
  };
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * constructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass the name of the
 * method as the second argument to this function. If you do not, you will get a
 * runtime error. This calls the superclass' method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express inheritance
 * relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the compiler will do
 * macro expansion to remove a lot of the extra overhead that this function
 * introduces. The compiler will also enforce a lot of the assumptions that this
 * function makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 * @suppress {es5Strict} This method can not be used in strict mode, but
 *     all Closure Library consumers must depend on this file.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;

  if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
    throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
                'with strict mode code. See ' +
                'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
  }

  if (caller.superClass_) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var ctorArgs = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++) {
      ctorArgs[i - 1] = arguments[i];
    }
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(me, ctorArgs);
  }

  // Copying using loop to avoid deop due to passing arguments object to
  // function. This is faster in many JS engines as of late 2014.
  var args = new Array(arguments.length - 2);
  for (var i = 2; i < arguments.length; i++) {
    args[i - 2] = arguments[i];
  }
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain, then one of two
  // things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the aliases
 * applied.  In uncompiled code the function is simply run since the aliases as
 * written are valid JavaScript.
 *
 *
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *     (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/*
 * To support uncompiled, strict mode bundles that use eval to divide source
 * like so:
 *    eval('someSource;//# sourceUrl sourcefile.js');
 * We need to export the globally defined symbols "goog" and "COMPILED".
 * Exporting "goog" breaks the compiler optimizations, so we required that
 * be defined externally.
 * NOTE: We don't use goog.exportSymbol here because we don't want to trigger
 * extern generation when that compiler option is enabled.
 */
if (!COMPILED) {
  goog.global['COMPILED'] = COMPILED;
}


//==============================================================================
// goog.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {goog.defineClass.ClassDescriptor} def
 *     An object literal describing
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 */
goog.defineClass = function(superClass, def) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var constructor = def.constructor;
  var statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if (!constructor || constructor == Object.prototype.constructor) {
    constructor = function() {
      throw Error('cannot instantiate an interface (no constructor defined).');
    };
  }

  var cls = goog.defineClass.createSealingConstructor_(constructor, superClass);
  if (superClass) {
    goog.inherits(cls, superClass);
  }

  // Remove all the properties that should not be copied to the prototype.
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


/**
 * @typedef {
 *     !Object|
 *     {constructor:!Function}|
 *     {constructor:!Function, statics:(Object|function(Function):void)}}
 * @suppress {missingProvide}
 */
goog.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by
 * goog.defineClass should be sealed when possible.
 */
goog.define('goog.defineClass.SEAL_CLASS_INSTANCES', goog.DEBUG);


/**
 * If goog.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
goog.defineClass.createSealingConstructor_ = function(ctr, superClass) {
  if (goog.defineClass.SEAL_CLASS_INSTANCES &&
      Object.seal instanceof Function) {
    // Don't seal subclasses of unsealable-tagged legacy classes.
    if (superClass && superClass.prototype &&
        superClass.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
      return ctr;
    }
    /**
     * @this {Object}
     * @return {?}
     */
    var wrappedCtr = function() {
      // Don't seal an instance of a subclass when it calls the constructor of
      // its super class as there is most likely still setup to do.
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


// TODO(johnlenz): share these values with the goog.object
/**
 * The names of the fields that are defined on Object.prototype.
 * @type {!Array<string>}
 * @private
 * @const
 */
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


// TODO(johnlenz): share this function with the goog.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properties from.
 * @private
 */
goog.defineClass.applyProperties_ = function(target, source) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var key;
  for (key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }

  // For IE the for-in-loop does not contain any properties that are not
  // enumerable on the prototype object (for example isPrototypeOf from
  // Object.prototype) and it will also not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
  for (var i = 0; i < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; i++) {
    key = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[i];
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key];
    }
  }
};


/**
 * Sealing classes breaks the older idiom of assigning properties on the
 * prototype rather than in the constructor.  As such, goog.defineClass
 * must not seal subclasses of these old-style classes until they are fixed.
 * Until then, this marks a class as "broken", instructing defineClass
 * not to seal subclasses.
 * @param {!Function} ctr The legacy constructor to tag as unsealable.
 */
goog.tagUnsealableClass = function(ctr) {
  if (!COMPILED && goog.defineClass.SEAL_CLASS_INSTANCES) {
    ctr.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
  }
};


/**
 * Name for unsealable tag property.
 * @const @private {string}
 */
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'goog_defineClass_legacy_unsealable';

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility for fast string concatenation.
 */

goog.provide('goog.string.StringBuffer');



/**
 * Utility class to facilitate string concatenation.
 *
 * @param {*=} opt_a1 Optional first initial item to append.
 * @param {...*} var_args Other initial items to
 *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
 * @constructor
 */
goog.string.StringBuffer = function(opt_a1, var_args) {
  if (opt_a1 != null) {
    this.append.apply(this, arguments);
  }
};


/**
 * Internal buffer for the string to be concatenated.
 * @type {string}
 * @private
 */
goog.string.StringBuffer.prototype.buffer_ = '';


/**
 * Sets the contents of the string buffer object, replacing what's currently
 * there.
 *
 * @param {*} s String to set.
 */
goog.string.StringBuffer.prototype.set = function(s) {
  this.buffer_ = '' + s;
};


/**
 * Appends one or more items to the buffer.
 *
 * Calling this with null, undefined, or empty arguments is an error.
 *
 * @param {*} a1 Required first string.
 * @param {*=} opt_a2 Optional second string.
 * @param {...*} var_args Other items to append,
 *     e.g., sb.append('foo', 'bar', 'baz').
 * @return {!goog.string.StringBuffer} This same StringBuffer object.
 * @suppress {duplicate}
 */
goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
  // Use a1 directly to avoid arguments instantiation for single-arg case.
  this.buffer_ += a1;
  if (opt_a2 != null) { // second argument is undefined (null == undefined)
    for (var i = 1; i < arguments.length; i++) {
      this.buffer_ += arguments[i];
    }
  }
  return this;
};


/**
 * Clears the internal buffer.
 */
goog.string.StringBuffer.prototype.clear = function() {
  this.buffer_ = '';
};


/**
 * @return {number} the length of the current contents of the buffer.
 */
goog.string.StringBuffer.prototype.getLength = function() {
  return this.buffer_.length;
};


/**
 * @return {string} The concatenated string.
 * @override
 */
goog.string.StringBuffer.prototype.toString = function() {
  return this.buffer_;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of goog.dom.NodeType.
 */

goog.provide('goog.dom.NodeType');


/**
 * Constants for the nodeType attribute in the Node interface.
 *
 * These constants match those specified in the Node interface. These are
 * usually present on the Node object in recent browsers, but not in older
 * browsers (specifically, early IEs) and thus are given here.
 *
 * In some browsers (early IEs), these are not defined on the Node object,
 * so they are provided here.
 *
 * See http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247
 * @enum {number}
 */
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

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Attempt to ensure there is a stack trace.
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

  /**
   * Whether to report this error to the server. Setting this to false will
   * cause the error reporter to not report the error back to the server,
   * which can be useful if the client knows that the error has already been
   * logged on the server.
   * @type {boolean}
   */
  this.reportErrorToServer = true;
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 * @author arv@google.com (Erik Arvidsson)
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * @define {boolean} Enables HTML escaping of lowercase letter "e" which helps
 * with detection of double-escaping as this letter is frequently used.
 */
goog.define('goog.string.DETECT_DOUBLE_ESCAPING', false);


/**
 * @define {boolean} Whether to force non-dom html unescaping.
 */
goog.define('goog.string.FORCE_NON_DOM_HTML_UNESCAPING', false);


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Case-insensitive equality checker.
 * @param {string} str1 First string to check.
 * @param {string} str2 Second string to check.
 * @return {boolean} True if {@code str1} and {@code str2} are the same string,
 *     ignoring case.
 */
goog.string.caseInsensitiveEquals = function(str1, str2) {
  return str1.toLowerCase() == str2.toLowerCase();
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  var splitParts = str.split('%s');
  var returnString = '';

  var subsArguments = Array.prototype.slice.call(arguments, 1);
  while (subsArguments.length &&
         // Replace up to the last split part. We are inserting in the
         // positions between split parts.
         splitParts.length > 1) {
    returnString += splitParts.shift() + subsArguments.shift();
  }

  return returnString + splitParts.join('%s'); // Join unused '%s'
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmptyOrWhitespace = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is empty.
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty.
 */
goog.string.isEmptyString = function(str) {
  return str.length == 0;
};


/**
 * Checks if a string is empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespace.
 *
 * @param {string} str The string to check.
 * @return {boolean} Whether {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = goog.string.isEmptyOrWhitespace;


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 * @deprecated Use goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str))
 *     instead.
 */
goog.string.isEmptyOrWhitespaceSafe = function(str) {
  return goog.string.isEmptyOrWhitespace(goog.string.makeSafe(str));
};


/**
 * Checks if a string is null, undefined, empty or contains only whitespaces.
 *
 * TODO(user): Deprecate this when clients have been switched over to
 * goog.string.isEmptyOrWhitespaceSafe.
 *
 * @param {*} str The string to check.
 * @return {boolean} Whether {@code str} is null, undefined, empty, or
 *     whitespace only.
 */
goog.string.isEmptySafe = goog.string.isEmptyOrWhitespaceSafe;


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {@code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = (goog.TRUSTED_SITE && String.prototype.trim) ?
    function(str) {
      return str.trim();
    } :
    function(str) {
      // Since IE doesn't include non-breaking-space (0xa0) in their \s
      // character class (as required by section 7.2 of the ECMAScript spec),
      // we explicitly include it in the regexp to enforce consistent
      // cross-browser behavior.
      return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    };


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
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


/**
 * Compares two strings interpreting their numeric substrings as numbers.
 *
 * @param {string} str1 First string.
 * @param {string} str2 Second string.
 * @param {!RegExp} tokenizerRegExp Splits a string into substrings of
 *     non-negative integers, non-numeric characters and optionally fractional
 *     numbers starting with a decimal point.
 * @return {number} Negative if str1 < str2, 0 is str1 == str2, positive if
 *     str1 > str2.
 * @private
 */
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

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(tokenizerRegExp);
  var tokens2 = str2.toLowerCase().match(tokenizerRegExp);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {
      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
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

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII string
  // comparison to stabilize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * String comparison function that handles non-negative integer numbers in a
 * way humans might expect. Using this function, the string 'File 2.jpg' sorts
 * before 'File 10.jpg', and 'Version 1.9' before 'Version 1.10'. The comparison
 * is mostly case-insensitive, though strings that are identical except for case
 * are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is up to 50x slower than either the default or the
 * case-insensitive compare. It should not be used in time-critical code, but
 * should be fast enough to sort several hundred short strings (like filenames)
 * with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.intAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\D+/g);
};


/**
 * String comparison function that handles non-negative integer and fractional
 * numbers in a way humans might expect. Using this function, the string
 * 'File 2.jpg' sorts before 'File 10.jpg', and '3.14' before '3.2'. Equivalent
 * to {@link goog.string.intAwareCompare} apart from the way how it interprets
 * dots.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.floatAwareCompare = function(str1, str2) {
  return goog.string.numberAwareCompare_(str1, str2, /\d+|\.\d+|\D+/g);
};


/**
 * Alias for {@link goog.string.floatAwareCompare}.
 *
 * @param {string} str1
 * @param {string} str2
 * @return {number}
 */
goog.string.numerateCompare = goog.string.floatAwareCompare;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escapes double quote '"' and single quote '\'' characters in addition to
 * '&', '<', and '>' so that a string can be included in an HTML tag attribute
 * value within double or single quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * With goog.string.DETECT_DOUBLE_ESCAPING, this function escapes also the
 * lowercase letter "e".
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    str = str.replace(goog.string.AMP_RE_, '&amp;')
          .replace(goog.string.LT_RE_, '&lt;')
          .replace(goog.string.GT_RE_, '&gt;')
          .replace(goog.string.QUOT_RE_, '&quot;')
          .replace(goog.string.SINGLE_QUOTE_RE_, '&#39;')
          .replace(goog.string.NULL_RE_, '&#0;');
    if (goog.string.DETECT_DOUBLE_ESCAPING) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.ALL_RE_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.AMP_RE_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.LT_RE_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.GT_RE_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.QUOT_RE_, '&quot;');
    }
    if (str.indexOf('\'') != -1) {
      str = str.replace(goog.string.SINGLE_QUOTE_RE_, '&#39;');
    }
    if (str.indexOf('\x00') != -1) {
      str = str.replace(goog.string.NULL_RE_, '&#0;');
    }
    if (goog.string.DETECT_DOUBLE_ESCAPING && str.indexOf('e') != -1) {
      str = str.replace(goog.string.E_RE_, '&#101;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.AMP_RE_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.LT_RE_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.GT_RE_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.QUOT_RE_ = /"/g;


/**
 * Regular expression that matches a single quote, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.SINGLE_QUOTE_RE_ = /'/g;


/**
 * Regular expression that matches null character, for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.NULL_RE_ = /\x00/g;


/**
 * Regular expression that matches a lowercase letter "e", for use in escaping.
 * @const {!RegExp}
 * @private
 */
goog.string.E_RE_ = /e/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @const {!RegExp}
 * @private
 */
goog.string.ALL_RE_ = (goog.string.DETECT_DOUBLE_ESCAPING ?
    /[\x00&<>"'e]/ :
    /[\x00&<>"']/);


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one or we explicitly
    // requested non-DOM html unescaping.
    if (!goog.string.FORCE_NON_DOM_HTML_UNESCAPING &&
        'document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes a HTML string using the provided document.
 *
 * @param {string} str The string to unescape.
 * @param {!Document} document A document to use in escaping the string.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntitiesWithDocument = function(str, document) {
  if (goog.string.contains(str, '&')) {
    return goog.string.unescapeEntitiesUsingDom_(str, document);
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @param {Document=} opt_document An optional document to use for creating
 *     elements. If this is not specified then the default window.document
 *     will be used.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str, opt_document) {
  /** @type {!Object<string, string>} */
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div;
  if (opt_document) {
    div = opt_document.createElement('div');
  } else {
    div = goog.global.document.createElement('div');
  }
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  // This doesn't use goog.string.preserveSpaces for backwards compatibility.
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Preserve spaces that would be otherwise collapsed in HTML by replacing them
 * with non-breaking space Unicode characters.
 * @param {string} str The string in which to preserve whitespace.
 * @return {string} A copy of {@code str} with preserved whitespace.
 */
goog.string.preserveSpaces = function(str) {
  return str.replace(/(^|[\n ]) /g, '$1' + goog.string.Unicode.NBSP);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
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


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private {!Object<string, string>}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\',
  // To support the use case of embedding quoted strings inside of script
  // tags, we have to make sure HTML comments and opening/closing script tags do
  // not appear in the resulting string. The specific strings that must be
  // escaped are documented at:
  // http://www.w3.org/TR/html51/semantics.html#restrictions-for-contents-of-script-elements
  '<': '\x3c'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private {!Object<string, string>}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string. The resulting string is safe to embed in
 * `<script>` tags as "<" is escaped.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  var sb = ['"'];
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i);
    var cc = ch.charCodeAt(0);
    sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
                ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
  }
  sb.push('"');
  return sb.join('');
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
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
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Determines whether a string contains a substring.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.contains = function(str, subString) {
  return str.indexOf(subString) != -1;
};


/**
 * Determines whether a string contains a substring, ignoring case.
 * @param {string} str The string to search.
 * @param {string} subString The substring to search for.
 * @return {boolean} Whether {@code str} contains {@code subString}.
 */
goog.string.caseInsensitiveContains = function(str, subString) {
  return goog.string.contains(str.toLowerCase(), subString.toLowerCase());
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = (String.prototype.repeat) ?
    function(string, length) {
      // The native method is over 100 times faster than the alternative.
      return string.repeat(length);
    } :
    function(string, length) {
      return new Array(length + 1).join(string);
    };


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    // Normalize to 4 byte range, 0 ... 2^32.
    result = (31 * result + str.charCodeAt(i)) >>> 0;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Infinity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmptyOrWhitespace(str)) {
    return NaN;
  }
  return num;
};


/**
 * Returns whether the given string is lower camel case (e.g. "isFooBar").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is lower camel case.
 */
goog.string.isLowerCamelCase = function(str) {
  return /^[a-z]+([A-Z][a-z]*)*$/.test(str);
};


/**
 * Returns whether the given string is upper camel case (e.g. "FooBarBaz").
 *
 * Note that this assumes the string is entirely letters.
 * @see http://en.wikipedia.org/wiki/CamelCase#Variations_and_synonyms
 *
 * @param {string} str String to test.
 * @return {boolean} Whether the string is upper camel case.
 */
goog.string.isUpperCamelCase = function(str) {
  return /^([A-Z][a-z]*)+$/.test(str);
};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};


/**
 * Converts a string into TitleCase. First character of the string is always
 * capitalized in addition to the first letter of every subsequent word.
 * Words are delimited by one or more whitespaces by default. Custom delimiters
 * can optionally be specified to replace the default, which doesn't preserve
 * whitespace delimiters and instead must be explicitly included if needed.
 *
 * Default delimiter => " ":
 *    goog.string.toTitleCase('oneTwoThree')    => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three')  => 'One Two Three'
 *    goog.string.toTitleCase('  one   two   ') => '  One   Two   '
 *    goog.string.toTitleCase('one_two_three')  => 'One_two_three'
 *    goog.string.toTitleCase('one-two-three')  => 'One-two-three'
 *
 * Custom delimiter => "_-.":
 *    goog.string.toTitleCase('oneTwoThree', '_-.')       => 'OneTwoThree'
 *    goog.string.toTitleCase('one two three', '_-.')     => 'One two three'
 *    goog.string.toTitleCase('  one   two   ', '_-.')    => '  one   two   '
 *    goog.string.toTitleCase('one_two_three', '_-.')     => 'One_Two_Three'
 *    goog.string.toTitleCase('one-two-three', '_-.')     => 'One-Two-Three'
 *    goog.string.toTitleCase('one...two...three', '_-.') => 'One...Two...Three'
 *    goog.string.toTitleCase('one. two. three', '_-.')   => 'One. two. three'
 *    goog.string.toTitleCase('one-two.three', '_-.')     => 'One-Two.Three'
 *
 * @param {string} str String value in camelCase form.
 * @param {string=} opt_delimiters Custom delimiter character set used to
 *      distinguish words in the string value. Each character represents a
 *      single delimiter. When provided, default whitespace delimiter is
 *      overridden and must be explicitly included if needed.
 * @return {string} String value in TitleCase form.
 */
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';

  // For IE8, we need to prevent using an empty character set. Otherwise,
  // incorrect matching will occur.
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';

  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};


/**
 * Capitalizes a string, i.e. converts the first letter to uppercase
 * and all other letters to lowercase, e.g.:
 *
 * goog.string.capitalize('one')     => 'One'
 * goog.string.capitalize('ONE')     => 'One'
 * goog.string.capitalize('one two') => 'One two'
 *
 * Note that this function does not trim initial whitespace.
 *
 * @param {string} str String value to capitalize.
 * @return {string} String value with first letter in uppercase.
 */
goog.string.capitalize = function(str) {
  return String(str.charAt(0)).toUpperCase() +
      String(str.substr(1)).toLowerCase();
};


/**
 * Parse a string in decimal or hexidecimal ('0xFFFF') form.
 *
 * To parse a particular radix, please use parseInt(string, radix) directly. See
 * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/parseInt
 *
 * This is a wrapper for the built-in parseInt function that will only parse
 * numbers as base 10 or base 16.  Some JS implementations assume strings
 * starting with "0" are intended to be octal. ES3 allowed but discouraged
 * this behavior. ES5 forbids it.  This function emulates the ES5 behavior.
 *
 * For more information, see Mozilla JS Reference: http://goo.gl/8RiFj
 *
 * @param {string|number|null|undefined} value The value to be parsed.
 * @return {number} The number, parsed. If the string failed to parse, this
 *     will be NaN.
 */
goog.string.parseInt = function(value) {
  // Force finite numbers to strings.
  if (isFinite(value)) {
    value = String(value);
  }

  if (goog.isString(value)) {
    // If the string starts with '0x' or '-0x', parse as hex.
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }

  return NaN;
};


/**
 * Splits a string on a separator a limited number of times.
 *
 * This implementation is more similar to Python or Java, where the limit
 * parameter specifies the maximum number of splits rather than truncating
 * the number of results.
 *
 * See http://docs.python.org/2/library/stdtypes.html#str.split
 * See JavaDoc: http://goo.gl/F2AsY
 * See Mozilla reference: http://goo.gl/dZdZs
 *
 * @param {string} str String to split.
 * @param {string} separator The separator.
 * @param {number} limit The limit to the number of splits. The resulting array
 *     will have a maximum length of limit+1.  Negative numbers are the same
 *     as zero.
 * @return {!Array<string>} The string, split.
 */

goog.string.splitLimit = function(str, separator, limit) {
  var parts = str.split(separator);
  var returnVal = [];

  // Only continue doing this while we haven't hit the limit and we have
  // parts left.
  while (limit > 0 && parts.length) {
    returnVal.push(parts.shift());
    limit--;
  }

  // If there are remaining parts, append them to the end.
  if (parts.length) {
    returnVal.push(parts.join(separator));
  }

  return returnVal;
};


/**
 * Computes the Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @return {number} The edit distance between the two strings.
 */
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
      // Cost for the substring is the minimum of adding one character, removing
      // one character, or a swap.
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }

    for (var j = 0; j < v0.length; j++) {
      v0[j] = v1[j];
    }
  }

  return v1[b.length];
};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.dom.NodeType');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.define('goog.asserts.ENABLE_ASSERTS', goog.DEBUG);



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 * @final
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permanently modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * The default error handler.
 * @param {!goog.asserts.AssertionError} e The exception to be handled.
 */
goog.asserts.DEFAULT_ERROR_HANDLER = function(e) { throw e; };


/**
 * The handler responsible for throwing or logging assertion errors.
 * @private {function(!goog.asserts.AssertionError)}
 */
goog.asserts.errorHandler_ = goog.asserts.DEFAULT_ERROR_HANDLER;


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  var e = new goog.asserts.AssertionError('' + message, args || []);
  goog.asserts.errorHandler_(e);
};


/**
 * Sets a custom error handler that can be used to customize the behavior of
 * assertion failures, for example by turning all assertion failures into log
 * messages.
 * @param {function(!goog.asserts.AssertionError)} errorHandler
 */
goog.asserts.setErrorHandler = function(errorHandler) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_ = errorHandler;
  }
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @template T
 * @param {T} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {T} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    goog.asserts.errorHandler_(new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1)));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array<?>} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array<?>} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is a DOM Element if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Element} The value, likely to be a DOM Element when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not an Element.
 */
goog.asserts.assertElement = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && (!goog.isObject(value) ||
      value.nodeType != goog.dom.NodeType.ELEMENT)) {
    goog.asserts.doAssertFailure_('Expected Element but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Element} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 *
 * The compiler may tighten the type returned by this function.
 *
 * @param {?} value The value to check.
 * @param {function(new: T, ...)} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 * @return {T}
 * @template T
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('Expected instanceof %s but got %s.',
        [goog.asserts.getType_(type), goog.asserts.getType_(value)],
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return value;
};


/**
 * Checks that no enumerable keys are present in Object.prototype. Such keys
 * would break most code that use {@code for (var ... in ...)} loops.
 */
goog.asserts.assertObjectPrototypeIsIntact = function() {
  for (var key in Object.prototype) {
    goog.asserts.fail(key + ' should not be enumerable in Object.prototype.');
  }
};


/**
 * Returns the type of a value. If a constructor is passed, and a suitable
 * string cannot be found, 'unknown type name' will be returned.
 * @param {*} value A constructor, object, or primitive.
 * @return {string} The best display name for the value, or 'unknown type name'.
 * @private
 */
goog.asserts.getType_ = function(value) {
  if (value instanceof Function) {
    return value.displayName || value.name || 'unknown type name';
  } else if (value instanceof Object) {
    return value.constructor.displayName || value.constructor.name ||
        Object.prototype.toString.call(value);
  } else {
    return value === null ? 'null' : typeof value;
  }
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.string.TypedString');



/**
 * Wrapper for strings that conform to a data type or language.
 *
 * Implementations of this interface are wrappers for strings, and typically
 * associate a type contract with the wrapped string.  Concrete implementations
 * of this interface may choose to implement additional run-time type checking,
 * see for example {@code goog.html.SafeHtml}. If available, client code that
 * needs to ensure type membership of an object should use the type's function
 * to assert type membership, such as {@code goog.html.SafeHtml.unwrap}.
 * @interface
 */
goog.string.TypedString = function() {};


/**
 * Interface marker of the TypedString interface.
 *
 * This property can be used to determine at runtime whether or not an object
 * implements this interface.  All implementations of this interface set this
 * property to {@code true}.
 * @type {boolean}
 */
goog.string.TypedString.prototype.implementsGoogStringTypedString;


/**
 * Retrieves this wrapped string's value.
 * @return {!string} The wrapped string's value.
 */
goog.string.TypedString.prototype.getTypedStringValue;

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.string.Const');

goog.require('goog.asserts');
goog.require('goog.string.TypedString');



/**
 * Wrapper for compile-time-constant strings.
 *
 * Const is a wrapper for strings that can only be created from program
 * constants (i.e., string literals).  This property relies on a custom Closure
 * compiler check that {@code goog.string.Const.from} is only invoked on
 * compile-time-constant expressions.
 *
 * Const is useful in APIs whose correct and secure use requires that certain
 * arguments are not attacker controlled: Compile-time constants are inherently
 * under the control of the application and not under control of external
 * attackers, and hence are safe to use in such contexts.
 *
 * Instances of this type must be created via its factory method
 * {@code goog.string.Const.from} and not by invoking its constructor.  The
 * constructor intentionally takes no parameters and the type is immutable;
 * hence only a default instance corresponding to the empty string can be
 * obtained via constructor invocation.
 *
 * @see goog.string.Const#from
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.string.Const = function() {
  /**
   * The wrapped value of this Const object.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.string.Const#unwrap
   * @const
   * @private
   */
  this.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ =
      goog.string.Const.TYPE_MARKER_;
};


/**
 * @override
 * @const
 */
goog.string.Const.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this Const's value a string.
 *
 * IMPORTANT: In code where it is security-relevant that an object's type is
 * indeed {@code goog.string.Const}, use {@code goog.string.Const.unwrap}
 * instead of this method.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.getTypedStringValue = function() {
  return this.stringConstValueWithSecurityContract__googStringSecurityPrivate_;
};


/**
 * Returns a debug-string representation of this value.
 *
 * To obtain the actual string value wrapped inside an object of this type,
 * use {@code goog.string.Const.unwrap}.
 *
 * @see goog.string.Const#unwrap
 * @override
 */
goog.string.Const.prototype.toString = function() {
  return 'Const{' +
         this.stringConstValueWithSecurityContract__googStringSecurityPrivate_ +
         '}';
};


/**
 * Performs a runtime check that the provided object is indeed an instance
 * of {@code goog.string.Const}, and returns its value.
 * @param {!goog.string.Const} stringConst The object to extract from.
 * @return {string} The Const object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.string.Const.unwrap = function(stringConst) {
  // Perform additional run-time type-checking to ensure that stringConst is
  // indeed an instance of the expected type.  This provides some additional
  // protection against security bugs due to application code that disables type
  // checks.
  if (stringConst instanceof goog.string.Const &&
      stringConst.constructor === goog.string.Const &&
      stringConst.STRING_CONST_TYPE_MARKER__GOOG_STRING_SECURITY_PRIVATE_ ===
          goog.string.Const.TYPE_MARKER_) {
    return stringConst.
        stringConstValueWithSecurityContract__googStringSecurityPrivate_;
  } else {
    goog.asserts.fail('expected object of type Const, got \'' +
                      stringConst + '\'');
    return 'type_error:Const';
  }
};


/**
 * Creates a Const object from a compile-time constant string.
 *
 * It is illegal to invoke this function on an expression whose
 * compile-time-contant value cannot be determined by the Closure compiler.
 *
 * Correct invocations include,
 * <pre>
 *   var s = goog.string.Const.from('hello');
 *   var t = goog.string.Const.from('hello' + 'world');
 * </pre>
 *
 * In contrast, the following are illegal:
 * <pre>
 *   var s = goog.string.Const.from(getHello());
 *   var t = goog.string.Const.from('hello' + world);
 * </pre>
 *
 * TODO(xtof): Compile-time checks that this function is only called
 * with compile-time constant expressions.
 *
 * @param {string} s A constant string from which to create a Const.
 * @return {!goog.string.Const} A Const object initialized to stringConst.
 */
goog.string.Const.from = function(s) {
  return goog.string.Const.create__googStringSecurityPrivate_(s);
};


/**
 * Type marker for the Const type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.string.Const.TYPE_MARKER_ = {};


/**
 * Utility method to create Const instances.
 * @param {string} s The string to initialize the Const object with.
 * @return {!goog.string.Const} The initialized Const object.
 * @private
 */
goog.string.Const.create__googStringSecurityPrivate_ = function(s) {
  var stringConst = new goog.string.Const();
  stringConst.stringConstValueWithSecurityContract__googStringSecurityPrivate_ =
      s;
  return stringConst;
};

// Copyright 2015 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Wrapper for URL and its createObjectUrl and revokeObjectUrl
 * methods that are part of the HTML5 File API.
 */

goog.provide('goog.fs.url');


/**
 * Creates a blob URL for a blob object.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {!Blob} blob The object for which to create the URL.
 * @return {string} The URL for the object.
 */
goog.fs.url.createObjectUrl = function(blob) {
  return goog.fs.url.getUrlObject_().createObjectURL(blob);
};


/**
 * Revokes a URL created by {@link goog.fs.url.createObjectUrl}.
 * Throws an error if the browser does not support Object Urls.
 *
 * @param {string} url The URL to revoke.
 */
goog.fs.url.revokeObjectUrl = function(url) {
  goog.fs.url.getUrlObject_().revokeObjectURL(url);
};


/**
 * @typedef {{createObjectURL: (function(!Blob): string),
 *            revokeObjectURL: function(string): void}}
 */
goog.fs.url.UrlObject_;


/**
 * Get the object that has the createObjectURL and revokeObjectURL functions for
 * this browser.
 *
 * @return {goog.fs.url.UrlObject_} The object for this browser.
 * @private
 */
goog.fs.url.getUrlObject_ = function() {
  var urlObject = goog.fs.url.findUrlObject_();
  if (urlObject != null) {
    return urlObject;
  } else {
    throw Error('This browser doesn\'t seem to support blob URLs');
  }
};


/**
 * Finds the object that has the createObjectURL and revokeObjectURL functions
 * for this browser.
 *
 * @return {?goog.fs.url.UrlObject_} The object for this browser or null if the
 *     browser does not support Object Urls.
 * @suppress {unnecessaryCasts} Depending on how the code is compiled, casting
 *     goog.global to UrlObject_ may result in unnecessary cast warning.
 *     However, the cast cannot be removed because with different set of
 *     compiler flags, the cast is indeed necessary.  As such, silencing it.
 * @private
 */
goog.fs.url.findUrlObject_ = function() {
  // This is what the spec says to do
  // http://dev.w3.org/2006/webapi/FileAPI/#dfn-createObjectURL
  if (goog.isDef(goog.global.URL) &&
      goog.isDef(goog.global.URL.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global.URL);
  // This is what Chrome does (as of 10.0.648.6 dev)
  } else if (goog.isDef(goog.global.webkitURL) &&
             goog.isDef(goog.global.webkitURL.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global.webkitURL);
  // This is what the spec used to say to do
  } else if (goog.isDef(goog.global.createObjectURL)) {
    return /** @type {goog.fs.url.UrlObject_} */ (goog.global);
  } else {
    return null;
  }
};


/**
 * Checks whether this browser supports Object Urls. If not, calls to
 * createObjectUrl and revokeObjectUrl will result in an error.
 *
 * @return {boolean} True if this browser supports Object Urls.
 */
goog.fs.url.browserSupportsObjectUrls = function() {
  return goog.fs.url.findUrlObject_() != null;
};

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility functions for supporting Bidi issues.
 */


/**
 * Namespace for bidi supporting functions.
 */
goog.provide('goog.i18n.bidi');
goog.provide('goog.i18n.bidi.Dir');
goog.provide('goog.i18n.bidi.DirectionalString');
goog.provide('goog.i18n.bidi.Format');


/**
 * @define {boolean} FORCE_RTL forces the {@link goog.i18n.bidi.IS_RTL} constant
 * to say that the current locale is a RTL locale.  This should only be used
 * if you want to override the default behavior for deciding whether the
 * current locale is RTL or not.
 *
 * {@see goog.i18n.bidi.IS_RTL}
 */
goog.define('goog.i18n.bidi.FORCE_RTL', false);


/**
 * Constant that defines whether or not the current locale is a RTL locale.
 * If {@link goog.i18n.bidi.FORCE_RTL} is not true, this constant will default
 * to check that {@link goog.LOCALE} is one of a few major RTL locales.
 *
 * <p>This is designed to be a maximally efficient compile-time constant. For
 * example, for the default goog.LOCALE, compiling
 * "if (goog.i18n.bidi.IS_RTL) alert('rtl') else {}" should produce no code. It
 * is this design consideration that limits the implementation to only
 * supporting a few major RTL locales, as opposed to the broader repertoire of
 * something like goog.i18n.bidi.isRtlLanguage.
 *
 * <p>Since this constant refers to the directionality of the locale, it is up
 * to the caller to determine if this constant should also be used for the
 * direction of the UI.
 *
 * {@see goog.LOCALE}
 *
 * @type {boolean}
 *
 * TODO(user): write a test that checks that this is a compile-time constant.
 */
goog.i18n.bidi.IS_RTL = goog.i18n.bidi.FORCE_RTL ||
    (
        (goog.LOCALE.substring(0, 2).toLowerCase() == 'ar' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'fa' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'he' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'iw' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'ps' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'sd' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'ug' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'ur' ||
         goog.LOCALE.substring(0, 2).toLowerCase() == 'yi') &&
        (goog.LOCALE.length == 2 ||
         goog.LOCALE.substring(2, 3) == '-' ||
         goog.LOCALE.substring(2, 3) == '_')
    ) || (
        goog.LOCALE.length >= 3 &&
        goog.LOCALE.substring(0, 3).toLowerCase() == 'ckb' &&
        (goog.LOCALE.length == 3 ||
         goog.LOCALE.substring(3, 4) == '-' ||
         goog.LOCALE.substring(3, 4) == '_')
    );


/**
 * Unicode formatting characters and directionality string constants.
 * @enum {string}
 */
goog.i18n.bidi.Format = {
  /** Unicode "Left-To-Right Embedding" (LRE) character. */
  LRE: '\u202A',
  /** Unicode "Right-To-Left Embedding" (RLE) character. */
  RLE: '\u202B',
  /** Unicode "Pop Directional Formatting" (PDF) character. */
  PDF: '\u202C',
  /** Unicode "Left-To-Right Mark" (LRM) character. */
  LRM: '\u200E',
  /** Unicode "Right-To-Left Mark" (RLM) character. */
  RLM: '\u200F'
};


/**
 * Directionality enum.
 * @enum {number}
 */
goog.i18n.bidi.Dir = {
  /**
   * Left-to-right.
   */
  LTR: 1,

  /**
   * Right-to-left.
   */
  RTL: -1,

  /**
   * Neither left-to-right nor right-to-left.
   */
  NEUTRAL: 0
};


/**
 * 'right' string constant.
 * @type {string}
 */
goog.i18n.bidi.RIGHT = 'right';


/**
 * 'left' string constant.
 * @type {string}
 */
goog.i18n.bidi.LEFT = 'left';


/**
 * 'left' if locale is RTL, 'right' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_RIGHT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.LEFT :
    goog.i18n.bidi.RIGHT;


/**
 * 'right' if locale is RTL, 'left' if not.
 * @type {string}
 */
goog.i18n.bidi.I18N_LEFT = goog.i18n.bidi.IS_RTL ? goog.i18n.bidi.RIGHT :
    goog.i18n.bidi.LEFT;


/**
 * Convert a directionality given in various formats to a goog.i18n.bidi.Dir
 * constant. Useful for interaction with different standards of directionality
 * representation.
 *
 * @param {goog.i18n.bidi.Dir|number|boolean|null} givenDir Directionality given
 *     in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LTR, negative = RTL, 0 = neutral).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 * @param {boolean=} opt_noNeutral Whether a givenDir of zero or
 *     goog.i18n.bidi.Dir.NEUTRAL should be treated as null, i.e. unknown, in
 *     order to preserve legacy behavior.
 * @return {?goog.i18n.bidi.Dir} A goog.i18n.bidi.Dir constant matching the
 *     given directionality. If given null, returns null (i.e. unknown).
 */
goog.i18n.bidi.toDir = function(givenDir, opt_noNeutral) {
  if (typeof givenDir == 'number') {
    // This includes the non-null goog.i18n.bidi.Dir case.
    return givenDir > 0 ? goog.i18n.bidi.Dir.LTR :
        givenDir < 0 ? goog.i18n.bidi.Dir.RTL :
        opt_noNeutral ? null : goog.i18n.bidi.Dir.NEUTRAL;
  } else if (givenDir == null) {
    return null;
  } else {
    // Must be typeof givenDir == 'boolean'.
    return givenDir ? goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR;
  }
};


/**
 * A practical pattern to identify strong LTR characters. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.ltrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified
 * for performance and small code size.
 * @type {string}
 * @private
 */
goog.i18n.bidi.rtlChars_ =
    '\u0591-\u06EF\u06FA-\u07FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFC';


/**
 * Simplified regular expression for an HTML tag (opening or closing) or an HTML
 * escape. We might want to skip over such expressions when estimating the text
 * directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.htmlSkipReg_ = /<[^>]*>|&[^;]+;/g;


/**
 * Returns the input text with spaces instead of HTML tags or HTML escapes, if
 * opt_isStripNeeded is true. Else returns the input as is.
 * Useful for text directionality estimation.
 * Note: the function should not be used in other contexts; it is not 100%
 * correct, but rather a good-enough implementation for directionality
 * estimation purposes.
 * @param {string} str The given string.
 * @param {boolean=} opt_isStripNeeded Whether to perform the stripping.
 *     Default: false (to retain consistency with calling functions).
 * @return {string} The given string cleaned of HTML tags / escapes.
 * @private
 */
goog.i18n.bidi.stripHtmlIfNeeded_ = function(str, opt_isStripNeeded) {
  return opt_isStripNeeded ? str.replace(goog.i18n.bidi.htmlSkipReg_, '') :
      str;
};


/**
 * Regular expression to check for RTL characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlCharReg_ = new RegExp('[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Regular expression to check for LTR characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrCharReg_ = new RegExp('[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains RTL characters.
 */
goog.i18n.bidi.hasAnyRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Test whether the given string has any RTL characters in it.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the string contains RTL characters.
 * @deprecated Use hasAnyRtl.
 */
goog.i18n.bidi.hasRtlChar = goog.i18n.bidi.hasAnyRtl;


/**
 * Test whether the given string has any LTR characters in it.
 * @param {string} str The given string that need to be tested.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether the string contains LTR characters.
 */
goog.i18n.bidi.hasAnyLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrCharReg_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Regular expression pattern to check if the first character in the string
 * is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrRe_ = new RegExp('^[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expression pattern to check if the first character in the string
 * is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlRe_ = new RegExp('^[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check if the first character in the string is RTL or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an RTL char.
 */
goog.i18n.bidi.isRtlChar = function(str) {
  return goog.i18n.bidi.rtlRe_.test(str);
};


/**
 * Check if the first character in the string is LTR or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is an LTR char.
 */
goog.i18n.bidi.isLtrChar = function(str) {
  return goog.i18n.bidi.ltrRe_.test(str);
};


/**
 * Check if the first character in the string is neutral or not.
 * @param {string} str The given string that need to be tested.
 * @return {boolean} Whether the first character in str is a neutral char.
 */
goog.i18n.bidi.isNeutralChar = function(str) {
  return !goog.i18n.bidi.isLtrChar(str) && !goog.i18n.bidi.isRtlChar(str);
};


/**
 * Regular expressions to check if a piece of text is of LTR directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.rtlChars_ + ']*[' + goog.i18n.bidi.ltrChars_ + ']');


/**
 * Regular expressions to check if a piece of text is of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlDirCheckRe_ = new RegExp(
    '^[^' + goog.i18n.bidi.ltrChars_ + ']*[' + goog.i18n.bidi.rtlChars_ + ']');


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithRtl.
 */
goog.i18n.bidi.isRtlText = goog.i18n.bidi.startsWithRtl;


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 */
goog.i18n.bidi.startsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrDirCheckRe_.test(goog.i18n.bidi.stripHtmlIfNeeded_(
      str, opt_isHtml));
};


/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 * @deprecated Use startsWithLtr.
 */
goog.i18n.bidi.isLtrText = goog.i18n.bidi.startsWithLtr;


/**
 * Regular expression to check if a string looks like something that must
 * always be LTR even in RTL text, e.g. a URL. When estimating the
 * directionality of text containing these, we treat these as weakly LTR,
 * like numbers.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.isRequiredLtrRe_ = /^http:\/\/.*/;


/**
 * Check whether the input string either contains no strongly directional
 * characters or looks like a url.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether neutral directionality is detected.
 */
goog.i18n.bidi.isNeutralText = function(str, opt_isHtml) {
  str = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml);
  return goog.i18n.bidi.isRequiredLtrRe_.test(str) ||
      !goog.i18n.bidi.hasAnyLtr(str) && !goog.i18n.bidi.hasAnyRtl(str);
};


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is LTR.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.ltrExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.ltrChars_ + '][^' + goog.i18n.bidi.rtlChars_ + ']*$');


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is RTL.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlExitDirCheckRe_ = new RegExp(
    '[' + goog.i18n.bidi.rtlChars_ + '][^' + goog.i18n.bidi.ltrChars_ + ']*$');


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 */
goog.i18n.bidi.endsWithLtr = function(str, opt_isHtml) {
  return goog.i18n.bidi.ltrExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 * @deprecated Use endsWithLtr.
 */
goog.i18n.bidi.isLtrExitText = goog.i18n.bidi.endsWithLtr;


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 */
goog.i18n.bidi.endsWithRtl = function(str, opt_isHtml) {
  return goog.i18n.bidi.rtlExitDirCheckRe_.test(
      goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml));
};


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str String being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 * @deprecated Use endsWithRtl.
 */
goog.i18n.bidi.isRtlExitText = goog.i18n.bidi.endsWithRtl;


/**
 * A regular expression for matching right-to-left language codes.
 * See {@link #isRtlLanguage} for the design.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rtlLocalesRe_ = new RegExp(
    '^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|' +
    '.*[-_](Arab|Hebr|Thaa|Nkoo|Tfng))' +
    '(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)',
    'i');


/**
 * Check if a BCP 47 / III language code indicates an RTL language, i.e. either:
 * - a language code explicitly specifying one of the right-to-left scripts,
 *   e.g. "az-Arab", or<p>
 * - a language code specifying one of the languages normally written in a
 *   right-to-left script, e.g. "fa" (Farsi), except ones explicitly specifying
 *   Latin or Cyrillic script (which are the usual LTR alternatives).<p>
 * The list of right-to-left scripts appears in the 100-199 range in
 * http://www.unicode.org/iso15924/iso15924-num.html, of which Arabic and
 * Hebrew are by far the most widely used. We also recognize Thaana, N'Ko, and
 * Tifinagh, which also have significant modern usage. The rest (Syriac,
 * Samaritan, Mandaic, etc.) seem to have extremely limited or no modern usage
 * and are not recognized to save on code size.
 * The languages usually written in a right-to-left script are taken as those
 * with Suppress-Script: Hebr|Arab|Thaa|Nkoo|Tfng  in
 * http://www.iana.org/assignments/language-subtag-registry,
 * as well as Central (or Sorani) Kurdish (ckb), Sindhi (sd) and Uyghur (ug).
 * Other subtags of the language code, e.g. regions like EG (Egypt), are
 * ignored.
 * @param {string} lang BCP 47 (a.k.a III) language code.
 * @return {boolean} Whether the language code is an RTL language.
 */
goog.i18n.bidi.isRtlLanguage = function(lang) {
  return goog.i18n.bidi.rtlLocalesRe_.test(lang);
};


/**
 * Regular expression for bracket guard replacement in html.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.bracketGuardHtmlRe_ =
    /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(&lt;.*?(&gt;)+)/g;


/**
 * Regular expression for bracket guard replacement in text.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.bracketGuardTextRe_ =
    /(\(.*?\)+)|(\[.*?\]+)|(\{.*?\}+)|(<.*?>+)/g;


/**
 * Apply bracket guard using html span tag. This is to address the problem of
 * messy bracket display frequently happens in RTL layout.
 * @param {string} s The string that need to be processed.
 * @param {boolean=} opt_isRtlContext specifies default direction (usually
 *     direction of the UI).
 * @return {string} The processed string, with all bracket guarded.
 */
goog.i18n.bidi.guardBracketInHtml = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ?
      goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
  if (useRtl) {
    return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_,
        '<span dir=rtl>$&</span>');
  }
  return s.replace(goog.i18n.bidi.bracketGuardHtmlRe_,
      '<span dir=ltr>$&</span>');
};


/**
 * Apply bracket guard using LRM and RLM. This is to address the problem of
 * messy bracket display frequently happens in RTL layout.
 * This version works for both plain text and html. But it does not work as
 * good as guardBracketInHtml in some cases.
 * @param {string} s The string that need to be processed.
 * @param {boolean=} opt_isRtlContext specifies default direction (usually
 *     direction of the UI).
 * @return {string} The processed string, with all bracket guarded.
 */
goog.i18n.bidi.guardBracketInText = function(s, opt_isRtlContext) {
  var useRtl = opt_isRtlContext === undefined ?
      goog.i18n.bidi.hasAnyRtl(s) : opt_isRtlContext;
  var mark = useRtl ? goog.i18n.bidi.Format.RLM : goog.i18n.bidi.Format.LRM;
  return s.replace(goog.i18n.bidi.bracketGuardTextRe_, mark + '$&' + mark);
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceRtlInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=rtl');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=rtl>' + html + '</span>';
};


/**
 * Enforce RTL on both end of the given text piece using unicode BiDi formatting
 * characters RLE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceRtlInText = function(text) {
  return goog.i18n.bidi.Format.RLE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Enforce the html snippet in RTL directionality regardless overall context.
 * If the html piece was enclosed by tag, dir will be applied to existing
 * tag, otherwise a span tag will be added as wrapper. For this reason, if
 * html snippet start with with tag, this tag must enclose the whole piece. If
 * the tag already has a dir specified, this new one will override existing
 * one in behavior (tested on FF and IE).
 * @param {string} html The string that need to be processed.
 * @return {string} The processed string, with directionality enforced to RTL.
 */
goog.i18n.bidi.enforceLtrInHtml = function(html) {
  if (html.charAt(0) == '<') {
    return html.replace(/<\w+/, '$& dir=ltr');
  }
  // '\n' is important for FF so that it won't incorrectly merge span groups
  return '\n<span dir=ltr>' + html + '</span>';
};


/**
 * Enforce LTR on both end of the given text piece using unicode BiDi formatting
 * characters LRE and PDF.
 * @param {string} text The piece of text that need to be wrapped.
 * @return {string} The wrapped string after process.
 */
goog.i18n.bidi.enforceLtrInText = function(text) {
  return goog.i18n.bidi.Format.LRE + text + goog.i18n.bidi.Format.PDF;
};


/**
 * Regular expression to find dimensions such as "padding: .3 0.4ex 5px 6;"
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.dimensionsRe_ =
    /:\s*([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)\s+([.\d][.\w]*)/g;


/**
 * Regular expression for left.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.leftRe_ = /left/gi;


/**
 * Regular expression for right.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.rightRe_ = /right/gi;


/**
 * Placeholder regular expression for swapping.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.tempRe_ = /%%%%/g;


/**
 * Swap location parameters and 'left'/'right' in CSS specification. The
 * processed string will be suited for RTL layout. Though this function can
 * cover most cases, there are always exceptions. It is suggested to put
 * those exceptions in separate group of CSS string.
 * @param {string} cssStr CSS spefication string.
 * @return {string} Processed CSS specification string.
 */
goog.i18n.bidi.mirrorCSS = function(cssStr) {
  return cssStr.
      // reverse dimensions
      replace(goog.i18n.bidi.dimensionsRe_, ':$1 $4 $3 $2').
      replace(goog.i18n.bidi.leftRe_, '%%%%').          // swap left and right
      replace(goog.i18n.bidi.rightRe_, goog.i18n.bidi.LEFT).
      replace(goog.i18n.bidi.tempRe_, goog.i18n.bidi.RIGHT);
};


/**
 * Regular expression for hebrew double quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.doubleQuoteSubstituteRe_ = /([\u0591-\u05f2])"/g;


/**
 * Regular expression for hebrew single quote substitution, finding quote
 * directly after hebrew characters.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.singleQuoteSubstituteRe_ = /([\u0591-\u05f2])'/g;


/**
 * Replace the double and single quote directly after a Hebrew character with
 * GERESH and GERSHAYIM. In such case, most likely that's user intention.
 * @param {string} str String that need to be processed.
 * @return {string} Processed string with double/single quote replaced.
 */
goog.i18n.bidi.normalizeHebrewQuote = function(str) {
  return str.
      replace(goog.i18n.bidi.doubleQuoteSubstituteRe_, '$1\u05f4').
      replace(goog.i18n.bidi.singleQuoteSubstituteRe_, '$1\u05f3');
};


/**
 * Regular expression to split a string into "words" for directionality
 * estimation based on relative word counts.
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.wordSeparatorRe_ = /\s+/;


/**
 * Regular expression to check if a string contains any numerals. Used to
 * differentiate between completely neutral strings and those containing
 * numbers, which are weakly LTR.
 *
 * Native Arabic digits (\u0660 - \u0669) are not included because although they
 * do flow left-to-right inside a number, this is the case even if the  overall
 * directionality is RTL, and a mathematical expression using these digits is
 * supposed to flow right-to-left overall, including unary plus and minus
 * appearing to the right of a number, and this does depend on the overall
 * directionality being RTL. The digits used in Farsi (\u06F0 - \u06F9), on the
 * other hand, are included, since Farsi math (including unary plus and minus)
 * does flow left-to-right.
 *
 * @type {RegExp}
 * @private
 */
goog.i18n.bidi.hasNumeralsRe_ = /[\d\u06f0-\u06f9]/;


/**
 * This constant controls threshold of RTL directionality.
 * @type {number}
 * @private
 */
goog.i18n.bidi.rtlDetectionThreshold_ = 0.40;


/**
 * Estimates the directionality of a string based on relative word counts.
 * If the number of RTL words is above a certain percentage of the total number
 * of strongly directional words, returns RTL.
 * Otherwise, if any words are strongly or weakly LTR, returns LTR.
 * Otherwise, returns UNKNOWN, which is used to mean "neutral".
 * Numbers are counted as weakly LTR.
 * @param {string} str The string to be checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {goog.i18n.bidi.Dir} Estimated overall directionality of {@code str}.
 */
goog.i18n.bidi.estimateDirection = function(str, opt_isHtml) {
  var rtlCount = 0;
  var totalCount = 0;
  var hasWeaklyLtr = false;
  var tokens = goog.i18n.bidi.stripHtmlIfNeeded_(str, opt_isHtml).
      split(goog.i18n.bidi.wordSeparatorRe_);
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

  return totalCount == 0 ?
      (hasWeaklyLtr ? goog.i18n.bidi.Dir.LTR : goog.i18n.bidi.Dir.NEUTRAL) :
      (rtlCount / totalCount > goog.i18n.bidi.rtlDetectionThreshold_ ?
          goog.i18n.bidi.Dir.RTL : goog.i18n.bidi.Dir.LTR);
};


/**
 * Check the directionality of a piece of text, return true if the piece of
 * text should be laid out in RTL direction.
 * @param {string} str The piece of text that need to be detected.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether this piece of text should be laid out in RTL.
 */
goog.i18n.bidi.detectRtlDirectionality = function(str, opt_isHtml) {
  return goog.i18n.bidi.estimateDirection(str, opt_isHtml) ==
      goog.i18n.bidi.Dir.RTL;
};


/**
 * Sets text input element's directionality and text alignment based on a
 * given directionality. Does nothing if the given directionality is unknown or
 * neutral.
 * @param {Element} element Input field element to set directionality to.
 * @param {goog.i18n.bidi.Dir|number|boolean|null} dir Desired directionality,
 *     given in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant.
 *     2. A number (positive = LRT, negative = RTL, 0 = neutral).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 */
goog.i18n.bidi.setElementDirAndAlign = function(element, dir) {
  if (element) {
    dir = goog.i18n.bidi.toDir(dir);
    if (dir) {
      element.style.textAlign =
          dir == goog.i18n.bidi.Dir.RTL ?
          goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
      element.dir = dir == goog.i18n.bidi.Dir.RTL ? 'rtl' : 'ltr';
    }
  }
};


/**
 * Sets element dir based on estimated directionality of the given text.
 * @param {!Element} element
 * @param {string} text
 */
goog.i18n.bidi.setElementDirByTextDirectionality = function(element, text) {
  switch (goog.i18n.bidi.estimateDirection(text)) {
    case (goog.i18n.bidi.Dir.LTR):
      element.dir = 'ltr';
      break;
    case (goog.i18n.bidi.Dir.RTL):
      element.dir = 'rtl';
      break;
    default:
      // Default for no direction, inherit from document.
      element.removeAttribute('dir');
  }
};



/**
 * Strings that have an (optional) known direction.
 *
 * Implementations of this interface are string-like objects that carry an
 * attached direction, if known.
 * @interface
 */
goog.i18n.bidi.DirectionalString = function() {};


/**
 * Interface marker of the DirectionalString interface.
 *
 * This property can be used to determine at runtime whether or not an object
 * implements this interface.  All implementations of this interface set this
 * property to {@code true}.
 * @type {boolean}
 */
goog.i18n.bidi.DirectionalString.prototype.
    implementsGoogI18nBidiDirectionalString;


/**
 * Retrieves this object's known direction (if any).
 * @return {?goog.i18n.bidi.Dir} The known direction. Null if unknown.
 */
goog.i18n.bidi.DirectionalString.prototype.getDirection;

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The SafeUrl type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeUrl');

goog.require('goog.asserts');
goog.require('goog.fs.url');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string that is safe to use in URL context in DOM APIs and HTML documents.
 *
 * A SafeUrl is a string-like object that carries the security type contract
 * that its value as a string will not cause untrusted script execution
 * when evaluated as a hyperlink URL in a browser.
 *
 * Values of this type are guaranteed to be safe to use in URL/hyperlink
 * contexts, such as, assignment to URL-valued DOM properties, or
 * interpolation into a HTML template in URL context (e.g., inside a href
 * attribute), in the sense that the use will not result in a
 * Cross-Site-Scripting vulnerability.
 *
 * Note that, as documented in {@code goog.html.SafeUrl.unwrap}, this type's
 * contract does not guarantee that instances are safe to interpolate into HTML
 * without appropriate escaping.
 *
 * Note also that this type's contract does not imply any guarantees regarding
 * the resource the URL refers to.  In particular, SafeUrls are <b>not</b>
 * safe to use in a context where the referred-to resource is interpreted as
 * trusted code, e.g., as the src of a script tag.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeUrl.fromConstant}, {@code goog.html.SafeUrl.sanitize}),
 * etc and not by invoking its constructor.  The constructor intentionally
 * takes no parameters and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * @see goog.html.SafeUrl#fromConstant
 * @see goog.html.SafeUrl#from
 * @see goog.html.SafeUrl#sanitize
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeUrl = function() {
  /**
   * The contained value of this SafeUrl.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeUrl#unwrap
   * @const
   * @private
   */
  this.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * The innocuous string generated by goog.html.SafeUrl.sanitize when passed
 * an unsafe URL.
 *
 * about:invalid is registered in
 * http://www.w3.org/TR/css3-values/#about-invalid.
 * http://tools.ietf.org/html/rfc6694#section-2.2.1 permits about URLs to
 * contain a fragment, which is not to be considered when determining if an
 * about URL is well-known.
 *
 * Using about:invalid seems preferable to using a fixed data URL, since
 * browsers might choose to not report CSP violations on it, as legitimate
 * CSS function calls to attr() can result in this URL being produced. It is
 * also a standard URL which matches exactly the semantics we need:
 * "The about:invalid URI references a non-existent document with a generic
 * error condition. It can be used when a URI is necessary, but the default
 * value shouldn't be resolveable as any type of document".
 *
 * @const {string}
 */
goog.html.SafeUrl.INNOCUOUS_STRING = 'about:invalid#zClosurez';


/**
 * @override
 * @const
 */
goog.html.SafeUrl.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this SafeUrl's value a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeUrl}, use {@code goog.html.SafeUrl.unwrap} instead of this
 * method. If in doubt, assume that it's security relevant. In particular, note
 * that goog.html functions which return a goog.html type do not guarantee that
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml instanceof
 * // goog.html.SafeHtml.
 * </pre>
 *
 * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
 * behavior of browsers when interpreting URLs. Values of SafeUrl objects MUST
 * be appropriately escaped before embedding in a HTML document. Note that the
 * required escaping is context-sensitive (e.g. a different escaping is
 * required for embedding a URL in a style property within a style
 * attribute, as opposed to embedding in a href attribute).
 *
 * @see goog.html.SafeUrl#unwrap
 * @override
 */
goog.html.SafeUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};


/**
 * @override
 * @const
 */
goog.html.SafeUrl.prototype.implementsGoogI18nBidiDirectionalString = true;


/**
 * Returns this URLs directionality, which is always {@code LTR}.
 * @override
 */
goog.html.SafeUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeUrl, use
   * {@code goog.html.SafeUrl.unwrap}.
   *
   * @see goog.html.SafeUrl#unwrap
   * @override
   */
  goog.html.SafeUrl.prototype.toString = function() {
    return 'SafeUrl{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a SafeUrl
 * object, and returns its value.
 *
 * IMPORTANT: The guarantees of the SafeUrl type contract only extend to the
 * behavior of  browsers when interpreting URLs. Values of SafeUrl objects MUST
 * be appropriately escaped before embedding in a HTML document. Note that the
 * required escaping is context-sensitive (e.g. a different escaping is
 * required for embedding a URL in a style property within a style
 * attribute, as opposed to embedding in a href attribute).
 *
 * @param {!goog.html.SafeUrl} safeUrl The object to extract from.
 * @return {string} The SafeUrl object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeUrl.unwrap = function(safeUrl) {
  // Perform additional Run-time type-checking to ensure that safeUrl is indeed
  // an instance of the expected type.  This provides some additional protection
  // against security bugs due to application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeUrl instanceof goog.html.SafeUrl &&
      safeUrl.constructor === goog.html.SafeUrl &&
      safeUrl.SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeUrl, got \'' +
                      safeUrl + '\'');
    return 'type_error:SafeUrl';

  }
};


/**
 * Creates a SafeUrl object from a compile-time constant string.
 *
 * Compile-time constant strings are inherently program-controlled and hence
 * trusted.
 *
 * @param {!goog.string.Const} url A compile-time-constant string from which to
 *         create a SafeUrl.
 * @return {!goog.html.SafeUrl} A SafeUrl object initialized to {@code url}.
 */
goog.html.SafeUrl.fromConstant = function(url) {
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      goog.string.Const.unwrap(url));
};


/**
 * A pattern that matches Blob or data types that can have SafeUrls created
 * from URL.createObjectURL(blob) or via a data: URI.  Only matches image and
 * video types, currently.
 * @const
 * @private
 */
goog.html.SAFE_MIME_TYPE_PATTERN_ =
    /^(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm))$/i;


/**
 * Creates a SafeUrl wrapping a blob URL for the given {@code blob}.
 *
 * The blob URL is created with {@code URL.createObjectURL}. If the MIME type
 * for {@code blob} is not of a known safe image or video MIME type, then the
 * SafeUrl will wrap {@link #INNOCUOUS_STRING}.
 *
 * @see http://www.w3.org/TR/FileAPI/#url
 * @param {!Blob} blob
 * @return {!goog.html.SafeUrl} The blob URL, or an innocuous string wrapped
 *   as a SafeUrl.
 */
goog.html.SafeUrl.fromBlob = function(blob) {
  var url = goog.html.SAFE_MIME_TYPE_PATTERN_.test(blob.type) ?
      goog.fs.url.createObjectUrl(blob) : goog.html.SafeUrl.INNOCUOUS_STRING;
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Matches a base-64 data URL, with the first match group being the MIME type.
 * @const
 * @private
 */
goog.html.DATA_URL_PATTERN_ = /^data:([^;,]*);base64,[a-z0-9+\/]+=*$/i;


/**
 * Creates a SafeUrl wrapping a data: URL, after validating it matches a
 * known-safe image or video MIME type.
 *
 * @param {string} dataUrl A valid base64 data URL with one of the whitelisted
 *     image or video MIME types.
 * @return {!goog.html.SafeUrl} A matching safe URL, or {@link INNOCUOUS_STRING}
 *     wrapped as a SafeUrl if it does not pass.
 */
goog.html.SafeUrl.fromDataUrl = function(dataUrl) {
  // There's a slight risk here that a browser sniffs the content type if it
  // doesn't know the MIME type and executes HTML within the data: URL. For this
  // to cause XSS it would also have to execute the HTML in the same origin
  // of the page with the link. It seems unlikely that both of these will
  // happen, particularly in not really old IEs.
  var match = dataUrl.match(goog.html.DATA_URL_PATTERN_);
  var valid = match && goog.html.SAFE_MIME_TYPE_PATTERN_.test(match[1]);
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(
      valid ? dataUrl : goog.html.SafeUrl.INNOCUOUS_STRING);
};


/**
 * A pattern that recognizes a commonly useful subset of URLs that satisfy
 * the SafeUrl contract.
 *
 * This regular expression matches a subset of URLs that will not cause script
 * execution if used in URL context within a HTML document. Specifically, this
 * regular expression matches if (comment from here on and regex copied from
 * Soy's EscapingConventions):
 * (1) Either a protocol in a whitelist (http, https, mailto or ftp).
 * (2) or no protocol.  A protocol must be followed by a colon. The below
 *     allows that by allowing colons only after one of the characters [/?#].
 *     A colon after a hash (#) must be in the fragment.
 *     Otherwise, a colon after a (?) must be in a query.
 *     Otherwise, a colon after a single solidus (/) must be in a path.
 *     Otherwise, a colon after a double solidus (//) must be in the authority
 *     (before port).
 *
 * The pattern disallows &, used in HTML entity declarations before
 * one of the characters in [/?#]. This disallows HTML entities used in the
 * protocol name, which should never happen, e.g. "h&#116;tp" for "http".
 * It also disallows HTML entities in the first path part of a relative path,
 * e.g. "foo&lt;bar/baz".  Our existing escaping functions should not produce
 * that. More importantly, it disallows masking of a colon,
 * e.g. "javascript&#58;...".
 *
 * @private
 * @const {!RegExp}
 */
goog.html.SAFE_URL_PATTERN_ =
    /^(?:(?:https?|mailto|ftp):|[^&:/?#]*(?:[/?#]|$))/i;


/**
 * Creates a SafeUrl object from {@code url}. If {@code url} is a
 * goog.html.SafeUrl then it is simply returned. Otherwise the input string is
 * validated to match a pattern of commonly used safe URLs. The string is
 * converted to UTF-8 and non-whitelisted characters are percent-encoded. The
 * string wrapped by the created SafeUrl will thus contain only ASCII printable
 * characters.
 *
 * {@code url} may be a URL with the http, https, mailto or ftp scheme,
 * or a relative URL (i.e., a URL without a scheme; specifically, a
 * scheme-relative, absolute-path-relative, or path-relative URL).
 *
 * {@code url} is converted to UTF-8 and non-whitelisted characters are
 * percent-encoded. Whitelisted characters are '%' and, from RFC 3986,
 * unreserved characters and reserved characters, with the exception of '\'',
 * '(' and ')'. This ensures the the SafeUrl contains only ASCII-printable
 * characters and reduces the chance of security bugs were it to be
 * interpolated into a specific context without the necessary escaping.
 *
 * If {@code url} fails validation or does not UTF-16 decode correctly
 * (JavaScript strings are UTF-16 encoded), this function returns a SafeUrl
 * object containing an innocuous string, goog.html.SafeUrl.INNOCUOUS_STRING.
 *
 * @see http://url.spec.whatwg.org/#concept-relative-url
 * @param {string|!goog.string.TypedString} url The URL to validate.
 * @return {!goog.html.SafeUrl} The validated URL, wrapped as a SafeUrl.
 */
goog.html.SafeUrl.sanitize = function(url) {
  if (url instanceof goog.html.SafeUrl) {
    return url;
  }
  else if (url.implementsGoogStringTypedString) {
    url = url.getTypedStringValue();
  } else {
    url = String(url);
  }
  if (!goog.html.SAFE_URL_PATTERN_.test(url)) {
    url = goog.html.SafeUrl.INNOCUOUS_STRING;
  }
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Type marker for the SafeUrl type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create SafeUrl instances.
 *
 * @param {string} url The string to initialize the SafeUrl object with.
 * @return {!goog.html.SafeUrl} The initialized SafeUrl object.
 * @package
 */
goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse = function(
    url) {
  var safeUrl = new goog.html.SafeUrl();
  safeUrl.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = url;
  return safeUrl;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 *
 * Setting goog.TRUSTED_SITE to false will automatically set
 * NATIVE_ARRAY_PROTOTYPES to false.
 */
goog.define('goog.NATIVE_ARRAY_PROTOTYPES', goog.TRUSTED_SITE);


/**
 * @define {boolean} If true, JSCompiler will use the native implementation of
 * array functions where appropriate (e.g., {@code Array#filter}) and remove the
 * unused pure JS implementation.
 */
goog.define('goog.array.ASSUME_NATIVE_FUNCTIONS', false);


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.last.
 * @param {Array<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Returns the last element in an array without removing it.
 * Same as goog.array.peek.
 * @param {Array<T>|goog.array.ArrayLike} array The array.
 * @return {T} Last item in array.
 * @template T
 */
goog.array.last = goog.array.peek;

// NOTE(arv): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 * @template T
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      Array.prototype.indexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return Array.prototype.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {!Array<T>|!goog.array.ArrayLike} arr The array to be searched.
 * @param {T} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 * @template T
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          Array.prototype.lastIndexOf) ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return Array.prototype.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array. Skips holes in the array.
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function takes 3 arguments (the element, the index and the
 *     array). The return value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @template T,S
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                      Array.prototype.forEach) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      Array.prototype.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this: S, T, number, ?): ?} f The function to call for every
 *     element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T,S
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?):boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array<T>} a new array in which only elements that passed the test
 *     are present.
 * @template T,S
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     Array.prototype.filter) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return Array.prototype.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr Array or array like object
 *     over which to iterate.
 * @param {function(this:THIS, VALUE, number, ?): RESULT} f The function to call
 *     for every element. This function takes 3 arguments (the element,
 *     the index and the array) and should return something. The result will be
 *     inserted into a new array.
 * @param {THIS=} opt_obj The object to be used as the value of 'this' within f.
 * @return {!Array<RESULT>} a new array with the results from f.
 * @template THIS, VALUE, RESULT
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                  Array.prototype.map) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return Array.prototype.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {R} Result of evaluating f repeatedly across the values of the array.
 * @template T,S,R
 */
goog.array.reduce = goog.NATIVE_ARRAY_PROTOTYPES &&
                    (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                     Array.prototype.reduce) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return Array.prototype.reduce.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEach(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, R, T, number, ?) : R} f The function to call for
 *     every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {?} val The initial value to pass into the function on the first call.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {R} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 * @template T,S,R
 */
goog.array.reduceRight = goog.NATIVE_ARRAY_PROTOTYPES &&
                         (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                          Array.prototype.reduceRight) ?
    function(arr, f, val, opt_obj) {
      goog.asserts.assert(arr.length != null);
      if (opt_obj) {
        f = goog.bind(f, opt_obj);
      }
      return Array.prototype.reduceRight.call(arr, f, val);
    } :
    function(arr, f, val, opt_obj) {
      var rval = val;
      goog.array.forEachRight(arr, function(val, index) {
        rval = f.call(opt_obj, rval, val, index, arr);
      });
      return rval;
    };


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 * @template T,S
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                   Array.prototype.some) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return Array.prototype.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 * @template T,S
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   (goog.array.ASSUME_NATIVE_FUNCTIONS ||
                    Array.prototype.every) ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return Array.prototype.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Counts the array elements that fulfill the predicate, i.e. for which the
 * callback function returns true. Skips holes in the array.
 *
 * @param {!(Array<T>|goog.array.ArrayLike)} arr Array or array like object
 *     over which to iterate.
 * @param {function(this: S, T, number, ?): boolean} f The function to call for
 *     every element. Takes 3 arguments (the element, the index and the array).
 * @param {S=} opt_obj The object to be used as the value of 'this' within f.
 * @return {number} The number of the matching elements.
 * @template T,S
 */
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call(opt_obj, element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {T|null} The first array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call for
 *     every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {T|null} The last array element that passes the test, or null if no
 *     element is found.
 * @template T,S
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 * @template T,S
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array<T>} arr Array into which to insert the item.
 * @param {T} obj Value to add.
 * @template T
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array<T>} arr The array to modify.
 * @param {T} obj The object to insert.
 * @param {T=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 * @template T
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {Array<T>|goog.array.ArrayLike} arr Array from which to remove
 *     value.
 * @param {T} obj Object to remove.
 * @return {boolean} True if an element was removed.
 * @template T
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return Array.prototype.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 * @template T,S
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Removes all values that satisfy the given condition.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array
 *     like object over which to iterate.
 * @param {?function(this:S, T, number, ?) : boolean} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {S=} opt_obj An optional "this" context for the function.
 * @return {number} The number of items removed
 * @template T,S
 */
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


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array<?>} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return Array.prototype.concat.apply(
      Array.prototype, arguments);
};


/**
 * Returns a new array that contains the contents of all the arrays passed.
 * @param {...!Array<T>} var_args
 * @return {!Array<T>}
 * @template T
 */
goog.array.join = function(var_args) {
  return Array.prototype.concat.apply(
      Array.prototype, arguments);
};


/**
 * Converts an object to an array.
 * @param {Array<T>|goog.array.ArrayLike} object  The object to convert to an
 *     array.
 * @return {!Array<T>} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 * @template T
 */
goog.array.toArray = function(object) {
  var length = object.length;

  // If length is not a number the following it false. This case is kept for
  // backwards compatibility since there are callers that pass objects that are
  // not array like.
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0; i < length; i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};


/**
 * Does a shallow copy of an array.
 * @param {Array<T>|goog.array.ArrayLike} arr  Array or array-like object to
 *     clone.
 * @return {!Array<T>} Clone of the input array.
 * @template T
 */
goog.array.clone = goog.array.toArray;


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array<VALUE>} arr1  The array to modify.
 * @param {...(Array<VALUE>|VALUE)} var_args The elements or arrays of elements
 *     to add to arr1.
 * @template VALUE
 */
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


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...T} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array<T>} the removed elements.
 * @template T
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return Array.prototype.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array from
 * which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array<T>} A new array containing the specified segment of the
 *     original array.
 * @template T
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return Array.prototype.slice.call(arr, start);
  } else {
    return Array.prototype.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Alternatively you can specify a custom hash function that returns a unique
 * value for each item in the array it should consider unique.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {Array<T>|goog.array.ArrayLike} arr The array from which to remove
 *     duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 * @param {function(T):string=} opt_hashFn An optional function to use to
 *     apply to every item in the array. This function should return a unique
 *     value for each item in the array it should consider unique.
 * @template T
 */
goog.array.removeDuplicates = function(arr, opt_rv, opt_hashFn) {
  var returnArray = opt_rv || arr;
  var defaultHashFn = function(item) {
    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    return goog.isObject(item) ? 'o' + goog.getUid(item) :
        (typeof item).charAt(0) + item;
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


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {TARGET} target The sought value.
 * @param {function(TARGET, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @template TARGET, VALUE
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {Array<VALUE>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(this:THIS, VALUE, number, ?): number} evaluator
 *     Evaluator function that receives 3 arguments (the element, the index and
 *     the array). Should return a negative number, zero, or a positive number
 *     depending on whether the desired index is before, at, or after the
 *     element passed to it.
 * @param {THIS=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 * @template THIS, VALUE
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {Array<?>|goog.array.ArrayLike} arr The array to be searched.
 * @param {function(?, ?, ?): number | function(?, ?): number} compareFn
 *     Either an evaluator or a comparison function, as defined by binarySearch
 *     and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {?=} opt_target If the function is a comparison function, then
 *     this is the target to binary search for.
 * @param {Object=} opt_selfObj If the function is an evaluator, this is an
 *     optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
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
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {?function(T,T):number=} opt_compareFn Optional comparison
 *     function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @template T
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(arv): Update type annotation since null is not accepted.
  arr.sort(opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {?function(T, T): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template T
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sort the specified array into ascending order based on item keys
 * returned by the specified key function.
 * If no opt_compareFn is specified, the keys are compared in ascending order
 * using <code>goog.array.defaultCompare</code>.
 *
 * Runtime: O(S(f(n)), where S is runtime of <code>goog.array.sort</code>
 * and f(n) is runtime of the key function.
 *
 * @param {Array<T>} arr The array to be sorted.
 * @param {function(T): K} keyFn Function taking array element and returning
 *     a key used for sorting this element.
 * @param {?function(K, K): number=} opt_compareFn Optional comparison function
 *     by which the keys are to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template T,K
 */
goog.array.sortByKey = function(arr, keyFn, opt_compareFn) {
  var keyCompareFn = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return keyCompareFn(keyFn(a), keyFn(b));
  });
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  goog.array.sortByKey(arr,
      function(obj) { return obj[key]; },
      opt_compareFn);
};


/**
 * Tells if the array is sorted.
 * @param {!Array<T>} arr The array.
 * @param {?function(T,T):number=} opt_compareFn Function to compare the
 *     array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 * @template T
 */
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


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
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


/**
 * 3-way array compare function.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} arr1 The first array to
 *     compare.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} arr2 The second array to
 *     compare.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is to be ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @template VALUE
 */
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


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {VALUE} a The first object to be compared.
 * @param {VALUE} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second,
 *     respectively.
 * @template VALUE
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for inverse order, using the built in < and >
 * operators.
 * @param {VALUE} a The first object to be compared.
 * @param {VALUE} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is greater than, equal to, or less than the second,
 *     respectively.
 * @template VALUE
 */
goog.array.inverseDefaultCompare = function(a, b) {
  return -goog.array.defaultCompare(a, b);
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array<VALUE>|goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to insert.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was inserted.
 * @template VALUE
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {!Array<VALUE>|!goog.array.ArrayLike} array The array to modify.
 * @param {VALUE} value The object to remove.
 * @param {function(VALUE, VALUE): number=} opt_compareFn Optional comparison
 *     function by which the array is ordered. Should take 2 arguments to
 *     compare, and return a negative number, zero, or a positive number
 *     depending on whether the first argument is less than, equal to, or
 *     greater than the second.
 * @return {boolean} True if an element was removed.
 * @template VALUE
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array<T>} array The array.
 * @param {function(this:S, T,number,Array<T>):?} sorter Function to call for
 *     every element.  This takes 3 arguments (the element, the index and the
 *     array) and must return a valid object key (a string, number, etc), or
 *     undefined, if that object should not be placed in a bucket.
 * @param {S=} opt_obj The object to be used as the value of 'this' within
 *     sorter.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 * @template T,S
 */
goog.array.bucket = function(array, sorter, opt_obj) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter.call(opt_obj, value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Creates a new object built from the provided array and the key-generation
 * function.
 * @param {Array<T>|goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate whose elements will be the values in the new object.
 * @param {?function(this:S, T, number, ?) : string} keyFunc The function to
 *     call for every element. This function takes 3 arguments (the element, the
 *     index and the array) and should return a string that will be used as the
 *     key for the element in the new object. If the function returns the same
 *     key for more than one element, the value for that key is
 *     implementation-defined.
 * @param {S=} opt_obj The object to be used as the value of 'this'
 *     within keyFunc.
 * @return {!Object<T>} The new object.
 * @template T,S
 */
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};


/**
 * Creates a range of numbers in an arithmetic progression.
 *
 * Range takes 1, 2, or 3 arguments:
 * <pre>
 * range(5) is the same as range(0, 5, 1) and produces [0, 1, 2, 3, 4]
 * range(2, 5) is the same as range(2, 5, 1) and produces [2, 3, 4]
 * range(-2, -5, -1) produces [-2, -3, -4]
 * range(-2, -5, 1) produces [], since stepping by 1 wouldn't ever reach -5.
 * </pre>
 *
 * @param {number} startOrEnd The starting value of the range if an end argument
 *     is provided. Otherwise, the start value is 0, and this is the end value.
 * @param {number=} opt_end The optional end value of the range.
 * @param {number=} opt_step The step size between range values. Defaults to 1
 *     if opt_step is undefined or 0.
 * @return {!Array<number>} An array of numbers for the requested range. May be
 *     an empty array if adding the step would not converge toward the end
 *     value.
 */
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
    // Sign mismatch: start + step will never reach the end value.
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


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {VALUE} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array<VALUE>} An array with the repeated value.
 * @template VALUE
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array<?>} An array containing the flattened values.
 */
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


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array<T>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array<T>} The array.
 * @template T
 */
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


/**
 * Moves one item of an array to a new position keeping the order of the rest
 * of the items. Example use case: keeping a list of JavaScript objects
 * synchronized with the corresponding list of DOM elements after one of the
 * elements has been dragged to a new position.
 * @param {!(Array|Arguments|{length:number})} arr The array to modify.
 * @param {number} fromIndex Index of the item to move between 0 and
 *     {@code arr.length - 1}.
 * @param {number} toIndex Target index between 0 and {@code arr.length - 1}.
 */
goog.array.moveItem = function(arr, fromIndex, toIndex) {
  goog.asserts.assert(fromIndex >= 0 && fromIndex < arr.length);
  goog.asserts.assert(toIndex >= 0 && toIndex < arr.length);
  // Remove 1 item at fromIndex.
  var removedItems = Array.prototype.splice.call(arr, fromIndex, 1);
  // Insert the removed item at toIndex.
  Array.prototype.splice.call(arr, toIndex, 0, removedItems[0]);
  // We don't use goog.array.insertAt and goog.array.removeAt, because they're
  // significantly slower than splice.
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array<!Array<?>>} A new array of arrays created from
 *     provided arrays.
 */
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


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array<?>} arr The array to be shuffled.
 * @param {function():number=} opt_randFn Optional random function to use for
 *     shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};


/**
 * Returns a new array of elements from arr, based on the indexes of elements
 * provided by index_arr. For example, the result of index copying
 * ['a', 'b', 'c'] with index_arr [1,0,0,2] is ['b', 'a', 'a', 'c'].
 *
 * @param {!Array<T>} arr The array to get a indexed copy from.
 * @param {!Array<number>} index_arr An array of indexes to get from arr.
 * @return {!Array<T>} A new array of elements from arr in index_arr order.
 * @template T
 */
goog.array.copyByIndex = function(arr, index_arr) {
  var result = [];
  goog.array.forEach(index_arr, function(index) {
    result.push(arr[index]);
  });
  return result;
};

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The SafeStyle type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeStyle');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string-like object which represents a sequence of CSS declarations
 * ({@code propertyName1: propertyvalue1; propertyName2: propertyValue2; ...})
 * and that carries the security type contract that its value, as a string,
 * will not cause untrusted script execution (XSS) when evaluated as CSS in a
 * browser.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeStyle.create} or
 * {@code goog.html.SafeStyle.fromConstant}) and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * A SafeStyle's string representation ({@link #getTypedStringValue()}) can
 * safely:
 * <ul>
 *   <li>Be interpolated as the entire content of a *quoted* HTML style
 *       attribute, or before already existing properties. The SafeStyle string
 *       *must be HTML-attribute-escaped* (where " and ' are escaped) before
 *       interpolation.
 *   <li>Be interpolated as the entire content of a {}-wrapped block within a
 *       stylesheet, or before already existing properties. The SafeStyle string
 *       should not be escaped before interpolation. SafeStyle's contract also
 *       guarantees that the string will not be able to introduce new properties
 *       or elide existing ones.
 *   <li>Be assigned to the style property of a DOM node. The SafeStyle string
 *       should not be escaped before being assigned to the property.
 * </ul>
 *
 * A SafeStyle may never contain literal angle brackets. Otherwise, it could
 * be unsafe to place a SafeStyle into a &lt;style&gt; tag (where it can't
 * be HTML escaped). For example, if the SafeStyle containing
 * "{@code font: 'foo &lt;style/&gt;&lt;script&gt;evil&lt;/script&gt;'}" were
 * interpolated within a &lt;style&gt; tag, this would then break out of the
 * style context into HTML.
 *
 * A SafeStyle may contain literal single or double quotes, and as such the
 * entire style string must be escaped when used in a style attribute (if
 * this were not the case, the string could contain a matching quote that
 * would escape from the style attribute).
 *
 * Values of this type must be composable, i.e. for any two values
 * {@code style1} and {@code style2} of this type,
 * {@code goog.html.SafeStyle.unwrap(style1) +
 * goog.html.SafeStyle.unwrap(style2)} must itself be a value that satisfies
 * the SafeStyle type constraint. This requirement implies that for any value
 * {@code style} of this type, {@code goog.html.SafeStyle.unwrap(style)} must
 * not end in a "property value" or "property name" context. For example,
 * a value of {@code background:url("} or {@code font-} would not satisfy the
 * SafeStyle contract. This is because concatenating such strings with a
 * second value that itself does not contain unsafe CSS can result in an
 * overall string that does. For example, if {@code javascript:evil())"} is
 * appended to {@code background:url("}, the resulting string may result in
 * the execution of a malicious script.
 *
 * TODO(user): Consider whether we should implement UTF-8 interchange
 * validity checks and blacklisting of newlines (including Unicode ones) and
 * other whitespace characters (\t, \f). Document here if so and also update
 * SafeStyle.fromConstant().
 *
 * The following example values comply with this type's contract:
 * <ul>
 *   <li><pre>width: 1em;</pre>
 *   <li><pre>height:1em;</pre>
 *   <li><pre>width: 1em;height: 1em;</pre>
 *   <li><pre>background:url('http://url');</pre>
 * </ul>
 * In addition, the empty string is safe for use in a CSS attribute.
 *
 * The following example values do NOT comply with this type's contract:
 * <ul>
 *   <li><pre>background: red</pre> (missing a trailing semi-colon)
 *   <li><pre>background:</pre> (missing a value and a trailing semi-colon)
 *   <li><pre>1em</pre> (missing an attribute name, which provides context for
 *       the value)
 * </ul>
 *
 * @see goog.html.SafeStyle#create
 * @see goog.html.SafeStyle#fromConstant
 * @see http://www.w3.org/TR/css3-syntax/
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeStyle = function() {
  /**
   * The contained value of this SafeStyle.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeStyle#unwrap
   * @const
   * @private
   */
  this.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeStyle.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeStyle type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a SafeStyle object from a compile-time constant string.
 *
 * {@code style} should be in the format
 * {@code name: value; [name: value; ...]} and must not have any < or >
 * characters in it. This is so that SafeStyle's contract is preserved,
 * allowing the SafeStyle to correctly be interpreted as a sequence of CSS
 * declarations and without affecting the syntactic structure of any
 * surrounding CSS and HTML.
 *
 * This method performs basic sanity checks on the format of {@code style}
 * but does not constrain the format of {@code name} and {@code value}, except
 * for disallowing tag characters.
 *
 * @param {!goog.string.Const} style A compile-time-constant string from which
 *     to create a SafeStyle.
 * @return {!goog.html.SafeStyle} A SafeStyle object initialized to
 *     {@code style}.
 */
goog.html.SafeStyle.fromConstant = function(style) {
  var styleString = goog.string.Const.unwrap(style);
  if (styleString.length === 0) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.html.SafeStyle.checkStyle_(styleString);
  goog.asserts.assert(goog.string.endsWith(styleString, ';'),
      'Last character of style string is not \';\': ' + styleString);
  goog.asserts.assert(goog.string.contains(styleString, ':'),
      'Style string must contain at least one \':\', to ' +
      'specify a "name: value" pair: ' + styleString);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      styleString);
};


/**
 * Checks if the style definition is valid.
 * @param {string} style
 * @private
 */
goog.html.SafeStyle.checkStyle_ = function(style) {
  goog.asserts.assert(!/[<>]/.test(style),
      'Forbidden characters in style string: ' + style);
};


/**
 * Returns this SafeStyle's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeStyle}, use {@code goog.html.SafeStyle.unwrap} instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml
 * // instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeStyle#unwrap
 * @override
 */
goog.html.SafeStyle.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyle, use
   * {@code goog.html.SafeStyle.unwrap}.
   *
   * @see goog.html.SafeStyle#unwrap
   * @override
   */
  goog.html.SafeStyle.prototype.toString = function() {
    return 'SafeStyle{' +
        this.privateDoNotAccessOrElseSafeStyleWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeStyle object, and returns its value.
 *
 * @param {!goog.html.SafeStyle} safeStyle The object to extract from.
 * @return {string} The safeStyle object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeStyle.unwrap = function(safeStyle) {
  // Perform additional Run-time type-checking to ensure that
  // safeStyle is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeStyle instanceof goog.html.SafeStyle &&
      safeStyle.constructor === goog.html.SafeStyle &&
      safeStyle.SAFE_STYLE_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeStyle.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyle.privateDoNotAccessOrElseSafeStyleWrappedValue_;
  } else {
    goog.asserts.fail(
        'expected object of type SafeStyle, got \'' + safeStyle + '\'');
    return 'type_error:SafeStyle';
  }
};


/**
 * Package-internal utility method to create SafeStyle instances.
 *
 * @param {string} style The string to initialize the SafeStyle object with.
 * @return {!goog.html.SafeStyle} The initialized SafeStyle object.
 * @package
 */
goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse =
    function(style) {
  return new goog.html.SafeStyle().initSecurityPrivateDoNotAccessOrElse_(style);
};


/**
 * Called from createSafeStyleSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} style
 * @return {!goog.html.SafeStyle}
 * @private
 */
goog.html.SafeStyle.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    style) {
  this.privateDoNotAccessOrElseSafeStyleWrappedValue_ = style;
  return this;
};


/**
 * A SafeStyle instance corresponding to the empty string.
 * @const {!goog.html.SafeStyle}
 */
goog.html.SafeStyle.EMPTY =
    goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse('');


/**
 * The innocuous string generated by goog.html.SafeUrl.create when passed
 * an unsafe value.
 * @const {string}
 */
goog.html.SafeStyle.INNOCUOUS_STRING = 'zClosurez';


/**
 * Mapping of property names to their values.
 * @typedef {!Object<string, goog.string.Const|string>}
 */
goog.html.SafeStyle.PropertyMap;


/**
 * Creates a new SafeStyle object from the properties specified in the map.
 * @param {goog.html.SafeStyle.PropertyMap} map Mapping of property names to
 *     their values, for example {'margin': '1px'}. Names must consist of
 *     [-_a-zA-Z0-9]. Values might be strings consisting of
 *     [-,.'"%_!# a-zA-Z0-9], where " and ' must be properly balanced.
 *     Other values must be wrapped in goog.string.Const. Null value causes
 *     skipping the property.
 * @return {!goog.html.SafeStyle}
 * @throws {Error} If invalid name is provided.
 * @throws {goog.asserts.AssertionError} If invalid value is provided. With
 *     disabled assertions, invalid value is replaced by
 *     goog.html.SafeStyle.INNOCUOUS_STRING.
 */
goog.html.SafeStyle.create = function(map) {
  var style = '';
  for (var name in map) {
    if (!/^[-_a-zA-Z0-9]+$/.test(name)) {
      throw Error('Name allows only [-_a-zA-Z0-9], got: ' + name);
    }
    var value = map[name];
    if (value == null) {
      continue;
    }
    if (value instanceof goog.string.Const) {
      value = goog.string.Const.unwrap(value);
      // These characters can be used to change context and we don't want that
      // even with const values.
      goog.asserts.assert(!/[{;}]/.test(value), 'Value does not allow [{;}].');
    } else if (!goog.html.SafeStyle.VALUE_RE_.test(value)) {
      goog.asserts.fail(
          'String value allows only [-,."\'%_!# a-zA-Z0-9], got: ' + value);
      value = goog.html.SafeStyle.INNOCUOUS_STRING;
    } else if (!goog.html.SafeStyle.hasBalancedQuotes_(value)) {
      goog.asserts.fail('String value requires balanced quotes, got: ' + value);
      value = goog.html.SafeStyle.INNOCUOUS_STRING;
    }
    style += name + ':' + value + ';';
  }
  if (!style) {
    return goog.html.SafeStyle.EMPTY;
  }
  goog.html.SafeStyle.checkStyle_(style);
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Checks that quotes (" and ') are properly balanced inside a string. Assumes
 * that neither escape (\) nor any other character that could result in
 * breaking out of a string parsing context are allowed;
 * see http://www.w3.org/TR/css3-syntax/#string-token-diagram.
 * @param {string} value Untrusted CSS property value.
 * @return {boolean} True if property value is safe with respect to quote
 *     balancedness.
 * @private
 */
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


// Keep in sync with the error string in create().
/**
 * Regular expression for safe values.
 *
 * Quotes (" and ') are allowed, but a check must be done elsewhere to ensure
 * they're balanced.
 *
 * ',' allows multiple values to be assigned to the same property
 * (e.g. background-attachment or font-family) and hence could allow
 * multiple values to get injected, but that should pose no risk of XSS.
 * @const {!RegExp}
 * @private
 */
goog.html.SafeStyle.VALUE_RE_ = /^[-,."'%_!# a-zA-Z0-9]+$/;


/**
 * Creates a new SafeStyle object by concatenating the values.
 * @param {...(!goog.html.SafeStyle|!Array<!goog.html.SafeStyle>)} var_args
 *     SafeStyles to concatenate.
 * @return {!goog.html.SafeStyle}
 */
goog.html.SafeStyle.concat = function(var_args) {
  var style = '';

  /**
   * @param {!goog.html.SafeStyle|!Array<!goog.html.SafeStyle>} argument
   */
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
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The SafeScript type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeScript');

goog.require('goog.asserts');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string-like object which represents JavaScript code and that carries the
 * security type contract that its value, as a string, will not cause execution
 * of unconstrained attacker controlled code (XSS) when evaluated as JavaScript
 * in a browser.
 *
 * Instances of this type must be created via the factory method
 * {@code goog.html.SafeScript.fromConstant} and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * A SafeScript's string representation can safely be interpolated as the
 * content of a script element within HTML. The SafeScript string should not be
 * escaped before interpolation.
 *
 * Note that the SafeScript might contain text that is attacker-controlled but
 * that text should have been interpolated with appropriate escaping,
 * sanitization and/or validation into the right location in the script, such
 * that it is highly constrained in its effect (for example, it had to match a
 * set of whitelisted words).
 *
 * A SafeScript can be constructed via security-reviewed unchecked
 * conversions. In this case producers of SafeScript must ensure themselves that
 * the SafeScript does not contain unsafe script. Note in particular that
 * {@code &lt;} is dangerous, even when inside JavaScript strings, and so should
 * always be forbidden or JavaScript escaped in user controlled input. For
 * example, if {@code &lt;/script&gt;&lt;script&gt;evil&lt;/script&gt;"} were
 * interpolated inside a JavaScript string, it would break out of the context
 * of the original script element and {@code evil} would execute. Also note
 * that within an HTML script (raw text) element, HTML character references,
 * such as "&lt;" are not allowed. See
 * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements.
 *
 * @see goog.html.SafeScript#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeScript = function() {
  /**
   * The contained value of this SafeScript.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeScript#unwrap
   * @const
   * @private
   */
  this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeScript.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeScript type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a SafeScript object from a compile-time constant string.
 *
 * @param {!goog.string.Const} script A compile-time-constant string from which
 *     to create a SafeScript.
 * @return {!goog.html.SafeScript} A SafeScript object initialized to
 *     {@code script}.
 */
goog.html.SafeScript.fromConstant = function(script) {
  var scriptString = goog.string.Const.unwrap(script);
  if (scriptString.length === 0) {
    return goog.html.SafeScript.EMPTY;
  }
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      scriptString);
};


/**
 * Returns this SafeScript's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeScript}, use {@code goog.html.SafeScript.unwrap} instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml
 * // instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeScript#unwrap
 * @override
 */
goog.html.SafeScript.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeScriptWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeScript, use
   * {@code goog.html.SafeScript.unwrap}.
   *
   * @see goog.html.SafeScript#unwrap
   * @override
   */
  goog.html.SafeScript.prototype.toString = function() {
    return 'SafeScript{' +
        this.privateDoNotAccessOrElseSafeScriptWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeScript object, and returns its value.
 *
 * @param {!goog.html.SafeScript} safeScript The object to extract from.
 * @return {string} The safeScript object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeScript.unwrap = function(safeScript) {
  // Perform additional Run-time type-checking to ensure that
  // safeScript is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeScript instanceof goog.html.SafeScript &&
      safeScript.constructor === goog.html.SafeScript &&
      safeScript.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeScript.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeScript.privateDoNotAccessOrElseSafeScriptWrappedValue_;
  } else {
    goog.asserts.fail(
        'expected object of type SafeScript, got \'' + safeScript + '\'');
    return 'type_error:SafeScript';
  }
};


/**
 * Package-internal utility method to create SafeScript instances.
 *
 * @param {string} script The string to initialize the SafeScript object with.
 * @return {!goog.html.SafeScript} The initialized SafeScript object.
 * @package
 */
goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse =
    function(script) {
  return new goog.html.SafeScript().initSecurityPrivateDoNotAccessOrElse_(
      script);
};


/**
 * Called from createSafeScriptSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} script
 * @return {!goog.html.SafeScript}
 * @private
 */
goog.html.SafeScript.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    script) {
  this.privateDoNotAccessOrElseSafeScriptWrappedValue_ = script;
  return this;
};


/**
 * A SafeScript instance corresponding to the empty string.
 * @const {!goog.html.SafeScript}
 */
goog.html.SafeScript.EMPTY =
    goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse('');

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The TrustedResourceUrl type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.TrustedResourceUrl');

goog.require('goog.asserts');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A URL which is under application control and from which script, CSS, and
 * other resources that represent executable code, can be fetched.
 *
 * Given that the URL can only be constructed from strings under application
 * control and is used to load resources, bugs resulting in a malformed URL
 * should not have a security impact and are likely to be easily detectable
 * during testing. Given the wide number of non-RFC compliant URLs in use,
 * stricter validation could prevent some applications from being able to use
 * this type.
 *
 * Instances of this type must be created via the factory method,
 * ({@code goog.html.TrustedResourceUrl.fromConstant}), and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty
 * string can be obtained via constructor invocation.
 *
 * @see goog.html.TrustedResourceUrl#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.TrustedResourceUrl = function() {
  /**
   * The contained value of this TrustedResourceUrl.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.TrustedResourceUrl#unwrap
   * @const
   * @private
   */
  this.TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.TrustedResourceUrl.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this TrustedResourceUrl's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code TrustedResourceUrl}, use
 * {@code goog.html.TrustedResourceUrl.unwrap} instead of this method. If in
 * doubt, assume that it's security relevant. In particular, note that
 * goog.html functions which return a goog.html type do not guarantee that
 * the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml instanceof
 * // goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.TrustedResourceUrl#unwrap
 * @override
 */
goog.html.TrustedResourceUrl.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
};


/**
 * @override
 * @const
 */
goog.html.TrustedResourceUrl.prototype.implementsGoogI18nBidiDirectionalString =
    true;


/**
 * Returns this URLs directionality, which is always {@code LTR}.
 * @override
 */
goog.html.TrustedResourceUrl.prototype.getDirection = function() {
  return goog.i18n.bidi.Dir.LTR;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a TrustedResourceUrl, use
   * {@code goog.html.TrustedResourceUrl.unwrap}.
   *
   * @see goog.html.TrustedResourceUrl#unwrap
   * @override
   */
  goog.html.TrustedResourceUrl.prototype.toString = function() {
    return 'TrustedResourceUrl{' +
        this.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * TrustedResourceUrl object, and returns its value.
 *
 * @param {!goog.html.TrustedResourceUrl} trustedResourceUrl The object to
 *     extract from.
 * @return {string} The trustedResourceUrl object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.TrustedResourceUrl.unwrap = function(trustedResourceUrl) {
  // Perform additional Run-time type-checking to ensure that
  // trustedResourceUrl is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (trustedResourceUrl instanceof goog.html.TrustedResourceUrl &&
      trustedResourceUrl.constructor === goog.html.TrustedResourceUrl &&
      trustedResourceUrl
          .TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
              goog.html.TrustedResourceUrl
                  .TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return trustedResourceUrl
        .privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type TrustedResourceUrl, got \'' +
                      trustedResourceUrl + '\'');
    return 'type_error:TrustedResourceUrl';

  }
};


/**
 * Creates a TrustedResourceUrl object from a compile-time constant string.
 *
 * Compile-time constant strings are inherently program-controlled and hence
 * trusted.
 *
 * @param {!goog.string.Const} url A compile-time-constant string from which to
 *     create a TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} A TrustedResourceUrl object
 *     initialized to {@code url}.
 */
goog.html.TrustedResourceUrl.fromConstant = function(url) {
  return goog.html.TrustedResourceUrl
      .createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(
          goog.string.Const.unwrap(url));
};


/**
 * Type marker for the TrustedResourceUrl type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.TrustedResourceUrl.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create TrustedResourceUrl instances.
 *
 * @param {string} url The string to initialize the TrustedResourceUrl object
 *     with.
 * @return {!goog.html.TrustedResourceUrl} The initialized TrustedResourceUrl
 *     object.
 * @package
 */
goog.html.TrustedResourceUrl.
    createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse = function(url) {
  var trustedResourceUrl = new goog.html.TrustedResourceUrl();
  trustedResourceUrl.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_ =
      url;
  return trustedResourceUrl;
};

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview The SafeStyleSheet type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeStyleSheet');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string-like object which represents a CSS style sheet and that carries the
 * security type contract that its value, as a string, will not cause untrusted
 * script execution (XSS) when evaluated as CSS in a browser.
 *
 * Instances of this type must be created via the factory method
 * {@code goog.html.SafeStyleSheet.fromConstant} and not by invoking its
 * constructor. The constructor intentionally takes no parameters and the type
 * is immutable; hence only a default instance corresponding to the empty string
 * can be obtained via constructor invocation.
 *
 * A SafeStyleSheet's string representation can safely be interpolated as the
 * content of a style element within HTML. The SafeStyleSheet string should
 * not be escaped before interpolation.
 *
 * Values of this type must be composable, i.e. for any two values
 * {@code styleSheet1} and {@code styleSheet2} of this type,
 * {@code goog.html.SafeStyleSheet.unwrap(styleSheet1) +
 * goog.html.SafeStyleSheet.unwrap(styleSheet2)} must itself be a value that
 * satisfies the SafeStyleSheet type constraint. This requirement implies that
 * for any value {@code styleSheet} of this type,
 * {@code goog.html.SafeStyleSheet.unwrap(styleSheet1)} must end in
 * "beginning of rule" context.

 * A SafeStyleSheet can be constructed via security-reviewed unchecked
 * conversions. In this case producers of SafeStyleSheet must ensure themselves
 * that the SafeStyleSheet does not contain unsafe script. Note in particular
 * that {@code &lt;} is dangerous, even when inside CSS strings, and so should
 * always be forbidden or CSS-escaped in user controlled input. For example, if
 * {@code &lt;/style&gt;&lt;script&gt;evil&lt;/script&gt;"} were interpolated
 * inside a CSS string, it would break out of the context of the original
 * style element and {@code evil} would execute. Also note that within an HTML
 * style (raw text) element, HTML character references, such as
 * {@code &amp;lt;}, are not allowed. See
 * http://www.w3.org/TR/html5/scripting-1.html#restrictions-for-contents-of-script-elements
 * (similar considerations apply to the style element).
 *
 * @see goog.html.SafeStyleSheet#fromConstant
 * @constructor
 * @final
 * @struct
 * @implements {goog.string.TypedString}
 */
goog.html.SafeStyleSheet = function() {
  /**
   * The contained value of this SafeStyleSheet.  The field has a purposely
   * ugly name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeStyleSheet#unwrap
   * @const
   * @private
   */
  this.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;
};


/**
 * @override
 * @const
 */
goog.html.SafeStyleSheet.prototype.implementsGoogStringTypedString = true;


/**
 * Type marker for the SafeStyleSheet type, used to implement additional
 * run-time type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Creates a new SafeStyleSheet object by concatenating values.
 * @param {...(!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>)}
 *     var_args Values to concatenate.
 * @return {!goog.html.SafeStyleSheet}
 */
goog.html.SafeStyleSheet.concat = function(var_args) {
  var result = '';

  /**
   * @param {!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>}
   *     argument
   */
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      result += goog.html.SafeStyleSheet.unwrap(argument);
    }
  };

  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeStyleSheet
      .createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(result);
};


/**
 * Creates a SafeStyleSheet object from a compile-time constant string.
 *
 * {@code styleSheet} must not have any &lt; characters in it, so that
 * the syntactic structure of the surrounding HTML is not affected.
 *
 * @param {!goog.string.Const} styleSheet A compile-time-constant string from
 *     which to create a SafeStyleSheet.
 * @return {!goog.html.SafeStyleSheet} A SafeStyleSheet object initialized to
 *     {@code styleSheet}.
 */
goog.html.SafeStyleSheet.fromConstant = function(styleSheet) {
  var styleSheetString = goog.string.Const.unwrap(styleSheet);
  if (styleSheetString.length === 0) {
    return goog.html.SafeStyleSheet.EMPTY;
  }
  // > is a valid character in CSS selectors and there's no strict need to
  // block it if we already block <.
  goog.asserts.assert(!goog.string.contains(styleSheetString, '<'),
      "Forbidden '<' character in style sheet string: " + styleSheetString);
  return goog.html.SafeStyleSheet.
      createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheetString);
};


/**
 * Returns this SafeStyleSheet's value as a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeStyleSheet}, use {@code goog.html.SafeStyleSheet.unwrap}
 * instead of this method. If in doubt, assume that it's security relevant. In
 * particular, note that goog.html functions which return a goog.html type do
 * not guarantee the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml
 * // instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeStyleSheet#unwrap
 * @override
 */
goog.html.SafeStyleSheet.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeStyleSheet, use
   * {@code goog.html.SafeStyleSheet.unwrap}.
   *
   * @see goog.html.SafeStyleSheet#unwrap
   * @override
   */
  goog.html.SafeStyleSheet.prototype.toString = function() {
    return 'SafeStyleSheet{' +
        this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ + '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a
 * SafeStyleSheet object, and returns its value.
 *
 * @param {!goog.html.SafeStyleSheet} safeStyleSheet The object to extract from.
 * @return {string} The safeStyleSheet object's contained string, unless
 *     the run-time type check fails. In that case, {@code unwrap} returns an
 *     innocuous string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeStyleSheet.unwrap = function(safeStyleSheet) {
  // Perform additional Run-time type-checking to ensure that
  // safeStyleSheet is indeed an instance of the expected type.  This
  // provides some additional protection against security bugs due to
  // application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeStyleSheet instanceof goog.html.SafeStyleSheet &&
      safeStyleSheet.constructor === goog.html.SafeStyleSheet &&
      safeStyleSheet.SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeStyleSheet.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeStyleSheet.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_;
  } else {
    goog.asserts.fail(
        "expected object of type SafeStyleSheet, got '" + safeStyleSheet +
        "'");
    return 'type_error:SafeStyleSheet';
  }
};


/**
 * Package-internal utility method to create SafeStyleSheet instances.
 *
 * @param {string} styleSheet The string to initialize the SafeStyleSheet
 *     object with.
 * @return {!goog.html.SafeStyleSheet} The initialized SafeStyleSheet object.
 * @package
 */
goog.html.SafeStyleSheet.createSafeStyleSheetSecurityPrivateDoNotAccessOrElse =
    function(styleSheet) {
  return new goog.html.SafeStyleSheet().initSecurityPrivateDoNotAccessOrElse_(
      styleSheet);
};


/**
 * Called from createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} styleSheet
 * @return {!goog.html.SafeStyleSheet}
 * @private
 */
goog.html.SafeStyleSheet.prototype.initSecurityPrivateDoNotAccessOrElse_ =
    function(styleSheet) {
  this.privateDoNotAccessOrElseSafeStyleSheetWrappedValue_ = styleSheet;
  return this;
};


/**
 * A SafeStyleSheet instance corresponding to the empty string.
 * @const {!goog.html.SafeStyleSheet}
 */
goog.html.SafeStyleSheet.EMPTY =
    goog.html.SafeStyleSheet.
        createSafeStyleSheetSecurityPrivateDoNotAccessOrElse('');

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 * @author arv@google.com (Erik Arvidsson)
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):?} f The function to call
 *     for every element. This function takes 3 arguments (the value, the
 *     key and the object) and the return value is ignored.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @template T,K,V
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to call
 *     for every element. This
 *     function takes 3 arguments (the value, the key and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,V>} a new object in which only elements that passed the
 *     test are present.
 * @template T,K,V
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object<K,V>} obj The object over which to iterate.
 * @param {function(this:T,V,?,Object<K,V>):R} f The function to call
 *     for every element. This function
 *     takes 3 arguments (the value, the key and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {!Object<K,R>} a new object with the results from f.
 * @template T,K,V,R
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object<K,V>} obj The object to check.
 * @param {function(this:T,V,?,Object<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the value, the key and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 * @template T,K,V
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object<K,V>} obj The object to check.
 * @param {?function(this:T,V,?,Object<K,V>):boolean} f The function to
 *     call for every element. This function
 *     takes 3 arguments (the value, the key and the object) and should
 *     return a boolean.
 * @param {T=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 * @template T,K,V
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(/** @type {?} */ (opt_obj), obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object<K,V>} obj The object to pick a value from.
 * @return {V|undefined} The value or undefined if the object is empty.
 * @template K,V
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object<K,V>} obj The object in which to look for val.
 * @param {V} val The object for which to check.
 * @return {boolean} true if val is present.
 * @template K,V
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object<K,V>} obj The object from which to get the values.
 * @return {!Array<V>} The values in the object/map/hash.
 * @template K,V
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array<number|string>)} var_args A number of keys
 *     (as strings, or numbers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {?} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return obj !== null && key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object<K,V>} obj The object in which to look for val.
 * @param {V} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 * @template K,V
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object<K,V>):boolean} f The
 *      function to call for every element. Takes 3 arguments (the value,
 *     the key and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(/** @type {?} */ (opt_this), obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object<K,V>} obj The object to search in.
 * @param {function(this:T,V,string,Object<K,V>):boolean} f The function
 *     to call for every element. Takes 3 arguments (the value, the key
 *     and the object) and should return a boolean.
 * @param {T=} opt_this An optional "this" context for the function.
 * @return {V} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 * @template T,K,V
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {?} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if (rv = key in /** @type {!Object} */ (obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} val The value to add.
 * @template K,V
 */
goog.object.add = function(obj, key, val) {
  if (obj !== null && key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object<K,V>} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {R=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {V|R|undefined} The value for the given key.
 * @template K,V,R
 */
goog.object.get = function(obj, key, opt_val) {
  if (obj !== null && key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add.
 * @template K,V
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {V} value The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in /** @type {!Object} */ (obj) ? obj[key] : (obj[key] = value);
};


/**
 * Sets a key and value to an object if the key is not set. The value will be
 * the return value of the given function. If the key already exists, the
 * object will not be changed and the function will not be called (the function
 * will be lazily evaluated -- only called if necessary).
 *
 * This function is particularly useful for use with a map used a as a cache.
 *
 * @param {!Object<K,V>} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {function():V} f The value to add if the key wasn't present.
 * @return {V} The value of the entry at the end of the function.
 * @template K,V
 */
goog.object.setWithReturnValueIfNotSet = function(obj, key, f) {
  if (key in obj) {
    return obj[key];
  }

  var val = f();
  obj[key] = val;
  return val;
};


/**
 * Compares two objects for equality using === on the values.
 *
 * @param {!Object<K,V>} a
 * @param {!Object<K,V>} b
 * @return {boolean}
 * @template K,V
 */
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


/**
 * Does a flat clone of the object.
 *
 * @param {Object<K,V>} obj Object to clone.
 * @return {!Object<K,V>} Clone of the input object.
 * @template K,V
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (goog.isFunction(obj.clone)) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
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


/**
 * Creates an immutable view of the underlying object, if the browser
 * supports immutable objects.
 *
 * In default mode, writes to this view will fail silently. In strict mode,
 * they will throw an error.
 *
 * @param {!Object<K,V>} obj An object.
 * @return {!Object<K,V>} An immutable view of that object, or the
 *     original object if this browser does not support immutables.
 * @template K,V
 */
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};


/**
 * @param {!Object} obj An object.
 * @return {boolean} Whether this is an immutable view of the object.
 */
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};

// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for HTML element tag names.
 */
goog.provide('goog.dom.tags');

goog.require('goog.object');


/**
 * The void elements specified by
 * http://www.w3.org/TR/html-markup/syntax.html#void-elements.
 * @const @private {!Object<string, boolean>}
 */
goog.dom.tags.VOID_TAGS_ = goog.object.createSet(
    'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
    'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr');


/**
 * Checks whether the tag is void (with no contents allowed and no legal end
 * tag), for example 'br'.
 * @param {string} tagName The tag name in lower case.
 * @return {boolean}
 */
goog.dom.tags.isVoidTag = function(tagName) {
  return goog.dom.tags.VOID_TAGS_[tagName] === true;
};

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all HTML tag names specified in either the the W3C HTML 4.01 index of
 * elements or the HTML5 draft specification.
 *
 * References:
 * http://www.w3.org/TR/html401/index/elements.html
 * http://dev.w3.org/html5/spec/section-index.html
 *
 */
goog.provide('goog.dom.TagName');


/**
 * Enum of all html tag names specified by the W3C HTML4.01 and HTML5
 * specifications.
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  ARTICLE: 'ARTICLE',
  ASIDE: 'ASIDE',
  AUDIO: 'AUDIO',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDI: 'BDI',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CANVAS: 'CANVAS',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  COMMAND: 'COMMAND',
  DATA: 'DATA',
  DATALIST: 'DATALIST',
  DD: 'DD',
  DEL: 'DEL',
  DETAILS: 'DETAILS',
  DFN: 'DFN',
  DIALOG: 'DIALOG',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  EMBED: 'EMBED',
  FIELDSET: 'FIELDSET',
  FIGCAPTION: 'FIGCAPTION',
  FIGURE: 'FIGURE',
  FONT: 'FONT',
  FOOTER: 'FOOTER',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HEADER: 'HEADER',
  HGROUP: 'HGROUP',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  KEYGEN: 'KEYGEN',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MARK: 'MARK',
  MATH: 'MATH',
  MENU: 'MENU',
  META: 'META',
  METER: 'METER',
  NAV: 'NAV',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  OUTPUT: 'OUTPUT',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  PROGRESS: 'PROGRESS',
  Q: 'Q',
  RP: 'RP',
  RT: 'RT',
  RUBY: 'RUBY',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SECTION: 'SECTION',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SOURCE: 'SOURCE',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUMMARY: 'SUMMARY',
  SUP: 'SUP',
  SVG: 'SVG',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEMPLATE: 'TEMPLATE',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TIME: 'TIME',
  TITLE: 'TITLE',
  TR: 'TR',
  TRACK: 'TRACK',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR',
  VIDEO: 'VIDEO',
  WBR: 'WBR'
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview The SafeHtml type and its builders.
 *
 * TODO(xtof): Link to document stating type contract.
 */

goog.provide('goog.html.SafeHtml');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.TagName');
goog.require('goog.dom.tags');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string that is safe to use in HTML context in DOM APIs and HTML documents.
 *
 * A SafeHtml is a string-like object that carries the security type contract
 * that its value as a string will not cause untrusted script execution when
 * evaluated as HTML in a browser.
 *
 * Values of this type are guaranteed to be safe to use in HTML contexts,
 * such as, assignment to the innerHTML DOM property, or interpolation into
 * a HTML template in HTML PC_DATA context, in the sense that the use will not
 * result in a Cross-Site-Scripting vulnerability.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeHtml.create}, {@code goog.html.SafeHtml.htmlEscape}),
 * etc and not by invoking its constructor.  The constructor intentionally
 * takes no parameters and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * @see goog.html.SafeHtml#create
 * @see goog.html.SafeHtml#htmlEscape
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeHtml = function() {
  /**
   * The contained value of this SafeHtml.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeHtml#unwrap
   * @const
   * @private
   */
  this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;

  /**
   * This SafeHtml's directionality, or null if unknown.
   * @private {?goog.i18n.bidi.Dir}
   */
  this.dir_ = null;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = true;


/** @override */
goog.html.SafeHtml.prototype.getDirection = function() {
  return this.dir_;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this SafeHtml's value a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeHtml}, use {@code goog.html.SafeHtml.unwrap} instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * that the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.htmlEscape(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.htmlEscape() as fakeSafeHtml
 * // instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeHtml#unwrap
 * @override
 */
goog.html.SafeHtml.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeHtml, use
   * {@code goog.html.SafeHtml.unwrap}.
   *
   * @see goog.html.SafeHtml#unwrap
   * @override
   */
  goog.html.SafeHtml.prototype.toString = function() {
    return 'SafeHtml{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a SafeHtml
 * object, and returns its value.
 * @param {!goog.html.SafeHtml} safeHtml The object to extract from.
 * @return {string} The SafeHtml object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeHtml.unwrap = function(safeHtml) {
  // Perform additional run-time type-checking to ensure that safeHtml is indeed
  // an instance of the expected type.  This provides some additional protection
  // against security bugs due to application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeHtml instanceof goog.html.SafeHtml &&
      safeHtml.constructor === goog.html.SafeHtml &&
      safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeHtml, got \'' +
                      safeHtml + '\'');
    return 'type_error:SafeHtml';
  }
};


/**
 * Shorthand for union of types that can sensibly be converted to strings
 * or might already be SafeHtml (as SafeHtml is a goog.string.TypedString).
 * @private
 * @typedef {string|number|boolean|!goog.string.TypedString|
 *           !goog.i18n.bidi.DirectionalString}
 */
goog.html.SafeHtml.TextOrHtml_;


/**
 * Returns HTML-escaped text as a SafeHtml object.
 *
 * If text is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, the directionality of the new
 * {@code SafeHtml} object is set to {@code text}'s directionality, if known.
 * Otherwise, the directionality of the resulting SafeHtml is unknown (i.e.,
 * {@code null}).
 *
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
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
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.htmlEscape(textAsString), dir);
};


/**
 * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
 * &lt;br&gt;.
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscapePreservingNewlines = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.newLineToBr(goog.html.SafeHtml.unwrap(html)),
      html.getDirection());
};


/**
 * Returns HTML-escaped text as a SafeHtml object, with newlines changed to
 * &lt;br&gt; and escaping whitespace to preserve spatial formatting. Character
 * entity #160 is used to make it safer for XML.
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text to escape. If
 *     the parameter is of type SafeHtml it is returned directly (no escaping
 *     is done).
 * @return {!goog.html.SafeHtml} The escaped text, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscapePreservingNewlinesAndSpaces = function(
    textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  }
  var html = goog.html.SafeHtml.htmlEscape(textOrHtml);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      goog.string.whitespaceEscape(goog.html.SafeHtml.unwrap(html)),
      html.getDirection());
};


/**
 * Coerces an arbitrary object into a SafeHtml object.
 *
 * If {@code textOrHtml} is already of type {@code goog.html.SafeHtml}, the same
 * object is returned. Otherwise, {@code textOrHtml} is coerced to string, and
 * HTML-escaped. If {@code textOrHtml} is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, its directionality, if known, is
 * preserved.
 *
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text or SafeHtml to
 *     coerce.
 * @return {!goog.html.SafeHtml} The resulting SafeHtml object.
 * @deprecated Use goog.html.SafeHtml.htmlEscape.
 */
goog.html.SafeHtml.from = goog.html.SafeHtml.htmlEscape;


/**
 * @const
 * @private
 */
goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;


/**
 * Set of attributes containing URL as defined at
 * http://www.w3.org/TR/html5/index.html#attributes-1.
 * @private @const {!Object<string,boolean>}
 */
goog.html.SafeHtml.URL_ATTRIBUTES_ = goog.object.createSet('action', 'cite',
    'data', 'formaction', 'href', 'manifest', 'poster', 'src');


/**
 * Tags which are unsupported via create(). They might be supported via a
 * tag-specific create method. These are tags which might require a
 * TrustedResourceUrl in one of their attributes or a restricted type for
 * their content.
 * @private @const {!Object<string,boolean>}
 */
goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = goog.object.createSet(
    goog.dom.TagName.EMBED, goog.dom.TagName.IFRAME, goog.dom.TagName.LINK,
    goog.dom.TagName.OBJECT, goog.dom.TagName.SCRIPT, goog.dom.TagName.STYLE,
    goog.dom.TagName.TEMPLATE);


/**
 * @typedef {string|number|goog.string.TypedString|
 *     goog.html.SafeStyle.PropertyMap}
 * @private
 */
goog.html.SafeHtml.AttributeValue_;


/**
 * Creates a SafeHtml content consisting of a tag with optional attributes and
 * optional content.
 *
 * For convenience tag names and attribute names are accepted as regular
 * strings, instead of goog.string.Const. Nevertheless, you should not pass
 * user-controlled values to these parameters. Note that these parameters are
 * syntactically validated at runtime, and invalid values will result in
 * an exception.
 *
 * Example usage:
 *
 * goog.html.SafeHtml.create('br');
 * goog.html.SafeHtml.create('div', {'class': 'a'});
 * goog.html.SafeHtml.create('p', {}, 'a');
 * goog.html.SafeHtml.create('p', {}, goog.html.SafeHtml.create('br'));
 *
 * goog.html.SafeHtml.create('span', {
 *   'style': {'margin': '0'}
 * });
 *
 * To guarantee SafeHtml's type contract is upheld there are restrictions on
 * attribute values and tag names.
 *
 * - For attributes which contain script code (on*), a goog.string.Const is
 *   required.
 * - For attributes which contain style (style), a goog.html.SafeStyle or a
 *   goog.html.SafeStyle.PropertyMap is required.
 * - For attributes which are interpreted as URLs (e.g. src, href) a
 *   goog.html.SafeUrl, goog.string.Const or string is required. If a string
 *   is passed, it will be sanitized with SafeUrl.sanitize().
 * - For tags which can load code, more specific goog.html.SafeHtml.create*()
 *   functions must be used. Tags which can load code and are not supported by
 *   this function are embed, iframe, link, object, script, style, and template.
 *
 * @param {string} tagName The name of the tag. Only tag names consisting of
 *     [a-zA-Z0-9-] are allowed. Tag names documented above are disallowed.
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=}
 *     opt_attributes Mapping from attribute names to their values. Only
 *     attribute names consisting of [a-zA-Z0-9-] are allowed. Value of null or
 *     undefined causes the attribute to be omitted.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to
 *     HTML-escape and put inside the tag. This must be empty for void tags
 *     like <br>. Array elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided.
 * @throws {goog.asserts.AssertionError} If content for void tag is provided.
 */
goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
  if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
    throw Error('Invalid tag name <' + tagName + '>.');
  }
  if (tagName.toUpperCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
    throw Error('Tag name <' + tagName + '> is not allowed for SafeHtml.');
  }
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      tagName, opt_attributes, opt_content);
};


/**
 * Creates a SafeHtml representing an iframe tag.
 *
 * By default the sandbox attribute is set to an empty value, which is the most
 * secure option, as it confers the iframe the least privileges. If this
 * is too restrictive then granting individual privileges is the preferable
 * option. Unsetting the attribute entirely is the least secure option and
 * should never be done unless it's stricly necessary.
 *
 * @param {goog.html.TrustedResourceUrl=} opt_src The value of the src
 *     attribute. If null or undefined src will not be set.
 * @param {goog.html.SafeHtml=} opt_srcdoc The value of the srcdoc attribute.
 *     If null or undefined srcdoc will not be set.
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=}
 *     opt_attributes Mapping from attribute names to their values. Only
 *     attribute names consisting of [a-zA-Z0-9-] are allowed. Value of null or
 *     undefined causes the attribute to be omitted.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to
 *     HTML-escape and put inside the tag. Array elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided. If opt_attributes contains the src or srcdoc attributes.
 */
goog.html.SafeHtml.createIframe = function(
    opt_src, opt_srcdoc, opt_attributes, opt_content) {
  var fixedAttributes = {};
  fixedAttributes['src'] = opt_src || null;
  fixedAttributes['srcdoc'] = opt_srcdoc || null;
  var defaultAttributes = {'sandbox': ''};
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'iframe', attributes, opt_content);
};


/**
 * Creates a SafeHtml representing a style tag. The type attribute is set
 * to "text/css".
 * @param {!goog.html.SafeStyleSheet|!Array<!goog.html.SafeStyleSheet>}
 *     styleSheet Content to put inside the tag. Array elements are
 *     concatenated.
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=}
 *     opt_attributes Mapping from attribute names to their values. Only
 *     attribute names consisting of [a-zA-Z0-9-] are allowed. Value of null or
 *     undefined causes the attribute to be omitted.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid attribute name or attribute value is provided. If
 *     opt_attributes contains the type attribute.
 */
goog.html.SafeHtml.createStyle = function(styleSheet, opt_attributes) {
  var fixedAttributes = {'type': 'text/css'};
  var defaultAttributes = {};
  var attributes = goog.html.SafeHtml.combineAttributes(
      fixedAttributes, defaultAttributes, opt_attributes);

  var content = '';
  styleSheet = goog.array.concat(styleSheet);
  for (var i = 0; i < styleSheet.length; i++) {
    content += goog.html.SafeStyleSheet.unwrap(styleSheet[i]);
  }
  // Convert to SafeHtml so that it's not HTML-escaped.
  var htmlContent = goog.html.SafeHtml
      .createSafeHtmlSecurityPrivateDoNotAccessOrElse(
          content, goog.i18n.bidi.Dir.NEUTRAL);
  return goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse(
      'style', attributes, htmlContent);
};


/**
 * @param {string} tagName The tag name.
 * @param {string} name The attribute name.
 * @param {!goog.html.SafeHtml.AttributeValue_} value The attribute value.
 * @return {string} A "name=value" string.
 * @throws {Error} If attribute value is unsafe for the given tag and attribute.
 * @private
 */
goog.html.SafeHtml.getAttrNameAndValue_ = function(tagName, name, value) {
  // If it's goog.string.Const, allow any valid attribute name.
  if (value instanceof goog.string.Const) {
    value = goog.string.Const.unwrap(value);
  } else if (name.toLowerCase() == 'style') {
    value = goog.html.SafeHtml.getStyleValue_(value);
  } else if (/^on/i.test(name)) {
    // TODO(jakubvrana): Disallow more attributes with a special meaning.
    throw Error('Attribute "' + name +
        '" requires goog.string.Const value, "' + value + '" given.');
  // URL attributes handled differently accroding to tag.
  } else if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
    if (value instanceof goog.html.TrustedResourceUrl) {
      value = goog.html.TrustedResourceUrl.unwrap(value);
    } else if (value instanceof goog.html.SafeUrl) {
      value = goog.html.SafeUrl.unwrap(value);
    } else if (goog.isString(value)) {
      value = goog.html.SafeUrl.sanitize(value).getTypedStringValue();
    } else {
      throw Error('Attribute "' + name + '" on tag "' + tagName +
          '" requires goog.html.SafeUrl, goog.string.Const, or string,' +
          ' value "' + value + '" given.');
    }
  }

  // Accept SafeUrl, TrustedResourceUrl, etc. for attributes which only require
  // HTML-escaping.
  if (value.implementsGoogStringTypedString) {
    // Ok to call getTypedStringValue() since there's no reliance on the type
    // contract for security here.
    value = value.getTypedStringValue();
  }

  goog.asserts.assert(goog.isString(value) || goog.isNumber(value),
      'String or number value expected, got ' +
      (typeof value) + ' with value: ' + value);
  return name + '="' + goog.string.htmlEscape(String(value)) + '"';
};


/**
 * Gets value allowed in "style" attribute.
 * @param {goog.html.SafeHtml.AttributeValue_} value It could be SafeStyle or a
 *     map which will be passed to goog.html.SafeStyle.create.
 * @return {string} Unwrapped value.
 * @throws {Error} If string value is given.
 * @private
 */
goog.html.SafeHtml.getStyleValue_ = function(value) {
  if (!goog.isObject(value)) {
    throw Error('The "style" attribute requires goog.html.SafeStyle or map ' +
        'of style properties, ' + (typeof value) + ' given: ' + value);
  }
  if (!(value instanceof goog.html.SafeStyle)) {
    // Process the property bag into a style object.
    value = goog.html.SafeStyle.create(value);
  }
  return goog.html.SafeStyle.unwrap(value);
};


/**
 * Creates a SafeHtml content with known directionality consisting of a tag with
 * optional attributes and optional content.
 * @param {!goog.i18n.bidi.Dir} dir Directionality.
 * @param {string} tagName
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=} opt_attributes
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>=} opt_content
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 */
goog.html.SafeHtml.createWithDir = function(dir, tagName, opt_attributes,
    opt_content) {
  var html = goog.html.SafeHtml.create(tagName, opt_attributes, opt_content);
  html.dir_ = dir;
  return html;
};


/**
 * Creates a new SafeHtml object by concatenating values.
 * @param {...(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)} var_args Values to concatenate.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.concat = function(var_args) {
  var dir = goog.i18n.bidi.Dir.NEUTRAL;
  var content = '';

  /**
   * @param {!goog.html.SafeHtml.TextOrHtml_|
   *     !Array<!goog.html.SafeHtml.TextOrHtml_>} argument
   */
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
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      content, dir);
};


/**
 * Creates a new SafeHtml object with known directionality by concatenating the
 * values.
 * @param {!goog.i18n.bidi.Dir} dir Directionality.
 * @param {...(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)} var_args Elements of array
 *     arguments would be processed recursively.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.concatWithDir = function(dir, var_args) {
  var html = goog.html.SafeHtml.concat(goog.array.slice(arguments, 1));
  html.dir_ = dir;
  return html;
};


/**
 * Type marker for the SafeHtml type, used to implement additional run-time
 * type checking.
 * @const {!Object}
 * @private
 */
goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Package-internal utility method to create SafeHtml instances.
 *
 * @param {string} html The string to initialize the SafeHtml object with.
 * @param {?goog.i18n.bidi.Dir} dir The directionality of the SafeHtml to be
 *     constructed, or null if unknown.
 * @return {!goog.html.SafeHtml} The initialized SafeHtml object.
 * @package
 */
goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse = function(
    html, dir) {
  return new goog.html.SafeHtml().initSecurityPrivateDoNotAccessOrElse_(
      html, dir);
};


/**
 * Called from createSafeHtmlSecurityPrivateDoNotAccessOrElse(). This
 * method exists only so that the compiler can dead code eliminate static
 * fields (like EMPTY) when they're not accessed.
 * @param {string} html
 * @param {?goog.i18n.bidi.Dir} dir
 * @return {!goog.html.SafeHtml}
 * @private
 */
goog.html.SafeHtml.prototype.initSecurityPrivateDoNotAccessOrElse_ = function(
    html, dir) {
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = html;
  this.dir_ = dir;
  return this;
};


/**
 * Like create() but does not restrict which tags can be constructed.
 *
 * @param {string} tagName Tag name. Set or validated by caller.
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=} opt_attributes
 * @param {(!goog.html.SafeHtml.TextOrHtml_|
 *     !Array<!goog.html.SafeHtml.TextOrHtml_>)=} opt_content
 * @return {!goog.html.SafeHtml}
 * @throws {Error} If invalid or unsafe attribute name or value is provided.
 * @throws {goog.asserts.AssertionError} If content for void tag is provided.
 * @package
 */
goog.html.SafeHtml.createSafeHtmlTagSecurityPrivateDoNotAccessOrElse =
    function(tagName, opt_attributes, opt_content) {
  var dir = null;
  var result = '<' + tagName;

  if (opt_attributes) {
    for (var name in opt_attributes) {
      if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
        throw Error('Invalid attribute name "' + name + '".');
      }
      var value = opt_attributes[name];
      if (!goog.isDefAndNotNull(value)) {
        continue;
      }
      result += ' ' +
          goog.html.SafeHtml.getAttrNameAndValue_(tagName, name, value);
    }
  }

  var content = opt_content;
  if (!goog.isDefAndNotNull(content)) {
    content = [];
  } else if (!goog.isArray(content)) {
    content = [content];
  }

  if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
    goog.asserts.assert(!content.length,
        'Void tag <' + tagName + '> does not allow content.');
    result += '>';
  } else {
    var html = goog.html.SafeHtml.concat(content);
    result += '>' + goog.html.SafeHtml.unwrap(html) + '</' + tagName + '>';
    dir = html.getDirection();
  }

  var dirAttribute = opt_attributes && opt_attributes['dir'];
  if (dirAttribute) {
    if (/^(ltr|rtl|auto)$/i.test(dirAttribute)) {
      // If the tag has the "dir" attribute specified then its direction is
      // neutral because it can be safely used in any context.
      dir = goog.i18n.bidi.Dir.NEUTRAL;
    } else {
      dir = null;
    }
  }

  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      result, dir);
};


/**
 * @param {!Object<string, string>} fixedAttributes
 * @param {!Object<string, string>} defaultAttributes
 * @param {!Object<string, goog.html.SafeHtml.AttributeValue_>=}
 *     opt_attributes Optional attributes passed to create*().
 * @return {!Object<string, goog.html.SafeHtml.AttributeValue_>}
 * @throws {Error} If opt_attributes contains an attribute with the same name
 *     as an attribute in fixedAttributes.
 * @package
 */
goog.html.SafeHtml.combineAttributes = function(
    fixedAttributes, defaultAttributes, opt_attributes) {
  var combinedAttributes = {};
  var name;

  for (name in fixedAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, 'Must be lower case');
    combinedAttributes[name] = fixedAttributes[name];
  }
  for (name in defaultAttributes) {
    goog.asserts.assert(name.toLowerCase() == name, 'Must be lower case');
    combinedAttributes[name] = defaultAttributes[name];
  }

  for (name in opt_attributes) {
    var nameLower = name.toLowerCase();
    if (nameLower in fixedAttributes) {
      throw Error('Cannot override "' + nameLower + '" attribute, got "' +
          name + '" with value "' + opt_attributes[name] + '"');
    }
    if (nameLower in defaultAttributes) {
      delete combinedAttributes[nameLower];
    }
    combinedAttributes[name] = opt_attributes[name];
  }

  return combinedAttributes;
};


/**
 * A SafeHtml instance corresponding to the HTML doctype: "<!DOCTYPE html>".
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.DOCTYPE_HTML =
    goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '<!DOCTYPE html>', goog.i18n.bidi.Dir.NEUTRAL);


/**
 * A SafeHtml instance corresponding to the empty string.
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.EMPTY =
    goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
        '', goog.i18n.bidi.Dir.NEUTRAL);

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unchecked conversions to create values of goog.html types from
 * plain strings.  Use of these functions could potentially result in instances
 * of goog.html types that violate their type contracts, and hence result in
 * security vulnerabilties.
 *
 * Therefore, all uses of the methods herein must be carefully security
 * reviewed.  Avoid use of the methods in this file whenever possible; instead
 * prefer to create instances of goog.html types using inherently safe builders
 * or template systems.
 *
 *
 *
 * @visibility {//closure/goog/html:approved_for_unchecked_conversion}
 * @visibility {//closure/goog/bin/sizetests:__pkg__}
 */


goog.provide('goog.html.uncheckedconversions');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string');
goog.require('goog.string.Const');


/**
 * Performs an "unchecked conversion" to SafeHtml from a plain string that is
 * known to satisfy the SafeHtml type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code html} satisfies the SafeHtml type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} html A string that is claimed to adhere to the SafeHtml
 *     contract.
 * @param {?goog.i18n.bidi.Dir=} opt_dir The optional directionality of the
 *     SafeHtml to be constructed. A null or undefined value signifies an
 *     unknown directionality.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 * @suppress {visibility} For access to SafeHtml.create...  Note that this
 *     use is appropriate since this method is intended to be "package private"
 *     withing goog.html.  DO NOT call SafeHtml.create... from outside this
 *     package; use appropriate wrappers instead.
 */
goog.html.uncheckedconversions.safeHtmlFromStringKnownToSatisfyTypeContract =
    function(justification, html, opt_dir) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, opt_dir || null);
};


/**
 * Performs an "unchecked conversion" to SafeScript from a plain string that is
 * known to satisfy the SafeScript type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code script} satisfies the SafeScript type contract in
 * all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} script The string to wrap as a SafeScript.
 * @return {!goog.html.SafeScript} The value of {@code script}, wrapped in a
 *     SafeScript object.
 */
goog.html.uncheckedconversions.safeScriptFromStringKnownToSatisfyTypeContract =
    function(justification, script) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmpty(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeScript.createSafeScriptSecurityPrivateDoNotAccessOrElse(
      script);
};


/**
 * Performs an "unchecked conversion" to SafeStyle from a plain string that is
 * known to satisfy the SafeStyle type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code style} satisfies the SafeUrl type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} style The string to wrap as a SafeStyle.
 * @return {!goog.html.SafeStyle} The value of {@code style}, wrapped in a
 *     SafeStyle object.
 */
goog.html.uncheckedconversions.safeStyleFromStringKnownToSatisfyTypeContract =
    function(justification, style) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Performs an "unchecked conversion" to SafeStyleSheet from a plain string
 * that is known to satisfy the SafeStyleSheet type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code styleSheet} satisfies the SafeUrl type contract in
 * all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} styleSheet The string to wrap as a SafeStyleSheet.
 * @return {!goog.html.SafeStyleSheet} The value of {@code styleSheet}, wrapped
 *     in a SafeStyleSheet object.
 */
goog.html.uncheckedconversions.
    safeStyleSheetFromStringKnownToSatisfyTypeContract =
    function(justification, styleSheet) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeStyleSheet.
      createSafeStyleSheetSecurityPrivateDoNotAccessOrElse(styleSheet);
};


/**
 * Performs an "unchecked conversion" to SafeUrl from a plain string that is
 * known to satisfy the SafeUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code url} satisfies the SafeUrl type contract in all
 * possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} url The string to wrap as a SafeUrl.
 * @return {!goog.html.SafeUrl} The value of {@code url}, wrapped in a SafeUrl
 *     object.
 */
goog.html.uncheckedconversions.safeUrlFromStringKnownToSatisfyTypeContract =
    function(justification, url) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Performs an "unchecked conversion" to TrustedResourceUrl from a plain string
 * that is known to satisfy the TrustedResourceUrl type contract.
 *
 * IMPORTANT: Uses of this method must be carefully security-reviewed to ensure
 * that the value of {@code url} satisfies the TrustedResourceUrl type contract
 * in all possible program states.
 *
 *
 * @param {!goog.string.Const} justification A constant string explaining why
 *     this use of this method is safe. May include a security review ticket
 *     number.
 * @param {string} url The string to wrap as a TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} The value of {@code url}, wrapped in
 *     a TrustedResourceUrl object.
 */
goog.html.uncheckedconversions.
    trustedResourceUrlFromStringKnownToSatisfyTypeContract =
    function(justification, url) {
  // unwrap() called inside an assert so that justification can be optimized
  // away in production code.
  goog.asserts.assertString(goog.string.Const.unwrap(justification),
                            'must provide justification');
  goog.asserts.assert(
      !goog.string.isEmptyOrWhitespace(goog.string.Const.unwrap(justification)),
      'must provide non-empty justification');
  return goog.html.TrustedResourceUrl.
      createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};

// Copyright 2012 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Soy data primitives.
 *
 * The goal is to encompass data types used by Soy, especially to mark content
 * as known to be "safe".
 *
 * @author gboyer@google.com (Garrett Boyer)
 */

goog.provide('goog.soy.data.SanitizedContent');
goog.provide('goog.soy.data.SanitizedContentKind');
goog.provide('goog.soy.data.UnsanitizedText');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.string.Const');


/**
 * A type of textual content.
 *
 * This is an enum of type Object so that these values are unforgeable.
 *
 * @enum {!Object}
 */
goog.soy.data.SanitizedContentKind = {

  /**
   * A snippet of HTML that does not start or end inside a tag, comment, entity,
   * or DOCTYPE; and that does not contain any executable code
   * (JS, {@code <object>}s, etc.) from a different trust domain.
   */
  HTML: goog.DEBUG ? {sanitizedContentKindHtml: true} : {},

  /**
   * Executable Javascript code or expression, safe for insertion in a
   * script-tag or event handler context, known to be free of any
   * attacker-controlled scripts. This can either be side-effect-free
   * Javascript (such as JSON) or Javascript that's entirely under Google's
   * control.
   */
  JS: goog.DEBUG ? {sanitizedContentJsChars: true} : {},

  /** A properly encoded portion of a URI. */
  URI: goog.DEBUG ? {sanitizedContentUri: true} : {},

  /** A resource URI not under attacker control. */
  TRUSTED_RESOURCE_URI:
      goog.DEBUG ? {sanitizedContentTrustedResourceUri: true} : {},

  /**
   * Repeated attribute names and values. For example,
   * {@code dir="ltr" foo="bar" onclick="trustedFunction()" checked}.
   */
  ATTRIBUTES: goog.DEBUG ? {sanitizedContentHtmlAttribute: true} : {},

  // TODO: Consider separating rules, declarations, and values into
  // separate types, but for simplicity, we'll treat explicitly blessed
  // SanitizedContent as allowed in all of these contexts.
  /**
   * A CSS3 declaration, property, value or group of semicolon separated
   * declarations.
   */
  CSS: goog.DEBUG ? {sanitizedContentCss: true} : {},

  /**
   * Unsanitized plain-text content.
   *
   * This is effectively the "null" entry of this enum, and is sometimes used
   * to explicitly mark content that should never be used unescaped. Since any
   * string is safe to use as text, being of ContentKind.TEXT makes no
   * guarantees about its safety in any other context such as HTML.
   */
  TEXT: goog.DEBUG ? {sanitizedContentKindText: true} : {}
};



/**
 * A string-like object that carries a content-type and a content direction.
 *
 * IMPORTANT! Do not create these directly, nor instantiate the subclasses.
 * Instead, use a trusted, centrally reviewed library as endorsed by your team
 * to generate these objects. Otherwise, you risk accidentally creating
 * SanitizedContent that is attacker-controlled and gets evaluated unescaped in
 * templates.
 *
 * @constructor
 */
goog.soy.data.SanitizedContent = function() {
  throw Error('Do not instantiate directly');
};


/**
 * The context in which this content is safe from XSS attacks.
 * @type {goog.soy.data.SanitizedContentKind}
 */
goog.soy.data.SanitizedContent.prototype.contentKind;


/**
 * The content's direction; null if unknown and thus to be estimated when
 * necessary.
 * @type {?goog.i18n.bidi.Dir}
 */
goog.soy.data.SanitizedContent.prototype.contentDir = null;


/**
 * The already-safe content.
 * @protected {string}
 */
goog.soy.data.SanitizedContent.prototype.content;


/**
 * Gets the already-safe content.
 * @return {string}
 */
goog.soy.data.SanitizedContent.prototype.getContent = function() {
  return this.content;
};


/** @override */
goog.soy.data.SanitizedContent.prototype.toString = function() {
  return this.content;
};


/**
 * Converts sanitized content of kind TEXT or HTML into SafeHtml. HTML content
 * is converted without modification, while text content is HTML-escaped.
 * @return {!goog.html.SafeHtml}
 * @throws {Error} when the content kind is not TEXT or HTML.
 */
goog.soy.data.SanitizedContent.prototype.toSafeHtml = function() {
  if (this.contentKind === goog.soy.data.SanitizedContentKind.TEXT) {
    return goog.html.SafeHtml.htmlEscape(this.toString());
  }
  if (this.contentKind !== goog.soy.data.SanitizedContentKind.HTML) {
    throw Error('Sanitized content was not of kind TEXT or HTML.');
  }
  return goog.html.uncheckedconversions.
      safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Soy SanitizedContent of kind HTML produces ' +
                  'SafeHtml-contract-compliant value.'),
          this.toString(), this.contentDir);
};



/**
 * An intermediary base class to allow the type system to sepcify text templates
 * without referencing the soydata package.
 * @extends {goog.soy.data.SanitizedContent}
 * @constructor
 */
goog.soy.data.UnsanitizedText = function() {
  // TODO(gboyer): Delete this class after moving soydata to Closure.
  goog.soy.data.UnsanitizedText.base(this, 'constructor');
};
goog.inherits(goog.soy.data.UnsanitizedText, goog.soy.data.SanitizedContent);

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities used by goog.labs.userAgent tools. These functions
 * should not be used outside of goog.labs.userAgent.*.
 *
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.userAgent.util');

goog.require('goog.string');


/**
 * Gets the native userAgent string from navigator if it exists.
 * If navigator or navigator.userAgent string is missing, returns an empty
 * string.
 * @return {string}
 * @private
 */
goog.labs.userAgent.util.getNativeUserAgentString_ = function() {
  var navigator = goog.labs.userAgent.util.getNavigator_();
  if (navigator) {
    var userAgent = navigator.userAgent;
    if (userAgent) {
      return userAgent;
    }
  }
  return '';
};


/**
 * Getter for the native navigator.
 * This is a separate function so it can be stubbed out in testing.
 * @return {Navigator}
 * @private
 */
goog.labs.userAgent.util.getNavigator_ = function() {
  return goog.global.navigator;
};


/**
 * A possible override for applications which wish to not check
 * navigator.userAgent but use a specified value for detection instead.
 * @private {string}
 */
goog.labs.userAgent.util.userAgent_ =
    goog.labs.userAgent.util.getNativeUserAgentString_();


/**
 * Applications may override browser detection on the built in
 * navigator.userAgent object by setting this string. Set to null to use the
 * browser object instead.
 * @param {?string=} opt_userAgent The User-Agent override.
 */
goog.labs.userAgent.util.setUserAgent = function(opt_userAgent) {
  goog.labs.userAgent.util.userAgent_ = opt_userAgent ||
      goog.labs.userAgent.util.getNativeUserAgentString_();
};


/**
 * @return {string} The user agent string.
 */
goog.labs.userAgent.util.getUserAgent = function() {
  return goog.labs.userAgent.util.userAgent_;
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string, ignoring
 *     case.
 */
goog.labs.userAgent.util.matchUserAgent = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.contains(userAgent, str);
};


/**
 * @param {string} str
 * @return {boolean} Whether the user agent contains the given string.
 */
goog.labs.userAgent.util.matchUserAgentIgnoreCase = function(str) {
  var userAgent = goog.labs.userAgent.util.getUserAgent();
  return goog.string.caseInsensitiveContains(userAgent, str);
};


/**
 * Parses the user agent into tuples for each section.
 * @param {string} userAgent
 * @return {!Array<!Array<string>>} Tuples of key, version, and the contents
 *     of the parenthetical.
 */
goog.labs.userAgent.util.extractVersionTuples = function(userAgent) {
  // Matches each section of a user agent string.
  // Example UA:
  // Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us)
  // AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405
  // This has three version tuples: Mozilla, AppleWebKit, and Mobile.

  var versionRegExp = new RegExp(
      // Key. Note that a key may have a space.
      // (i.e. 'Mobile Safari' in 'Mobile Safari/5.0')
      '(\\w[\\w ]+)' +

      '/' +                // slash
      '([^\\s]+)' +        // version (i.e. '5.0b')
      '\\s*' +             // whitespace
      '(?:\\((.*?)\\))?',  // parenthetical info. parentheses not matched.
      'g');

  var data = [];
  var match;

  // Iterate and collect the version tuples.  Each iteration will be the
  // next regex match.
  while (match = versionRegExp.exec(userAgent)) {
    data.push([
      match[1],  // key
      match[2],  // value
      // || undefined as this is not undefined in IE7 and IE8
      match[3] || undefined  // info
    ]);
  }

  return data;
};


// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent platform detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on browser brand, rendering engine, or device see the
 * other sub-namespaces in goog.labs.userAgent (browser, engine, and device
 * respectively).
 *
 */

goog.provide('goog.labs.userAgent.platform');

goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the platform is Android.
 */
goog.labs.userAgent.platform.isAndroid = function() {
  return goog.labs.userAgent.util.matchUserAgent('Android');
};


/**
 * @return {boolean} Whether the platform is iPod.
 */
goog.labs.userAgent.platform.isIpod = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPod');
};


/**
 * @return {boolean} Whether the platform is iPhone.
 */
goog.labs.userAgent.platform.isIphone = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPhone') &&
      !goog.labs.userAgent.util.matchUserAgent('iPod') &&
      !goog.labs.userAgent.util.matchUserAgent('iPad');
};


/**
 * @return {boolean} Whether the platform is iPad.
 */
goog.labs.userAgent.platform.isIpad = function() {
  return goog.labs.userAgent.util.matchUserAgent('iPad');
};


/**
 * @return {boolean} Whether the platform is iOS.
 */
goog.labs.userAgent.platform.isIos = function() {
  return goog.labs.userAgent.platform.isIphone() ||
      goog.labs.userAgent.platform.isIpad() ||
      goog.labs.userAgent.platform.isIpod();
};


/**
 * @return {boolean} Whether the platform is Mac.
 */
goog.labs.userAgent.platform.isMacintosh = function() {
  return goog.labs.userAgent.util.matchUserAgent('Macintosh');
};


/**
 * Note: ChromeOS is not considered to be Linux as it does not report itself
 * as Linux in the user agent string.
 * @return {boolean} Whether the platform is Linux.
 */
goog.labs.userAgent.platform.isLinux = function() {
  return goog.labs.userAgent.util.matchUserAgent('Linux');
};


/**
 * @return {boolean} Whether the platform is Windows.
 */
goog.labs.userAgent.platform.isWindows = function() {
  return goog.labs.userAgent.util.matchUserAgent('Windows');
};


/**
 * @return {boolean} Whether the platform is ChromeOS.
 */
goog.labs.userAgent.platform.isChromeOS = function() {
  return goog.labs.userAgent.util.matchUserAgent('CrOS');
};


/**
 * The version of the platform. We only determine the version for Windows,
 * Mac, and Chrome OS. It doesn't make much sense on Linux. For Windows, we only
 * look at the NT version. Non-NT-based versions (e.g. 95, 98, etc.) are given
 * version 0.0.
 *
 * @return {string} The platform version or empty string if version cannot be
 *     determined.
 */
goog.labs.userAgent.platform.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  var version = '', re;
  if (goog.labs.userAgent.platform.isWindows()) {
    re = /Windows (?:NT|Phone) ([0-9.]+)/;
    var match = re.exec(userAgentString);
    if (match) {
      version = match[1];
    } else {
      version = '0.0';
    }
  } else if (goog.labs.userAgent.platform.isIos()) {
    re = /(?:iPhone|iPod|iPad|CPU)\s+OS\s+(\S+)/;
    var match = re.exec(userAgentString);
    // Report the version as x.y.z and not x_y_z
    version = match && match[1].replace(/_/g, '.');
  } else if (goog.labs.userAgent.platform.isMacintosh()) {
    re = /Mac OS X ([0-9_.]+)/;
    var match = re.exec(userAgentString);
    // Note: some old versions of Camino do not report an OSX version.
    // Default to 10.
    version = match ? match[1].replace(/_/g, '.') : '10';
  } else if (goog.labs.userAgent.platform.isAndroid()) {
    re = /Android\s+([^\);]+)(\)|;)/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  } else if (goog.labs.userAgent.platform.isChromeOS()) {
    re = /(?:CrOS\s+(?:i686|x86_64)\s+([0-9.]+))/;
    var match = re.exec(userAgentString);
    version = match && match[1];
  }
  return version || '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.platform.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.platform.getVersion(),
                                     version) >= 0;
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection (Browser).
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For more information on rendering engine, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent, goog.labs.userAgent.platform,
 * goog.labs.userAgent.device respectively.)
 *
 * @author martone@google.com (Andy Martone)
 */

goog.provide('goog.labs.userAgent.browser');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.object');
goog.require('goog.string');


// TODO(nnaze): Refactor to remove excessive exclusion logic in matching
// functions.


/**
 * @return {boolean} Whether the user's browser is Opera.
 * @private
 */
goog.labs.userAgent.browser.matchOpera_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Opera') ||
      goog.labs.userAgent.util.matchUserAgent('OPR');
};


/**
 * @return {boolean} Whether the user's browser is IE.
 * @private
 */
goog.labs.userAgent.browser.matchIE_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the user's browser is Edge.
 * @private
 */
goog.labs.userAgent.browser.matchEdge_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Edge');
};


/**
 * @return {boolean} Whether the user's browser is Firefox.
 * @private
 */
goog.labs.userAgent.browser.matchFirefox_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Firefox');
};


/**
 * @return {boolean} Whether the user's browser is Safari.
 * @private
 */
goog.labs.userAgent.browser.matchSafari_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Safari') &&
      !(goog.labs.userAgent.browser.matchChrome_() ||
        goog.labs.userAgent.browser.matchCoast_() ||
        goog.labs.userAgent.browser.matchOpera_() ||
        goog.labs.userAgent.browser.matchEdge_() ||
        goog.labs.userAgent.browser.isSilk() ||
        goog.labs.userAgent.util.matchUserAgent('Android'));
};


/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 * @private
 */
goog.labs.userAgent.browser.matchCoast_ = function() {
  return goog.labs.userAgent.util.matchUserAgent('Coast');
};


/**
 * @return {boolean} Whether the user's browser is iOS Webview.
 * @private
 */
goog.labs.userAgent.browser.matchIosWebview_ = function() {
  // iOS Webview does not show up as Chrome or Safari. Also check for Opera's
  // WebKit-based iOS browser, Coast.
  return (goog.labs.userAgent.util.matchUserAgent('iPad') ||
          goog.labs.userAgent.util.matchUserAgent('iPhone')) &&
      !goog.labs.userAgent.browser.matchSafari_() &&
      !goog.labs.userAgent.browser.matchChrome_() &&
      !goog.labs.userAgent.browser.matchCoast_() &&
      goog.labs.userAgent.util.matchUserAgent('AppleWebKit');
};


/**
 * @return {boolean} Whether the user's browser is Chrome.
 * @private
 */
goog.labs.userAgent.browser.matchChrome_ = function() {
  return (goog.labs.userAgent.util.matchUserAgent('Chrome') ||
      goog.labs.userAgent.util.matchUserAgent('CriOS')) &&
      !goog.labs.userAgent.browser.matchOpera_() &&
      !goog.labs.userAgent.browser.matchEdge_();
};


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 * @private
 */
goog.labs.userAgent.browser.matchAndroidBrowser_ = function() {
  // Android can appear in the user agent string for Chrome on Android.
  // This is not the Android standalone browser if it does.
  return goog.labs.userAgent.util.matchUserAgent('Android') &&
      !(goog.labs.userAgent.browser.isChrome() ||
        goog.labs.userAgent.browser.isFirefox() ||
        goog.labs.userAgent.browser.isOpera() ||
        goog.labs.userAgent.browser.isSilk());
};


/**
 * @return {boolean} Whether the user's browser is Opera.
 */
goog.labs.userAgent.browser.isOpera = goog.labs.userAgent.browser.matchOpera_;


/**
 * @return {boolean} Whether the user's browser is IE.
 */
goog.labs.userAgent.browser.isIE = goog.labs.userAgent.browser.matchIE_;


/**
 * @return {boolean} Whether the user's browser is Edge.
 */
goog.labs.userAgent.browser.isEdge = goog.labs.userAgent.browser.matchEdge_;


/**
 * @return {boolean} Whether the user's browser is Firefox.
 */
goog.labs.userAgent.browser.isFirefox =
    goog.labs.userAgent.browser.matchFirefox_;


/**
 * @return {boolean} Whether the user's browser is Safari.
 */
goog.labs.userAgent.browser.isSafari =
    goog.labs.userAgent.browser.matchSafari_;


/**
 * @return {boolean} Whether the user's browser is Coast (Opera's Webkit-based
 *     iOS browser).
 */
goog.labs.userAgent.browser.isCoast =
    goog.labs.userAgent.browser.matchCoast_;


/**
 * @return {boolean} Whether the user's browser is iOS Webview.
 */
goog.labs.userAgent.browser.isIosWebview =
    goog.labs.userAgent.browser.matchIosWebview_;


/**
 * @return {boolean} Whether the user's browser is Chrome.
 */
goog.labs.userAgent.browser.isChrome =
    goog.labs.userAgent.browser.matchChrome_;


/**
 * @return {boolean} Whether the user's browser is the Android browser.
 */
goog.labs.userAgent.browser.isAndroidBrowser =
    goog.labs.userAgent.browser.matchAndroidBrowser_;


/**
 * For more information, see:
 * http://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
 * @return {boolean} Whether the user's browser is Silk.
 */
goog.labs.userAgent.browser.isSilk = function() {
  return goog.labs.userAgent.util.matchUserAgent('Silk');
};


/**
 * @return {string} The browser version or empty string if version cannot be
 *     determined. Note that for Internet Explorer, this returns the version of
 *     the browser, not the version of the rendering engine. (IE 8 in
 *     compatibility mode will return 8.0 rather than 7.0. To determine the
 *     rendering engine version, look at document.documentMode instead. See
 *     http://msdn.microsoft.com/en-us/library/cc196988(v=vs.85).aspx for more
 *     details.)
 */
goog.labs.userAgent.browser.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  // Special case IE since IE's version is inside the parenthesis and
  // without the '/'.
  if (goog.labs.userAgent.browser.isIE()) {
    return goog.labs.userAgent.browser.getIEVersion_(userAgentString);
  }

  var versionTuples = goog.labs.userAgent.util.extractVersionTuples(
      userAgentString);

  // Construct a map for easy lookup.
  var versionMap = {};
  goog.array.forEach(versionTuples, function(tuple) {
    // Note that the tuple is of length three, but we only care about the
    // first two.
    var key = tuple[0];
    var value = tuple[1];
    versionMap[key] = value;
  });

  var versionMapHasKey = goog.partial(goog.object.containsKey, versionMap);

  // Gives the value with the first key it finds, otherwise empty string.
  function lookUpValueWithKeys(keys) {
    var key = goog.array.find(keys, versionMapHasKey);
    return versionMap[key] || '';
  }

  // Check Opera before Chrome since Opera 15+ has "Chrome" in the string.
  // See
  // http://my.opera.com/ODIN/blog/2013/07/15/opera-user-agent-strings-opera-15-and-beyond
  if (goog.labs.userAgent.browser.isOpera()) {
    // Opera 10 has Version/10.0 but Opera/9.8, so look for "Version" first.
    // Opera uses 'OPR' for more recent UAs.
    return lookUpValueWithKeys(['Version', 'Opera', 'OPR']);
  }

  // Check Edge before Chrome since it has Chrome in the string.
  if (goog.labs.userAgent.browser.isEdge()) {
    return lookUpValueWithKeys(['Edge']);
  }

  if (goog.labs.userAgent.browser.isChrome()) {
    return lookUpValueWithKeys(['Chrome', 'CriOS']);
  }

  // Usually products browser versions are in the third tuple after "Mozilla"
  // and the engine.
  var tuple = versionTuples[2];
  return tuple && tuple[1] || '';
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the browser version is higher or the same as the
 *     given version.
 */
goog.labs.userAgent.browser.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.browser.getVersion(),
                                     version) >= 0;
};


/**
 * Determines IE version. More information:
 * http://msdn.microsoft.com/en-us/library/ie/bg182625(v=vs.85).aspx#uaString
 * http://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
 * http://blogs.msdn.com/b/ie/archive/2010/03/23/introducing-ie9-s-user-agent-string.aspx
 * http://blogs.msdn.com/b/ie/archive/2009/01/09/the-internet-explorer-8-user-agent-string-updated-edition.aspx
 *
 * @param {string} userAgent the User-Agent.
 * @return {string}
 * @private
 */
goog.labs.userAgent.browser.getIEVersion_ = function(userAgent) {
  // IE11 may identify itself as MSIE 9.0 or MSIE 10.0 due to an IE 11 upgrade
  // bug. Example UA:
  // Mozilla/5.0 (MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; rv:11.0)
  // like Gecko.
  // See http://www.whatismybrowser.com/developers/unknown-user-agent-fragments.
  var rv = /rv: *([\d\.]*)/.exec(userAgent);
  if (rv && rv[1]) {
    return rv[1];
  }

  var version = '';
  var msie = /MSIE +([\d\.]+)/.exec(userAgent);
  if (msie && msie[1]) {
    // IE in compatibility mode usually identifies itself as MSIE 7.0; in this
    // case, use the Trident version to determine the version of IE. For more
    // details, see the links above.
    var tridentVersion = /Trident\/(\d.\d)/.exec(userAgent);
    if (msie[1] == '7.0') {
      if (tridentVersion && tridentVersion[1]) {
        switch (tridentVersion[1]) {
          case '4.0':
            version = '8.0';
            break;
          case '5.0':
            version = '9.0';
            break;
          case '6.0':
            version = '10.0';
            break;
          case '7.0':
            version = '11.0';
            break;
        }
      } else {
        version = '7.0';
      }
    } else {
      version = msie[1];
    }
  }
  return version;
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Closure user agent detection.
 * @see http://en.wikipedia.org/wiki/User_agent
 * For more information on browser brand, platform, or device see the other
 * sub-namespaces in goog.labs.userAgent (browser, platform, and device).
 *
 */

goog.provide('goog.labs.userAgent.engine');

goog.require('goog.array');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @return {boolean} Whether the rendering engine is Presto.
 */
goog.labs.userAgent.engine.isPresto = function() {
  return goog.labs.userAgent.util.matchUserAgent('Presto');
};


/**
 * @return {boolean} Whether the rendering engine is Trident.
 */
goog.labs.userAgent.engine.isTrident = function() {
  // IE only started including the Trident token in IE8.
  return goog.labs.userAgent.util.matchUserAgent('Trident') ||
      goog.labs.userAgent.util.matchUserAgent('MSIE');
};


/**
 * @return {boolean} Whether the rendering engine is Edge.
 */
goog.labs.userAgent.engine.isEdge = function() {
  return goog.labs.userAgent.util.matchUserAgent('Edge');
};


/**
 * @return {boolean} Whether the rendering engine is WebKit.
 */
goog.labs.userAgent.engine.isWebKit = function() {
  return goog.labs.userAgent.util.matchUserAgentIgnoreCase('WebKit') &&
      !goog.labs.userAgent.engine.isEdge();
};


/**
 * @return {boolean} Whether the rendering engine is Gecko.
 */
goog.labs.userAgent.engine.isGecko = function() {
  return goog.labs.userAgent.util.matchUserAgent('Gecko') &&
      !goog.labs.userAgent.engine.isWebKit() &&
      !goog.labs.userAgent.engine.isTrident() &&
      !goog.labs.userAgent.engine.isEdge();
};


/**
 * @return {string} The rendering engine's version or empty string if version
 *     can't be determined.
 */
goog.labs.userAgent.engine.getVersion = function() {
  var userAgentString = goog.labs.userAgent.util.getUserAgent();
  if (userAgentString) {
    var tuples = goog.labs.userAgent.util.extractVersionTuples(
        userAgentString);

    var engineTuple = goog.labs.userAgent.engine.getEngineTuple_(tuples);
    if (engineTuple) {
      // In Gecko, the version string is either in the browser info or the
      // Firefox version.  See Gecko user agent string reference:
      // http://goo.gl/mULqa
      if (engineTuple[0] == 'Gecko') {
        return goog.labs.userAgent.engine.getVersionForKey_(
            tuples, 'Firefox');
      }

      return engineTuple[1];
    }

    // MSIE has only one version identifier, and the Trident version is
    // specified in the parenthetical. IE Edge is covered in the engine tuple
    // detection.
    var browserTuple = tuples[0];
    var info;
    if (browserTuple && (info = browserTuple[2])) {
      var match = /Trident\/([^\s;]+)/.exec(info);
      if (match) {
        return match[1];
      }
    }
  }
  return '';
};


/**
 * @param {!Array<!Array<string>>} tuples Extracted version tuples.
 * @return {!Array<string>|undefined} The engine tuple or undefined if not
 *     found.
 * @private
 */
goog.labs.userAgent.engine.getEngineTuple_ = function(tuples) {
  if (!goog.labs.userAgent.engine.isEdge()) {
    return tuples[1];
  }
  for (var i = 0; i < tuples.length; i++) {
    var tuple = tuples[i];
    if (tuple[0] == 'Edge') {
      return tuple;
    }
  }
};


/**
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the rendering engine version is higher or the same
 *     as the given version.
 */
goog.labs.userAgent.engine.isVersionOrHigher = function(version) {
  return goog.string.compareVersions(goog.labs.userAgent.engine.getVersion(),
                                     version) >= 0;
};


/**
 * @param {!Array<!Array<string>>} tuples Version tuples.
 * @param {string} key The key to look for.
 * @return {string} The version string of the given key, if present.
 *     Otherwise, the empty string.
 * @private
 */
goog.labs.userAgent.engine.getVersionForKey_ = function(tuples, key) {
  // TODO(nnaze): Move to util if useful elsewhere.

  var pair = goog.array.find(tuples, function(pair) {
    return key == pair[0];
  });

  return pair && pair[1] || '';
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @author arv@google.com (Erik Arvidsson)
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.engine');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.labs.userAgent.util');
goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.define('goog.userAgent.ASSUME_IE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is EDGE.
 */
goog.define('goog.userAgent.ASSUME_EDGE', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.define('goog.userAgent.ASSUME_GECKO', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.define('goog.userAgent.ASSUME_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.define('goog.userAgent.ASSUME_MOBILE_WEBKIT', false);


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.define('goog.userAgent.ASSUME_OPERA', false);


/**
 * @define {boolean} Whether the
 *     {@code goog.userAgent.isVersionOrHigher}
 *     function will return true for any version.
 */
goog.define('goog.userAgent.ASSUME_ANY_VERSION', false);


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_EDGE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 *
 * @return {string} The userAgent string.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.labs.userAgent.util.getUserAgent();
};


/**
 * TODO(nnaze): Change type to "Navigator" and update compilation targets.
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (in a WorkerPool, for example).
  return goog.global['navigator'] || null;
};


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA :
    goog.labs.userAgent.browser.isOpera();


/**
 * Whether the user agent is Internet Explorer.
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE :
    goog.labs.userAgent.browser.isIE();


/**
 * Whether the user agent is Microsoft Edge.
 * @type {boolean}
 */
goog.userAgent.EDGE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_EDGE :
    goog.labs.userAgent.engine.isEdge();


/**
 * Whether the user agent is MS Internet Explorer or MS Edge.
 * @type {boolean}
 */
goog.userAgent.EDGE_OR_IE = goog.userAgent.EDGE || goog.userAgent.IE;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Firefox, and others.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.labs.userAgent.engine.isGecko();


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.labs.userAgent.engine.isWebKit();


/**
 * Whether the user agent is running on a mobile device.
 *
 * This is a separate function so that the logic can be tested.
 *
 * TODO(nnaze): Investigate swapping in goog.labs.userAgent.device.isMobile().
 *
 * @return {boolean} Whether the user agent is running on a mobile device.
 * @private
 */
goog.userAgent.isMobile_ = function() {
  return goog.userAgent.WEBKIT &&
         goog.labs.userAgent.util.matchUserAgent('Mobile');
};


/**
 * Whether the user agent is running on a mobile device.
 *
 * TODO(nnaze): Consider deprecating MOBILE when labs.userAgent
 *   is promoted as the gecko/webkit logic is likely inaccurate.
 *
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.isMobile_();


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_MAC', false);


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_WINDOWS', false);


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.define('goog.userAgent.ASSUME_LINUX', false);


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.define('goog.userAgent.ASSUME_X11', false);


/**
 * @define {boolean} Whether the user agent is running on Android.
 */
goog.define('goog.userAgent.ASSUME_ANDROID', false);


/**
 * @define {boolean} Whether the user agent is running on an iPhone.
 */
goog.define('goog.userAgent.ASSUME_IPHONE', false);


/**
 * @define {boolean} Whether the user agent is running on an iPad.
 */
goog.define('goog.userAgent.ASSUME_IPAD', false);


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11 ||
    goog.userAgent.ASSUME_ANDROID ||
    goog.userAgent.ASSUME_IPHONE ||
    goog.userAgent.ASSUME_IPAD;


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.labs.userAgent.platform.isMacintosh();


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS :
    goog.labs.userAgent.platform.isWindows();


/**
 * Whether the user agent is Linux per the legacy behavior of
 * goog.userAgent.LINUX, which considered ChromeOS to also be
 * Linux.
 * @return {boolean}
 * @private
 */
goog.userAgent.isLegacyLinux_ = function() {
  return goog.labs.userAgent.platform.isLinux() ||
      goog.labs.userAgent.platform.isChromeOS();
};


/**
 * Whether the user agent is running on a Linux operating system.
 *
 * Note that goog.userAgent.LINUX considers ChromeOS to be Linux,
 * while goog.labs.userAgent.platform considers ChromeOS and
 * Linux to be different OSes.
 *
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX :
    goog.userAgent.isLegacyLinux_();


/**
 * @return {boolean} Whether the user agent is an X11 windowing system.
 * @private
 */
goog.userAgent.isX11_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return !!navigator &&
      goog.string.contains(navigator['appVersion'] || '', 'X11');
};


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 :
    goog.userAgent.isX11_();


/**
 * Whether the user agent is running on Android.
 * @type {boolean}
 */
goog.userAgent.ANDROID = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_ANDROID :
    goog.labs.userAgent.platform.isAndroid();


/**
 * Whether the user agent is running on an iPhone.
 * @type {boolean}
 */
goog.userAgent.IPHONE = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPHONE :
    goog.labs.userAgent.platform.isIphone();


/**
 * Whether the user agent is running on an iPad.
 * @type {boolean}
 */
goog.userAgent.IPAD = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_IPAD :
    goog.labs.userAgent.platform.isIpad();


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * Assumes user agent is opera.
 * @private
 */
goog.userAgent.operaVersion_ = function() {
  var version = goog.global.opera.version;
  try {
    return version();
  } catch (e) {
    return version;
  }
};


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  if (goog.userAgent.OPERA && goog.global['opera']) {
    return goog.userAgent.operaVersion_();
  }

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '';
  var arr = goog.userAgent.getVersionRegexResult_();
  if (arr) {
    version = arr ? arr[1] : '';
  }

  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }

  return version;
};


/**
 * @return {Array|undefined} The version regex matches from parsing the user
 *     agent string. These regex statements must be executed inline so they can
 *     be compiled out by the closure compiler with the rest of the useragent
 *     detection logic when ASSUME_* is specified.
 * @private
 */
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
    // WebKit/125.4
    return /WebKit\/(\S+)/.exec(userAgent);
  }
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersionOrHigher}.
 * Calls to compareVersions are surprisingly expensive and, as a browser's
 * version number is unlikely to change during a session, we cache the results.
 * @const
 * @private
 */
goog.userAgent.isVersionOrHigherCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersionOrHigher = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionOrHigherCache_[version] ||
      (goog.userAgent.isVersionOrHigherCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Deprecated alias to {@code goog.userAgent.isVersionOrHigher}.
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 * @deprecated Use goog.userAgent.isVersionOrHigher().
 */
goog.userAgent.isVersion = goog.userAgent.isVersionOrHigher;


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentModeOrHigher = function(documentMode) {
  return goog.userAgent.DOCUMENT_MODE >= documentMode;
};


/**
 * Deprecated alias to {@code goog.userAgent.isDocumentModeOrHigher}.
 * @param {number} version The version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *      same as the given version.
 * @deprecated Use goog.userAgent.isDocumentModeOrHigher().
 */
goog.userAgent.isDocumentMode = goog.userAgent.isDocumentModeOrHigher;


/**
 * For IE version < 7, documentMode is undefined, so attempt to use the
 * CSS1Compat property to see if we are in standards mode. If we are in
 * standards mode, treat the browser version as the document mode. Otherwise,
 * IE is emulating version 5.
 * @type {number|undefined}
 * @const
 */
goog.userAgent.DOCUMENT_MODE = (function() {
  var doc = goog.global['document'];
  var mode = goog.userAgent.getDocumentMode_();
  if (!doc || !goog.userAgent.IE) {
    return undefined;
  }
  return mode || (doc['compatMode'] == 'CSS1Compat' ?
      parseInt(goog.userAgent.VERSION, 10) : 5);
})();

// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 * @author brenneman@google.com (Shawn Brenneman)
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @struct
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   * @override
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The perimeter of the size (width + height) * 2.
 */
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {!goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {!goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {!goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {!goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales this size by the given scale factors. The width and height are scaled
 * by {@code sx} and {@code opt_sy} respectively.  If {@code opt_sy} is not
 * given, then {@code sx} is used for both the width and height.
 * @param {number} sx The scale factor to use for the width.
 * @param {number=} opt_sy The scale factor to use for the height.
 * @return {!goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.width *= sx;
  this.height *= sy;
  return this;
};


/**
 * Uniformly scales the size to perfectly cover the dimensions of a given size.
 * If the size is already larger than the target, it will be scaled down to the
 * minimum size at which it still covers the entire target. The original aspect
 * ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToCover = function(target) {
  var s = this.aspectRatio() <= target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Type-safe wrappers for unsafe DOM APIs.
 *
 * This file provides type-safe wrappers for DOM APIs that can result in
 * cross-site scripting (XSS) vulnerabilities, if the API is supplied with
 * untrusted (attacker-controlled) input.  Instead of plain strings, the type
 * safe wrappers consume values of types from the goog.html package whose
 * contract promises that values are safe to use in the corresponding context.
 *
 * Hence, a program that exclusively uses the wrappers in this file (i.e., whose
 * only reference to security-sensitive raw DOM APIs are in this file) is
 * guaranteed to be free of XSS due to incorrect use of such DOM APIs (modulo
 * correctness of code that produces values of the respective goog.html types,
 * and absent code that violates type safety).
 *
 * For example, assigning to an element's .innerHTML property a string that is
 * derived (even partially) from untrusted input typically results in an XSS
 * vulnerability. The type-safe wrapper goog.html.setInnerHtml consumes a value
 * of type goog.html.SafeHtml, whose contract states that using its values in a
 * HTML context will not result in XSS. Hence a program that is free of direct
 * assignments to any element's innerHTML property (with the exception of the
 * assignment to .innerHTML in this file) is guaranteed to be free of XSS due to
 * assignment of untrusted strings to the innerHTML property.
 */

goog.provide('goog.dom.safe');
goog.provide('goog.dom.safe.InsertAdjacentHtmlPosition');

goog.require('goog.asserts');
goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string');
goog.require('goog.string.Const');


/** @enum {string} */
goog.dom.safe.InsertAdjacentHtmlPosition = {
  AFTERBEGIN: 'afterbegin',
  AFTEREND: 'afterend',
  BEFOREBEGIN: 'beforebegin',
  BEFOREEND: 'beforeend'
};


/**
 * Inserts known-safe HTML into a Node, at the specified position.
 * @param {!Node} node The node on which to call insertAdjacentHTML.
 * @param {!goog.dom.safe.InsertAdjacentHtmlPosition} position Position where
 *     to insert the HTML.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to insert.
 */
goog.dom.safe.insertAdjacentHtml = function(node, position, html) {
  node.insertAdjacentHTML(position, goog.html.SafeHtml.unwrap(html));
};


/**
 * Assigns known-safe HTML to an element's innerHTML property.
 * @param {!Element} elem The element whose innerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.setInnerHtml = function(elem, html) {
  elem.innerHTML = goog.html.SafeHtml.unwrap(html);
};


/**
 * Assigns known-safe HTML to an element's outerHTML property.
 * @param {!Element} elem The element whose outerHTML is to be assigned to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.setOuterHtml = function(elem, html) {
  elem.outerHTML = goog.html.SafeHtml.unwrap(html);
};


/**
 * Writes known-safe HTML to a document.
 * @param {!Document} doc The document to be written to.
 * @param {!goog.html.SafeHtml} html The known-safe HTML to assign.
 */
goog.dom.safe.documentWrite = function(doc, html) {
  doc.write(goog.html.SafeHtml.unwrap(html));
};


/**
 * Safely assigns a URL to an anchor element's href property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * anchor's href property.  If url is of type string however, it is first
 * sanitized using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setAnchorHref(anchorEl, url);
 * which is a safe alternative to
 *   anchorEl.href = url;
 * The latter can result in XSS vulnerabilities if url is a
 * user-/attacker-controlled value.
 *
 * @param {!HTMLAnchorElement} anchor The anchor element whose href property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setAnchorHref = function(anchor, url) {
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  anchor.href = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely assigns a URL to an embed element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setEmbedSrc(embedEl, url);
 * which is a safe alternative to
 *   embedEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLEmbedElement} embed The embed element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setEmbedSrc = function(embed, url) {
  embed.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to a frame element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setFrameSrc(frameEl, url);
 * which is a safe alternative to
 *   frameEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLFrameElement} frame The frame element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setFrameSrc = function(frame, url) {
  frame.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to an iframe element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setIframeSrc(iframeEl, url);
 * which is a safe alternative to
 *   iframeEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLIFrameElement} iframe The iframe element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setIframeSrc = function(iframe, url) {
  iframe.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely sets a link element's href and rel properties. Whether or not
 * the URL assigned to href has to be a goog.html.TrustedResourceUrl
 * depends on the value of the rel property. If rel contains "stylesheet"
 * then a TrustedResourceUrl is required.
 *
 * Example usage:
 *   goog.dom.safe.setLinkHrefAndRel(linkEl, url, 'stylesheet');
 * which is a safe alternative to
 *   linkEl.rel = 'stylesheet';
 *   linkEl.href = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLLinkElement} link The link element whose href property
 *     is to be assigned to.
 * @param {string|!goog.html.SafeUrl|!goog.html.TrustedResourceUrl} url The URL
 *     to assign to the href property. Must be a TrustedResourceUrl if the
 *     value assigned to rel contains "stylesheet". A string value is
 *     sanitized with goog.html.SafeUrl.sanitize.
 * @param {string} rel The value to assign to the rel property.
 * @throws {Error} if rel contains "stylesheet" and url is not a
 *     TrustedResourceUrl
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setLinkHrefAndRel = function(link, url, rel) {
  link.rel = rel;
  if (goog.string.caseInsensitiveContains(rel, 'stylesheet')) {
    goog.asserts.assert(
        url instanceof goog.html.TrustedResourceUrl,
        'URL must be TrustedResourceUrl because "rel" contains "stylesheet"');
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else if (url instanceof goog.html.TrustedResourceUrl) {
    link.href = goog.html.TrustedResourceUrl.unwrap(url);
  } else if (url instanceof goog.html.SafeUrl) {
    link.href = goog.html.SafeUrl.unwrap(url);
  } else {  // string
    // SafeUrl.sanitize must return legitimate SafeUrl when passed a string.
    link.href = goog.html.SafeUrl.sanitize(url).getTypedStringValue();
  }
};


/**
 * Safely assigns a URL to an object element's data property.
 *
 * Example usage:
 *   goog.dom.safe.setObjectData(objectEl, url);
 * which is a safe alternative to
 *   objectEl.data = url;
 * The latter can result in loading untrusted code unless setit is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLObjectElement} object The object element whose data property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setObjectData = function(object, url) {
  object.data = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to an iframe element's src property.
 *
 * Example usage:
 *   goog.dom.safe.setScriptSrc(scriptEl, url);
 * which is a safe alternative to
 *   scriptEl.src = url;
 * The latter can result in loading untrusted code unless it is ensured that
 * the URL refers to a trustworthy resource.
 *
 * @param {!HTMLScriptElement} script The script element whose src property
 *     is to be assigned to.
 * @param {!goog.html.TrustedResourceUrl} url The URL to assign.
 */
goog.dom.safe.setScriptSrc = function(script, url) {
  script.src = goog.html.TrustedResourceUrl.unwrap(url);
};


/**
 * Safely assigns a URL to a Location object's href property.
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and assigned to
 * loc's href property.  If url is of type string however, it is first sanitized
 * using goog.html.SafeUrl.sanitize.
 *
 * Example usage:
 *   goog.dom.safe.setLocationHref(document.location, redirectUrl);
 * which is a safe alternative to
 *   document.location.href = redirectUrl;
 * The latter can result in XSS vulnerabilities if redirectUrl is a
 * user-/attacker-controlled value.
 *
 * @param {!Location} loc The Location object whose href property is to be
 *     assigned to.
 * @param {string|!goog.html.SafeUrl} url The URL to assign.
 * @see goog.html.SafeUrl#sanitize
 */
goog.dom.safe.setLocationHref = function(loc, url) {
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  loc.href = goog.html.SafeUrl.unwrap(safeUrl);
};


/**
 * Safely opens a URL in a new window (via window.open).
 *
 * If url is of type goog.html.SafeUrl, its value is unwrapped and passed in to
 * window.open.  If url is of type string however, it is first sanitized
 * using goog.html.SafeUrl.sanitize.
 *
 * Note that this function does not prevent leakages via the referer that is
 * sent by window.open. It is advised to only use this to open 1st party URLs.
 *
 * Example usage:
 *   goog.dom.safe.openInWindow(url);
 * which is a safe alternative to
 *   window.open(url);
 * The latter can result in XSS vulnerabilities if redirectUrl is a
 * user-/attacker-controlled value.
 *
 * @param {string|!goog.html.SafeUrl} url The URL to open.
 * @param {Window=} opt_openerWin Window of which to call the .open() method.
 *     Defaults to the global window.
 * @param {!goog.string.Const=} opt_name Name of the window to open in. Can be
 *     _top, etc as allowed by window.open().
 * @param {string=} opt_specs Comma-separated list of specifications, same as
 *     in window.open().
 * @param {boolean=} opt_replace Whether to replace the current entry in browser
 *     history, same as in window.open().
 * @return {Window} Window the url was opened in.
 */
goog.dom.safe.openInWindow = function(
    url, opt_openerWin, opt_name, opt_specs, opt_replace) {
  /** @type {!goog.html.SafeUrl} */
  var safeUrl;
  if (url instanceof goog.html.SafeUrl) {
    safeUrl = url;
  } else {
    safeUrl = goog.html.SafeUrl.sanitize(url);
  }
  var win = opt_openerWin || window;
  return win.open(goog.html.SafeUrl.unwrap(safeUrl),
      // If opt_name is undefined, simply passing that in to open() causes IE to
      // reuse the current window instead of opening a new one. Thus we pass ''
      // in instead, which according to spec opens a new window. See
      // https://html.spec.whatwg.org/multipage/browsers.html#dom-open .
      opt_name ? goog.string.Const.unwrap(opt_name) : '',
      opt_specs, opt_replace);
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */


goog.provide('goog.dom.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.dom.BrowserFeature = {
  /**
   * Whether attributes 'name' and 'type' can be added to an element after it's
   * created. False in Internet Explorer prior to version 9.
   */
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
      goog.userAgent.isDocumentModeOrHigher(9),

  /**
   * Whether we can use element.children to access an element's Element
   * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
   * nodes in the collection.)
   */
  CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
      goog.userAgent.IE && goog.userAgent.isDocumentModeOrHigher(9) ||
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9.1'),

  /**
   * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
   * include text nodes in script and style tags. Not document-mode-dependent.
   */
  CAN_USE_INNER_TEXT: (
      goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')),

  /**
   * MSIE, Opera, and Safari>=4 support element.parentElement to access an
   * element's parent if it is an Element.
   */
  CAN_USE_PARENT_ELEMENT_PROPERTY: goog.userAgent.IE || goog.userAgent.OPERA ||
      goog.userAgent.WEBKIT,

  /**
   * Whether NoScope elements need a scoped element written before them in
   * innerHTML.
   * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
   */
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE,

  /**
   * Whether we use legacy IE range API.
   */
  LEGACY_IE_RANGES: goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Additional mathematical functions.
 */

goog.provide('goog.math');

goog.require('goog.array');
goog.require('goog.asserts');


/**
 * Returns a random integer greater than or equal to 0 and less than {@code a}.
 * @param {number} a  The upper bound for the random integer (exclusive).
 * @return {number} A random integer N such that 0 <= N < a.
 */
goog.math.randomInt = function(a) {
  return Math.floor(Math.random() * a);
};


/**
 * Returns a random number greater than or equal to {@code a} and less than
 * {@code b}.
 * @param {number} a  The lower bound for the random number (inclusive).
 * @param {number} b  The upper bound for the random number (exclusive).
 * @return {number} A random number N such that a <= N < b.
 */
goog.math.uniformRandom = function(a, b) {
  return a + Math.random() * (b - a);
};


/**
 * Takes a number and clamps it to within the provided bounds.
 * @param {number} value The input number.
 * @param {number} min The minimum value to return.
 * @param {number} max The maximum value to return.
 * @return {number} The input number if it is within bounds, or the nearest
 *     number within the bounds.
 */
goog.math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};


/**
 * The % operator in JavaScript returns the remainder of a / b, but differs from
 * some other languages in that the result will have the same sign as the
 * dividend. For example, -1 % 8 == -1, whereas in some other languages
 * (such as Python) the result would be 7. This function emulates the more
 * correct modulo behavior, which is useful for certain applications such as
 * calculating an offset index in a circular list.
 *
 * @param {number} a The dividend.
 * @param {number} b The divisor.
 * @return {number} a % b where the result is between 0 and b (either 0 <= x < b
 *     or b < x <= 0, depending on the sign of b).
 */
goog.math.modulo = function(a, b) {
  var r = a % b;
  // If r and b differ in sign, add b to wrap the result to the correct sign.
  return (r * b < 0) ? r + b : r;
};


/**
 * Performs linear interpolation between values a and b. Returns the value
 * between a and b proportional to x (when x is between 0 and 1. When x is
 * outside this range, the return value is a linear extrapolation).
 * @param {number} a A number.
 * @param {number} b A number.
 * @param {number} x The proportion between a and b.
 * @return {number} The interpolated value between a and b.
 */
goog.math.lerp = function(a, b, x) {
  return a + x * (b - a);
};


/**
 * Tests whether the two values are equal to each other, within a certain
 * tolerance to adjust for floating point errors.
 * @param {number} a A number.
 * @param {number} b A number.
 * @param {number=} opt_tolerance Optional tolerance range. Defaults
 *     to 0.000001. If specified, should be greater than 0.
 * @return {boolean} Whether {@code a} and {@code b} are nearly equal.
 */
goog.math.nearlyEquals = function(a, b, opt_tolerance) {
  return Math.abs(a - b) <= (opt_tolerance || 0.000001);
};


// TODO(user): Rename to normalizeAngle, retaining old name as deprecated
// alias.
/**
 * Normalizes an angle to be in range [0-360). Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in degrees.
 * @return {number} Standardized angle.
 */
goog.math.standardAngle = function(angle) {
  return goog.math.modulo(angle, 360);
};


/**
 * Normalizes an angle to be in range [0-2*PI). Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in radians.
 * @return {number} Standardized angle.
 */
goog.math.standardAngleInRadians = function(angle) {
  return goog.math.modulo(angle, 2 * Math.PI);
};


/**
 * Converts degrees to radians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 */
goog.math.toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};


/**
 * Converts radians to degrees.
 * @param {number} angleRadians Angle in radians.
 * @return {number} Angle in degrees.
 */
goog.math.toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};


/**
 * For a given angle and radius, finds the X portion of the offset.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The x-distance for the angle and radius.
 */
goog.math.angleDx = function(degrees, radius) {
  return radius * Math.cos(goog.math.toRadians(degrees));
};


/**
 * For a given angle and radius, finds the Y portion of the offset.
 * @param {number} degrees Angle in degrees (zero points in +X direction).
 * @param {number} radius Radius.
 * @return {number} The y-distance for the angle and radius.
 */
goog.math.angleDy = function(degrees, radius) {
  return radius * Math.sin(goog.math.toRadians(degrees));
};


/**
 * Computes the angle between two points (x1,y1) and (x2,y2).
 * Angle zero points in the +X direction, 90 degrees points in the +Y
 * direction (down) and from there we grow clockwise towards 360 degrees.
 * @param {number} x1 x of first point.
 * @param {number} y1 y of first point.
 * @param {number} x2 x of second point.
 * @param {number} y2 y of second point.
 * @return {number} Standardized angle in degrees of the vector from
 *     x1,y1 to x2,y2.
 */
goog.math.angle = function(x1, y1, x2, y2) {
  return goog.math.standardAngle(goog.math.toDegrees(Math.atan2(y2 - y1,
                                                                x2 - x1)));
};


/**
 * Computes the difference between startAngle and endAngle (angles in degrees).
 * @param {number} startAngle  Start angle in degrees.
 * @param {number} endAngle  End angle in degrees.
 * @return {number} The number of degrees that when added to
 *     startAngle will result in endAngle. Positive numbers mean that the
 *     direction is clockwise. Negative numbers indicate a counter-clockwise
 *     direction.
 *     The shortest route (clockwise vs counter-clockwise) between the angles
 *     is used.
 *     When the difference is 180 degrees, the function returns 180 (not -180)
 *     angleDifference(30, 40) is 10, and angleDifference(40, 30) is -10.
 *     angleDifference(350, 10) is 20, and angleDifference(10, 350) is -20.
 */
goog.math.angleDifference = function(startAngle, endAngle) {
  var d = goog.math.standardAngle(endAngle) -
          goog.math.standardAngle(startAngle);
  if (d > 180) {
    d = d - 360;
  } else if (d <= -180) {
    d = 360 + d;
  }
  return d;
};


/**
 * Returns the sign of a number as per the "sign" or "signum" function.
 * @param {number} x The number to take the sign of.
 * @return {number} -1 when negative, 1 when positive, 0 when 0. Preserves
 *     signed zeros and NaN.
 */
goog.math.sign = Math.sign || function(x) {
  if (x > 0) {
    return 1;
  }
  if (x < 0) {
    return -1;
  }
  return x;  // Preserves signed zeros and NaN.
};


/**
 * JavaScript implementation of Longest Common Subsequence problem.
 * http://en.wikipedia.org/wiki/Longest_common_subsequence
 *
 * Returns the longest possible array that is subarray of both of given arrays.
 *
 * @param {Array<Object>} array1 First array of objects.
 * @param {Array<Object>} array2 Second array of objects.
 * @param {Function=} opt_compareFn Function that acts as a custom comparator
 *     for the array ojects. Function should return true if objects are equal,
 *     otherwise false.
 * @param {Function=} opt_collectorFn Function used to decide what to return
 *     as a result subsequence. It accepts 2 arguments: index of common element
 *     in the first array and index in the second. The default function returns
 *     element from the first array.
 * @return {!Array<Object>} A list of objects that are common to both arrays
 *     such that there is no common subsequence with size greater than the
 *     length of the list.
 */
goog.math.longestCommonSubsequence = function(
    array1, array2, opt_compareFn, opt_collectorFn) {

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

  // Backtracking
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


/**
 * Returns the sum of the arguments.
 * @param {...number} var_args Numbers to add.
 * @return {number} The sum of the arguments (0 if no arguments were provided,
 *     {@code NaN} if any of the arguments is not a valid number).
 */
goog.math.sum = function(var_args) {
  return /** @type {number} */ (goog.array.reduce(arguments,
      function(sum, value) {
        return sum + value;
      }, 0));
};


/**
 * Returns the arithmetic mean of the arguments.
 * @param {...number} var_args Numbers to average.
 * @return {number} The average of the arguments ({@code NaN} if no arguments
 *     were provided or any of the arguments is not a valid number).
 */
goog.math.average = function(var_args) {
  return goog.math.sum.apply(null, arguments) / arguments.length;
};


/**
 * Returns the unbiased sample variance of the arguments. For a definition,
 * see e.g. http://en.wikipedia.org/wiki/Variance
 * @param {...number} var_args Number samples to analyze.
 * @return {number} The unbiased sample variance of the arguments (0 if fewer
 *     than two samples were provided, or {@code NaN} if any of the samples is
 *     not a valid number).
 */
goog.math.sampleVariance = function(var_args) {
  var sampleSize = arguments.length;
  if (sampleSize < 2) {
    return 0;
  }

  var mean = goog.math.average.apply(null, arguments);
  var variance = goog.math.sum.apply(null, goog.array.map(arguments,
      function(val) {
        return Math.pow(val - mean, 2);
      })) / (sampleSize - 1);

  return variance;
};


/**
 * Returns the sample standard deviation of the arguments.  For a definition of
 * sample standard deviation, see e.g.
 * http://en.wikipedia.org/wiki/Standard_deviation
 * @param {...number} var_args Number samples to analyze.
 * @return {number} The sample standard deviation of the arguments (0 if fewer
 *     than two samples were provided, or {@code NaN} if any of the samples is
 *     not a valid number).
 */
goog.math.standardDeviation = function(var_args) {
  return Math.sqrt(goog.math.sampleVariance.apply(null, arguments));
};


/**
 * Returns whether the supplied number represents an integer, i.e. that is has
 * no fractional component.  No range-checking is performed on the number.
 * @param {number} num The number to test.
 * @return {boolean} Whether {@code num} is an integer.
 */
goog.math.isInt = function(num) {
  return isFinite(num) && num % 1 == 0;
};


/**
 * Returns whether the supplied number is finite and not NaN.
 * @param {number} num The number to test.
 * @return {boolean} Whether {@code num} is a finite number.
 */
goog.math.isFiniteNumber = function(num) {
  return isFinite(num) && !isNaN(num);
};


/**
 * @param {number} num The number to test.
 * @return {boolean} Whether it is negative zero.
 */
goog.math.isNegativeZero = function(num) {
  return num == 0 && 1 / num < 0;
};


/**
 * Returns the precise value of floor(log10(num)).
 * Simpler implementations didn't work because of floating point rounding
 * errors. For example
 * <ul>
 * <li>Math.floor(Math.log(num) / Math.LN10) is off by one for num == 1e+3.
 * <li>Math.floor(Math.log(num) * Math.LOG10E) is off by one for num == 1e+15.
 * <li>Math.floor(Math.log10(num)) is off by one for num == 1e+15 - 1.
 * </ul>
 * @param {number} num A floating point number.
 * @return {number} Its logarithm to base 10 rounded down to the nearest
 *     integer if num > 0. -Infinity if num == 0. NaN if num < 0.
 */
goog.math.log10Floor = function(num) {
  if (num > 0) {
    var x = Math.round(Math.log(num) * Math.LOG10E);
    return x - (parseFloat('1e' + x) > num ? 1 : 0);
  }
  return num == 0 ? -Infinity : NaN;
};


/**
 * A tweaked variant of {@code Math.floor} which tolerates if the passed number
 * is infinitesimally smaller than the closest integer. It often happens with
 * the results of floating point calculations because of the finite precision
 * of the intermediate results. For example {@code Math.floor(Math.log(1000) /
 * Math.LN10) == 2}, not 3 as one would expect.
 * @param {number} num A number.
 * @param {number=} opt_epsilon An infinitesimally small positive number, the
 *     rounding error to tolerate.
 * @return {number} The largest integer less than or equal to {@code num}.
 */
goog.math.safeFloor = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.floor(num + (opt_epsilon || 2e-15));
};


/**
 * A tweaked variant of {@code Math.ceil}. See {@code goog.math.safeFloor} for
 * details.
 * @param {number} num A number.
 * @param {number=} opt_epsilon An infinitesimally small positive number, the
 *     rounding error to tolerate.
 * @return {number} The smallest integer greater than or equal to {@code num}.
 */
goog.math.safeCeil = function(num, opt_epsilon) {
  goog.asserts.assert(!goog.isDef(opt_epsilon) || opt_epsilon > 0);
  return Math.ceil(num - (opt_epsilon || 2e-15));
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */


goog.provide('goog.math.Coordinate');

goog.require('goog.math');



/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @struct
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   * @override
   */
  goog.math.Coordinate.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };
}


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the magnitude of a coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @return {number} The distance between the origin and {@code a}.
 */
goog.math.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};


/**
 * Returns the angle from the origin to a coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @return {number} The angle, in degrees, clockwise from the positive X
 *     axis to {@code a}.
 */
goog.math.Coordinate.azimuth = function(a) {
  return goog.math.angle(0, 0, a.x, a.y);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};


/**
 * Returns the sum of two coordinates as a new goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two
 *     coordinates.
 */
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};


/**
 * Rounds the x and y fields to the next larger integer values.
 * @return {!goog.math.Coordinate} This coordinate with ceil'd fields.
 */
goog.math.Coordinate.prototype.ceil = function() {
  this.x = Math.ceil(this.x);
  this.y = Math.ceil(this.y);
  return this;
};


/**
 * Rounds the x and y fields to the next smaller integer values.
 * @return {!goog.math.Coordinate} This coordinate with floored fields.
 */
goog.math.Coordinate.prototype.floor = function() {
  this.x = Math.floor(this.x);
  this.y = Math.floor(this.y);
  return this;
};


/**
 * Rounds the x and y fields to the nearest integer values.
 * @return {!goog.math.Coordinate} This coordinate with rounded fields.
 */
goog.math.Coordinate.prototype.round = function() {
  this.x = Math.round(this.x);
  this.y = Math.round(this.y);
  return this;
};


/**
 * Translates this box by the given offsets. If a {@code goog.math.Coordinate}
 * is given, then the x and y values are translated by the coordinate's x and y.
 * Otherwise, x and y are translated by {@code tx} and {@code opt_ty}
 * respectively.
 * @param {number|goog.math.Coordinate} tx The value to translate x by or the
 *     the coordinate to translate this coordinate by.
 * @param {number=} opt_ty The value to translate y by.
 * @return {!goog.math.Coordinate} This coordinate after translating.
 */
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


/**
 * Scales this coordinate by the given scale factors. The x and y values are
 * scaled by {@code sx} and {@code opt_sy} respectively.  If {@code opt_sy}
 * is not given, then {@code sx} is used for both x and y.
 * @param {number} sx The scale factor to use for the x dimension.
 * @param {number=} opt_sy The scale factor to use for the y dimension.
 * @return {!goog.math.Coordinate} This coordinate after scaling.
 */
goog.math.Coordinate.prototype.scale = function(sx, opt_sy) {
  var sy = goog.isNumber(opt_sy) ? opt_sy : sx;
  this.x *= sx;
  this.y *= sy;
  return this;
};


/**
 * Rotates this coordinate clockwise about the origin (or, optionally, the given
 * center) by the given angle, in radians.
 * @param {number} radians The angle by which to rotate this coordinate
 *     clockwise about the given center, in radians.
 * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults
 *     to (0, 0) if not given.
 */
goog.math.Coordinate.prototype.rotateRadians = function(radians, opt_center) {
  var center = opt_center || new goog.math.Coordinate(0, 0);

  var x = this.x;
  var y = this.y;
  var cos = Math.cos(radians);
  var sin = Math.sin(radians);

  this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
  this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;
};


/**
 * Rotates this coordinate clockwise about the origin (or, optionally, the given
 * center) by the given angle, in degrees.
 * @param {number} degrees The angle by which to rotate this coordinate
 *     clockwise about the given center, in degrees.
 * @param {!goog.math.Coordinate=} opt_center The center of rotation. Defaults
 *     to (0, 0) if not given.
 */
goog.math.Coordinate.prototype.rotateDegrees = function(degrees, opt_center) {
  this.rotateRadians(goog.math.toRadians(degrees), opt_center);
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 * @author arv@google.com (Erik Arvidsson)
 */


// TODO(arv): Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.


goog.provide('goog.dom');
goog.provide('goog.dom.Appendable');
goog.provide('goog.dom.DomHelper');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.BrowserFeature');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.safe');
goog.require('goog.html.SafeHtml');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Unicode');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.define('goog.dom.ASSUME_QUIRKS_MODE', false);


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.define('goog.dom.ASSUME_STANDARDS_MODE', false);


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {(Node|Window)=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      (goog.dom.defaultDomHelper_ ||
          (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Gets an element from the current document by element id.
 *
 * If an Element is passed in, it is returned.
 *
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.dom.getElementHelper_(document, element);
};


/**
 * Gets an element by id from the given document (if present).
 * If an element is given, it is returned.
 * @param {!Document} doc
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The resulting element.
 * @private
 */
goog.dom.getElementHelper_ = function(doc, element) {
  return goog.isString(element) ?
      doc.getElementById(element) :
      element;
};


/**
 * Gets an element by id, asserting that the element is found.
 *
 * This is used when an element is expected to exist, and should fail with
 * an assertion error if it does not (if assertions are enabled).
 *
 * @param {string} id Element ID.
 * @return {!Element} The element with the given ID, if it exists.
 */
goog.dom.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(document, id);
};


/**
 * Helper function for getRequiredElementHelper functions, both static and
 * on DomHelper.  Asserts the element with the given id exists.
 * @param {!Document} doc
 * @param {string} id
 * @return {!Element} The element with the given ID, if it exists.
 * @private
 */
goog.dom.getRequiredElementHelper_ = function(doc, id) {
  // To prevent users passing in Elements as is permitted in getElement().
  goog.asserts.assertString(id);
  var element = goog.dom.getElementHelper_(doc, id);
  element = goog.asserts.assertElement(element,
      'No element found with id: ' + id);
  return element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * Note that tag names are case sensitive in the SVG namespace, and this
 * function converts opt_tag to uppercase for comparisons. For queries in the
 * SVG namespace you should use querySelector or querySelectorAll instead.
 * https://bugzilla.mozilla.org/show_bug.cgi?id=963870
 * https://bugs.webkit.org/show_bug.cgi?id=83438
 *
 * @see {goog.dom.query}
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Returns a static, array-like list of the elements with the provided
 * className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll('.' + className);
  }
  return goog.dom.getElementsByTagNameAndClass_(
      document, '*', className, opt_el);
};


/**
 * Returns the first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item with the class name provided.
 */
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (parent.getElementsByClassName) {
    retVal = parent.getElementsByClassName(className)[0];
  } else if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector('.' + className);
  } else {
    retVal = goog.dom.getElementsByTagNameAndClass_(
        document, '*', className, opt_el)[0];
  }
  return retVal || null;
};


/**
 * Ensures an element with the given className exists, and then returns the
 * first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {!Element|!Document=} opt_root Optional element or document to look
 *     in.
 * @return {!Element} The first item with the class name provided.
 * @throws {goog.asserts.AssertionError} Thrown if no element is found.
 */
goog.dom.getRequiredElementByClass = function(className, opt_root) {
  var retValue = goog.dom.getElementByClass(className, opt_root);
  return goog.asserts.assert(retValue,
      'No element found with className: ' + className);
};


/**
 * Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
 * fast W3C Selectors API.
 * @param {!(Element|Document)} parent The parent document object.
 * @return {boolean} whether or not we can use parent.querySelector* APIs.
 * @private
 */
goog.dom.canUseQuerySelector_ = function(parent) {
  return !!(parent.querySelectorAll && parent.querySelector);
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  if (goog.dom.canUseQuerySelector_(parent) &&
      (tagName || opt_class)) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
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

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (goog.dom.DIRECT_ATTRIBUTE_MAP_.hasOwnProperty(key)) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else if (goog.string.startsWith(key, 'aria-') ||
        goog.string.startsWith(key, 'data-')) {
      element.setAttribute(key, val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @private {!Object<string, string>}
 * @const
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'frameborder': 'frameBorder',
  'height': 'height',
  'maxlength': 'maxLength',
  'role': 'role',
  'rowspan': 'rowSpan',
  'type': 'type',
  'usemap': 'useMap',
  'valign': 'vAlign',
  'width': 'width'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the current document.
 */
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};


/**
 * Calculates the height of the document of the given window.
 *
 * Function code copied from the opensocial gadget api:
 *   gadgets.window.adjustHeight(opt_height)
 *
 * @private
 * @param {!Window} win The window whose document height to retrieve.
 * @return {number} The height of the document of the given window.
 */
goog.dom.getDocumentHeight_ = function(win) {
  // NOTE(eae): This method will return the window size rather than the document
  // size in webkit quirks mode.
  var doc = win.document;
  var height = 0;

  if (doc) {
    // Calculating inner content height is hard and different between
    // browsers rendering in Strict vs. Quirks mode.  We use a combination of
    // three properties within document.body and document.documentElement:
    // - scrollHeight
    // - offsetHeight
    // - clientHeight
    // These values differ significantly between browsers and rendering modes.
    // But there are patterns.  It just takes a lot of time and persistence
    // to figure out.

    var body = doc.body;
    var docEl = /** @type {!HTMLElement} */ (doc.documentElement);
    if (!(docEl && body)) {
      return 0;
    }

    // Get the height of the viewport
    var vh = goog.dom.getViewportSize_(win).height;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      // In Strict mode:
      // The inner content height is contained in either:
      //    document.documentElement.scrollHeight
      //    document.documentElement.offsetHeight
      // Based on studying the values output by different browsers,
      // use the value that's NOT equal to the viewport height found above.
      height = docEl.scrollHeight != vh ?
          docEl.scrollHeight : docEl.offsetHeight;
    } else {
      // In Quirks mode:
      // documentElement.clientHeight is equal to documentElement.offsetHeight
      // except in IE.  In most browsers, document.documentElement can be used
      // to calculate the inner content height.
      // However, in other browsers (e.g. IE), document.body must be used
      // instead.  How do we know which one to use?
      // If document.documentElement.clientHeight does NOT equal
      // document.documentElement.offsetHeight, then use document.body.
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }

      // Detect whether the inner content height is bigger or smaller
      // than the bounding box (viewport).  If bigger, take the larger
      // value.  If smaller, take the smaller value.
      if (sh > vh) {
        // Content is larger
        height = sh > oh ? sh : oh;
      } else {
        // Content is smaller
        height = sh < oh ? sh : oh;
      }
    }
  }

  return height;
};


/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @deprecated Use {@link goog.dom.getDocumentScroll} instead.
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};


/**
 * Gets the document scroll distance as a coordinate object.
 *
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 */
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};


/**
 * Helper for {@code getDocumentScroll}.
 *
 * @param {!Document} doc The document to get the scroll for.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @private
 */
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('10') &&
      win.pageYOffset != el.scrollTop) {
    // The keyboard on IE10 touch devices shifts the page using the pageYOffset
    // without modifying scrollTop. For this case, we want the body scroll
    // offsets.
    return new goog.math.Coordinate(el.scrollLeft, el.scrollTop);
  }
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft,
      win.pageYOffset || el.scrollTop);
};


/**
 * Gets the document scroll element.
 * @return {!Element} Scrolling element.
 */
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};


/**
 * Helper for {@code getDocumentScrollElement}.
 * @param {!Document} doc The document to get the scroll element for.
 * @return {!Element} Scrolling element.
 * @private
 */
goog.dom.getDocumentScrollElement_ = function(doc) {
  // Old WebKit needs body.scrollLeft in both quirks mode and strict mode. We
  // also default to the documentElement if the document does not have a body
  // (e.g. a SVG document).
  // Uses http://dev.w3.org/csswg/cssom-view/#dom-document-scrollingelement to
  // avoid trying to guess about browser behavior from the UA string.
  if (doc.scrollingElement) {
    return doc.scrollingElement;
  }
  if (!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc)) {
    return doc.documentElement;
  }
  return doc.body || doc.documentElement;
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO(arv): This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {(Object|Array<string>|string)=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};


/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {!Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb:
  // name: https://msdn.microsoft.com/en-us/library/ms534184(v=vs.85).aspx
  // type: https://msdn.microsoft.com/en-us/library/ms534700(v=vs.85).aspx
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&
      (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');

      // Clone attributes map to remove 'type' without mutating the input.
      var clone = {};
      goog.object.extend(clone, attributes);

      // JSCompiler can't see how goog.object.extend added this property,
      // because it was essentially added by reflection.
      // So it needs to be quoted.
      delete clone['type'];

      attributes = clone;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else if (goog.isArray(attributes)) {
      element.className = attributes.join(' ');
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }

  return element;
};


/**
 * Appends a node with text or other nodes.
 * @param {!Document} doc The document to create new nodes in.
 * @param {!Node} parent The node to append nodes to.
 * @param {!Arguments} args The values to add. See {@code goog.dom.append}.
 * @param {number} startIndex The index of the array to start from.
 * @private
 */
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    // TODO(user): More coercion, ala MochiKit?
    if (child) {
      parent.appendChild(goog.isString(child) ?
          doc.createTextNode(child) : child);
    }
  }

  for (var i = startIndex; i < args.length; i++) {
    var arg = args[i];
    // TODO(attila): Fix isArrayLike to return false for a text node.
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      // If the argument is a node list, not a real array, use a clone,
      // because forEach can't be used to mutate a NodeList.
      goog.array.forEach(goog.dom.isNodeList(arg) ?
          goog.array.toArray(arg) : arg,
          childHandler);
    } else {
      childHandler(arg);
    }
  }
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(string|Object)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return document.createElement(name);
};


/**
 * Creates a new text node.
 * @param {number|string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return document.createTextNode(String(content));
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with
 *     {@code goog.string.Unicode.NBSP} characters.
 * @return {!Element} The created table.
 */
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  // TODO(user): Return HTMLTableElement, also in prototype function.
  // Callers need to be updated to e.g. not assign numbers to table.cellSpacing.
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};


/**
 * Create a table.
 * @param {!Document} doc Document object to use to create the table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean} fillWithNbsp If true, fills table entries with
 *     {@code goog.string.Unicode.NBSP} characters.
 * @return {!HTMLTableElement} The created table.
 * @private
 */
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var table = /** @type {!HTMLTableElement} */
      (doc.createElement(goog.dom.TagName.TABLE));
  var tbody = table.appendChild(doc.createElement(goog.dom.TagName.TBODY));
  for (var i = 0; i < rows; i++) {
    var tr = doc.createElement(goog.dom.TagName.TR);
    for (var j = 0; j < columns; j++) {
      var td = doc.createElement(goog.dom.TagName.TD);
      // IE <= 9 will create a text node if we set text content to the empty
      // string, so we avoid doing it unless necessary. This ensures that the
      // same DOM tree is returned on all browsers.
      if (fillWithNbsp) {
        goog.dom.setTextContent(td, goog.string.Unicode.NBSP);
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  return table;
};


/**
 * Converts HTML markup into a node.
 * @param {!goog.html.SafeHtml} html The HTML markup to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.safeHtmlToNode = function(html) {
  return goog.dom.safeHtmlToNode_(document, html);
};


/**
 * Helper for {@code safeHtmlToNode}.
 * @param {!Document} doc The document.
 * @param {!goog.html.SafeHtml} html The HTML markup to convert.
 * @return {!Node} The resulting node.
 * @private
 */
goog.dom.safeHtmlToNode_ = function(doc, html) {
  var tempDiv = doc.createElement(goog.dom.TagName.DIV);
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    goog.dom.safe.setInnerHtml(tempDiv,
        goog.html.SafeHtml.concat(goog.html.SafeHtml.create('br'), html));
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    goog.dom.safe.setInnerHtml(tempDiv, html);
  }
  return goog.dom.childrenToNode_(doc, tempDiv);
};


/**
 * Converts an HTML string into a document fragment. The string must be
 * sanitized in order to avoid cross-site scripting. For example
 * {@code goog.dom.htmlToDocumentFragment('&lt;img src=x onerror=alert(0)&gt;')}
 * triggers an alert in all browsers, even if the returned document fragment
 * is thrown away immediately.
 *
 * NOTE: This method doesn't work if your htmlString contains elements that
 * can't be contained in a <div>. For example, <tr>.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};


// TODO(jakubvrana): Merge with {@code safeHtmlToNode_}.
/**
 * Helper for {@code htmlToDocumentFragment}.
 *
 * @param {!Document} doc The document.
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 * @private
 */
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement(goog.dom.TagName.DIV);
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  return goog.dom.childrenToNode_(doc, tempDiv);
};


/**
 * Helper for {@code htmlToDocumentFragment_}.
 * @param {!Document} doc The document.
 * @param {!Node} tempDiv The input node.
 * @return {!Node} The resulting node.
 * @private
 */
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


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @param {!Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * IE natively supports node.canHaveChildren but has inconsistent behavior.
 * Prior to IE8 the base tag allows children and in IE9 all nodes return true
 * for canHaveChildren.
 *
 * In practice all non-IE browsers allow you to add children to any node, but
 * the behavior is inconsistent:
 *
 * <pre>
 *   var a = document.createElement(goog.dom.TagName.BR);
 *   a.appendChild(document.createTextNode('foo'));
 *   a.appendChild(document.createTextNode('bar'));
 *   console.log(a.childNodes.length);  // 2
 *   console.log(a.innerHTML);  // Chrome: "", IE9: "foobar", FF3.5: "foobar"
 * </pre>
 *
 * For more information, see:
 * http://dev.w3.org/html5/markup/syntax.html#syntax-elements
 *
 * TODO(user): Rename shouldAllowChildren() ?
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch (/** @type {!Element} */ (node).tagName) {
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


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.insertChildAt = function(parent, child, index) {
  // Note that if the second argument is null, insertBefore
  // will append the child at the end of the list of children.
  parent.insertBefore(child, parent.childNodes[index] || null);
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the document
 *     to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(false));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.getChildren = function(element) {
  // We check if the children attribute is supported for child elements
  // since IE8 misuses the attribute by also including comments.
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE &&
      element.children != undefined) {
    return element.children;
  }
  // Fall back to manually filtering the element's child nodes.
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.getFirstElementChild = function(node) {
  if (goog.isDef(node.firstElementChild)) {
    return /** @type {!Element} */(node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.getLastElementChild = function(node) {
  if (goog.isDef(node.lastElementChild)) {
    return /** @type {!Element} */(node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.getNextElementSibling = function(node) {
  if (goog.isDef(node.nextElementSibling)) {
    return /** @type {!Element} */(node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.getPreviousElementSibling = function(node) {
  if (goog.isDef(node.previousElementSibling)) {
    return /** @type {!Element} */(node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};


/**
 * Returns the first node that is an element in the specified direction,
 * starting with {@code node}.
 * @param {Node} node The node to get the next element from.
 * @param {boolean} forward Whether to look forwards or backwards.
 * @return {Element} The first element.
 * @private
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
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


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
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


/**
 * Whether the object looks like a DOM node.
 * @param {?} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether the object looks like an Element.
 * @param {?} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {?} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj['window'] == obj;
};


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.getParentElement = function(element) {
  var parent;
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    var isIe9 = goog.userAgent.IE &&
        goog.userAgent.isVersionOrHigher('9') &&
        !goog.userAgent.isVersionOrHigher('10');
    // SVG elements in IE9 can't use the parentElement property.
    // goog.global['SVGElement'] is not defined in IE9 quirks mode.
    if (!(isIe9 && goog.global['SVGElement'] &&
        element instanceof goog.global['SVGElement'])) {
      parent = element.parentElement;
      if (parent) {
        return parent;
      }
    }
  }
  parent = element.parentNode;
  return goog.dom.isElement(parent) ? /** @type {!Element} */ (parent) : null;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Special case for document nodes on IE 7 and 8.
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    if (node1.nodeType == goog.dom.NodeType.DOCUMENT) {
      return -1;
    }
    if (node2.nodeType == goog.dom.NodeType.DOCUMENT) {
      return 1;
    }
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
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

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {!Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {!Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
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
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
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


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO(nnaze): Update param signature to be non-nullable.
  goog.asserts.assert(node, 'Node cannot be null or undefined.');
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};


/**
 * Cross-browser function for getting the document element of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {!Document} The frame content document.
 */
goog.dom.getFrameContentDocument = function(frame) {
  return frame.contentDocument || frame.contentWindow.document;
};


/**
 * Cross-browser function for getting the window of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {Window} The window associated with the given frame, or null if none
 *     exists.
 */
goog.dom.getFrameContentWindow = function(frame) {
  try {
    return frame.contentWindow ||
           (frame.contentDocument ? goog.dom.getWindow(frame.contentDocument) :
                                    null);
  } catch (e) {
    // NOTE(user): In IE8, checking the contentWindow or contentDocument
    // properties will throw a "Unspecified Error" exception if the iframe is
    // not inserted in the DOM. If we get this we can be sure that no window
    // exists, so return null.
  }
  return null;
};


/**
 * Sets the text content of a node, with cross-browser support.
 * @param {Node} node The node to change the text content of.
 * @param {string|number} text The value that should replace the node's content.
 */
goog.dom.setTextContent = function(node, text) {
  goog.asserts.assert(node != null,
      'goog.dom.setTextContent expects a non-null value for node');

  if ('textContent' in node) {
    node.textContent = text;
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    node.data = text;
  } else if (node.firstChild &&
             node.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // If the first child is a text node we just change its data and remove the
    // rest of the children.
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


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement(goog.dom.TagName.DIV);
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};


/**
 * Finds the first descendant node that matches the filter function, using
 * a depth first search. This function offers the most general purpose way
 * of finding a matching element. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.
 * @see goog.dom.query
 *
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that match the filter function, using a
 * a depth first search. This function offers the most general-purpose way
 * of finding a set of matching elements. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.

 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {!Array<!Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that match the filter function,
 * using a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @param {!Array<!Node>} rv The found nodes are added to this array.
 * @param {boolean} findOne If true we exit after the first found node.
 * @return {boolean} Whether the search is complete or not. True in case findOne
 *     is true and the node is found. False otherwise.
 * @private
 */
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


/**
 * Map of tags whose content to ignore when calculating text length.
 * @private {!Object<string, number>}
 * @const
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @private {!Object<string, string>}
 * @const
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that some elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 * @see http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
 */
goog.dom.isFocusableTabIndex = function(element) {
  return goog.dom.hasSpecifiedTabIndex_(element) &&
         goog.dom.isTabIndexFocusable_(element);
};


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    // Set tabIndex to -1 first, then remove it. This is a workaround for
    // Safari (confirmed in version 4 on Windows). When removing the attribute
    // without setting it to -1 first, the element remains keyboard focusable
    // despite not having a tabIndex attribute anymore.
    element.tabIndex = -1;
    element.removeAttribute('tabIndex'); // Must be camelCase!
  }
};


/**
 * Returns true if the element can be focused, i.e. it has a tab index that
 * allows it to receive keyboard focus (tabIndex >= 0), or it is an element
 * that natively supports keyboard focus.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element allows keyboard focus.
 */
goog.dom.isFocusable = function(element) {
  var focusable;
  // Some elements can have unspecified tab index and still receive focus.
  if (goog.dom.nativelySupportsFocus_(element)) {
    // Make sure the element is not disabled ...
    focusable = !element.disabled &&
        // ... and if a tab index is specified, it allows focus.
        (!goog.dom.hasSpecifiedTabIndex_(element) ||
         goog.dom.isTabIndexFocusable_(element));
  } else {
    focusable = goog.dom.isFocusableTabIndex(element);
  }

  // IE requires elements to be visible in order to focus them.
  return focusable && goog.userAgent.IE ?
             goog.dom.hasNonZeroBoundingRect_(element) : focusable;
};


/**
 * Returns true if the element has a specified tab index.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element has a specified tab index.
 * @private
 */
goog.dom.hasSpecifiedTabIndex_ = function(element) {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  var attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  return goog.isDefAndNotNull(attrNode) && attrNode.specified;
};


/**
 * Returns true if the element's tab index allows the element to be focused.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element's tab index allows focus.
 * @private
 */
goog.dom.isTabIndexFocusable_ = function(element) {
  var index = element.tabIndex;
  // NOTE: IE9 puts tabIndex in 16-bit int, e.g. -2 is 65534.
  return goog.isNumber(index) && index >= 0 && index < 32768;
};


/**
 * Returns true if the element is focusable even when tabIndex is not set.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element natively supports focus.
 * @private
 */
goog.dom.nativelySupportsFocus_ = function(element) {
  return element.tagName == goog.dom.TagName.A ||
         element.tagName == goog.dom.TagName.INPUT ||
         element.tagName == goog.dom.TagName.TEXTAREA ||
         element.tagName == goog.dom.TagName.SELECT ||
         element.tagName == goog.dom.TagName.BUTTON;
};


/**
 * Returns true if the element has a bounding rectangle that would be visible
 * (i.e. its width and height are greater than zero).
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element has a non-zero bounding rectangle.
 * @private
 */
goog.dom.hasNonZeroBoundingRect_ = function(element) {
  var rect = goog.isFunction(element['getBoundingClientRect']) ?
      element.getBoundingClientRect() :
      {'height': element.offsetHeight, 'width': element.offsetWidth};
  return goog.isDefAndNotNull(rect) && rect.height > 0 && rect.width > 0;
};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // Note(arv): IE9, Opera, and Safari 3 support innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');
  // Strip &#8203; entities. goog.format.insertWordBreaks inserts them in IE8.
  textContent = textContent.replace(/\u200B/g, '');

  // Skip this replacement on old browsers with working innerText, which
  // automatically turns &nbsp; into ' ' and / +/ into ' ' when reading
  // innerText.
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, ' ');
  }
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array<string>} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
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


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by goog.dom.getNodeTextLength.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent The node relative to which the offset will
 *     be calculated. Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while ((cur = cur.previousSibling)) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  // Trim left to deal with FF cases when there might be line breaks and empty
  // nodes at the front of the text
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length;
};


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur = null;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
      // ignore certain tags
    } else if (cur.nodeType == goog.dom.NodeType.TEXT) {
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
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


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO(attila): Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return false;
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class,
    opt_maxSearchSteps) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return /** @type {Element} */ (goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || goog.isString(node.className) &&
                   goog.array.contains(node.className.split(/\s+/), opt_class));
      }, true, opt_maxSearchSteps));
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} className The class name to match.
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.getAncestorByClass = function(element, className, opt_maxSearchSteps) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className,
      opt_maxSearchSteps);
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    goog.asserts.assert(element.name != 'parentNode');
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};


/**
 * Determines the active element in the given document.
 * @param {Document} doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
    // NOTE(nicksantos): Sometimes, evaluating document.activeElement in IE
    // throws an exception. I'm not 100% sure why, but I suspect it chokes
    // on document.activeElement if the activeElement has been recently
    // removed from the DOM by a JS operation.
    //
    // We assume that an exception here simply means
    // "there is no active element."
  }

  return null;
};


/**
 * Gives the current devicePixelRatio.
 *
 * By default, this is the value of window.devicePixelRatio (which should be
 * preferred if present).
 *
 * If window.devicePixelRatio is not present, the ratio is calculated with
 * window.matchMedia, if present. Otherwise, gives 1.0.
 *
 * Some browsers (including Chrome) consider the browser zoom level in the pixel
 * ratio, so the value may change across multiple calls.
 *
 * @return {number} The number of actual pixels per virtual pixel.
 */
goog.dom.getPixelRatio = function() {
  var win = goog.dom.getWindow();
  if (goog.isDef(win.devicePixelRatio)) {
    return win.devicePixelRatio;
  } else if (win.matchMedia) {
    return goog.dom.matchesPixelRatio_(.75) ||
           goog.dom.matchesPixelRatio_(1.5) ||
           goog.dom.matchesPixelRatio_(2) ||
           goog.dom.matchesPixelRatio_(3) || 1;
  }
  return 1;
};


/**
 * Calculates a mediaQuery to check if the current device supports the
 * given actual to virtual pixel ratio.
 * @param {number} pixelRatio The ratio of actual pixels to virtual pixels.
 * @return {number} pixelRatio if applicable, otherwise 0.
 * @private
 */
goog.dom.matchesPixelRatio_ = function(pixelRatio) {
  var win = goog.dom.getWindow();
  var query = ('(-webkit-min-device-pixel-ratio: ' + pixelRatio + '),' +
               '(min--moz-device-pixel-ratio: ' + pixelRatio + '),' +
               '(min-resolution: ' + pixelRatio + 'dppx)');
  return win.matchMedia(query).matches ? pixelRatio : 0;
};



/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  return goog.dom.getElementHelper_(this.document_, element);
};


/**
 * Gets an element by id, asserting that the element is found.
 *
 * This is used when an element is expected to exist, and should fail with
 * an assertion error if it does not (if assertions are enabled).
 *
 * @param {string} id Element ID.
 * @return {!Element} The element with the given ID, if it exists.
 */
goog.dom.DomHelper.prototype.getRequiredElement = function(id) {
  return goog.dom.getRequiredElementHelper_(this.document_, id);
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};


/**
 * Returns the first element we find matching the provided class name.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Element|Document)=} opt_el Optional element to look in.
 * @return {Element} The first item found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};


/**
 * Ensures an element with the given className exists, and then returns the
 * first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(!Element|!Document)=} opt_root Optional element or document to look
 *     in.
 * @return {!Element} The first item found with the class name provided.
 * @throws {goog.asserts.AssertionError} Thrown if no element is found.
 */
goog.dom.DomHelper.prototype.getRequiredElementByClass = function(className,
                                                                  opt_root) {
  var root = opt_root || this.document_;
  return goog.dom.getRequiredElementByClass(className, root);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the document.
 */
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};


/**
 * Typedef for use with goog.dom.createDom and goog.dom.append.
 * @typedef {Object|string|Array|NodeList}
 */
goog.dom.Appendable;


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(Object|string)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or strings for
 *     text nodes.  If one of the var_args is an array, its children will be
 *     added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {number|string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(String(content));
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with
 *     {@code goog.string.Unicode.NBSP} characters.
 * @return {!HTMLElement} The created table.
 */
goog.dom.DomHelper.prototype.createTable = function(rows, columns,
    opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns,
      !!opt_fillWithNbsp);
};


/**
 * Converts an HTML into a node or a document fragment. A single Node is used if
 * {@code html} only generates a single node. If {@code html} generates multiple
 * nodes then these are put inside a {@code DocumentFragment}.
 * @param {!goog.html.SafeHtml} html The HTML markup to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.safeHtmlToNode = function(html) {
  return goog.dom.safeHtmlToNode_(this.document_, html);
};


/**
 * Converts an HTML string into a node or a document fragment.  A single Node
 * is used if the {@code htmlString} only generates a single node.  If the
 * {@code htmlString} generates multiple nodes then these are put inside a
 * {@code DocumentFragment}.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Gets the document scroll element.
 * @return {!Element} Scrolling element.
 */
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};


/**
 * Gets the document scroll distance as a coordinate object.
 * @return {!goog.math.Coordinate} Object with properties 'x' and 'y'.
 */
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};


/**
 * Determines the active element in the given document.
 * @param {Document=} opt_doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.DomHelper.prototype.getActiveElement = function(opt_doc) {
  return goog.dom.getActiveElement(opt_doc || this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.DomHelper.prototype.append = goog.dom.append;


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.DomHelper.prototype.canHaveChildren = goog.dom.canHaveChildren;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.DomHelper.prototype.insertChildAt = goog.dom.insertChildAt;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.DomHelper.prototype.getChildren = goog.dom.getChildren;


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getFirstElementChild =
    goog.dom.getFirstElementChild;


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getNextElementSibling =
    goog.dom.getNextElementSibling;


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.DomHelper.prototype.getPreviousElementSibling =
    goog.dom.getPreviousElementSibling;


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;


/**
 * Whether the object looks like a DOM node.
 * @param {?} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether the object looks like an Element.
 * @param {?} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.DomHelper.prototype.isElement = goog.dom.isElement;


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {?} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.DomHelper.prototype.isWindow = goog.dom.isWindow;


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.DomHelper.prototype.getParentElement = goog.dom.getParentElement;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.DomHelper.prototype.compareNodeOrder = goog.dom.compareNodeOrder;


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.DomHelper.prototype.findCommonAncestor = goog.dom.findCommonAncestor;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Cross browser function for getting the document element of an iframe.
 * @param {Element} iframe Iframe element.
 * @return {!Document} The frame content document.
 */
goog.dom.DomHelper.prototype.getFrameContentDocument =
    goog.dom.getFrameContentDocument;


/**
 * Cross browser function for getting the window of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.DomHelper.prototype.getFrameContentWindow =
    goog.dom.getFrameContentWindow;


/**
 * Sets the text content of a node, with cross-browser support.
 * @param {Node} node The node to change the text content of.
 * @param {string|number} text The value that should replace the node's content.
 */
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.DomHelper.prototype.getOuterHtml = goog.dom.getOuterHtml;


/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that some elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 */
goog.dom.DomHelper.prototype.isFocusableTabIndex = goog.dom.isFocusableTabIndex;


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.DomHelper.prototype.setFocusableTabIndex =
    goog.dom.setFocusableTabIndex;


/**
 * Returns true if the element can be focused, i.e. it has a tab index that
 * allows it to receive keyboard focus (tabIndex >= 0), or it is an element
 * that natively supports keyboard focus.
 * @param {!Element} element Element to check.
 * @return {boolean} Whether the element allows keyboard focus.
 */
goog.dom.DomHelper.prototype.isFocusable = goog.dom.isFocusable;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by
 * {@code goog.dom.getNodeTextLength}.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.DomHelper.prototype.getNodeAtOffset = goog.dom.getNodeAtOffset;


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.DomHelper.prototype.isNodeList = goog.dom.isNodeList;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass =
    goog.dom.getAncestorByTagNameAndClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} class The class name to match.
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.DomHelper.prototype.getAncestorByClass =
    goog.dom.getAncestorByClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;

// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides utility methods to render soy template.
 * @author chrishenry@google.com (Chris Henry)
 */

goog.provide('goog.soy');

goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.soy.data.SanitizedContent');
goog.require('goog.soy.data.SanitizedContentKind');
goog.require('goog.string');


/**
 * @define {boolean} Whether to require all Soy templates to be "strict html".
 * Soy templates that use strict autoescaping forbid noAutoescape along with
 * many dangerous directives, and return a runtime type SanitizedContent that
 * marks them as safe.
 *
 * If this flag is enabled, Soy templates will fail to render if a template
 * returns plain text -- indicating it is a non-strict template.
 */
goog.define('goog.soy.REQUIRE_STRICT_AUTOESCAPE', false);


/**
 * Sets the processed template as the innerHTML of an element. It is recommended
 * to use this helper function instead of directly setting innerHTML in your
 * hand-written code, so that it will be easier to audit the code for cross-site
 * scripting vulnerabilities.
 *
 * @param {?Element} element The element whose content we are rendering into.
 * @param {!goog.soy.data.SanitizedContent} templateResult The processed
 *     template of kind HTML or TEXT (which will be escaped).
 * @template ARG_TYPES
 */
goog.soy.renderHtml = function(element, templateResult) {
  element.innerHTML = goog.soy.ensureTemplateOutputHtml_(templateResult);
};


/**
 * Renders a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * @param {Element} element The element whose content we are rendering into.
 * @param {null|function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @template ARG_TYPES
 */
goog.soy.renderElement = function(element, template, opt_templateData,
                                  opt_injectedData) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  element.innerHTML = goog.soy.ensureTemplateOutputHtml_(template(
      opt_templateData || goog.soy.defaultTemplateData_, undefined,
      opt_injectedData));
};


/**
 * Renders a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned (note that this is *not* a fragment, despite them name of
 * the method). Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * @param {null|function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Node} The resulting node or document fragment.
 * @template ARG_TYPES
 */
goog.soy.renderAsFragment = function(template, opt_templateData,
                                     opt_injectedData, opt_domHelper) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  var dom = opt_domHelper || goog.dom.getDomHelper();
  var html = goog.soy.ensureTemplateOutputHtml_(
      template(opt_templateData || goog.soy.defaultTemplateData_,
               undefined, opt_injectedData));
  goog.soy.assertFirstTagValid_(html);
  return dom.htmlToDocumentFragment(html);
};


/**
 * Renders a Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * @param {null|function(ARG_TYPES, null=, Object<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @template ARG_TYPES
 */
goog.soy.renderAsElement = function(template, opt_templateData,
                                    opt_injectedData, opt_domHelper) {
  // Soy template parameter is only nullable for historical reasons.
  goog.asserts.assert(template, 'Soy template may not be null.');
  return goog.soy.convertToElement_(template(
      opt_templateData || goog.soy.defaultTemplateData_,
      undefined, opt_injectedData), opt_domHelper);
};


/**
 * Converts a processed Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * @param {!goog.soy.data.SanitizedContent} templateResult The processed
 *     template of kind HTML or TEXT (which will be escaped).
 * @param {?goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 */
goog.soy.convertToElement = function(templateResult, opt_domHelper) {
  return goog.soy.convertToElement_(templateResult, opt_domHelper);
};


/**
 * Non-strict version of {@code goog.soy.convertToElement}.
 *
 * @param {*} templateResult The processed template.
 * @param {?goog.dom.DomHelper=} opt_domHelper The DOM helper used to
 *     create DOM nodes; defaults to {@code goog.dom.getDomHelper}.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @private
 */
goog.soy.convertToElement_ = function(templateResult, opt_domHelper) {
  var dom = opt_domHelper || goog.dom.getDomHelper();
  var wrapper = dom.createElement(goog.dom.TagName.DIV);
  var html = goog.soy.ensureTemplateOutputHtml_(templateResult);
  goog.soy.assertFirstTagValid_(html);
  wrapper.innerHTML = html;

  // If the template renders as a single element, return it.
  if (wrapper.childNodes.length == 1) {
    var firstChild = wrapper.firstChild;
    if (firstChild.nodeType == goog.dom.NodeType.ELEMENT) {
      return /** @type {!Element} */ (firstChild);
    }
  }

  // Otherwise, return the wrapper DIV.
  return wrapper;
};


/**
 * Ensures the result is "safe" to insert as HTML.
 *
 * Note if the template has non-strict autoescape, the guarantees here are very
 * weak. It is recommended applications switch to requiring strict
 * autoescaping over time by tweaking goog.soy.REQUIRE_STRICT_AUTOESCAPE.
 *
 * In the case the argument is a SanitizedContent object, it either must
 * already be of kind HTML, or if it is kind="text", the output will be HTML
 * escaped.
 *
 * @param {*} templateResult The template result.
 * @return {string} The assumed-safe HTML output string.
 * @private
 */
goog.soy.ensureTemplateOutputHtml_ = function(templateResult) {
  // Allow strings as long as strict autoescaping is not mandated. Note we
  // allow everything that isn't an object, because some non-escaping templates
  // end up returning non-strings if their only print statement is a
  // non-escaped argument, plus some unit tests spoof templates.
  // TODO(gboyer): Track down and fix these cases.
  if (!goog.soy.REQUIRE_STRICT_AUTOESCAPE && !goog.isObject(templateResult)) {
    return String(templateResult);
  }

  // Allow SanitizedContent of kind HTML.
  if (templateResult instanceof goog.soy.data.SanitizedContent) {
    templateResult = /** @type {!goog.soy.data.SanitizedContent} */ (
        templateResult);
    var ContentKind = goog.soy.data.SanitizedContentKind;
    if (templateResult.contentKind === ContentKind.HTML) {
      return goog.asserts.assertString(templateResult.getContent());
    }
    if (templateResult.contentKind === ContentKind.TEXT) {
      // Allow text to be rendered, as long as we escape it. Other content
      // kinds will fail, since we don't know what to do with them.
      // TODO(gboyer): Perhaps also include URI in this case.
      return goog.string.htmlEscape(templateResult.getContent());
    }
  }

  goog.asserts.fail('Soy template output is unsafe for use as HTML: ' +
      templateResult);

  // In production, return a safe string, rather than failing hard.
  return 'zSoyz';
};


/**
 * Checks that the rendered HTML does not start with an invalid tag that would
 * likely cause unexpected output from renderAsElement or renderAsFragment.
 * See {@link http://www.w3.org/TR/html5/semantics.html#semantics} for reference
 * as to which HTML elements can be parents of each other.
 * @param {string} html The output of a template.
 * @private
 */
goog.soy.assertFirstTagValid_ = function(html) {
  if (goog.asserts.ENABLE_ASSERTS) {
    var matches = html.match(goog.soy.INVALID_TAG_TO_RENDER_);
    goog.asserts.assert(!matches, 'This template starts with a %s, which ' +
        'cannot be a child of a <div>, as required by soy internals. ' +
        'Consider using goog.soy.renderElement instead.\nTemplate output: %s',
        matches && matches[0], html);
  }
};


/**
 * A pattern to find templates that cannot be rendered by renderAsElement or
 * renderAsFragment, as these elements cannot exist as the child of a <div>.
 * @type {!RegExp}
 * @private
 */
goog.soy.INVALID_TAG_TO_RENDER_ =
    /^<(body|caption|col|colgroup|head|html|tr|td|th|tbody|thead|tfoot)>/i;


/**
 * Immutable object that is passed into templates that are rendered
 * without any data.
 * @private @const
 */
goog.soy.defaultTemplateData_ = {};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides inversion and inversion map functionality for storing
 * integer ranges and corresponding values.
 *
 */

goog.provide('goog.structs.InversionMap');

goog.require('goog.array');



/**
 * Maps ranges to values.
 * @param {Array<number>} rangeArray An array of monotonically
 *     increasing integer values, with at least one instance.
 * @param {Array<T>} valueArray An array of corresponding values.
 *     Length must be the same as rangeArray.
 * @param {boolean=} opt_delta If true, saves only delta from previous value.
 * @constructor
 * @template T
 */
goog.structs.InversionMap = function(rangeArray, valueArray, opt_delta) {
  /**
   * @protected {Array<number>}
   */
  this.rangeArray = null;

  if (rangeArray.length != valueArray.length) {
    // rangeArray and valueArray has to match in number of entries.
    return null;
  }
  this.storeInversion_(rangeArray, opt_delta);

  /** @protected {Array<T>} */
  this.values = valueArray;
};


/**
 * Stores the integers as ranges (half-open).
 * If delta is true, the integers are delta from the previous value and
 * will be restored to the absolute value.
 * When used as a set, even indices are IN, and odd are OUT.
 * @param {Array<number?>} rangeArray An array of monotonically
 *     increasing integer values, with at least one instance.
 * @param {boolean=} opt_delta If true, saves only delta from previous value.
 * @private
 */
goog.structs.InversionMap.prototype.storeInversion_ = function(rangeArray,
    opt_delta) {
  this.rangeArray = rangeArray;

  for (var i = 1; i < rangeArray.length; i++) {
    if (rangeArray[i] == null) {
      rangeArray[i] = rangeArray[i - 1] + 1;
    } else if (opt_delta) {
      rangeArray[i] += rangeArray[i - 1];
    }
  }
};


/**
 * Splices a range -> value map into this inversion map.
 * @param {Array<number>} rangeArray An array of monotonically
 *     increasing integer values, with at least one instance.
 * @param {Array<T>} valueArray An array of corresponding values.
 *     Length must be the same as rangeArray.
 * @param {boolean=} opt_delta If true, saves only delta from previous value.
 */
goog.structs.InversionMap.prototype.spliceInversion = function(
    rangeArray, valueArray, opt_delta) {
  // By building another inversion map, we build the arrays that we need
  // to splice in.
  var otherMap = new goog.structs.InversionMap(
      rangeArray, valueArray, opt_delta);

  // Figure out where to splice those arrays.
  var startRange = otherMap.rangeArray[0];
  var endRange =
      /** @type {number} */ (goog.array.peek(otherMap.rangeArray));
  var startSplice = this.getLeast(startRange);
  var endSplice = this.getLeast(endRange);

  // The inversion map works by storing the start points of ranges...
  if (startRange != this.rangeArray[startSplice]) {
    // ...if we're splicing in a start point that isn't already here,
    // then we need to insert it after the insertion point.
    startSplice++;
  } // otherwise we overwrite the insertion point.

  var spliceLength = endSplice - startSplice + 1;
  goog.partial(goog.array.splice, this.rangeArray, startSplice,
      spliceLength).apply(null, otherMap.rangeArray);
  goog.partial(goog.array.splice, this.values, startSplice,
      spliceLength).apply(null, otherMap.values);
};


/**
 * Gets the value corresponding to a number from the inversion map.
 * @param {number} intKey The number for which value needs to be retrieved
 *     from inversion map.
 * @return {T|null} Value retrieved from inversion map; null if not found.
 */
goog.structs.InversionMap.prototype.at = function(intKey) {
  var index = this.getLeast(intKey);
  if (index < 0) {
    return null;
  }
  return this.values[index];
};


/**
 * Gets the largest index such that rangeArray[index] <= intKey from the
 * inversion map.
 * @param {number} intKey The probe for which rangeArray is searched.
 * @return {number} Largest index such that rangeArray[index] <= intKey.
 * @protected
 */
goog.structs.InversionMap.prototype.getLeast = function(intKey) {
  var arr = this.rangeArray;
  var low = 0;
  var high = arr.length;
  while (high - low > 8) {
    var mid = (high + low) >> 1;
    if (arr[mid] <= intKey) {
      low = mid;
    } else {
      high = mid;
    }
  }
  for (; low < high; ++low) {
    if (intKey < arr[low]) {
      break;
    }
  }
  return low - 1;
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Detect Grapheme Cluster Break in a pair of codepoints. Follows
 * Unicode 5.1 UAX#29. Tailoring for Virama × Indic Consonants is used.
 *
 */

goog.provide('goog.i18n.GraphemeBreak');
goog.require('goog.structs.InversionMap');


/**
 * Enum for all Grapheme Cluster Break properties.
 * These enums directly corresponds to Grapheme_Cluster_Break property values
 * mentioned in http://unicode.org/reports/tr29 table 2. VIRAMA and
 * INDIC_CONSONANT are for the Virama × Base tailoring mentioned in the notes.
 *
 * CR and LF are moved to the bottom of the list because they occur only once
 * and so good candidates to take 2 decimal digit values.
 * @enum {number}
 * @protected
 */
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


/**
 * Grapheme Cluster Break property values for all codepoints as inversion map.
 * Constructed lazily.
 *
 * @type {goog.structs.InversionMap}
 * @private
 */
goog.i18n.GraphemeBreak.inversions_ = null;


/**
 * There are two kinds of grapheme clusters: 1) Legacy 2)Extended. This method
 * is to check for legacy rules.
 *
 * @param {number} prop_a The property enum value of the first character.
 * @param {number} prop_b The property enum value of the second character.
 * @return {boolean} True if a & b do not form a cluster; False otherwise.
 * @private
 */
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
  if ((prop_a == prop.L) &&
      (prop_b == prop.L || prop_b == prop.V ||
      prop_b == prop.LV || prop_b == prop.LVT)) {
    return false;
  }
  if ((prop_a == prop.LV || prop_a == prop.V) &&
      (prop_b == prop.V || prop_b == prop.T)) {
    return false;
  }
  if ((prop_a == prop.LVT || prop_a == prop.T) && (prop_b == prop.T)) {
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


/**
 * Method to return property enum value of the codepoint. If it is Hangul LV or
 * LVT, then it is computed; for the rest it is picked from the inversion map.
 * @param {number} acode The code point value of the character.
 * @return {number} Property enum value of codepoint.
 * @private
 */
goog.i18n.GraphemeBreak.getBreakProp_ = function(acode) {
  if (0xAC00 <= acode && acode <= 0xD7A3) {
    var prop = goog.i18n.GraphemeBreak.property;
    if (acode % 0x1C == 0x10) {
      return prop.LV;
    }
    return prop.LVT;
  } else {
    if (!goog.i18n.GraphemeBreak.inversions_) {
      goog.i18n.GraphemeBreak.inversions_ = new goog.structs.InversionMap(
          [0, 10, 1, 2, 1, 18, 95, 33, 13, 1, 594, 112, 275, 7, 263, 45, 1, 1,
           1, 2, 1, 2, 1, 1, 56, 5, 11, 11, 48, 21, 16, 1, 101, 7, 1, 1, 6, 2,
           2, 1, 4, 33, 1, 1, 1, 30, 27, 91, 11, 58, 9, 34, 4, 1, 9, 1, 3, 1,
           5, 43, 3, 136, 31, 1, 17, 37, 1, 1, 1, 1, 3, 8, 4, 1, 2, 1, 7, 8, 2,
           2, 21, 8, 1, 2, 17, 39, 1, 1, 1, 2, 6, 6, 1, 9, 5, 4, 2, 2, 12, 2,
           15, 2, 1, 17, 39, 2, 3, 12, 4, 8, 6, 17, 2, 3, 14, 1, 17, 39, 1, 1,
           3, 8, 4, 1, 20, 2, 29, 1, 2, 17, 39, 1, 1, 2, 1, 6, 6, 9, 6, 4, 2,
           2, 13, 1, 16, 1, 18, 41, 1, 1, 1, 12, 1, 9, 1, 41, 3, 17, 37, 4, 3,
           5, 7, 8, 3, 2, 8, 2, 30, 2, 17, 39, 1, 1, 1, 1, 2, 1, 3, 1, 5, 1, 8,
           9, 1, 3, 2, 30, 2, 17, 38, 3, 1, 2, 5, 7, 1, 9, 1, 10, 2, 30, 2, 22,
           48, 5, 1, 2, 6, 7, 19, 2, 13, 46, 2, 1, 1, 1, 6, 1, 12, 8, 50, 46,
           2, 1, 1, 1, 9, 11, 6, 14, 2, 58, 2, 27, 1, 1, 1, 1, 1, 4, 2, 49, 14,
           1, 4, 1, 1, 2, 5, 48, 9, 1, 57, 33, 12, 4, 1, 6, 1, 2, 2, 2, 1, 16,
           2, 4, 2, 2, 4, 3, 1, 3, 2, 7, 3, 4, 13, 1, 1, 1, 2, 6, 1, 1, 14, 1,
           98, 96, 72, 88, 349, 3, 931, 15, 2, 1, 14, 15, 2, 1, 14, 15, 2, 15,
           15, 14, 35, 17, 2, 1, 7, 8, 1, 2, 9, 1, 1, 9, 1, 45, 3, 155, 1, 87,
           31, 3, 4, 2, 9, 1, 6, 3, 20, 19, 29, 44, 9, 3, 2, 1, 69, 23, 2, 3,
           4, 45, 6, 2, 1, 1, 1, 8, 1, 1, 1, 2, 8, 6, 13, 128, 4, 1, 14, 33, 1,
           1, 5, 1, 1, 5, 1, 1, 1, 7, 31, 9, 12, 2, 1, 7, 23, 1, 4, 2, 2, 2, 2,
           2, 11, 3, 2, 36, 2, 1, 1, 2, 3, 1, 1, 3, 2, 12, 36, 8, 8, 2, 2, 21,
           3, 128, 3, 1, 13, 1, 7, 4, 1, 4, 2, 1, 203, 64, 523, 1, 2, 2, 24, 7,
           49, 16, 96, 33, 3070, 3, 141, 1, 96, 32, 554, 6, 105, 2, 30164, 4,
           1, 10, 33, 1, 80, 2, 272, 1, 3, 1, 4, 1, 23, 2, 2, 1, 24, 30, 4, 4,
           3, 8, 1, 1, 13, 2, 16, 34, 16, 1, 27, 18, 24, 24, 4, 8, 2, 23, 11,
           1, 1, 12, 32, 3, 1, 5, 3, 3, 36, 1, 2, 4, 2, 1, 3, 1, 69, 35, 6, 2,
           2, 2, 2, 12, 1, 8, 1, 1, 18, 16, 1, 3, 6, 1, 5, 48, 1, 1, 3, 2, 2,
           5, 2, 1, 1, 32, 9, 1, 2, 2, 5, 1, 1, 201, 14, 2, 1, 1, 9, 8, 2, 1,
           2, 1, 2, 1, 1, 1, 18, 11184, 27, 49, 1028, 1024, 6942, 1, 737, 16,
           16, 7, 216, 1, 158, 2, 89, 3, 513, 1, 2051, 15, 40, 7, 1, 1472, 1,
           1, 1, 53, 14, 1, 57, 2, 1, 45, 3, 4, 2, 1, 1, 2, 1, 66, 3, 36, 5, 1,
           6, 2, 75, 2, 1, 48, 3, 9, 1, 1, 1258, 1, 1, 1, 2, 6, 1, 1, 22681,
           62, 4, 25042, 1, 1, 3, 3, 1, 5, 8, 8, 2, 7, 30, 4, 148, 3, 8097, 26,
           790017, 255],
          [1, 13, 1, 12, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0,
           2, 0, 1, 0, 2, 0, 2, 0, 2, 0, 2, 1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0,
           2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 4, 0, 5, 2, 4, 2,
           0, 4, 2, 4, 6, 4, 0, 2, 5, 0, 2, 0, 5, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4,
           6, 0, 2, 5, 0, 2, 0, 5, 0, 2, 4, 0, 5, 2, 4, 2, 6, 2, 5, 0, 2, 0, 2,
           4, 0, 5, 2, 0, 4, 2, 4, 6, 0, 2, 0, 2, 4, 0, 5, 2, 0, 2, 4, 2, 4, 6,
           2, 5, 0, 2, 0, 5, 0, 2, 0, 5, 2, 4, 2, 4, 6, 0, 2, 0, 4, 0, 5, 0, 2,
           4, 2, 6, 2, 5, 0, 2, 0, 4, 0, 5, 2, 0, 4, 2, 4, 2, 4, 2, 4, 2, 6, 2,
           5, 0, 2, 0, 4, 0, 5, 0, 2, 4, 2, 4, 6, 0, 2, 0, 2, 0, 4, 0, 5, 6, 2,
           4, 2, 4, 2, 4, 0, 5, 0, 2, 0, 4, 2, 6, 0, 2, 0, 5, 0, 2, 0, 4, 2, 0,
           2, 0, 5, 0, 2, 0, 2, 0, 2, 0, 2, 0, 4, 5, 2, 4, 2, 6, 0, 2, 0, 2, 0,
           2, 0, 5, 0, 2, 4, 2, 0, 6, 4, 2, 5, 0, 5, 0, 4, 2, 5, 2, 5, 0, 5, 0,
           5, 2, 5, 2, 0, 4, 2, 0, 2, 5, 0, 2, 0, 7, 8, 9, 0, 2, 0, 5, 2, 6, 0,
           5, 2, 6, 0, 5, 2, 0, 5, 2, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 2, 0, 2, 0,
           2, 0, 2, 0, 5, 2, 4, 2, 4, 2, 4, 2, 0, 5, 0, 5, 0, 4, 0, 4, 0, 5, 2,
           4, 0, 5, 0, 5, 4, 2, 4, 2, 6, 0, 2, 0, 2, 4, 2, 0, 2, 4, 0, 5, 2, 4,
           2, 4, 2, 4, 2, 4, 6, 5, 0, 2, 0, 2, 4, 0, 5, 4, 2, 4, 2, 6, 4, 5, 0,
           5, 0, 5, 0, 2, 4, 2, 4, 2, 4, 2, 6, 0, 5, 4, 2, 4, 2, 0, 5, 0, 2, 0,
           2, 4, 2, 0, 2, 0, 4, 2, 0, 2, 0, 1, 2, 1, 0, 1, 0, 1, 0, 2, 0, 2, 0,
           6, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 6, 5, 2, 5, 4,
           2, 4, 0, 5, 0, 5, 0, 5, 0, 5, 0, 4, 0, 5, 4, 6, 0, 2, 0, 5, 0, 2, 0,
           5, 2, 4, 6, 0, 7, 2, 4, 0, 5, 0, 5, 2, 4, 2, 4, 2, 4, 6, 0, 5, 2, 4,
           2, 4, 2, 0, 2, 0, 2, 4, 0, 5, 0, 5, 0, 5, 0, 5, 2, 0, 2, 0, 2, 0, 2,
           0, 2, 0, 5, 4, 2, 4, 0, 4, 6, 0, 5, 0, 5, 0, 5, 0, 4, 2, 4, 2, 4, 0,
           4, 6, 0, 11, 8, 9, 0, 2, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2,
           0, 2, 0, 2, 6, 0, 4, 2, 4, 0, 2, 6, 0, 2, 4, 0, 4, 2, 4, 6, 2, 0, 1,
           0, 2, 0, 2, 4, 2, 6, 0, 2, 4, 0, 4, 2, 4, 6, 0, 2, 4, 2, 4, 2, 6, 2,
           0, 4, 2, 0, 2, 4, 2, 0, 4, 2, 1, 2, 0, 2, 0, 2, 0, 2, 0, 14, 0, 1,
           2],
          true);
    }
    return /** @type {number} */ (
        goog.i18n.GraphemeBreak.inversions_.at(acode));
  }
};


/**
 * There are two kinds of grapheme clusters: 1) Legacy 2)Extended. This method
 * is to check for both using a boolean flag to switch between them.
 * @param {number} a The code point value of the first character.
 * @param {number} b The code point value of the second character.
 * @param {boolean=} opt_extended If true, indicates extended grapheme cluster;
 *     If false, indicates legacy cluster.
 * @return {boolean} True if a & b do not form a cluster; False otherwise.
 */
goog.i18n.GraphemeBreak.hasGraphemeBreak = function(a, b, opt_extended) {

  var prop_a = goog.i18n.GraphemeBreak.getBreakProp_(a);
  var prop_b = goog.i18n.GraphemeBreak.getBreakProp_(b);
  var prop = goog.i18n.GraphemeBreak.property;

  return goog.i18n.GraphemeBreak.applyLegacyBreakRules_(prop_a, prop_b) &&
      !(opt_extended &&
          (prop_a == prop.PREPEND || prop_b == prop.SPACING_MARK));
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides utility functions for formatting strings, numbers etc.
 *
 */

goog.provide('goog.format');

goog.require('goog.i18n.GraphemeBreak');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Formats a number of bytes in human readable form.
 * 54, 450K, 1.3M, 5G etc.
 * @param {number} bytes The number of bytes to show.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @return {string} The human readable form of the byte size.
 */
goog.format.fileSize = function(bytes, opt_decimals) {
  return goog.format.numBytesToString(bytes, opt_decimals, false);
};


/**
 * Checks whether string value containing scaling units (K, M, G, T, P, m,
 * u, n) can be converted to a number.
 *
 * Where there is a decimal, there must be a digit to the left of the
 * decimal point.
 *
 * Negative numbers are valid.
 *
 * Examples:
 *   0, 1, 1.0, 10.4K, 2.3M, -0.3P, 1.2m
 *
 * @param {string} val String value to check.
 * @return {boolean} True if string could be converted to a numeric value.
 */
goog.format.isConvertableScaledNumber = function(val) {
  return goog.format.SCALED_NUMERIC_RE_.test(val);
};


/**
 * Converts a string to numeric value, taking into account the units.
 * If string ends in 'B', use binary conversion.
 * @param {string} stringValue String to be converted to numeric value.
 * @return {number} Numeric value for string.
 */
goog.format.stringToNumericValue = function(stringValue) {
  if (goog.string.endsWith(stringValue, 'B')) {
    return goog.format.stringToNumericValue_(
        stringValue, goog.format.NUMERIC_SCALES_BINARY_);
  }
  return goog.format.stringToNumericValue_(
      stringValue, goog.format.NUMERIC_SCALES_SI_);
};


/**
 * Converts a string to number of bytes, taking into account the units.
 * Binary conversion.
 * @param {string} stringValue String to be converted to numeric value.
 * @return {number} Numeric value for string.
 */
goog.format.stringToNumBytes = function(stringValue) {
  return goog.format.stringToNumericValue_(
      stringValue, goog.format.NUMERIC_SCALES_BINARY_);
};


/**
 * Converts a numeric value to string representation. SI conversion.
 * @param {number} val Value to be converted.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @return {string} String representation of number.
 */
goog.format.numericValueToString = function(val, opt_decimals) {
  return goog.format.numericValueToString_(
      val, goog.format.NUMERIC_SCALES_SI_, opt_decimals);
};


/**
 * Converts number of bytes to string representation. Binary conversion.
 * Default is to return the additional 'B' suffix only for scales greater than
 * 1K, e.g. '10.5KB' to minimize confusion with counts that are scaled by powers
 * of 1000. Otherwise, suffix is empty string.
 * @param {number} val Value to be converted.
 * @param {number=} opt_decimals The number of decimals to use.  Defaults to 2.
 * @param {boolean=} opt_suffix If true, include trailing 'B' in returned
 *     string.  Default is true.
 * @param {boolean=} opt_useSeparator If true, number and scale will be
 *     separated by a no break space. Default is false.
 * @return {string} String representation of number of bytes.
 */
goog.format.numBytesToString = function(val, opt_decimals, opt_suffix,
    opt_useSeparator) {
  var suffix = '';
  if (!goog.isDef(opt_suffix) || opt_suffix) {
    suffix = 'B';
  }
  return goog.format.numericValueToString_(
      val, goog.format.NUMERIC_SCALES_BINARY_, opt_decimals, suffix,
      opt_useSeparator);
};


/**
 * Converts a string to numeric value, taking into account the units.
 * @param {string} stringValue String to be converted to numeric value.
 * @param {Object} conversion Dictionary of conversion scales.
 * @return {number} Numeric value for string.  If it cannot be converted,
 *    returns NaN.
 * @private
 */
goog.format.stringToNumericValue_ = function(stringValue, conversion) {
  var match = stringValue.match(goog.format.SCALED_NUMERIC_RE_);
  if (!match) {
    return NaN;
  }
  var val = match[1] * conversion[match[2]];
  return val;
};


/**
 * Converts a numeric value to string, using specified conversion
 * scales.
 * @param {number} val Value to be converted.
 * @param {Object} conversion Dictionary of scaling factors.
 * @param {number=} opt_decimals The number of decimals to use.  Default is 2.
 * @param {string=} opt_suffix Optional suffix to append.
 * @param {boolean=} opt_useSeparator If true, number and scale will be
 *     separated by a space. Default is false.
 * @return {string} The human readable form of the byte size.
 * @private
 */
goog.format.numericValueToString_ = function(val, conversion,
    opt_decimals, opt_suffix, opt_useSeparator) {
  var prefixes = goog.format.NUMERIC_SCALE_PREFIXES_;
  var orig_val = val;
  var symbol = '';
  var separator = '';
  var scale = 1;
  if (val < 0) {
    val = -val;
  }
  for (var i = 0; i < prefixes.length; i++) {
    var unit = prefixes[i];
    scale = conversion[unit];
    if (val >= scale || (scale <= 1 && val > 0.1 * scale)) {
      // Treat values less than 1 differently, allowing 0.5 to be "0.5" rather
      // than "500m"
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
      separator = ' ';
    }
  }
  var ex = Math.pow(10, goog.isDef(opt_decimals) ? opt_decimals : 2);
  return Math.round(orig_val / scale * ex) / ex + separator + symbol;
};


/**
 * Regular expression for detecting scaling units, such as K, M, G, etc. for
 * converting a string representation to a numeric value.
 *
 * Also allow 'k' to be aliased to 'K'.  These could be used for SI (powers
 * of 1000) or Binary (powers of 1024) conversions.
 *
 * Also allow final 'B' to be interpreted as byte-count, implicitly triggering
 * binary conversion (e.g., '10.2MB').
 *
 * @type {RegExp}
 * @private
 */
goog.format.SCALED_NUMERIC_RE_ = /^([-]?\d+\.?\d*)([K,M,G,T,P,k,m,u,n]?)[B]?$/;


/**
 * Ordered list of scaling prefixes in decreasing order.
 * @private {Array<string>}
 */
goog.format.NUMERIC_SCALE_PREFIXES_ = [
  'P', 'T', 'G', 'M', 'K', '', 'm', 'u', 'n'
];


/**
 * Scaling factors for conversion of numeric value to string.  SI conversion.
 * @type {Object}
 * @private
 */
goog.format.NUMERIC_SCALES_SI_ = {
  '': 1,
  'n': 1e-9,
  'u': 1e-6,
  'm': 1e-3,
  'k': 1e3,
  'K': 1e3,
  'M': 1e6,
  'G': 1e9,
  'T': 1e12,
  'P': 1e15
};


/**
 * Scaling factors for conversion of numeric value to string.  Binary
 * conversion.
 * @type {Object}
 * @private
 */
goog.format.NUMERIC_SCALES_BINARY_ = {
  '': 1,
  'n': Math.pow(1024, -3),
  'u': Math.pow(1024, -2),
  'm': 1.0 / 1024,
  'k': 1024,
  'K': 1024,
  'M': Math.pow(1024, 2),
  'G': Math.pow(1024, 3),
  'T': Math.pow(1024, 4),
  'P': Math.pow(1024, 5)
};


/**
 * First Unicode code point that has the Mark property.
 * @type {number}
 * @private
 */
goog.format.FIRST_GRAPHEME_EXTEND_ = 0x300;


/**
 * Returns true if and only if given character should be treated as a breaking
 * space. All ASCII control characters, the main Unicode range of spacing
 * characters (U+2000 to U+200B inclusive except for U+2007), and several other
 * Unicode space characters are treated as breaking spaces.
 * @param {number} charCode The character code under consideration.
 * @return {boolean} True if the character is a breaking space.
 * @private
 */
goog.format.isTreatedAsBreakingSpace_ = function(charCode) {
  return (charCode <= goog.format.WbrToken_.SPACE) ||
         (charCode >= 0x1000 &&
          ((charCode >= 0x2000 && charCode <= 0x2006) ||
           (charCode >= 0x2008 && charCode <= 0x200B) ||
           charCode == 0x1680 ||
           charCode == 0x180E ||
           charCode == 0x2028 ||
           charCode == 0x2029 ||
           charCode == 0x205f ||
           charCode == 0x3000));
};


/**
 * Returns true if and only if given character is an invisible formatting
 * character.
 * @param {number} charCode The character code under consideration.
 * @return {boolean} True if the character is an invisible formatting character.
 * @private
 */
goog.format.isInvisibleFormattingCharacter_ = function(charCode) {
  // See: http://unicode.org/charts/PDF/U2000.pdf
  return (charCode >= 0x200C && charCode <= 0x200F) ||
         (charCode >= 0x202A && charCode <= 0x202E);
};


/**
 * Inserts word breaks into an HTML string at a given interval.  The counter is
 * reset if a space or a character which behaves like a space is encountered,
 * but it isn't incremented if an invisible formatting character is encountered.
 * WBRs aren't inserted into HTML tags or entities.  Entities count towards the
 * character count, HTML tags do not.
 *
 * With common strings aliased, objects allocations are constant based on the
 * length of the string: N + 3. This guarantee does not hold if the string
 * contains an element >= U+0300 and hasGraphemeBreak is non-trivial.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {function(number, number, boolean): boolean} hasGraphemeBreak A
 *     function determining if there is a grapheme break between two characters,
 *     in the same signature as goog.i18n.GraphemeBreak.hasGraphemeBreak.
 * @param {number=} opt_maxlen Maximum length after which to ensure
 *     there is a break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 * @private
 */
goog.format.insertWordBreaksGeneric_ = function(str, hasGraphemeBreak,
    opt_maxlen) {
  var maxlen = opt_maxlen || 10;
  if (maxlen > str.length) return str;

  var rv = [];
  var n = 0; // The length of the current token

  // This will contain the ampersand or less-than character if one of the
  // two has been seen; otherwise, the value is zero.
  var nestingCharCode = 0;

  // First character position from input string that has not been outputted.
  var lastDumpPosition = 0;

  var charCode = 0;
  for (var i = 0; i < str.length; i++) {
    // Using charCodeAt versus charAt avoids allocating new string objects.
    var lastCharCode = charCode;
    charCode = str.charCodeAt(i);

    // Don't add a WBR before characters that might be grapheme extending.
    var isPotentiallyGraphemeExtending =
        charCode >= goog.format.FIRST_GRAPHEME_EXTEND_ &&
        !hasGraphemeBreak(lastCharCode, charCode, true);

    // Don't add a WBR at the end of a word. For the purposes of determining
    // work breaks, all ASCII control characters and some commonly encountered
    // Unicode spacing characters are treated as breaking spaces.
    if (n >= maxlen &&
        !goog.format.isTreatedAsBreakingSpace_(charCode) &&
        !isPotentiallyGraphemeExtending) {
      // Flush everything seen so far, and append a word break.
      rv.push(str.substring(lastDumpPosition, i), goog.format.WORD_BREAK_HTML);
      lastDumpPosition = i;
      n = 0;
    }

    if (!nestingCharCode) {
      // Not currently within an HTML tag or entity

      if (charCode == goog.format.WbrToken_.LT ||
          charCode == goog.format.WbrToken_.AMP) {

        // Entering an HTML Entity '&' or open tag '<'
        nestingCharCode = charCode;
      } else if (goog.format.isTreatedAsBreakingSpace_(charCode)) {

        // A space or control character -- reset the token length
        n = 0;
      } else if (!goog.format.isInvisibleFormattingCharacter_(charCode)) {

        // A normal flow character - increment.  For grapheme extending
        // characters, this is not *technically* a new character.  However,
        // since the grapheme break detector might be overly conservative,
        // we have to continue incrementing, or else we won't even be able
        // to add breaks when we get to things like punctuation.  For the
        // case where we have a full grapheme break detector, it is okay if
        // we occasionally break slightly early.
        n++;
      }
    } else if (charCode == goog.format.WbrToken_.GT &&
        nestingCharCode == goog.format.WbrToken_.LT) {

      // Leaving an HTML tag, treat the tag as zero-length
      nestingCharCode = 0;
    } else if (charCode == goog.format.WbrToken_.SEMI_COLON &&
        nestingCharCode == goog.format.WbrToken_.AMP) {

      // Leaving an HTML entity, treat it as length one
      nestingCharCode = 0;
      n++;
    }
  }

  // Take care of anything we haven't flushed so far.
  rv.push(str.substr(lastDumpPosition));

  return rv.join('');
};


/**
 * Inserts word breaks into an HTML string at a given interval.
 *
 * This method is as aggressive as possible, using a full table of Unicode
 * characters where it is legal to insert word breaks; however, this table
 * comes at a 2.5k pre-gzip (~1k post-gzip) size cost.  Consider using
 * insertWordBreaksBasic to minimize the size impact.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {number=} opt_maxlen Maximum length after which to ensure there is a
 *     break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 */
goog.format.insertWordBreaks = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(str,
      goog.i18n.GraphemeBreak.hasGraphemeBreak, opt_maxlen);
};


/**
 * Determines conservatively if a character has a Grapheme break.
 *
 * Conforms to a similar signature as goog.i18n.GraphemeBreak, but is overly
 * conservative, returning true only for characters in common scripts that
 * are simple to account for.
 *
 * @param {number} lastCharCode The previous character code.  Ignored.
 * @param {number} charCode The character code under consideration.  It must be
 *     at least \u0300 as a precondition -- this case is covered by
 *     insertWordBreaksGeneric_.
 * @param {boolean=} opt_extended Ignored, to conform with the interface.
 * @return {boolean} Whether it is one of the recognized subsets of characters
 *     with a grapheme break.
 * @private
 */
goog.format.conservativelyHasGraphemeBreak_ = function(
    lastCharCode, charCode, opt_extended) {
  // Return false for everything except the most common Cyrillic characters.
  // Don't worry about Latin characters, because insertWordBreaksGeneric_
  // itself already handles those.
  // TODO(gboyer): Also account for Greek, Armenian, and Georgian if it is
  // simple to do so.
  return charCode >= 0x400 && charCode < 0x523;
};


// TODO(gboyer): Consider using a compile-time flag to switch implementations
// rather than relying on the developers to toggle implementations.
/**
 * Inserts word breaks into an HTML string at a given interval.
 *
 * This method is less aggressive than insertWordBreaks, only inserting
 * breaks next to punctuation and between Latin or Cyrillic characters.
 * However, this is good enough for the common case of URLs.  It also
 * works for all Latin and Cyrillic languages, plus CJK has no need for word
 * breaks.  When this method is used, goog.i18n.GraphemeBreak may be dead
 * code eliminated.
 *
 * @param {string} str HTML to insert word breaks into.
 * @param {number=} opt_maxlen Maximum length after which to ensure there is a
 *     break.  Default is 10 characters.
 * @return {string} The string including word breaks.
 */
goog.format.insertWordBreaksBasic = function(str, opt_maxlen) {
  return goog.format.insertWordBreaksGeneric_(str,
      goog.format.conservativelyHasGraphemeBreak_, opt_maxlen);
};


/**
 * True iff the current userAgent is IE8 or above.
 * @type {boolean}
 * @private
 */
goog.format.IS_IE8_OR_ABOVE_ = goog.userAgent.IE &&
    goog.userAgent.isVersionOrHigher(8);


/**
 * Constant for the WBR replacement used by insertWordBreaks.  Safari requires
 * <wbr></wbr>, Opera needs the &shy; entity, though this will give a visible
 * hyphen at breaks.  IE8 uses a zero width space.
 * Other browsers just use <wbr>.
 * @type {string}
 */
goog.format.WORD_BREAK_HTML =
    goog.userAgent.WEBKIT ?
        '<wbr></wbr>' : goog.userAgent.OPERA ?
            '&shy;' : goog.format.IS_IE8_OR_ABOVE_ ?
                '&#8203;' : '<wbr>';


/**
 * Tokens used within insertWordBreaks.
 * @private
 * @enum {number}
 */
goog.format.WbrToken_ = {
  LT: 60, // '<'.charCodeAt(0)
  GT: 62, // '>'.charCodeAt(0)
  AMP: 38, // '&'.charCodeAt(0)
  SEMI_COLON: 59, // ';'.charCodeAt(0)
  SPACE: 32 // ' '.charCodeAt(0)
};

// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Conversions from plain string to goog.html types for use in
 * legacy APIs that do not use goog.html types.
 *
 * This file provides conversions to create values of goog.html types from plain
 * strings.  These conversions are intended for use in legacy APIs that consume
 * HTML in the form of plain string types, but whose implementations use
 * goog.html types internally (and expose such types in an augmented, HTML-type-
 * safe API).
 *
 * IMPORTANT: No new code should use the conversion functions in this file.
 *
 * The conversion functions in this file are guarded with global flag
 * (goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS). If set to false, it
 * effectively "locks in" an entire application to only use HTML-type-safe APIs.
 *
 * Intended use of the functions in this file are as follows:
 *
 * Many Closure and application-specific classes expose methods that consume
 * values that in the class' implementation are forwarded to DOM APIs that can
 * result in security vulnerabilities.  For example, goog.ui.Dialog's setContent
 * method consumes a string that is assigned to an element's innerHTML property;
 * if this string contains untrusted (attacker-controlled) data, this can result
 * in a cross-site-scripting vulnerability.
 *
 * Widgets such as goog.ui.Dialog are being augmented to expose safe APIs
 * expressed in terms of goog.html types.  For instance, goog.ui.Dialog has a
 * method setSafeHtmlContent that consumes an object of type goog.html.SafeHtml,
 * a type whose contract guarantees that its value is safe to use in HTML
 * context, i.e. can be safely assigned to .innerHTML. An application that only
 * uses this API is forced to only supply values of this type, i.e. values that
 * are safe.
 *
 * However, the legacy method setContent cannot (for the time being) be removed
 * from goog.ui.Dialog, due to a large number of existing callers.  The
 * implementation of goog.ui.Dialog has been refactored to use
 * goog.html.SafeHtml throughout.  This in turn requires that the value consumed
 * by its setContent method is converted to goog.html.SafeHtml in an unchecked
 * conversion. The conversion function is provided by this file:
 * goog.html.legacyconversions.safeHtmlFromString.
 *
 * Note that the semantics of the conversions in goog.html.legacyconversions are
 * very different from the ones provided by goog.html.uncheckedconversions:  The
 * latter are for use in code where it has been established through manual
 * security review that the value produced by a piece of code must always
 * satisfy the SafeHtml contract (e.g., the output of a secure HTML sanitizer).
 * In uses of goog.html.legacyconversions, this guarantee is not given -- the
 * value in question originates in unreviewed legacy code and there is no
 * guarantee that it satisfies the SafeHtml contract.
 *
 * To establish correctness with confidence, application code should be
 * refactored to use SafeHtml instead of plain string to represent HTML markup,
 * and to use goog.html-typed APIs (e.g., goog.ui.Dialog#setSafeHtmlContent
 * instead of goog.ui.Dialog#setContent).
 *
 * To prevent introduction of new vulnerabilities, application owners can
 * effectively disable unsafe legacy APIs by compiling with the define
 * goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS set to false.  When
 * set, this define causes the conversion methods in this file to
 * unconditionally throw an exception.
 *
 * Note that new code should always be compiled with
 * ALLOW_LEGACY_CONVERSIONS=false.  At some future point, the default for this
 * define may change to false.
 */


goog.provide('goog.html.legacyconversions');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');


/**
 * @define {boolean} Whether conversion from string to goog.html types for
 * legacy API purposes is permitted.
 *
 * If false, the conversion functions in this file unconditionally throw an
 * exception.
 */
goog.define('goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS', true);


/**
 * Performs an "unchecked conversion" from string to SafeHtml for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} html A string to be converted to SafeHtml.
 * @return {!goog.html.SafeHtml} The value of html, wrapped in a SafeHtml
 *     object.
 */
goog.html.legacyconversions.safeHtmlFromString = function(html) {
  goog.html.legacyconversions.throwIfConversionsDisallowed();
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse(
      html, null /* dir */);
};


/**
 * Performs an "unchecked conversion" from string to SafeStyle for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} style A string to be converted to SafeStyle.
 * @return {!goog.html.SafeStyle} The value of style, wrapped in a SafeStyle
 *     object.
 */
goog.html.legacyconversions.safeStyleFromString = function(style) {
  goog.html.legacyconversions.throwIfConversionsDisallowed();
  return goog.html.SafeStyle.createSafeStyleSecurityPrivateDoNotAccessOrElse(
      style);
};


/**
 * Performs an "unchecked conversion" from string to TrustedResourceUrl for
 * legacy API purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} url A string to be converted to TrustedResourceUrl.
 * @return {!goog.html.TrustedResourceUrl} The value of url, wrapped in a
 *     TrustedResourceUrl object.
 */
goog.html.legacyconversions.trustedResourceUrlFromString = function(url) {
  goog.html.legacyconversions.throwIfConversionsDisallowed();
  return goog.html.TrustedResourceUrl.
      createTrustedResourceUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * Performs an "unchecked conversion" from string to SafeUrl for legacy API
 * purposes.
 *
 * Unchecked conversion will not proceed if ALLOW_LEGACY_CONVERSIONS is false,
 * and instead this function unconditionally throws an exception.
 *
 * @param {string} url A string to be converted to SafeUrl.
 * @return {!goog.html.SafeUrl} The value of url, wrapped in a SafeUrl
 *     object.
 */
goog.html.legacyconversions.safeUrlFromString = function(url) {
  goog.html.legacyconversions.throwIfConversionsDisallowed();
  return goog.html.SafeUrl.createSafeUrlSecurityPrivateDoNotAccessOrElse(url);
};


/**
 * @private {function(): undefined}
 */
goog.html.legacyconversions.reportCallback_ = goog.nullFunction;


/**
 * Sets a function that will be called every time a legacy conversion is
 * performed. The function is called with no parameters but it can use
 * goog.debug.getStacktrace to get a stacktrace.
 *
 * @param {function(): undefined} callback Error callback as defined above.
 */
goog.html.legacyconversions.setReportCallback = function(callback) {
  goog.html.legacyconversions.reportCallback_ = callback;
};


/**
 * Throws an exception if ALLOW_LEGACY_CONVERSIONS is false. This is useful
 * for legacy APIs which consume HTML in the form of plain string types, but
 * do not provide an alternative HTML-type-safe API.
 */
goog.html.legacyconversions.throwIfConversionsDisallowed = function() {
  if (!goog.html.legacyconversions.ALLOW_LEGACY_CONVERSIONS) {
    throw Error(
        'Error: Legacy conversion from string to goog.html types is disabled');
  }
  goog.html.legacyconversions.reportCallback_();
};

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility for formatting text for display in a potentially
 * opposite-directionality context without garbling.
 * Mostly a port of http://go/formatter.cc.
 */


goog.provide('goog.i18n.BidiFormatter');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.legacyconversions');
goog.require('goog.i18n.bidi');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.Format');



/**
 * Utility class for formatting text for display in a potentially
 * opposite-directionality context without garbling. Provides the following
 * functionality:
 *
 * 1. BiDi Wrapping
 * When text in one language is mixed into a document in another, opposite-
 * directionality language, e.g. when an English business name is embedded in a
 * Hebrew web page, both the inserted string and the text following it may be
 * displayed incorrectly unless the inserted string is explicitly separated
 * from the surrounding text in a "wrapper" that declares its directionality at
 * the start and then resets it back at the end. This wrapping can be done in
 * HTML mark-up (e.g. a 'span dir="rtl"' tag) or - only in contexts where
 * mark-up can not be used - in Unicode BiDi formatting codes (LRE|RLE and PDF).
 * Providing such wrapping services is the basic purpose of the BiDi formatter.
 *
 * 2. Directionality estimation
 * How does one know whether a string about to be inserted into surrounding
 * text has the same directionality? Well, in many cases, one knows that this
 * must be the case when writing the code doing the insertion, e.g. when a
 * localized message is inserted into a localized page. In such cases there is
 * no need to involve the BiDi formatter at all. In the remaining cases, e.g.
 * when the string is user-entered or comes from a database, the language of
 * the string (and thus its directionality) is not known a priori, and must be
 * estimated at run-time. The BiDi formatter does this automatically.
 *
 * 3. Escaping
 * When wrapping plain text - i.e. text that is not already HTML or HTML-
 * escaped - in HTML mark-up, the text must first be HTML-escaped to prevent XSS
 * attacks and other nasty business. This of course is always true, but the
 * escaping can not be done after the string has already been wrapped in
 * mark-up, so the BiDi formatter also serves as a last chance and includes
 * escaping services.
 *
 * Thus, in a single call, the formatter will escape the input string as
 * specified, determine its directionality, and wrap it as necessary. It is
 * then up to the caller to insert the return value in the output.
 *
 * See http://wiki/Main/TemplatesAndBiDi for more information.
 *
 * @param {goog.i18n.bidi.Dir|number|boolean|null} contextDir The context
 *     directionality, in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant. NEUTRAL is treated the same as null,
 *        i.e. unknown, for backward compatibility with legacy calls.
 *     2. A number (positive = LTR, negative = RTL, 0 = unknown).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 * @param {boolean=} opt_alwaysSpan Whether {@link #spanWrap} should always
 *     use a 'span' tag, even when the input directionality is neutral or
 *     matches the context, so that the DOM structure of the output does not
 *     depend on the combination of directionalities. Default: false.
 * @constructor
 * @final
 */
goog.i18n.BidiFormatter = function(contextDir, opt_alwaysSpan) {
  /**
   * The overall directionality of the context in which the formatter is being
   * used.
   * @type {?goog.i18n.bidi.Dir}
   * @private
   */
  this.contextDir_ = goog.i18n.bidi.toDir(contextDir, true /* opt_noNeutral */);

  /**
   * Whether {@link #spanWrap} and similar methods should always use the same
   * span structure, regardless of the combination of directionalities, for a
   * stable DOM structure.
   * @type {boolean}
   * @private
   */
  this.alwaysSpan_ = !!opt_alwaysSpan;
};


/**
 * @return {?goog.i18n.bidi.Dir} The context directionality.
 */
goog.i18n.BidiFormatter.prototype.getContextDir = function() {
  return this.contextDir_;
};


/**
 * @return {boolean} Whether alwaysSpan is set.
 */
goog.i18n.BidiFormatter.prototype.getAlwaysSpan = function() {
  return this.alwaysSpan_;
};


/**
 * @param {goog.i18n.bidi.Dir|number|boolean|null} contextDir The context
 *     directionality, in one of the following formats:
 *     1. A goog.i18n.bidi.Dir constant. NEUTRAL is treated the same as null,
 *        i.e. unknown.
 *     2. A number (positive = LTR, negative = RTL, 0 = unknown).
 *     3. A boolean (true = RTL, false = LTR).
 *     4. A null for unknown directionality.
 */
goog.i18n.BidiFormatter.prototype.setContextDir = function(contextDir) {
  this.contextDir_ = goog.i18n.bidi.toDir(contextDir, true /* opt_noNeutral */);
};


/**
 * @param {boolean} alwaysSpan Whether {@link #spanWrap} should always use a
 *     'span' tag, even when the input directionality is neutral or matches the
 *     context, so that the DOM structure of the output does not depend on the
 *     combination of directionalities.
 */
goog.i18n.BidiFormatter.prototype.setAlwaysSpan = function(alwaysSpan) {
  this.alwaysSpan_ = alwaysSpan;
};


/**
 * Returns the directionality of input argument {@code str}.
 * Identical to {@link goog.i18n.bidi.estimateDirection}.
 *
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @return {goog.i18n.bidi.Dir} Estimated overall directionality of {@code str}.
 */
goog.i18n.BidiFormatter.prototype.estimateDirection =
    goog.i18n.bidi.estimateDirection;


/**
 * Returns true if two given directionalities are opposite.
 * Note: the implementation is based on the numeric values of the Dir enum.
 *
 * @param {?goog.i18n.bidi.Dir} dir1 1st directionality.
 * @param {?goog.i18n.bidi.Dir} dir2 2nd directionality.
 * @return {boolean} Whether the directionalities are opposite.
 * @private
 */
goog.i18n.BidiFormatter.prototype.areDirectionalitiesOpposite_ = function(dir1,
    dir2) {
  return dir1 * dir2 < 0;
};


/**
 * Returns a unicode BiDi mark matching the context directionality (LRM or
 * RLM) if {@code opt_dirReset}, and if either the directionality or the exit
 * directionality of {@code str} is opposite to the context directionality.
 * Otherwise returns the empty string.
 *
 * @param {string} str The input text.
 * @param {goog.i18n.bidi.Dir} dir {@code str}'s overall directionality.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to perform the reset. Default: false.
 * @return {string} A unicode BiDi mark or the empty string.
 * @private
 */
goog.i18n.BidiFormatter.prototype.dirResetIfNeeded_ = function(str, dir,
    opt_isHtml, opt_dirReset) {
  // endsWithRtl and endsWithLtr are called only if needed (short-circuit).
  if (opt_dirReset &&
      (this.areDirectionalitiesOpposite_(dir, this.contextDir_) ||
       (this.contextDir_ == goog.i18n.bidi.Dir.LTR &&
        goog.i18n.bidi.endsWithRtl(str, opt_isHtml)) ||
       (this.contextDir_ == goog.i18n.bidi.Dir.RTL &&
        goog.i18n.bidi.endsWithLtr(str, opt_isHtml)))) {
    return this.contextDir_ == goog.i18n.bidi.Dir.LTR ?
        goog.i18n.bidi.Format.LRM : goog.i18n.bidi.Format.RLM;
  } else {
    return '';
  }
};


/**
 * Returns "rtl" if {@code str}'s estimated directionality is RTL, and "ltr" if
 * it is LTR. In case it's NEUTRAL, returns "rtl" if the context directionality
 * is RTL, and "ltr" otherwise.
 * Needed for GXP, which can't handle dirAttr.
 * Example use case:
 * &lt;td expr:dir='bidiFormatter.dirAttrValue(foo)'&gt;
 *   &lt;gxp:eval expr='foo'&gt;
 * &lt;/td&gt;
 *
 * @param {string} str Text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} "rtl" or "ltr", according to the logic described above.
 */
goog.i18n.BidiFormatter.prototype.dirAttrValue = function(str, opt_isHtml) {
  return this.knownDirAttrValue(this.estimateDirection(str, opt_isHtml));
};


/**
 * Returns "rtl" if the given directionality is RTL, and "ltr" if it is LTR. In
 * case it's NEUTRAL, returns "rtl" if the context directionality is RTL, and
 * "ltr" otherwise.
 *
 * @param {goog.i18n.bidi.Dir} dir A directionality.
 * @return {string} "rtl" or "ltr", according to the logic described above.
 */
goog.i18n.BidiFormatter.prototype.knownDirAttrValue = function(dir) {
  var resolvedDir = dir == goog.i18n.bidi.Dir.NEUTRAL ? this.contextDir_ : dir;
  return resolvedDir == goog.i18n.bidi.Dir.RTL ? 'rtl' : 'ltr';
};


/**
 * Returns 'dir="ltr"' or 'dir="rtl"', depending on {@code str}'s estimated
 * directionality, if it is not the same as the context directionality.
 * Otherwise, returns the empty string.
 *
 * @param {string} str Text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} 'dir="rtl"' for RTL text in non-RTL context; 'dir="ltr"' for
 *     LTR text in non-LTR context; else, the empty string.
 */
goog.i18n.BidiFormatter.prototype.dirAttr = function(str, opt_isHtml) {
  return this.knownDirAttr(this.estimateDirection(str, opt_isHtml));
};


/**
 * Returns 'dir="ltr"' or 'dir="rtl"', depending on the given directionality, if
 * it is not the same as the context directionality. Otherwise, returns the
 * empty string.
 *
 * @param {goog.i18n.bidi.Dir} dir A directionality.
 * @return {string} 'dir="rtl"' for RTL text in non-RTL context; 'dir="ltr"' for
 *     LTR text in non-LTR context; else, the empty string.
 */
goog.i18n.BidiFormatter.prototype.knownDirAttr = function(dir) {
  if (dir != this.contextDir_) {
    return dir == goog.i18n.bidi.Dir.RTL ? 'dir="rtl"' :
        dir == goog.i18n.bidi.Dir.LTR ? 'dir="ltr"' : '';
  }
  return '';
};


/**
 * Formats a string of unknown directionality for use in HTML output of the
 * context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 * The algorithm: estimates the directionality of input argument {@code html}.
 * In case its directionality doesn't match the context directionality, wraps it
 * with a 'span' tag and adds a "dir" attribute (either 'dir="rtl"' or
 * 'dir="ltr"'). If setAlwaysSpan(true) was used, the input is always wrapped
 * with 'span', skipping just the dir attribute when it's not needed.
 *
 * If {@code opt_dirReset}, and if the overall directionality or the exit
 * directionality of {@code str} are opposite to the context directionality, a
 * trailing unicode BiDi mark matching the context directionality is appened
 * (LRM or RLM).
 *
 * @param {!goog.html.SafeHtml} html The input HTML.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code html}. Default: true.
 * @return {!goog.html.SafeHtml} Input text after applying the processing.
 */
goog.i18n.BidiFormatter.prototype.spanWrapSafeHtml = function(html,
    opt_dirReset) {
  return this.spanWrapSafeHtmlWithKnownDir(null, html, opt_dirReset);
};


/**
 * String version of {@link #spanWrapSafeHtml}.
 *
 * If !{@code opt_isHtml}, HTML-escapes {@code str} regardless of wrapping.
 *
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.spanWrap = function(str, opt_isHtml,
    opt_dirReset) {
  return this.spanWrapWithKnownDir(null, str, opt_isHtml, opt_dirReset);
};


/**
 * Formats a string of given directionality for use in HTML output of the
 * context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 * The algorithm: If {@code dir} doesn't match the context directionality, wraps
 * {@code html} with a 'span' tag and adds a "dir" attribute (either 'dir="rtl"'
 * or 'dir="ltr"'). If setAlwaysSpan(true) was used, the input is always wrapped
 * with 'span', skipping just the dir attribute when it's not needed.
 *
 * If {@code opt_dirReset}, and if {@code dir} or the exit directionality of
 * {@code html} are opposite to the context directionality, a trailing unicode
 * BiDi mark matching the context directionality is appened (LRM or RLM).
 *
 * @param {?goog.i18n.bidi.Dir} dir {@code html}'s overall directionality, or
 *     null if unknown and needs to be estimated.
 * @param {!goog.html.SafeHtml} html The input HTML.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code html}. Default: true.
 * @return {!goog.html.SafeHtml} Input text after applying the processing.
 */
goog.i18n.BidiFormatter.prototype.spanWrapSafeHtmlWithKnownDir = function(dir,
    html, opt_dirReset) {
  if (dir == null) {
    dir = this.estimateDirection(goog.html.SafeHtml.unwrap(html), true);
  }
  return this.spanWrapWithKnownDir_(dir, html, opt_dirReset);
};


/**
 * String version of {@link #spanWrapSafeHtmlWithKnownDir}.
 *
 * If !{@code opt_isHtml}, HTML-escapes {@code str} regardless of wrapping.
 *
 * @param {?goog.i18n.bidi.Dir} dir {@code str}'s overall directionality, or
 *     null if unknown and needs to be estimated.
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir = function(dir, str,
    opt_isHtml, opt_dirReset) {
  // We're calling legacy conversions, but quickly unwrapping it.
  var html = opt_isHtml ? goog.html.legacyconversions.safeHtmlFromString(str) :
      goog.html.SafeHtml.htmlEscape(str);
  return goog.html.SafeHtml.unwrap(
      this.spanWrapSafeHtmlWithKnownDir(dir, html, opt_dirReset));
};


/**
 * The internal implementation of spanWrapSafeHtmlWithKnownDir for non-null dir,
 * to help the compiler optimize.
 *
 * @param {goog.i18n.bidi.Dir} dir {@code str}'s overall directionality.
 * @param {!goog.html.SafeHtml} html The input HTML.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {!goog.html.SafeHtml} Input text after applying the above processing.
 * @private
 */
goog.i18n.BidiFormatter.prototype.spanWrapWithKnownDir_ = function(dir, html,
    opt_dirReset) {
  opt_dirReset = opt_dirReset || (opt_dirReset == undefined);

  var result;
  // Whether to add the "dir" attribute.
  var dirCondition =
      dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_;
  if (this.alwaysSpan_ || dirCondition) {  // Wrap is needed
    var dirAttribute;
    if (dirCondition) {
      dirAttribute = dir == goog.i18n.bidi.Dir.RTL ? 'rtl' : 'ltr';
    }
    result = goog.html.SafeHtml.create('span', {'dir': dirAttribute}, html);
  } else {
    result = html;
  }
  var str = goog.html.SafeHtml.unwrap(html);
  result = goog.html.SafeHtml.concatWithDir(goog.i18n.bidi.Dir.NEUTRAL, result,
      this.dirResetIfNeeded_(str, dir, true, opt_dirReset));
  return result;
};


/**
 * Formats a string of unknown directionality for use in plain-text output of
 * the context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 * As opposed to {@link #spanWrap}, this makes use of unicode BiDi formatting
 * characters. In HTML, its *only* valid use is inside of elements that do not
 * allow mark-up, e.g. an 'option' tag.
 * The algorithm: estimates the directionality of input argument {@code str}.
 * In case it doesn't match  the context directionality, wraps it with Unicode
 * BiDi formatting characters: RLE{@code str}PDF for RTL text, and
 * LRE{@code str}PDF for LTR text.
 *
 * If {@code opt_dirReset}, and if the overall directionality or the exit
 * directionality of {@code str} are opposite to the context directionality, a
 * trailing unicode BiDi mark matching the context directionality is appended
 * (LRM or RLM).
 *
 * Does *not* do HTML-escaping regardless of the value of {@code opt_isHtml}.
 * The return value can be HTML-escaped as necessary.
 *
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.unicodeWrap = function(str, opt_isHtml,
    opt_dirReset) {
  return this.unicodeWrapWithKnownDir(null, str, opt_isHtml, opt_dirReset);
};


/**
 * Formats a string of given directionality for use in plain-text output of the
 * context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 * As opposed to {@link #spanWrapWithKnownDir}, makes use of unicode BiDi
 * formatting characters. In HTML, its *only* valid use is inside of elements
 * that do not allow mark-up, e.g. an 'option' tag.
 * The algorithm: If {@code dir} doesn't match the context directionality, wraps
 * {@code str} with Unicode BiDi formatting characters: RLE{@code str}PDF for
 * RTL text, and LRE{@code str}PDF for LTR text.
 *
 * If {@code opt_dirReset}, and if the overall directionality or the exit
 * directionality of {@code str} are opposite to the context directionality, a
 * trailing unicode BiDi mark matching the context directionality is appended
 * (LRM or RLM).
 *
 * Does *not* do HTML-escaping regardless of the value of {@code opt_isHtml}.
 * The return value can be HTML-escaped as necessary.
 *
 * @param {?goog.i18n.bidi.Dir} dir {@code str}'s overall directionality, or
 *     null if unknown and needs to be estimated.
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir = function(dir, str,
    opt_isHtml, opt_dirReset) {
  if (dir == null) {
    dir = this.estimateDirection(str, opt_isHtml);
  }
  return this.unicodeWrapWithKnownDir_(dir, str, opt_isHtml, opt_dirReset);
};


/**
 * The internal implementation of unicodeWrapWithKnownDir for non-null dir, to
 * help the compiler optimize.
 *
 * @param {goog.i18n.bidi.Dir} dir {@code str}'s overall directionality.
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @param {boolean=} opt_dirReset Whether to append a trailing unicode bidi mark
 *     matching the context directionality, when needed, to prevent the possible
 *     garbling of whatever may follow {@code str}. Default: true.
 * @return {string} Input text after applying the above processing.
 * @private
 */
goog.i18n.BidiFormatter.prototype.unicodeWrapWithKnownDir_ = function(dir, str,
    opt_isHtml, opt_dirReset) {
  opt_dirReset = opt_dirReset || (opt_dirReset == undefined);
  var result = [];
  if (dir != goog.i18n.bidi.Dir.NEUTRAL && dir != this.contextDir_) {
    result.push(dir == goog.i18n.bidi.Dir.RTL ? goog.i18n.bidi.Format.RLE :
                                                goog.i18n.bidi.Format.LRE);
    result.push(str);
    result.push(goog.i18n.bidi.Format.PDF);
  } else {
    result.push(str);
  }

  result.push(this.dirResetIfNeeded_(str, dir, opt_isHtml, opt_dirReset));
  return result.join('');
};


/**
 * Returns a Unicode BiDi mark matching the context directionality (LRM or RLM)
 * if the directionality or the exit directionality of {@code str} are opposite
 * to the context directionality. Otherwise returns the empty string.
 *
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching the global directionality or
 *     the empty string.
 */
goog.i18n.BidiFormatter.prototype.markAfter = function(str, opt_isHtml) {
  return this.markAfterKnownDir(null, str, opt_isHtml);
};


/**
 * Returns a Unicode BiDi mark matching the context directionality (LRM or RLM)
 * if the given directionality or the exit directionality of {@code str} are
 * opposite to the context directionality. Otherwise returns the empty string.
 *
 * @param {?goog.i18n.bidi.Dir} dir {@code str}'s overall directionality, or
 *     null if unknown and needs to be estimated.
 * @param {string} str The input text.
 * @param {boolean=} opt_isHtml Whether {@code str} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching the global directionality or
 *     the empty string.
 */
goog.i18n.BidiFormatter.prototype.markAfterKnownDir = function(
    dir, str, opt_isHtml) {
  if (dir == null) {
    dir = this.estimateDirection(str, opt_isHtml);
  }
  return this.dirResetIfNeeded_(str, dir, opt_isHtml, true);
};


/**
 * Returns the Unicode BiDi mark matching the context directionality (LRM for
 * LTR context directionality, RLM for RTL context directionality), or the
 * empty string for neutral / unknown context directionality.
 *
 * @return {string} LRM for LTR context directionality and RLM for RTL context
 *     directionality.
 */
goog.i18n.BidiFormatter.prototype.mark = function() {
  switch (this.contextDir_) {
    case (goog.i18n.bidi.Dir.LTR):
      return goog.i18n.bidi.Format.LRM;
    case (goog.i18n.bidi.Dir.RTL):
      return goog.i18n.bidi.Format.RLM;
    default:
      return '';
  }
};


/**
 * Returns 'right' for RTL context directionality. Otherwise (LTR or neutral /
 * unknown context directionality) returns 'left'.
 *
 * @return {string} 'right' for RTL context directionality and 'left' for other
 *     context directionality.
 */
goog.i18n.BidiFormatter.prototype.startEdge = function() {
  return this.contextDir_ == goog.i18n.bidi.Dir.RTL ?
      goog.i18n.bidi.RIGHT : goog.i18n.bidi.LEFT;
};


/**
 * Returns 'left' for RTL context directionality. Otherwise (LTR or neutral /
 * unknown context directionality) returns 'right'.
 *
 * @return {string} 'left' for RTL context directionality and 'right' for other
 *     context directionality.
 */
goog.i18n.BidiFormatter.prototype.endEdge = function() {
  return this.contextDir_ == goog.i18n.bidi.Dir.RTL ?
      goog.i18n.bidi.LEFT : goog.i18n.bidi.RIGHT;
};

/*
 * Copyright 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Utility functions and classes for Soy.
 *
 * <p>
 * The top portion of this file contains utilities for Soy users:<ul>
 *   <li> soy.StringBuilder: Compatible with the 'stringbuilder' code style.
 *   <li> soy.renderElement: Render template and set as innerHTML of an element.
 *   <li> soy.renderAsFragment: Render template and return as HTML fragment.
 * </ul>
 *
 * <p>
 * The bottom portion of this file contains utilities that should only be called
 * by Soy-generated JS code. Please do not use these functions directly from
 * your hand-writen code. Their names all start with '$$'.
 *
 * @author Garrett Boyer
 * @author Mike Samuel
 * @author Kai Huang
 * @author Aharon Lanin
 */

goog.provide('soy');
goog.provide('soy.StringBuilder');
goog.provide('soy.esc');
goog.provide('soydata');
goog.provide('soydata.SanitizedHtml');
goog.provide('soydata.SanitizedHtmlAttribute');
goog.provide('soydata.SanitizedJs');
goog.provide('soydata.SanitizedJsStrChars');
goog.provide('soydata.SanitizedUri');
goog.provide('soydata.VERY_UNSAFE');

goog.require('goog.asserts');
goog.require('goog.dom.DomHelper');
goog.require('goog.format');
goog.require('goog.i18n.BidiFormatter');
goog.require('goog.i18n.bidi');
goog.require('goog.soy');
goog.require('goog.soy.data.SanitizedContentKind');
goog.require('goog.string');
goog.require('goog.string.StringBuffer');


// -----------------------------------------------------------------------------
// StringBuilder (compatible with the 'stringbuilder' code style).


/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator. For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object} var_args Initial items to append,
 *     e.g., new soy.StringBuilder('foo', 'bar').
 * @constructor
 */
soy.StringBuilder = goog.string.StringBuffer;


// -----------------------------------------------------------------------------
// soydata: Defines typed strings, e.g. an HTML string {@code "a<b>c"} is
// semantically distinct from the plain text string {@code "a<b>c"} and smart
// templates can take that distinction into account.

/**
 * A type of textual content.
 *
 * This is an enum of type Object so that these values are unforgeable.
 *
 * @enum {!Object}
 */
soydata.SanitizedContentKind = goog.soy.data.SanitizedContentKind;


/**
 * Checks whether a given value is of a given content kind.
 *
 * @param {*} value The value to be examined.
 * @param {soydata.SanitizedContentKind} contentKind The desired content
 *     kind.
 * @return {boolean} Whether the given value is of the given kind.
 * @private
 */
soydata.isContentKind = function(value, contentKind) {
  // TODO(user): This function should really include the assert on
  // value.constructor that is currently sprinkled at most of the call sites.
  // Unfortunately, that would require a (debug-mode-only) switch statement.
  // TODO(user): Perhaps we should get rid of the contentKind property
  // altogether and only at the constructor.
  return value != null && value.contentKind === contentKind;
};


/**
 * Returns a given value's contentDir property, constrained to a
 * goog.i18n.bidi.Dir value or null. Returns null if the value is null,
 * undefined, a primitive or does not have a contentDir property, or the
 * property's value is not 1 (for LTR), -1 (for RTL), or 0 (for neutral).
 *
 * @param {*} value The value whose contentDir property, if any, is to
 *     be returned.
 * @return {?goog.i18n.bidi.Dir} The contentDir property.
 */
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


/**
 * Content of type {@link soydata.SanitizedContentKind.HTML}.
 *
 * The content is a string of HTML that can safely be embedded in a PCDATA
 * context in your app.  If you would be surprised to find that an HTML
 * sanitizer produced {@code s} (e.g.  it runs code or fetches bad URLs) and
 * you wouldn't write a template that produces {@code s} on security or privacy
 * grounds, then don't pass {@code s} here. The default content direction is
 * unknown, i.e. to be estimated when necessary.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedHtml = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedHtml, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedHtml.prototype.contentKind = soydata.SanitizedContentKind.HTML;

/**
 * Returns a SanitizedHtml object for a particular value. The content direction
 * is preserved.
 *
 * This HTML-escapes the value unless it is already SanitizedHtml.
 *
 * @param {*} value The value to convert. If it is already a SanitizedHtml
 *     object, it is left alone.
 * @return {!soydata.SanitizedHtml} A SanitizedHtml object derived from the
 *     stringified value. It is escaped unless the input is SanitizedHtml.
 */
soydata.SanitizedHtml.from = function(value) {
  // The check is soydata.isContentKind() inlined for performance.
  if (value != null &&
      value.contentKind === soydata.SanitizedContentKind.HTML) {
    goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
    return /** @type {!soydata.SanitizedHtml} */ (value);
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(
      soy.esc.$$escapeHtmlHelper(String(value)), soydata.getContentDir(value));
};


/**
 * Content of type {@link soydata.SanitizedContentKind.JS}.
 *
 * The content is Javascript source that when evaluated does not execute any
 * attacker-controlled scripts. The content direction is LTR.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedJs = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedJs, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedJs.prototype.contentKind =
    soydata.SanitizedContentKind.JS;

/** @override */
soydata.SanitizedJs.prototype.contentDir = goog.i18n.bidi.Dir.LTR;


/**
 * Content of type {@link soydata.SanitizedContentKind.JS_STR_CHARS}.
 *
 * The content can be safely inserted as part of a single- or double-quoted
 * string without terminating the string. The default content direction is
 * unknown, i.e. to be estimated when necessary.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedJsStrChars = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedJsStrChars, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedJsStrChars.prototype.contentKind =
    soydata.SanitizedContentKind.JS_STR_CHARS;

/**
 * Content of type {@link soydata.SanitizedContentKind.URI}.
 *
 * The content is a URI chunk that the caller knows is safe to emit in a
 * template. The content direction is LTR.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedUri = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedUri, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;

/** @override */
soydata.SanitizedUri.prototype.contentDir = goog.i18n.bidi.Dir.LTR;


/**
 * Content of type {@link soydata.SanitizedContentKind.ATTRIBUTES}.
 *
 * The content should be safely embeddable within an open tag, such as a
 * key="value" pair. The content direction is LTR.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedHtmlAttribute = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedHtmlAttribute, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedHtmlAttribute.prototype.contentKind =
    soydata.SanitizedContentKind.ATTRIBUTES;

/** @override */
soydata.SanitizedHtmlAttribute.prototype.contentDir = goog.i18n.bidi.Dir.LTR;


/**
 * Content of type {@link soydata.SanitizedContentKind.CSS}.
 *
 * The content is non-attacker-exploitable CSS, such as {@code color:#c3d9ff}.
 * The content direction is LTR.
 *
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.SanitizedCss = function() {
  goog.soy.data.SanitizedContent.call(this);  // Throws an exception.
};
goog.inherits(soydata.SanitizedCss, goog.soy.data.SanitizedContent);

/** @override */
soydata.SanitizedCss.prototype.contentKind =
    soydata.SanitizedContentKind.CSS;

/** @override */
soydata.SanitizedCss.prototype.contentDir = goog.i18n.bidi.Dir.LTR;


/**
 * Unsanitized plain text string.
 *
 * While all strings are effectively safe to use as a plain text, there are no
 * guarantees about safety in any other context such as HTML. This is
 * sometimes used to mark that should never be used unescaped.
 *
 * @param {*} content Plain text with no guarantees.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @constructor
 * @extends {goog.soy.data.SanitizedContent}
 */
soydata.UnsanitizedText = function(content, opt_contentDir) {
  /** @override */
  this.content = String(content);
  this.contentDir = opt_contentDir != null ? opt_contentDir : null;
};
goog.inherits(soydata.UnsanitizedText, goog.soy.data.SanitizedContent);

/** @override */
soydata.UnsanitizedText.prototype.contentKind =
    soydata.SanitizedContentKind.TEXT;


/**
 * Empty string, used as a type in Soy templates.
 * @enum {string}
 * @private
 */
soydata.$$EMPTY_STRING_ = {
  VALUE: ''
};


/**
 * Creates a factory for SanitizedContent types.
 *
 * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
 * instantiate Sanitized* classes, without making the Sanitized* constructors
 * publicly usable. Requiring all construction to use the VERY_UNSAFE names
 * helps callers and their reviewers easily tell that creating SanitizedContent
 * is not always safe and calls for careful review.
 *
 * @param {function(new: T)} ctor A constructor.
 * @return {!function(*, ?goog.i18n.bidi.Dir=): T} A factory that takes
 *     content and an optional content direction and returns a new instance. If
 *     the content direction is undefined, ctor.prototype.contentDir is used.
 * @template T
 * @private
 */
soydata.$$makeSanitizedContentFactory_ = function(ctor) {
  /** @type {function(new: goog.soy.data.SanitizedContent)} */
  function InstantiableCtor() {}
  InstantiableCtor.prototype = ctor.prototype;
  /**
   * Creates a ctor-type SanitizedContent instance.
   *
   * @param {*} content The content to put in the instance.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction. If
   *     undefined, ctor.prototype.contentDir is used.
   * @return {!goog.soy.data.SanitizedContent} The new instance. It is actually
   *     of type T above (ctor's type, a descendant of SanitizedContent), but
   *     there is no way to express that here.
   */
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


/**
 * Creates a factory for SanitizedContent types that should always have their
 * default directionality.
 *
 * This is a hack so that the soydata.VERY_UNSAFE.ordainSanitized* can
 * instantiate Sanitized* classes, without making the Sanitized* constructors
 * publicly usable. Requiring all construction to use the VERY_UNSAFE names
 * helps callers and their reviewers easily tell that creating SanitizedContent
 * is not always safe and calls for careful review.
 *
 * @param {function(new: T, string)} ctor A constructor.
 * @return {!function(*): T} A factory that takes content and returns a new
 *     instance (with default directionality, i.e. ctor.prototype.contentDir).
 * @template T
 * @private
 */
soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_ = function(ctor) {
  /** @type {function(new: goog.soy.data.SanitizedContent)} */
  function InstantiableCtor() {}
  InstantiableCtor.prototype = ctor.prototype;
  /**
   * Creates a ctor-type SanitizedContent instance.
   *
   * @param {*} content The content to put in the instance.
   * @return {!goog.soy.data.SanitizedContent} The new instance. It is actually
   *     of type T above (ctor's type, a descendant of SanitizedContent), but
   *     there is no way to express that here.
   */
  function sanitizedContentFactory(content) {
    var result = new InstantiableCtor();
    result.content = String(content);
    return result;
  }
  return sanitizedContentFactory;
};


// -----------------------------------------------------------------------------
// Sanitized content ordainers. Please use these with extreme caution (with the
// exception of markUnsanitizedText). A good recommendation is to limit usage
// of these to just a handful of files in your source tree where usages can be
// carefully audited.


/**
 * Protects a string from being used in an noAutoescaped context.
 *
 * This is useful for content where there is significant risk of accidental
 * unescaped usage in a Soy template. A great case is for user-controlled
 * data that has historically been a source of vulernabilities.
 *
 * @param {*} content Text to protect.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @return {!soydata.UnsanitizedText} A wrapper that is rejected by the
 *     Soy noAutoescape print directive.
 */
soydata.markUnsanitizedText = function(content, opt_contentDir) {
  return new soydata.UnsanitizedText(content, opt_contentDir);
};


/**
 * Takes a leap of faith that the provided content is "safe" HTML.
 *
 * @param {*} content A string of HTML that can safely be embedded in
 *     a PCDATA context in your app. If you would be surprised to find that an
 *     HTML sanitizer produced {@code s} (e.g. it runs code or fetches bad URLs)
 *     and you wouldn't write a template that produces {@code s} on security or
 *     privacy grounds, then don't pass {@code s} here.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @return {!soydata.SanitizedHtml} Sanitized content wrapper that
 *     indicates to Soy not to escape when printed as HTML.
 */
soydata.VERY_UNSAFE.ordainSanitizedHtml =
    soydata.$$makeSanitizedContentFactory_(soydata.SanitizedHtml);


/**
 * Takes a leap of faith that the provided content is "safe" (non-attacker-
 * controlled, XSS-free) Javascript.
 *
 * @param {*} content Javascript source that when evaluated does not
 *     execute any attacker-controlled scripts.
 * @return {!soydata.SanitizedJs} Sanitized content wrapper that indicates to
 *     Soy not to escape when printed as Javascript source.
 */
soydata.VERY_UNSAFE.ordainSanitizedJs =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
        soydata.SanitizedJs);


// TODO: This function is probably necessary, either externally or internally
// as an implementation detail. Generally, plain text will always work here,
// as there's no harm to unescaping the string and then re-escaping when
// finally printed.
/**
 * Takes a leap of faith that the provided content can be safely embedded in
 * a Javascript string without re-esacping.
 *
 * @param {*} content Content that can be safely inserted as part of a
 *     single- or double-quoted string without terminating the string.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @return {!soydata.SanitizedJsStrChars} Sanitized content wrapper that
 *     indicates to Soy not to escape when printed in a JS string.
 */
soydata.VERY_UNSAFE.ordainSanitizedJsStrChars =
    soydata.$$makeSanitizedContentFactory_(soydata.SanitizedJsStrChars);


/**
 * Takes a leap of faith that the provided content is "safe" to use as a URI
 * in a Soy template.
 *
 * This creates a Soy SanitizedContent object which indicates to Soy there is
 * no need to escape it when printed as a URI (e.g. in an href or src
 * attribute), such as if it's already been encoded or  if it's a Javascript:
 * URI.
 *
 * @param {*} content A chunk of URI that the caller knows is safe to
 *     emit in a template.
 * @return {!soydata.SanitizedUri} Sanitized content wrapper that indicates to
 *     Soy not to escape or filter when printed in URI context.
 */
soydata.VERY_UNSAFE.ordainSanitizedUri =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
        soydata.SanitizedUri);


/**
 * Takes a leap of faith that the provided content is "safe" to use as an
 * HTML attribute.
 *
 * @param {*} content An attribute name and value, such as
 *     {@code dir="ltr"}.
 * @return {!soydata.SanitizedHtmlAttribute} Sanitized content wrapper that
 *     indicates to Soy not to escape when printed as an HTML attribute.
 */
soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
        soydata.SanitizedHtmlAttribute);


/**
 * Takes a leap of faith that the provided content is "safe" to use as CSS
 * in a style attribute or block.
 *
 * @param {*} content CSS, such as {@code color:#c3d9ff}.
 * @return {!soydata.SanitizedCss} Sanitized CSS wrapper that indicates to
 *     Soy there is no need to escape or filter when printed in CSS context.
 */
soydata.VERY_UNSAFE.ordainSanitizedCss =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnly_(
        soydata.SanitizedCss);


// -----------------------------------------------------------------------------
// Public utilities.


/**
 * Helper function to render a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * NOTE: New code should consider using goog.soy.renderElement instead.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @template ARG_TYPES
 */
soy.renderElement = goog.soy.renderElement;


/**
 * Helper function to render a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned (note that this is *not* a fragment, despite them name of
 * the method). Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * NOTE: New code should consider using goog.soy.renderAsFragment
 * instead (note that the arguments are different).
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES} opt_templateData The data for the template.
 * @param {Document=} opt_document The document used to create DOM nodes. If not
 *     specified, global document object is used.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @return {!Node} The resulting node or document fragment.
 * @template ARG_TYPES
 */
soy.renderAsFragment = function(
    template, opt_templateData, opt_document, opt_injectedData) {
  return goog.soy.renderAsFragment(
      template, opt_templateData, opt_injectedData,
      new goog.dom.DomHelper(opt_document));
};


/**
 * Helper function to render a Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * NOTE: New code should consider using goog.soy.renderAsElement
 * instead (note that the arguments are different).
 *
 * @param {null|function(ARG_TYPES, null=, Object.<string, *>=):*} template
 *     The Soy template defining the element's content.
 * @param {ARG_TYPES} opt_templateData The data for the template.
 * @param {Document=} opt_document The document used to create DOM nodes. If not
 *     specified, global document object is used.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 * @template ARG_TYPES
 */
soy.renderAsElement = function(
    template, opt_templateData, opt_document, opt_injectedData) {
  return goog.soy.renderAsElement(
      template, opt_templateData, opt_injectedData,
      new goog.dom.DomHelper(opt_document));
};


// -----------------------------------------------------------------------------
// Below are private utilities to be used by Soy-generated code only.


/**
 * Whether the locale is right-to-left.
 *
 * @type {boolean}
 */
soy.$$IS_LOCALE_RTL = goog.i18n.bidi.IS_RTL;


/**
 * Builds an augmented map. The returned map will contain mappings from both
 * the base map and the additional map. If the same key appears in both, then
 * the value from the additional map will be visible, while the value from the
 * base map will be hidden. The base map will be used, but not modified.
 *
 * @param {!Object} baseMap The original map to augment.
 * @param {!Object} additionalMap A map containing the additional mappings.
 * @return {!Object} An augmented map containing both the original and
 *     additional mappings.
 */
soy.$$augmentMap = function(baseMap, additionalMap) {

  // Create a new map whose '__proto__' field is set to baseMap.
  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = baseMap;
  var augmentedMap = new TempCtor();

  // Add the additional mappings to the new map.
  for (var key in additionalMap) {
    augmentedMap[key] = additionalMap[key];
  }

  return augmentedMap;
};


/**
 * Checks that the given map key is a string.
 * @param {*} key Key to check.
 * @return {string} The given key.
 */
soy.$$checkMapKey = function(key) {
  // TODO: Support map literal with nonstring key.
  if ((typeof key) != 'string') {
    throw Error(
        'Map literal\'s key expression must evaluate to string' +
        ' (encountered type "' + (typeof key) + '").');
  }
  return key;
};


/**
 * Gets the keys in a map as an array. There are no guarantees on the order.
 * @param {Object} map The map to get the keys of.
 * @return {!Array.<string>} The array of keys in the given map.
 */
soy.$$getMapKeys = function(map) {
  var mapKeys = [];
  for (var key in map) {
    mapKeys.push(key);
  }
  return mapKeys;
};


/**
 * Gets a consistent unique id for the given delegate template name. Two calls
 * to this function will return the same id if and only if the input names are
 * the same.
 *
 * <p> Important: This function must always be called with a string constant.
 *
 * <p> If Closure Compiler is not being used, then this is just this identity
 * function. If Closure Compiler is being used, then each call to this function
 * will be replaced with a short string constant, which will be consistent per
 * input name.
 *
 * @param {string} delTemplateName The delegate template name for which to get a
 *     consistent unique id.
 * @return {string} A unique id that is consistent per input name.
 *
 * @consistentIdGenerator
 */
soy.$$getDelTemplateId = function(delTemplateName) {
  return delTemplateName;
};


/**
 * Map from registered delegate template key to the priority of the
 * implementation.
 * @type {Object}
 * @private
 */
soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};

/**
 * Map from registered delegate template key to the implementation function.
 * @type {Object}
 * @private
 */
soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};


/**
 * Registers a delegate implementation. If the same delegate template key (id
 * and variant) has been registered previously, then priority values are
 * compared and only the higher priority implementation is stored (if
 * priorities are equal, an error is thrown).
 *
 * @param {string} delTemplateId The delegate template id.
 * @param {string} delTemplateVariant The delegate template variant (can be
 *     empty string).
 * @param {number} delPriority The implementation's priority value.
 * @param {Function} delFn The implementation function.
 */
soy.$$registerDelegateFn = function(
    delTemplateId, delTemplateVariant, delPriority, delFn) {

  var mapKey = 'key_' + delTemplateId + ':' + delTemplateVariant;
  var currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
  if (currPriority === undefined || delPriority > currPriority) {
    // Registering new or higher-priority function: replace registry entry.
    soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority;
    soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
  } else if (delPriority == currPriority) {
    // Registering same-priority function: error.
    throw Error(
        'Encountered two active delegates with the same priority ("' +
            delTemplateId + ':' + delTemplateVariant + '").');
  } else {
    // Registering lower-priority function: do nothing.
  }
};


/**
 * Retrieves the (highest-priority) implementation that has been registered for
 * a given delegate template key (id and variant). If no implementation has
 * been registered for the key, then the fallback is the same id with empty
 * variant. If the fallback is also not registered, and allowsEmptyDefault is
 * true, then returns an implementation that is equivalent to an empty template
 * (i.e. rendered output would be empty string).
 *
 * @param {string} delTemplateId The delegate template id.
 * @param {string} delTemplateVariant The delegate template variant (can be
 *     empty string).
 * @param {boolean} allowsEmptyDefault Whether to default to the empty template
 *     function if there's no active implementation.
 * @return {Function} The retrieved implementation function.
 */
soy.$$getDelegateFn = function(
    delTemplateId, delTemplateVariant, allowsEmptyDefault) {

  var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_[
      'key_' + delTemplateId + ':' + delTemplateVariant];
  if (! delFn && delTemplateVariant != '') {
    // Fallback to empty variant.
    delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_['key_' + delTemplateId + ':'];
  }

  if (delFn) {
    return delFn;
  } else if (allowsEmptyDefault) {
    return soy.$$EMPTY_TEMPLATE_FN_;
  } else {
    throw Error(
        'Found no active impl for delegate call to "' + delTemplateId + ':' +
            delTemplateVariant + '" (and not allowemptydefault="true").');
  }
};


/**
 * Private helper soy.$$getDelegateFn(). This is the empty template function
 * that is returned whenever there's no delegate implementation found.
 *
 * @param {Object.<string, *>=} opt_data
 * @param {soy.StringBuilder=} opt_sb
 * @param {Object.<string, *>=} opt_ijData
 * @return {string}
 * @private
 */
soy.$$EMPTY_TEMPLATE_FN_ = function(opt_data, opt_sb, opt_ijData) {
  return '';
};


// -----------------------------------------------------------------------------
// Internal sanitized content wrappers.


/**
 * Creates a SanitizedContent factory for SanitizedContent types for internal
 * Soy let and param blocks.
 *
 * This is a hack within Soy so that SanitizedContent objects created via let
 * and param blocks will truth-test as false if they are empty string.
 * Tricking the Javascript runtime to treat empty SanitizedContent as falsey is
 * not possible, and changing the Soy compiler to wrap every boolean statement
 * for just this purpose is impractical.  Instead, we just avoid wrapping empty
 * string as SanitizedContent, since it's a no-op for empty strings anyways.
 *
 * @param {function(new: T)} ctor A constructor.
 * @return {!function(*, ?goog.i18n.bidi.Dir=): (T|soydata.$$EMPTY_STRING_)}
 *     A factory that takes content and an optional content direction and
 *     returns a new instance, or an empty string. If the content direction is
 *     undefined, ctor.prototype.contentDir is used.
 * @template T
 * @private
 */
soydata.$$makeSanitizedContentFactoryForInternalBlocks_ = function(ctor) {
  /** @type {function(new: goog.soy.data.SanitizedContent)} */
  function InstantiableCtor() {}
  InstantiableCtor.prototype = ctor.prototype;
  /**
   * Creates a ctor-type SanitizedContent instance.
   *
   * @param {*} content The content to put in the instance.
   * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction. If
   *     undefined, ctor.prototype.contentDir is used.
   * @return {!goog.soy.data.SanitizedContent|soydata.$$EMPTY_STRING_} The new
   *     instance, or an empty string. A new instance is actually of type T
   *     above (ctor's type, a descendant of SanitizedContent), but there's no
   *     way to express that here.
   * a descendant of SanitizedContent), but there's no way to express that here.
   */
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


/**
 * Creates a SanitizedContent factory for SanitizedContent types that should
 * always have their default directionality for internal Soy let and param
 * blocks.
 *
 * This is a hack within Soy so that SanitizedContent objects created via let
 * and param blocks will truth-test as false if they are empty string.
 * Tricking the Javascript runtime to treat empty SanitizedContent as falsey is
 * not possible, and changing the Soy compiler to wrap every boolean statement
 * for just this purpose is impractical.  Instead, we just avoid wrapping empty
 * string as SanitizedContent, since it's a no-op for empty strings anyways.
 *
 * @param {function(new: T)} ctor A constructor.
 * @return {!function(*): (T|soydata.$$EMPTY_STRING_)} A
 *     factory that takes content and returns a
 *     new instance (with default directionality, i.e.
 *     ctor.prototype.contentDir), or an empty string.
 * @template T
 * @private
 */
soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_ =
    function(ctor) {
  /** @type {function(new: goog.soy.data.SanitizedContent)} */
  function InstantiableCtor() {}
  InstantiableCtor.prototype = ctor.prototype;
  /**
   * Creates a ctor-type SanitizedContent instance.
   *
   * @param {*} content The content to put in the instance.
   * @return {!goog.soy.data.SanitizedContent|soydata.$$EMPTY_STRING_} The new
   *     instance, or an empty string. A new instance is actually of type T
   *     above (ctor's type, a descendant of SanitizedContent), but there's no
   *     way to express that here.
   * a descendant of SanitizedContent), but there's no way to express that here.
   */
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


/**
 * Creates kind="text" block contents (internal use only).
 *
 * @param {*} content Text.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @return {!soydata.UnsanitizedText|soydata.$$EMPTY_STRING_} Wrapped result.
 */
soydata.$$markUnsanitizedTextForInternalBlocks = function(
    content, opt_contentDir) {
  var contentString = String(content);
  if (!contentString) {
    return soydata.$$EMPTY_STRING_.VALUE;
  }
  return new soydata.UnsanitizedText(contentString, opt_contentDir);
};


/**
 * Creates kind="html" block contents (internal use only).
 *
 * @param {*} content Text.
 * @param {?goog.i18n.bidi.Dir=} opt_contentDir The content direction; null if
 *     unknown and thus to be estimated when necessary. Default: null.
 * @return {!soydata.SanitizedHtml|soydata.$$EMPTY_STRING_} Wrapped result.
 */
soydata.VERY_UNSAFE.$$ordainSanitizedHtmlForInternalBlocks =
    soydata.$$makeSanitizedContentFactoryForInternalBlocks_(
        soydata.SanitizedHtml);


/**
 * Creates kind="js" block contents (internal use only).
 *
 * @param {*} content Text.
 * @return {!soydata.SanitizedJs|soydata.$$EMPTY_STRING_} Wrapped result.
 */
soydata.VERY_UNSAFE.$$ordainSanitizedJsForInternalBlocks =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
        soydata.SanitizedJs);


/**
 * Creates kind="uri" block contents (internal use only).
 *
 * @param {*} content Text.
 * @return {soydata.SanitizedUri|soydata.$$EMPTY_STRING_} Wrapped result.
 */
soydata.VERY_UNSAFE.$$ordainSanitizedUriForInternalBlocks =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
        soydata.SanitizedUri);


/**
 * Creates kind="attributes" block contents (internal use only).
 *
 * @param {*} content Text.
 * @return {soydata.SanitizedHtmlAttribute|soydata.$$EMPTY_STRING_} Wrapped
 *     result.
 */
soydata.VERY_UNSAFE.$$ordainSanitizedAttributesForInternalBlocks =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
        soydata.SanitizedHtmlAttribute);


/**
 * Creates kind="css" block contents (internal use only).
 *
 * @param {*} content Text.
 * @return {soydata.SanitizedCss|soydata.$$EMPTY_STRING_} Wrapped result.
 */
soydata.VERY_UNSAFE.$$ordainSanitizedCssForInternalBlocks =
    soydata.$$makeSanitizedContentFactoryWithDefaultDirOnlyForInternalBlocks_(
        soydata.SanitizedCss);


// -----------------------------------------------------------------------------
// Escape/filter/normalize.


/**
 * Returns a SanitizedHtml object for a particular value. The content direction
 * is preserved.
 *
 * This HTML-escapes the value unless it is already SanitizedHtml. Escapes
 * double quote '"' in addition to '&', '<', and '>' so that a string can be
 * included in an HTML tag attribute value within double quotes.
 *
 * @param {*} value The value to convert. If it is already a SanitizedHtml
 *     object, it is left alone.
 * @return {!soydata.SanitizedHtml} An escaped version of value.
 */
soy.$$escapeHtml = function(value) {
  return soydata.SanitizedHtml.from(value);
};


/**
 * Strips unsafe tags to convert a string of untrusted HTML into HTML that
 * is safe to embed. The content direction is preserved.
 *
 * @param {*} value The string-like value to be escaped. May not be a string,
 *     but the value will be coerced to a string.
 * @return {!soydata.SanitizedHtml} A sanitized and normalized version of value.
 */
soy.$$cleanHtml = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
    return /** @type {!soydata.SanitizedHtml} */ (value);
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtml(
      soy.$$stripHtmlTags(value, soy.esc.$$SAFE_TAG_WHITELIST_),
      soydata.getContentDir(value));
};


/**
 * Escapes HTML special characters in a string so that it can be embedded in
 * RCDATA.
 * <p>
 * Escapes HTML special characters so that the value will not prematurely end
 * the body of a tag like {@code <textarea>} or {@code <title>}. RCDATA tags
 * cannot contain other HTML entities, so it is not strictly necessary to escape
 * HTML special characters except when part of that text looks like an HTML
 * entity or like a close tag : {@code </textarea>}.
 * <p>
 * Will normalize known safe HTML to make sure that sanitized HTML (which could
 * contain an innocuous {@code </textarea>} don't prematurely end an RCDATA
 * element.
 *
 * @param {*} value The string-like value to be escaped. May not be a string,
 *     but the value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlRcdata = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
    return soy.esc.$$normalizeHtmlHelper(value.content);
  }
  return soy.esc.$$escapeHtmlHelper(value);
};


/**
 * Matches any/only HTML5 void elements' start tags.
 * See http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
 * @type {RegExp}
 * @private
 */
soy.$$HTML5_VOID_ELEMENTS_ = new RegExp(
    '^<(?:area|base|br|col|command|embed|hr|img|input' +
    '|keygen|link|meta|param|source|track|wbr)\\b');


/**
 * Removes HTML tags from a string of known safe HTML.
 * If opt_tagWhitelist is not specified or is empty, then
 * the result can be used as an attribute value.
 *
 * @param {*} value The HTML to be escaped. May not be a string, but the
 *     value will be coerced to a string.
 * @param {Object.<string, number>=} opt_tagWhitelist Has an own property whose
 *     name is a lower-case tag name and whose value is {@code 1} for
 *     each element that is allowed in the output.
 * @return {string} A representation of value without disallowed tags,
 *     HTML comments, or other non-text content.
 */
soy.$$stripHtmlTags = function(value, opt_tagWhitelist) {
  if (!opt_tagWhitelist) {
    // If we have no white-list, then use a fast track which elides all tags.
    return String(value).replace(soy.esc.$$HTML_TAG_REGEX_, '')
        // This is just paranoia since callers should normalize the result
        // anyway, but if they didn't, it would be necessary to ensure that
        // after the first replace non-tag uses of < do not recombine into
        // tags as in "<<foo>script>alert(1337)</<foo>script>".
        .replace(soy.esc.$$LT_REGEX_, '&lt;');
  }

  // Escapes '[' so that we can use [123] below to mark places where tags
  // have been removed.
  var html = String(value).replace(/\[/g, '&#91;');

  // Consider all uses of '<' and replace whitelisted tags with markers like
  // [1] which are indices into a list of approved tag names.
  // Replace all other uses of < and > with entities.
  var tags = [];
  html = html.replace(
    soy.esc.$$HTML_TAG_REGEX_,
    function(tok, tagName) {
      if (tagName) {
        tagName = tagName.toLowerCase();
        if (opt_tagWhitelist.hasOwnProperty(tagName) &&
            opt_tagWhitelist[tagName]) {
          var start = tok.charAt(1) === '/' ? '</' : '<';
          var index = tags.length;
          tags[index] = start + tagName + '>';
          return '[' + index + ']';
        }
      }
      return '';
    });

  // Escape HTML special characters. Now there are no '<' in html that could
  // start a tag.
  html = soy.esc.$$normalizeHtmlHelper(html);

  var finalCloseTags = soy.$$balanceTags_(tags);

  // Now html contains no tags or less-than characters that could become
  // part of a tag via a replacement operation and tags only contains
  // approved tags.
  // Reinsert the white-listed tags.
  html = html.replace(
       /\[(\d+)\]/g, function(_, index) { return tags[index]; });

  // Close any still open tags.
  // This prevents unclosed formatting elements like <ol> and <table> from
  // breaking the layout of containing HTML.
  return html + finalCloseTags;
};


/**
 * Throw out any close tags that don't correspond to start tags.
 * If {@code <table>} is used for formatting, embedded HTML shouldn't be able
 * to use a mismatched {@code </table>} to break page layout.
 *
 * @param {Array.<string>} tags an array of tags that will be modified in place
 *    include tags, the empty string, or concatenations of empty tags.
 * @return {string} zero or more closed tags that close all elements that are
 *    opened in tags but not closed.
 * @private
 */
soy.$$balanceTags_ = function(tags) {
  var open = [];
  for (var i = 0, n = tags.length; i < n; ++i) {
    var tag = tags[i];
    if (tag.charAt(1) === '/') {
      var openTagIndex = open.length - 1;
      // NOTE: This is essentially lastIndexOf, but it's not supported in IE.
      while (openTagIndex >= 0 && open[openTagIndex] != tag) {
        openTagIndex--;
      }
      if (openTagIndex < 0) {
        tags[i] = '';  // Drop close tag.
      } else {
        tags[i] = open.slice(openTagIndex).reverse().join('');
        open.length = openTagIndex;
      }
    } else if (!soy.$$HTML5_VOID_ELEMENTS_.test(tag)) {
      open.push('</' + tag.substring(1));
    }
  }
  return open.reverse().join('');
};


/**
 * Escapes HTML special characters in an HTML attribute value.
 *
 * @param {*} value The HTML to be escaped. May not be a string, but the
 *     value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlAttribute = function(value) {
  // NOTE: We don't accept ATTRIBUTES here because ATTRIBUTES is actually not
  // the attribute value context, but instead k/v pairs.
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    // NOTE: After removing tags, we also escape quotes ("normalize") so that
    // the HTML can be embedded in attribute context.
    goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
    return soy.esc.$$normalizeHtmlHelper(soy.$$stripHtmlTags(value.content));
  }
  return soy.esc.$$escapeHtmlHelper(value);
};


/**
 * Escapes HTML special characters in a string including space and other
 * characters that can end an unquoted HTML attribute value.
 *
 * @param {*} value The HTML to be escaped. May not be a string, but the
 *     value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlAttributeNospace = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedHtml);
    return soy.esc.$$normalizeHtmlNospaceHelper(
        soy.$$stripHtmlTags(value.content));
  }
  return soy.esc.$$escapeHtmlNospaceHelper(value);
};


/**
 * Filters out strings that cannot be a substring of a valid HTML attribute.
 *
 * Note the input is expected to be key=value pairs.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A valid HTML attribute name part or name/value pair.
 *     {@code "zSoyz"} if the input is invalid.
 */
soy.$$filterHtmlAttributes = function(value) {
  // NOTE: Explicitly no support for SanitizedContentKind.HTML, since that is
  // meaningless in this context, which is generally *between* html attributes.
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.ATTRIBUTES)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedHtmlAttribute);
    // Add a space at the end to ensure this won't get merged into following
    // attributes, unless the interpretation is unambiguous (ending with quotes
    // or a space).
    return value.content.replace(/([^"'\s])$/, '$1 ');
  }
  // TODO: Dynamically inserting attributes that aren't marked as trusted is
  // probably unnecessary.  Any filtering done here will either be inadequate
  // for security or not flexible enough.  Having clients use kind="attributes"
  // in parameters seems like a wiser idea.
  return soy.esc.$$filterHtmlAttributesHelper(value);
};


/**
 * Filters out strings that cannot be a substring of a valid HTML element name.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A valid HTML element name part.
 *     {@code "zSoyz"} if the input is invalid.
 */
soy.$$filterHtmlElementName = function(value) {
  // NOTE: We don't accept any SanitizedContent here. HTML indicates valid
  // PCDATA, not tag names. A sloppy developer shouldn't be able to cause an
  // exploit:
  // ... {let userInput}script src=http://evil.com/evil.js{/let} ...
  // ... {param tagName kind="html"}{$userInput}{/param} ...
  // ... <{$tagName}>Hello World</{$tagName}>
  return soy.esc.$$filterHtmlElementNameHelper(value);
};


/**
 * Escapes characters in the value to make it valid content for a JS string
 * literal.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 * @deprecated
 */
soy.$$escapeJs = function(value) {
  return soy.$$escapeJsString(value);
};


/**
 * Escapes characters in the value to make it valid content for a JS string
 * literal.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeJsString = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS_STR_CHARS)) {
    // TODO: It might still be worthwhile to normalize it to remove
    // unescaped quotes, null, etc: replace(/(?:^|[^\])['"]/g, '\\$
    goog.asserts.assert(value.constructor === soydata.SanitizedJsStrChars);
    return value.content;
  }
  return soy.esc.$$escapeJsStringHelper(value);
};


/**
 * Encodes a value as a JavaScript literal.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A JavaScript code representation of the input.
 */
soy.$$escapeJsValue = function(value) {
  // We surround values with spaces so that they can't be interpolated into
  // identifiers by accident.
  // We could use parentheses but those might be interpreted as a function call.
  if (value == null) {  // Intentionally matches undefined.
    // Java returns null from maps where there is no corresponding key while
    // JS returns undefined.
    // We always output null for compatibility with Java which does not have a
    // distinct undefined value.
    return ' null ';
  }
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.JS)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedJs);
    return value.content;
  }
  switch (typeof value) {
    case 'boolean': case 'number':
      return ' ' + value + ' ';
    default:
      return "'" + soy.esc.$$escapeJsStringHelper(String(value)) + "'";
  }
};


/**
 * Escapes characters in the string to make it valid content for a JS regular
 * expression literal.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeJsRegex = function(value) {
  return soy.esc.$$escapeJsRegexHelper(value);
};


/**
 * Matches all URI mark characters that conflict with HTML attribute delimiters
 * or that cannot appear in a CSS uri.
 * From <a href="http://www.w3.org/TR/CSS2/grammar.html">G.2: CSS grammar</a>
 * <pre>
 *     url        ([!#$%&*-~]|{nonascii}|{escape})*
 * </pre>
 *
 * @type {RegExp}
 * @private
 */
soy.$$problematicUriMarks_ = /['()]/g;

/**
 * @param {string} ch A single character in {@link soy.$$problematicUriMarks_}.
 * @return {string}
 * @private
 */
soy.$$pctEncode_ = function(ch) {
  return '%' + ch.charCodeAt(0).toString(16);
};

/**
 * Escapes a string so that it can be safely included in a URI.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeUri = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedUri);
    return soy.$$normalizeUri(value);
  }
  // Apostophes and parentheses are not matched by encodeURIComponent.
  // They are technically special in URIs, but only appear in the obsolete mark
  // production in Appendix D.2 of RFC 3986, so can be encoded without changing
  // semantics.
  var encoded = soy.esc.$$escapeUriHelper(value);
  soy.$$problematicUriMarks_.lastIndex = 0;
  if (soy.$$problematicUriMarks_.test(encoded)) {
    return encoded.replace(soy.$$problematicUriMarks_, soy.$$pctEncode_);
  }
  return encoded;
};


/**
 * Removes rough edges from a URI by escaping any raw HTML/JS string delimiters.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$normalizeUri = function(value) {
  return soy.esc.$$normalizeUriHelper(value);
};


/**
 * Vets a URI's protocol and removes rough edges from a URI by escaping
 * any raw HTML/JS string delimiters.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$filterNormalizeUri = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.URI)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedUri);
    return soy.$$normalizeUri(value);
  }
  return soy.esc.$$filterNormalizeUriHelper(value);
};


/**
 * Allows only data-protocol image URI's.
 *
 * @param {*} value The value to process. May not be a string, but the value
 *     will be coerced to a string.
 * @return {!soydata.SanitizedUri} An escaped version of value.
 */
soy.$$filterImageDataUri = function(value) {
  // NOTE: Even if it's a SanitizedUri, we will still filter it.
  return soydata.VERY_UNSAFE.ordainSanitizedUri(
      soy.esc.$$filterImageDataUriHelper(value));
};


/**
 * Escapes a string so it can safely be included inside a quoted CSS string.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeCssString = function(value) {
  return soy.esc.$$escapeCssStringHelper(value);
};


/**
 * Encodes a value as a CSS identifier part, keyword, or quantity.
 *
 * @param {*} value The value to escape. May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A safe CSS identifier part, keyword, or quanitity.
 */
soy.$$filterCssValue = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.CSS)) {
    goog.asserts.assert(value.constructor === soydata.SanitizedCss);
    return value.content;
  }
  // Uses == to intentionally match null and undefined for Java compatibility.
  if (value == null) {
    return '';
  }
  return soy.esc.$$filterCssValueHelper(value);
};


/**
 * Sanity-checks noAutoescape input for explicitly tainted content.
 *
 * SanitizedContentKind.TEXT is used to explicitly mark input that was never
 * meant to be used unescaped.
 *
 * @param {*} value The value to filter.
 * @return {*} The value, that we dearly hope will not cause an attack.
 */
soy.$$filterNoAutoescape = function(value) {
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.TEXT)) {
    // Fail in development mode.
    goog.asserts.fail(
        'Tainted SanitizedContentKind.TEXT for |noAutoescape: `%s`',
        [value.content]);
    // Return innocuous data in production.
    return 'zSoyz';
  }

  return value;
};


// -----------------------------------------------------------------------------
// Basic directives/functions.


/**
 * Converts \r\n, \r, and \n to <br>s
 * @param {*} value The string in which to convert newlines.
 * @return {string|!soydata.SanitizedHtml} A copy of {@code value} with
 *     converted newlines. If {@code value} is SanitizedHtml, the return value
 *     is also SanitizedHtml, of the same known directionality.
 */
soy.$$changeNewlineToBr = function(value) {
  var result = goog.string.newLineToBr(String(value), false);
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(
        result, soydata.getContentDir(value));
  }
  return result;
};


/**
 * Inserts word breaks ('wbr' tags) into a HTML string at a given interval. The
 * counter is reset if a space is encountered. Word breaks aren't inserted into
 * HTML tags or entities. Entites count towards the character count; HTML tags
 * do not.
 *
 * @param {*} value The HTML string to insert word breaks into. Can be other
 *     types, but the value will be coerced to a string.
 * @param {number} maxCharsBetweenWordBreaks Maximum number of non-space
 *     characters to allow before adding a word break.
 * @return {string|!soydata.SanitizedHtml} The string including word
 *     breaks. If {@code value} is SanitizedHtml, the return value
 *     is also SanitizedHtml, of the same known directionality.
 */
soy.$$insertWordBreaks = function(value, maxCharsBetweenWordBreaks) {
  var result = goog.format.insertWordBreaks(
      String(value), maxCharsBetweenWordBreaks);
  if (soydata.isContentKind(value, soydata.SanitizedContentKind.HTML)) {
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(
        result, soydata.getContentDir(value));
  }
  return result;
};


/**
 * Truncates a string to a given max length (if it's currently longer),
 * optionally adding ellipsis at the end.
 *
 * @param {*} str The string to truncate. Can be other types, but the value will
 *     be coerced to a string.
 * @param {number} maxLen The maximum length of the string after truncation
 *     (including ellipsis, if applicable).
 * @param {boolean} doAddEllipsis Whether to add ellipsis if the string needs
 *     truncation.
 * @return {string} The string after truncation.
 */
soy.$$truncate = function(str, maxLen, doAddEllipsis) {

  str = String(str);
  if (str.length <= maxLen) {
    return str;  // no need to truncate
  }

  // If doAddEllipsis, either reduce maxLen to compensate, or else if maxLen is
  // too small, just turn off doAddEllipsis.
  if (doAddEllipsis) {
    if (maxLen > 3) {
      maxLen -= 3;
    } else {
      doAddEllipsis = false;
    }
  }

  // Make sure truncating at maxLen doesn't cut up a unicode surrogate pair.
  if (soy.$$isHighSurrogate_(str.charAt(maxLen - 1)) &&
      soy.$$isLowSurrogate_(str.charAt(maxLen))) {
    maxLen -= 1;
  }

  // Truncate.
  str = str.substring(0, maxLen);

  // Add ellipsis.
  if (doAddEllipsis) {
    str += '...';
  }

  return str;
};

/**
 * Private helper for $$truncate() to check whether a char is a high surrogate.
 * @param {string} ch The char to check.
 * @return {boolean} Whether the given char is a unicode high surrogate.
 * @private
 */
soy.$$isHighSurrogate_ = function(ch) {
  return 0xD800 <= ch && ch <= 0xDBFF;
};

/**
 * Private helper for $$truncate() to check whether a char is a low surrogate.
 * @param {string} ch The char to check.
 * @return {boolean} Whether the given char is a unicode low surrogate.
 * @private
 */
soy.$$isLowSurrogate_ = function(ch) {
  return 0xDC00 <= ch && ch <= 0xDFFF;
};


// -----------------------------------------------------------------------------
// Bidi directives/functions.


/**
 * Cache of bidi formatter by context directionality, so we don't keep on
 * creating new objects.
 * @type {!Object.<!goog.i18n.BidiFormatter>}
 * @private
 */
soy.$$bidiFormatterCache_ = {};


/**
 * Returns cached bidi formatter for bidiGlobalDir, or creates a new one.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @return {!goog.i18n.BidiFormatter} A formatter for bidiGlobalDir.
 * @private
 */
soy.$$getBidiFormatterInstance_ = function(bidiGlobalDir) {
  return soy.$$bidiFormatterCache_[bidiGlobalDir] ||
         (soy.$$bidiFormatterCache_[bidiGlobalDir] =
             new goog.i18n.BidiFormatter(bidiGlobalDir));
};


/**
 * Estimate the overall directionality of text. If opt_isHtml, makes sure to
 * ignore the LTR nature of the mark-up and escapes in text, making the logic
 * suitable for HTML and HTML-escaped text.
 * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
 * estimating the directionality.
 *
 * @param {*} text The content whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {number} 1 if text is LTR, -1 if it is RTL, and 0 if it is neutral.
 */
soy.$$bidiTextDir = function(text, opt_isHtml) {
  var contentDir = soydata.getContentDir(text);
  if (contentDir != null) {
    return contentDir;
  }
  var isHtml = opt_isHtml ||
      soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
  return goog.i18n.bidi.estimateDirection(text + '', isHtml);
};


/**
 * Returns 'dir="ltr"' or 'dir="rtl"', depending on text's estimated
 * directionality, if it is not the same as bidiGlobalDir.
 * Otherwise, returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
 * estimating the directionality.
 *
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} text The content whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {!soydata.SanitizedHtmlAttribute} 'dir="rtl"' for RTL text in non-RTL
 *     context; 'dir="ltr"' for LTR text in non-LTR context;
 *     else, the empty string.
 */
soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  var contentDir = soydata.getContentDir(text);
  if (contentDir == null) {
    var isHtml = opt_isHtml ||
        soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
    contentDir = goog.i18n.bidi.estimateDirection(text + '', isHtml);
  }
  return soydata.VERY_UNSAFE.ordainSanitizedHtmlAttribute(
      formatter.knownDirAttr(contentDir));
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
 * estimating the directionality.
 *
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} text The content whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or the empty
 *     string when text's overall and exit directionalities both match
 *     bidiGlobalDir, or bidiGlobalDir is 0 (unknown).
 */
soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  var isHtml = opt_isHtml ||
      soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
  return formatter.markAfterKnownDir(soydata.getContentDir(text), text + '',
      isHtml);
};


/**
 * Returns text wrapped in a <span dir="ltr|rtl"> according to its
 * directionality - but only if that is neither neutral nor the same as the
 * global context. Otherwise, returns text unchanged.
 * Always treats text as HTML/HTML-escaped, i.e. ignores mark-up and escapes
 * when estimating text's directionality.
 * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
 * estimating the directionality.
 *
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} text The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {!goog.soy.data.SanitizedContent|string} The wrapped text.
 */
soy.$$bidiSpanWrap = function(bidiGlobalDir, text) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);

  // We always treat the value as HTML, because span-wrapping is only useful
  // when its output will be treated as HTML (without escaping), and because
  // |bidiSpanWrap is not itself specified to do HTML escaping in Soy. (Both
  // explicit and automatic HTML escaping, if any, is done before calling
  // |bidiSpanWrap because the BidiSpanWrapDirective Java class implements
  // SanitizedContentOperator, but this does not mean that the input has to be
  // HTML SanitizedContent. In legacy usage, a string that is not
  // SanitizedContent is often printed in an autoescape="false" template or by
  // a print with a |noAutoescape, in which case our input is just SoyData.) If
  // the output will be treated as HTML, the input had better be safe
  // HTML/HTML-escaped (even if it isn't HTML SanitizedData), or we have an XSS
  // opportunity and a much bigger problem than bidi garbling.
  var wrappedText = formatter.spanWrapWithKnownDir(
      soydata.getContentDir(text), text + '', true /* opt_isHtml */);

  // Like other directives whose Java class implements SanitizedContentOperator,
  // |bidiSpanWrap is called after the escaping (if any) has already been done,
  // and thus there is no need for it to produce actual SanitizedContent.
  return wrappedText;
};


/**
 * Returns text wrapped in Unicode BiDi formatting characters according to its
 * directionality, i.e. either LRE or RLE at the beginning and PDF at the end -
 * but only if text's directionality is neither neutral nor the same as the
 * global context. Otherwise, returns text unchanged.
 * Only treats soydata.SanitizedHtml as HTML/HTML-escaped, i.e. ignores mark-up
 * and escapes when estimating text's directionality.
 * If text has a goog.i18n.bidi.Dir-valued contentDir, this is used instead of
 * estimating the directionality.
 *
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} text The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {!goog.soy.data.SanitizedContent|string} The wrapped string.
 */
soy.$$bidiUnicodeWrap = function(bidiGlobalDir, text) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);

  // We treat the value as HTML if and only if it says it's HTML, even though in
  // legacy usage, we sometimes have an HTML string (not SanitizedContent) that
  // is passed to an autoescape="false" template or a {print $foo|noAutoescape},
  // with the output going into an HTML context without escaping. We simply have
  // no way of knowing if this is what is happening when we get
  // non-SanitizedContent input, and most of the time it isn't.
  var isHtml = soydata.isContentKind(text, soydata.SanitizedContentKind.HTML);
  var wrappedText = formatter.unicodeWrapWithKnownDir(
      soydata.getContentDir(text), text + '', isHtml);

  // Bidi-wrapping a value converts it to the context directionality. Since it
  // does not cost us anything, we will indicate this known direction in the
  // output SanitizedContent, even though the intended consumer of that
  // information - a bidi wrapping directive - has already been run.
  var wrappedTextDir = formatter.getContextDir();

  // Unicode-wrapping UnsanitizedText gives UnsanitizedText.
  // Unicode-wrapping safe HTML or JS string data gives valid, safe HTML or JS
  // string data.
  // ATTENTION: Do these need to be ...ForInternalBlocks()?
  if (soydata.isContentKind(text, soydata.SanitizedContentKind.TEXT)) {
    return new soydata.UnsanitizedText(wrappedText, wrappedTextDir);
  }
  if (isHtml) {
    return soydata.VERY_UNSAFE.ordainSanitizedHtml(wrappedText, wrappedTextDir);
  }
  if (soydata.isContentKind(text, soydata.SanitizedContentKind.JS_STR_CHARS)) {
    return soydata.VERY_UNSAFE.ordainSanitizedJsStrChars(
        wrappedText, wrappedTextDir);
  }

  // Unicode-wrapping does not conform to the syntax of the other types of
  // content. For lack of anything better to do, we we do not declare a content
  // kind at all by falling through to the non-SanitizedContent case below.
  // TODO(user): Consider throwing a runtime error on receipt of
  // SanitizedContent other than TEXT, HTML, or JS_STR_CHARS.

  // The input was not SanitizedContent, so our output isn't SanitizedContent
  // either.
  return wrappedText;
};


// -----------------------------------------------------------------------------
// Generated code.








// START GENERATED CODE FOR ESCAPERS.

/**
 * @type {function (*) : string}
 */
soy.esc.$$escapeUriHelper = function(v) {
  return goog.string.urlEncode(String(v));
};

/**
 * Maps characters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = {
  '\x00': '\x26#0;',
  '\x22': '\x26quot;',
  '\x26': '\x26amp;',
  '\x27': '\x26#39;',
  '\x3c': '\x26lt;',
  '\x3e': '\x26gt;',
  '\x09': '\x26#9;',
  '\x0a': '\x26#10;',
  '\x0b': '\x26#11;',
  '\x0c': '\x26#12;',
  '\x0d': '\x26#13;',
  ' ': '\x26#32;',
  '-': '\x26#45;',
  '\/': '\x26#47;',
  '\x3d': '\x26#61;',
  '`': '\x26#96;',
  '\x85': '\x26#133;',
  '\xa0': '\x26#160;',
  '\u2028': '\x26#8232;',
  '\u2029': '\x26#8233;'
};

/**
 * A function that can be used with String.replace.
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_[ch];
};

/**
 * Maps characters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = {
  '\x00': '\\x00',
  '\x08': '\\x08',
  '\x09': '\\t',
  '\x0a': '\\n',
  '\x0b': '\\x0b',
  '\x0c': '\\f',
  '\x0d': '\\r',
  '\x22': '\\x22',
  '\x26': '\\x26',
  '\x27': '\\x27',
  '\/': '\\\/',
  '\x3c': '\\x3c',
  '\x3d': '\\x3d',
  '\x3e': '\\x3e',
  '\\': '\\\\',
  '\x85': '\\x85',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
  '$': '\\x24',
  '(': '\\x28',
  ')': '\\x29',
  '*': '\\x2a',
  '+': '\\x2b',
  ',': '\\x2c',
  '-': '\\x2d',
  '.': '\\x2e',
  ':': '\\x3a',
  '?': '\\x3f',
  '[': '\\x5b',
  ']': '\\x5d',
  '^': '\\x5e',
  '{': '\\x7b',
  '|': '\\x7c',
  '}': '\\x7d'
};

/**
 * A function that can be used with String.replace.
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_[ch];
};

/**
 * Maps characters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_ = {
  '\x00': '\\0 ',
  '\x08': '\\8 ',
  '\x09': '\\9 ',
  '\x0a': '\\a ',
  '\x0b': '\\b ',
  '\x0c': '\\c ',
  '\x0d': '\\d ',
  '\x22': '\\22 ',
  '\x26': '\\26 ',
  '\x27': '\\27 ',
  '(': '\\28 ',
  ')': '\\29 ',
  '*': '\\2a ',
  '\/': '\\2f ',
  ':': '\\3a ',
  ';': '\\3b ',
  '\x3c': '\\3c ',
  '\x3d': '\\3d ',
  '\x3e': '\\3e ',
  '@': '\\40 ',
  '\\': '\\5c ',
  '{': '\\7b ',
  '}': '\\7d ',
  '\x85': '\\85 ',
  '\xa0': '\\a0 ',
  '\u2028': '\\2028 ',
  '\u2029': '\\2029 '
};

/**
 * A function that can be used with String.replace.
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_[ch];
};

/**
 * Maps characters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = {
  '\x00': '%00',
  '\x01': '%01',
  '\x02': '%02',
  '\x03': '%03',
  '\x04': '%04',
  '\x05': '%05',
  '\x06': '%06',
  '\x07': '%07',
  '\x08': '%08',
  '\x09': '%09',
  '\x0a': '%0A',
  '\x0b': '%0B',
  '\x0c': '%0C',
  '\x0d': '%0D',
  '\x0e': '%0E',
  '\x0f': '%0F',
  '\x10': '%10',
  '\x11': '%11',
  '\x12': '%12',
  '\x13': '%13',
  '\x14': '%14',
  '\x15': '%15',
  '\x16': '%16',
  '\x17': '%17',
  '\x18': '%18',
  '\x19': '%19',
  '\x1a': '%1A',
  '\x1b': '%1B',
  '\x1c': '%1C',
  '\x1d': '%1D',
  '\x1e': '%1E',
  '\x1f': '%1F',
  ' ': '%20',
  '\x22': '%22',
  '\x27': '%27',
  '(': '%28',
  ')': '%29',
  '\x3c': '%3C',
  '\x3e': '%3E',
  '\\': '%5C',
  '{': '%7B',
  '}': '%7D',
  '\x7f': '%7F',
  '\x85': '%C2%85',
  '\xa0': '%C2%A0',
  '\u2028': '%E2%80%A8',
  '\u2029': '%E2%80%A9',
  '\uff01': '%EF%BC%81',
  '\uff03': '%EF%BC%83',
  '\uff04': '%EF%BC%84',
  '\uff06': '%EF%BC%86',
  '\uff07': '%EF%BC%87',
  '\uff08': '%EF%BC%88',
  '\uff09': '%EF%BC%89',
  '\uff0a': '%EF%BC%8A',
  '\uff0b': '%EF%BC%8B',
  '\uff0c': '%EF%BC%8C',
  '\uff0f': '%EF%BC%8F',
  '\uff1a': '%EF%BC%9A',
  '\uff1b': '%EF%BC%9B',
  '\uff1d': '%EF%BC%9D',
  '\uff1f': '%EF%BC%9F',
  '\uff20': '%EF%BC%A0',
  '\uff3b': '%EF%BC%BB',
  '\uff3d': '%EF%BC%BD'
};

/**
 * A function that can be used with String.replace.
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_[ch];
};

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_HTML_ = /[\x00\x22\x26\x27\x3c\x3e]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_ = /[\x00\x22\x27\x3c\x3e]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x26\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_ = /[\x00\x08-\x0d\x22\x26\x27\/\x3c-\x3e\\\x85\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_ = /[\x00\x08-\x0d\x22\x24\x26-\/\x3a\x3c-\x3f\x5b-\x5e\x7b-\x7d\x85\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_ = /[\x00\x08-\x0d\x22\x26-\x2a\/\x3a-\x3e@\\\x7b\x7d\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_ = /^(?!-*(?:expression|(?:moz-)?binding))(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,2}|%)?|!important|)$/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_ = /^(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_ = /^data:image\/(?:bmp|gif|jpe?g|png|tiff|webp);base64,[a-z0-9+\/]+=*$/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_ = /^(?!style|on|action|archive|background|cite|classid|codebase|data|dsync|href|longdesc|src|usemap)(?:[a-z0-9_$:-]*)$/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_ = /^(?!script|style|title|textarea|xmp|no)[a-z0-9_$:-]*$/i;

/**
 * A helper for the Soy directive |escapeHtml
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeHtmlHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_HTML_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |normalizeHtml
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeHtmlHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |escapeHtmlNospace
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeHtmlNospaceHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |normalizeHtmlNospace
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeHtmlNospaceHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |escapeJsString
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeJsStringHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_,
      soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

/**
 * A helper for the Soy directive |escapeJsRegex
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeJsRegexHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_,
      soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

/**
 * A helper for the Soy directive |escapeCssString
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeCssStringHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_,
      soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_);
};

/**
 * A helper for the Soy directive |filterCssValue
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterCssValueHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_.test(str)) {
    goog.asserts.fail('Bad value `%s` for |filterCssValue', [str]);
    return 'zSoyz';
  }
  return str;
};

/**
 * A helper for the Soy directive |normalizeUri
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeUriHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
      soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

/**
 * A helper for the Soy directive |filterNormalizeUri
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterNormalizeUriHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_.test(str)) {
    goog.asserts.fail('Bad value `%s` for |filterNormalizeUri', [str]);
    return '#zSoyz';
  }
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
      soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

/**
 * A helper for the Soy directive |filterImageDataUri
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterImageDataUriHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_IMAGE_DATA_URI_.test(str)) {
    goog.asserts.fail('Bad value `%s` for |filterImageDataUri', [str]);
    return 'data:image/gif;base64,zSoyz';
  }
  return str;
};

/**
 * A helper for the Soy directive |filterHtmlAttributes
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterHtmlAttributesHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTES_.test(str)) {
    goog.asserts.fail('Bad value `%s` for |filterHtmlAttributes', [str]);
    return 'zSoyz';
  }
  return str;
};

/**
 * A helper for the Soy directive |filterHtmlElementName
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterHtmlElementNameHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_.test(str)) {
    goog.asserts.fail('Bad value `%s` for |filterHtmlElementName', [str]);
    return 'zSoyz';
  }
  return str;
};

/**
 * Matches all tags, HTML comments, and DOCTYPEs in tag soup HTML.
 * By removing these, and replacing any '<' or '>' characters with
 * entities we guarantee that the result can be embedded into a
 * an attribute without introducing a tag boundary.
 *
 * @type {RegExp}
 * @private
 */
soy.esc.$$HTML_TAG_REGEX_ = /<(?:!|\/?([a-zA-Z][a-zA-Z0-9:\-]*))(?:[^>'"]|"[^"]*"|'[^']*')*>/g;

/**
 * Matches all occurrences of '<'.
 *
 * @type {RegExp}
 * @private
 */
soy.esc.$$LT_REGEX_ = /</g;

/**
 * Maps lower-case names of innocuous tags to 1.
 *
 * @type {Object.<string,number>}
 * @private
 */
soy.esc.$$SAFE_TAG_WHITELIST_ = {'b': 1, 'br': 1, 'em': 1, 'i': 1, 's': 1, 'sub': 1, 'sup': 1, 'u': 1};

// END GENERATED CODE

goog.require('soy');
goog.provide('fssoy');
// This file was automatically generated from templates.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace fssoy.
 */

if (typeof fssoy == 'undefined') { var fssoy = {}; }


fssoy.layerdetaildiv = function(opt_data, opt_ignored) {
  return '<div>' + ((opt_data.item.details.updated) ? '<b>Updated:</b> ' + opt_data.item.details.updated : '') + ((opt_data.item.details.source) ? '<br><b>Source:</b> ' + opt_data.item.details.source : '') + ((opt_data.item.details.custodian) ? '<br><b>Custodian:</b> ' + opt_data.item.details.custodian : '') + ((opt_data.item.details.positionalaccuracy) ? '<br><b>Positional Accuracy:</b> ' + opt_data.item.details.positionalaccuracy : '') + ((opt_data.item.details.scaledependancy) ? '<br><b>Scale Dependancy:</b> ' + opt_data.item.details.scaledependancy : '') + ((opt_data.item.details.labels) ? '<br><b>Labels:</b> ' + opt_data.item.details.labels : '') + ((opt_data.item.details.labelscaledependancy) ? '<br><b>Label Scale Dependancy:</b> ' + opt_data.item.details.labelscaledependancy : '') + ((opt_data.item.details.description) ? '<br><b>Description:</b> ' + opt_data.item.details.description : '') + ((opt_data.item.details.metadata) ? '<br><b>Metadata:</b> ' + opt_data.item.details.metadata : '') + '</div>';
};
if (goog.DEBUG) {
  fssoy.layerdetaildiv.soyTemplateName = 'fssoy.layerdetaildiv';
}


fssoy.resourcedetaildiv = function(opt_data, opt_ignored) {
  return '<div class="float-left" style="padding-top: 5px; width: 77%;"><b>' + soy.$$escapeHtml(opt_data.item.callsign) + '</b> - ' + soy.$$escapeHtml(opt_data.item.name) + '<br><b>Device ID:</b> ' + soy.$$escapeHtml(opt_data.item.deviceid) + '<br><b>Last Logged:</b> ' + soy.$$escapeHtml(opt_data.item.logged_time_str) + '<br><b>Heading: </b>' + soy.$$escapeHtml(opt_data.item.heading) + '<br></div><div class="float-right" style="width: 65px;"><p align="center" style="font-size:10px; line-height:10px;"><img width=50% src="//static.dpaw.wa.gov.au/static/firesource/static/build/symbols/' + soy.$$escapeHtml(opt_data.item.symbol) + '_64.png"><br>' + soy.$$escapeHtml(opt_data.item.symboltext) + '</p></div>';
};
if (goog.DEBUG) {
  fssoy.resourcedetaildiv.soyTemplateName = 'fssoy.resourcedetaildiv';
}


fssoy.viewItem = function(opt_data, opt_ignored) {
  return '<li class="listitem view-immutable" itemid="' + soy.$$escapeHtml(opt_data.item.map_id) + '"><div class="itemtitle"><label class="itemname" >' + soy.$$escapeHtml(opt_data.item.name) + ' (' + soy.$$escapeHtml(opt_data.item.type) + ')</label></div><div class="buttonset-view"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to load this view" class="ui-state-default ui-corner-all ui-button-text-only">Load</a></div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.item.tags) + '</p><div class="details-view" style="font-size:10px; display:none"></div><div class="edit-view" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.viewItem.soyTemplateName = 'fssoy.viewItem';
}


fssoy.layerItem = function(opt_data, opt_ignored) {
  return '<li class="listitem" itemid="' + soy.$$escapeHtml(opt_data.item.id) + '" itemtype="' + soy.$$escapeHtml(opt_data.item.type) + '"><div class="itemtitle">' + ((opt_data.item.type == 'imagery') ? '<input title="Click to select this layer as base layer" type="radio" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" name="imagerylayers" class="float-left" />' : '<input title="Click to turn this layer on/off" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" class="float-left" />') + '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '">' + soy.$$escapeHtml(opt_data.item.name) + '</label></div><div class="buttonset-layer showonselect hideonselect" style="display:none;"><a title="Click to view searchable tags" class="ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Layer Details" class="ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + ((opt_data.item.refreshable) ? '<a title="Click to refresh the Layer" class="ui-state-default ui-corner-all ui-button-text-only">Refresh</a>' : '') + ((opt_data.item.type == 'point' || opt_data.item.type == 'line' || opt_data.item.type == 'polygon') ? '<button title="Inspect features" role="button" class="ui-button ui-widget ui-corner-all ui-state-default ui-button-text-only inspect-features"><span class="ui-button-icon-primary ui-icon gisicon-inspect gis-icon"></span></button>' : '') + '<span class="float-right latest_data">' + soy.$$escapeHtml(opt_data.item.latest_data) + '</span><span style="position: relative; font-size: 7px; font-weight: bold; float: left; width: 95%; top: 2px; text-align: center;"><span style="float: left;">&nbsp;0</span>Opacity %<span style="float: right;">100&nbsp;</span></span></div><div id="slider-' + soy.$$escapeHtml(opt_data.item.type) + '-' + soy.$$escapeHtml(opt_data.item.id) + '" class="showonselect hideonselect" style="display:none;"></div><p class="tags hideonselect" style="display:none"><b>Search Tags: </b>id:' + soy.$$escapeHtml(opt_data.item.id) + ', type:' + soy.$$escapeHtml(opt_data.item.type) + ', ' + soy.$$escapeHtml(opt_data.item.tags) + '</p><a href="' + soy.$$escapeHtml(opt_data.item.legend) + '" target="_blank"><img class="legend-layer hideonselect contain float-right" style="display:none;" src="' + soy.$$escapeHtml(opt_data.item.legend) + '"/></a><div class="details-layer hideonselect" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.layerItem.soyTemplateName = 'fssoy.layerItem';
}


fssoy.vectorItem = function(opt_data, opt_ignored) {
  return '<li class="listitem" featureid="' + soy.$$escapeHtml(opt_data.id) + '"><div class="itemtitle"><input title="Click to select/unselect this vector" type="checkbox" id="toggle-' + soy.$$escapeHtml(opt_data.id) + '" class="float-left" />' + ((opt_data.attributes.name) ? (opt_data.attributes.callsign) ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.callsign) + ' - ' + soy.$$escapeHtml(opt_data.attributes.name) + '</label>' : '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.name) + '</label>' : (opt_data.attributes.deviceid) ? '<label class="itemname" for="toggle-' + soy.$$escapeHtml(opt_data.id) + '">' + soy.$$escapeHtml(opt_data.attributes.deviceid) + '</label>' : '') + '</div><div class="buttonset-vector"><a title="Click to view searchable tags" class="tags ui-state-default ui-corner-all ui-button-text-only">Tags</a><a title="Click to view Device Details" class="details ui-state-default ui-corner-all ui-button-text-only">Detail</a>' + ((opt_data.attributes.age <= 1) ? '<span style="color:#008800"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : (opt_data.attributes.age <= 3) ? '<span style="color:#CCCC00"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : (opt_data.attributes.age > 3) ? '<span style="color:#CC0000"><b> Updated: </b></span><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>' : '<b> Updated: </b><span class="latest_data">' + soy.$$escapeHtml(opt_data.attributes.age) + ' - ' + soy.$$escapeHtml(opt_data.attributes.logged_time_str) + '</span>') + '</div><p class="tags" style="display:none"><b>Search Tags: </b>' + soy.$$escapeHtml(opt_data.searchtags) + '</p><div class="details-vector" style="font-size:10px; display:none"></div><div class="edit-vector" style="font-size:10px; display:none"></div></li>';
};
if (goog.DEBUG) {
  fssoy.vectorItem.soyTemplateName = 'fssoy.vectorItem';
}


fssoy.listTags = function(opt_data, opt_ignored) {
  var output = '';
  var itemList169 = opt_data.items;
  var itemListLen169 = itemList169.length;
  for (var itemIndex169 = 0; itemIndex169 < itemListLen169; itemIndex169++) {
    var itemData169 = itemList169[itemIndex169];
    output += '<li class="listitem"><a searchid="' + soy.$$escapeHtml(itemData169.id) + '">' + soy.$$escapeHtml(itemData169.name) + '</a></li>';
  }
  return output;
};
if (goog.DEBUG) {
  fssoy.listTags.soyTemplateName = 'fssoy.listTags';
}


fssoy.helloWorld = function(opt_data, opt_ignored) {
  return 'Hello world!';
};
if (goog.DEBUG) {
  fssoy.helloWorld.soyTemplateName = 'fssoy.helloWorld';
}


fssoy.ollayerwms = function(opt_data, opt_ignored) {
  return 'new OpenLayers.Layer.WMS("' + opt_data.id + '", "' + opt_data.url + '", {layers:"' + opt_data.layers + '", tiled:true, transparent:' + opt_data.transparent + '}, {buffer:0} );';
};
if (goog.DEBUG) {
  fssoy.ollayerwms.soyTemplateName = 'fssoy.ollayerwms';
}


fssoy.ollayertms = function(opt_data, opt_ignored) {
  return 'new OpenLayers.Layer.TMS("' + opt_data.id + '", "' + opt_data.url + '", {layername:"' + opt_data.layers + '@gda94@' + ((opt_data.transparent) ? 'png' : 'jpeg') + '", type:"' + ((opt_data.transparent) ? 'png' : 'jpeg') + '"} );';
};
if (goog.DEBUG) {
  fssoy.ollayertms.soyTemplateName = 'fssoy.ollayertms';
}

goog.provide('firesource.session');
goog.require('fssoy');

var s = {} //session object, should be a dict of everything! (except functions)
s.ui = {} //s.ui should be user interface vars
s.ui.dialogs = {} //s.ui.dialogs is floating dialogs
s.ui.menus = {} // menus
s.ui.buttons = {} // buttons
s.ui.states = {} // states
s.ol = {} //s.ol should be openlayers vars
s.ol.controls = {} //s.ol.controls should be openlayers controls
s.queries = {} //queries to send, named after e.target.getCaption()
s.callbacks = {} //callbacks to fire, named after e.target.getCaption()
s.results = {} //convenient place to store callback results
//jquery reverse
$.fn.reverse = [].reverse;

//jquery ajaxSetup override
$.ajaxSetup({
	'timeout': 30000
});

//sigfigs
var sigFigs = function(n, sig) {
	var mult = Math.pow(10, sig - Math.floor(Math.log(n) / Math.LN10) - 1);
	return Math.round(n * mult) / mult;
}

//escape css
var escapecss = function(text) {
	return text.replace(/(:|\.)/g, '\\$1');
}

var timezoneDate = function(utcisostring) {
    return new Date(Date.parse(utcisostring) - (new Date().getTimezoneOffset()) * 60 * 1000)
}

//jquery fromxml
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

//session callbacks
s.callbacks.resourcegroups = function(data) { //needs moving to ui
	$('#resources-div-west ul.list').empty().append(fssoy.listTags({
		"items": data
	}));
}


s.callbacks.layergroups = function(data) {
	$('div#layers-div-west .list').append(fssoy.listTags({
		items: data
	}));
	$('input#layersearchtext').keyup();
}

s.callbacks.layers = function(data) {
    var ullayers = $('ul#layers')
	// add layers to session map
	firesource.ol.populateLayers(s.ol.olmap, data, s.ol.layers);

	//save and restore are for future when user updates layer inside session
	//firesource.ui.saveLayerState();
	ullayers.empty();
	$.each(data, function(index, layer) {
		if (layer.latest_data) {
			layer.latest_data = dateFormat(timezoneDate(layer.latest_data), "dd/mm/yyyy HH:MM");
		} else {
			if (layer.details.updated) {
				layer.latest_data = layer.details.updated;
			} else {
				layer.latest_data = 'Unknown';
			}
		}
		layer.refreshable = true;
		if (layer.details.updated != 'Live') {
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
				// make sure history traversal is actually shifting view
				while (stack[1] && stack[0].center.lon == stack[1].center.lon && stack[0].center.lat == stack[1].center.lat && stack[0].resolution == stack[1].resolution) {
					s.ol.navigationHistory[direction + "Trigger"]();
				}
				s.ol.navigationHistory[direction + "Trigger"]();
			}
		}
		s.ui.states.navigationHistoryActive = true;
	}
	s.ol.olmap.addControl(s.ol.controls.mouseposition);
    $('div#views-div-west').find('a:contains(Saved)').click()
    firesource.ol.loadState(null, function() {
        if (django_query.layersearch) {
            $('input#layersearchtext').val(django_query.layersearch[0]).keyup();
        } else {
            $('input#layersearchtext').keyup();
        }
        s.ol.olmap.events.on({
            zoomend: firesource['ol']['mapZoomEnd'],
            moveend: firesource['ol']['saveState'],
            changelayer: firesource['ol']['saveState'],
            changebaselayer: firesource['ol']['saveState']
        });
        s.ol.olmap.events.triggerEvent("zoomend");
    });
}

s.callbacks.maps = function(data) {
    var ulviews = $('ul#views');
    ulviews.empty();
	$.each(data, function(index, view) {
        ulviews.append(fssoy.viewItem({"item":view}));
		s.ol.userviews[view["map_id"]] = view
	});
}

firesource.session.updateResults = function(data) {
	//updates results array with keys, and fires function for each key
	$.each(data, function(key, value) {
		s.results[key] = value;
		s.callbacks[key](s.results[key]);
	});
}



goog.require('firesource.session');
goog.provide('firesource.forms');

s.ui.forms = {}

firesource.forms.presubmit = function(formData, jqForm, options) { 
    var form = jqForm[0];
    $.merge(formData, [{"name":"mod","value":form.className.split(' ')[1]+"_formpost"},
        {"name":"formid","value":form.id}]);
 
    // here we could return false to prevent the form from being submitted; 
    // returning anything other than false will allow the form submit to continue 
    return true; 
} 
 
// post-submit callback 
firesource.forms.postsubmit = function(responseText, statusText, xhr, $form)  { 
    // for normal html responses, the first argument to the success callback 
    // is the XMLHttpRequest object's responseText property 
 
    // if the ajaxSubmit method was passed an Options Object with the dataType 
    // property set to 'xml' then the first argument to the success callback 
    // is the XMLHttpRequest object's responseXML property 
 
    // if the ajaxSubmit method was passed an Options Object with the dataType 
    // property set to 'json' then the first argument to the success callback 
    // is the json data object returned by the server 
 
} 

firesource.forms.decorate = function() {
    var options = { 
        url: '/json', 
        dataType:'json', 
        success: null, //What to call after a reply from Django
        beforeSubmit: firesource['forms']['presubmit'],
        afterSubmit: firesource['forms']['postsubmit']
    };
    // bind forms using ajaxForm 
    $('form.uniForm').ajaxForm(options);
    $('a:visible').each(function(i,e){$(this).attr('tabindex', -1);});
}


goog.provide('firesource.ol.loadingpanel');

OpenLayers.Control.LoadingPanel = OpenLayers.Class(OpenLayers.Control, {

    /**
     * Property: counter
     * {Integer} A counter for the number of layers loading
     */
    counter: 0,

    /**
     * Property: maximized
     * {Boolean} A boolean indicating whether or not the control is maximized
    */
    maximized: false,

    /**
     * Property: visible
     * {Boolean} A boolean indicating whether or not the control is visible
    */
    visible: true,

    /**
     * Constructor: OpenLayers.Control.LoadingPanel
     * Display a panel across the map that says 'loading'.
     *
     * Parameters:
     * options - {Object} additional options.
     */
    initialize: function(options) {
         OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**
     * Function: setVisible
     * Set the visibility of this control
     *
     * Parameters:
     * visible - {Boolean} should the control be visible or not?
    */
    setVisible: function(visible) {
        this.visible = visible;
    },

    /**
     * Function: getVisible
     * Get the visibility of this control
     *
     * Returns:
     * {Boolean} the current visibility of this control
    */
    getVisible: function() {
        return this.visible;
    },

    /**
     * APIMethod: hide
     * Hide the loading panel control
    */
    hide: function() {
        this.setVisible(false);
    },

    /**
     * APIMethod: show
     * Show the loading panel control
    */
    show: function() {
        this.setVisible(true);
    },

    /**
     * APIMethod: toggle
     * Toggle the visibility of the loading panel control
    */
    toggle: function() {
        this.setVisible(!this.getVisible());
    },

    /**
     * Method: addLayer
     * Attach event handlers when new layer gets added to the map
     *
     * Parameters:
     * evt - {Event}
    */
    addLayer: function(evt) {
        if (evt.layer) {
            evt.layer.events.register('loadstart', this, this.increaseCounter);
            evt.layer.events.register('loadend', this, this.decreaseCounter);
            evt.layer.events.register('loadcancel', this, this.clear);
            evt.layer.events.register('visibilitychanged', this, this.clear);
        }
    },

    /**
     * Method: setMap
     * Set the map property for the control and all handlers.
     *
     * Parameters:
     * map - {<OpenLayers.Map>} The control's map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        this.map.events.register('preaddlayer', this, this.addLayer);
        for (var i = 0; i < this.map.layers.length; i++) {
            var layer = this.map.layers[i];
            layer.events.register('loadstart', this, this.increaseCounter);
            layer.events.register('loadend', this, this.decreaseCounter);
            layer.events.register('loadcancel', this, this.clear);
            layer.events.register('visibilitychanged', this, this.clear);
        }
    },

    /**
     * Method: increaseCounter
     * Increase the counter and show control
    */
    clear: function(evt) {
        if (evt.object.visibility == false) {
            var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
            lyrli.removeClass("loaded-tiles loading-tiles");
        }
    },

    increaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        lyrli.removeClass("loaded-tiles broken-tiles").addClass("loading-tiles");
    },

    /**
     * Method: decreaseCounter
     * Decrease the counter and hide the control if finished
    */
    decreaseCounter: function(evt) {
        var lyrli = $("ul#layers").find("li[itemid="+evt.object.name+"]")
        if (evt.object.isBaseLayer) {
            $("ul#layers").find("li[itemtype=imagery]").removeClass("loaded-tiles loading-tiles");
        }
        if (evt.object.grid && $(evt.object.grid[0][0].imgDiv).hasClass("olImageLoadError")) {
            if (evt.object.isBaseLayer) {
                window.alert('Base Imagery "' + lyrli.find("label").text() + '" ('+evt.object.grid[0][0].imgDiv.src.split("?")[0]+') doesn\'t seem to be loading properly, try switching to another.');
            } else if (window.confirm('Layer "' + lyrli.find("label").text() + '" ('+evt.object.grid[0][0].imgDiv.src.split("?")[0]+') doesn\'t seem to be loading properly, would you like to disable it?')) {
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

    /**
     * Method: draw
     * Create and return the element to be splashed over the map.
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        return this.div;
    },

    /**
     * Method: minimizeControl
     * Set the display properties of the control to make it disappear.
     *
     * Parameters:
     * evt - {Event}
     */
    minimizeControl: function(evt) {
        $('#map').loading(false);
        this.maximized = false;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: maximizeControl
     * Make the control visible.
     *
     * Parameters:
     * evt - {Event}
     */
    maximizeControl: function(evt) {
        $('#map').loading(true, {pulse:'ellipsis', align:'center'});
        this.maximized = true;

        if (evt != null) {
            OpenLayers.Event.stop(evt);
        }
    },

    /**
     * Method: destroy
     * Destroy control.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.unregister('preaddlayer', this, this.addLayer);
            if (this.map.layers) {
                for (var i = 0; i < this.map.layers.length; i++) {
                    var layer = this.map.layers[i];
                    layer.events.unregister('loadstart', this,
                        this.increaseCounter);
                    layer.events.unregister('loadend', this,
                        this.decreaseCounter);
                    layer.events.unregister('clear', this,
                        this.clear);
                }
            }
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.LoadingPanel"

});

goog.require('firesource.session');
goog.require('firesource.ol.loadingpanel');
goog.provide('firesource.ol');

/*
	Contains functions for resource tracking project
	that use the openlayers controls and interact with
	the vector features
*/

s.ol.controls = {}; //openlayers controls
s.ol.symbolizers = {}; //symbolizers stored in session
s.ol.styles = {}; //openlayers styles
s.ol.styleMaps = {}; //openlayers styleMaps
s.ol.layers = {}; //openlayers layers
s.ol.layers.vector = {}; //vector based layers
s.ol.layers.vectoroverlay = {}; //vector overlay layers (unselectable)
s.ol.layers.point = {}; //point imagery layers
s.ol.layers.line = {}; //line imagery layers
s.ol.layers.polygon = {}; //poly imagery layers
s.ol.layers.overlay = {}; //poly imagery layers
s.ol.layers.imagery = {}; //imagery/base, only one at a time layers
s.ol.userviews = {};

firesource.ol.interact = {}; //interactive controls
firesource.ol.events = {}; //like actions but for events?
firesource.ol.maps = {}; //maps

OpenLayers.Control.Inspect = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': false,
        'stopDouble': false
    },

    initialize: function(options) {
        this.handlerOptions = OpenLayers.Util.extend(
            {}, this.defaultHandlerOptions
        );
        OpenLayers.Control.prototype.initialize.apply(
            this, arguments
        );
        this.handler = new OpenLayers.Handler.Click(
            this, {
                'click': this.trigger
            }, this.handlerOptions
        );
    },

    trigger: function(e) {
        if (s.inspect) { s.inspect(e.xy); }
    }

});

$.ajaxSetup({
  xhrFields: {
    withCredentials: true
  }
});

firesource.ol.updateLayer = function(features, layer, ollayer) {
	//show the layers being updated
	listitem = $("ul#layers").find("li.listitem[itemid=" + layer.id + "]");
	listitem.find("span.latest_data").text("...");
	//update layer
	ollayer.destroyFeatures();
	ollayer.addFeatures(features);
	ollayer.redraw();
	var latest_data = timezoneDate(jLinq.from(jLinq.from(features).select(function(r) {
		return r.attributes
	})).orderBy("-logged_time").select(function(r) {
		return r.logged_time
	})[0]);
	// update latest data time
	listitem.find("span.latest_data").text(dateFormat(latest_data, "dd/mm/yyyy HH:MM"));
	// rebuild vectors tab
	s.ui.states.vectorsBuilt = false;
	$("select#vectors-select").change();
}

firesource.ol.buildHistory = function(layer, features) {
	if (s.ol.layers.vector.history && s.ol.layers.vector.history_lines) {
		s.ol.layers.vector.history.destroy();
        delete s.ol.layers.vector.history;
		s.ol.layers.vector.history_lines.destroy();
        delete s.ol.layers.vector.history_lines;
	}
    s.ol.layers.vector.history = new OpenLayers.Layer.Vector("history", {
        strategies: [new OpenLayers.Strategy.Cluster({
            distance: 16,
            threshold: 2
        })]
    });
    // add to layers list & move to underneath s.ol.activeVector
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
		var points = []
		var curpoint = [firesource.ol.getFeaturesBy(unique, s.ol.activeVector, id)[0].geometry];
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
	$.get('//static.dpaw.wa.gov.au/static/firesource/static/styles/' + style + '.xml', function(data) {
		var styles = s.ol.sldformat.read(data).namedLayers
        s.hstyles = styles;
		if (styles["default"]) {
			defaultstyle = styles["default"].userStyles[0];
			history_layer.styleMap.styles["default"] = defaultstyle;
			history_lines_layer.styleMap.styles["default"] = defaultstyle;
		}
		history_layer.redraw();
		history_lines_layer.redraw();
	});
}

firesource.ol.buildVectorLayer = function(layer, layerType) {
	if (layer.cluster) {
		layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id, {
			strategies: [new OpenLayers.Strategy.Cluster({
				distance: layer.cluster,
				threshold: 2
			})]
		});
	} else {
		layerType[layer.id] = new OpenLayers.Layer.Vector(layer.id);
	}
	var ollayer = layerType[layer.id]
	ollayer.search_filters = layer.filters;
    $.get('//static.dpaw.wa.gov.au/static/firesource/static/styles/' + layer.style + '.xml', function(data) {
        var styles = s.ol.sldformat.read(data).namedLayers
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
		};
        s.ol.loading_view = true;
        ollayer.events.triggerEvent("loadstart");
        $.get('/apps/spatial/query_vector/' + layer.query + '.json', function(data) {
            if (layer) {
                firesource.ol.updateLayer(s.ol.geojsonformat.read(data), layer, ollayer);
            }
            s.ol.loading_view = false;
            ollayer.events.triggerEvent("loadend");
        });
	}

	ollayer.query_history = function(datefrom, dateto, selectedVectors) {
		$.post('/apps/spatial/query_vector/' + layer.query + '.json', JSON.stringify({
			"from_date": datefrom,
			"to_date": dateto,
			"unique_list": selectedVectors
		}), function(data) {
			s.results.vectorHistory = s.ol.geojsonformat.read(data);
			firesource.ol.buildHistory(layer, s.results.vectorHistory);
		});
	}

	return ollayer
}

firesource.ol.populateLayers = function(olmap, layers, root) {
	// use reverse to make sure openlayers adds layers in visibility order
	var lyrs = layers.slice(0);
	lyrs.reverse();
	$.each(lyrs, function(index, layer) {
		if (layer.type == "vectortemplate") {
			return;
		}
		if (layer.type.search("vector") > - 1) {
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
}

firesource.ol.getFeaturesBy = function(field, layer, featureid) {
	var features = jLinq.from(layer.features).contains(field, featureid).select();
	if (features.length != 1) { // if cluster check inside cluster attributes
		$.each(layer.features, function(index, f) {
			$.merge(features, jLinq.from(f.cluster).contains(field, featureid).select());
			if (features.length == 1) {
				return false;
			}
		});
	}
	return features;
}

firesource.ol.jiggleMap = function(map) {
	if (map.getCenter()) {
        map.updateSize();
        firesource.ol.saveState();
		return true;
	} else {
		return false;
	}
}

firesource.ol.mapZoomEnd = function(e) {
	$('#vectors li.listitem input[id^="toggle-"]:checked').change();
	s.ui.zoomslider.children(".slider").slider("value", s.ol.olmap.zoom);
	$('div#hoverdetails').hide();
}

firesource.ol.currentState = function(extraLayers) {
	var layerlist = jLinq.from(s.ol.olmap.layers).equals("visibility", true).select()
	var printablelayers = [];
	$.each(layerlist, function(index, value) {
		if (value.name.slice(0, 11) != "OpenLayers." && value.name.slice(0,7) != "history") {
			if (value.opacity === null) {
				value.opacity = 1
			};
			printablelayers.push({
				"layer_id": value.name,
				"opacity": value.opacity
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
    center = s.ol.olmap.getCenter()
	return {
		"layers": printablelayers,
		"center": {"type":"Point","coordinates":[center.lon, center.lat]},
		"scale": Math.round(s.ol.olmap.getScale())
	}
}

firesource.ol.saveState = function(e, callback) {
    if (e) { var layers = e.layers; } else { var layers = false; }
    if (!s.ol.loading_view && s.loaded) {
        s.saved_state = JSON.stringify(firesource.ol.currentState(layers));
        localStorage.setItem("ss", s.saved_state);
        document.location.hash = $.param({"ss": s.saved_state });
        if (callback) { callback(); }
        return true;
    } else {
        return false;
    }
}

firesource.ol.loadState = function(e, callback) {
    var tempview, hashview, localview;
    tempview = hashview = localview = false;
    if (document.location.hash.length > 10) {
        var hashview = decodeURIComponent(document.location.hash.slice(1)).slice(3); }
    if (localStorage.getItem("ss")) {
        var localview = localStorage.getItem("ss"); }
    if (hashview && localview && hashview != localview) {
        if (window.confirm("Load state from url? If you cancel the map will return to your previous state.")) {
            tempview = hashview; } else { 
            tempview = localview; } } else {
        tempview = hashview || localview;
    }
    if (tempview) {
        tempview = JSON.parse(tempview);
        s.ol.loading_view = false;
        firesource.ol.loadView(tempview);
    }
    s.loaded = true;
    if (callback) { callback(); }
    return true;
}

window.addEventListener("hashchange", function () {
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
        return false
    }
    s.ol.loading_view = true;
    layers = $('ul#layers')
    //uncheck all layers
    layers.find('input[type!=radio][id^=toggle-]:checked').prop("checked", false).change();

    var maxIndex = 0;
    $.each(viewobject.layers, function(index, layer) {
        //turn on layer
        var ollayer = s.ol.olmap.getLayersByName(layer.layer_id);
        if (ollayer.length != 1) { return true; } else { ollayer = ollayer[0]; }
        if (s.ol.olmap.getLayerIndex(ollayer) < maxIndex) {
            maxIndex += 1;
            s.ol.olmap.setLayerIndex(ollayer, maxIndex);
            // should also update sortables position
        }
        layers.find('li[itemid=' + layer.layer_id + '] input[id^=toggle-]').prop('checked', true).change();
        //update opacity
        ollayer.setOpacity(layer.opacity);
        layers.find('li[itemid=' + layer.layer_id + '] div[id^=slider-]').slider("value", layer.opacity * 100);
    });
    s.ol.olmap.resetLayersZIndex();
    if (viewobject.type != "theme" && s.ol.olmap.baseLayer) {
        s.ol.olmap.zoomToScale(viewobject.scale);
        var center = new OpenLayers.LonLat(viewobject.center.coordinates[0], viewobject.center.coordinates[1]);
        s.ol.olmap.setCenter(center);
    }
    s.ol.loading_view = false;
    return true
}


firesource.ol.maps.overMap = function(selector) {
    divsize = new OpenLayers.Size($(selector).width(),$(selector).height())
	return new OpenLayers.Control.OverviewMap({
		div: $(selector)[0],
        size: divsize,
		autoPan: true,
		mapOptions: {
		    projection: new OpenLayers.Projection("EPSG:4326"),
			tileSize: new OpenLayers.Size(1024, 1024),
            resolutions: [0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.433227539062E-4, 1.716613769531E-4, 8.58306884766E-5, 4.29153442383E-5, 2.14576721191E-5, 1.07288360596E-5, 5.3644180298E-6, 2.6822090149E-6, 1.3411045074E-6]
		}
	})
}

firesource.ol.maps.gda94 = function(div, bounds) {
    OpenLayers.DOTS_PER_INCH = 90.71428571428572;
	var options = {
		controls: [],
		projection: new OpenLayers.Projection("EPSG:4326"),
        maxExtent: new OpenLayers.Bounds(-180.0,-90.0,180.0,90.0),
		tileSize: new OpenLayers.Size(1024, 1024),
        resolutions: [0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.433227539062E-4, 1.716613769531E-4, 8.58306884766E-5, 4.29153442383E-5, 2.14576721191E-5, 1.07288360596E-5, 5.3644180298E-6, 2.6822090149E-6, 1.3411045074E-6],
		units: 'degrees',
        fractionalZoom: false
	};
	olmap = new OpenLayers.Map(div, options);

	s.ol.controls.mouseposition = new OpenLayers.Control.MousePosition({
		element: $('#mouseposition')[0],
        formatOutput: function(lonLat) {
            lon = OpenLayers.Util.getFormattedLonLat(lonLat.lon, "lon", "dms")
            lat = OpenLayers.Util.getFormattedLonLat(lonLat.lat, "lat", "dms")
            return lon + ", " + lat + "</br><span>" + lonLat.lon + ", " + lonLat.lat + "</span>"
        }
	});
	olmap.addControl( new OpenLayers.Control.ScaleLine({geodesic: true}));
	olmap.addControl( new OpenLayers.Control.Scale());
	olmap.addControl(new OpenLayers.Control.LoadingPanel());
	return olmap;
}

firesource.ol.buildMap = function() {
	//static layers
	s.ol.olmap.zoomToExtent(s.ol.bounds);
	//other controls
	s.ol.olmap.addControl(s.ol.controls.navigate);
	s.ol.olmap.addControl(s.ol.controls.measureLine);
	s.ol.olmap.addControl(s.ol.controls.measureArea);
    s.ol.inspect = new OpenLayers.Control.Inspect();
    s.ol.olmap.addControl(s.ol.inspect);
    s.ol.inspect.activate();
	s.ui.states.built = true;
	$('#controlpan').click();
}

firesource.ol.hoverdetails = function(feature) {
	hoverdetails = $("div#hoverdetails")
	map = $("div#map")
	if (feature === null || ! feature.geometry.bounds.centerLonLat) {
		hoverdetails.hide();
		return;
	} else {
		var attributes = feature.attributes;
		featurex = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).x;
		featurey = s.ol.olmap.getPixelFromLonLat(feature.geometry.bounds.centerLonLat).y;
		attributes.logged_time_str = dateFormat(timezoneDate(attributes.logged_time), "dd/mm/yyyy HH:MM");
        attributes.symboltext = attributes.symbol.split("/")[1].replace(/_/g, " ")
		var content = fssoy.resourcedetaildiv({
			"item": attributes
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
			"top": posy,
			"left": posx
		});
	}
}

firesource.ol.events.select = function(feature, state) {
	if (!feature) {
		return
	}
	var vectors = $('ul#vectors');
	if (s.ol.activeVector.selectedFeatures.length == 0 && state === false) {
		vectors.find("li.listitem").find("input[id^=toggle-]:checked").attr('checked', false);
		return;
	}
	if (feature.cluster) {
		$.each(feature.cluster, function(index, subfeature) {
			vectors.find("li.listitem[featureid=" + subfeature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr('checked', state);
		});
	} else {
		vectors.find("li.listitem[featureid=" + feature.id.split(".").pop() + "]").find("input[id^=toggle-]").attr('checked', state);
	}
	$('#vectorsearchtext').keyup();
}

firesource.ol.events.selectupdate = function(feature, label) {
    var prefill = feature.attributes[label]
    if (prefill == undefined) {
        prefill = "";
    }
    var attr = window.prompt("Please enter a " + label + " for feature " + feature.fid.split(".")[1], prefill);
    if (!attr) {return false;}
    feature.attributes[label] = attr;
    feature.state = OpenLayers.State.UPDATE;
    s.ol.SaveStrategy.save();
}

firesource.ol.interact.selectupdate = function(layer, label) {
    return new OpenLayers.Control.SelectFeature(layer, {
        multiple: false,
        onSelect: function(f) {
            firesource.ol.events.selectupdate(f, label)
        }
    });
}

firesource.ol.interact.select = function(layer) {
	return new OpenLayers.Control.SelectFeature(layer, {
		clickout: true,
		toggle: false,
		multiple: false,
		hover: false,
		toggleKey: "ctrlKey",
		// ctrl key removes from selection
		multipleKey: "shiftKey",
		// shift key adds to selection
		box: true,
		onSelect: function(f) {
			firesource.ol.events.select(f, true)
		},
		onUnselect: function(f) {
			firesource.ol.events.select(f, false),
			$('#vectorsearchtext').keyup();
		}
	});
}

s.ol.controls.navigate = new OpenLayers.Control.Navigation();

s.ol.navigationHistory = new OpenLayers.Control.NavigationHistory({
	'trackBaseLayerChange': true
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
	if (id.search("measure") == - 1) {
		$('span#messagetext').stop(true).fadeTo(400, 0);
	}
	if (id == "navigate" && s.ol.SaveStrategy && s.ol.SaveStrategy.active) {
		firesource.ui.updateDataTable(s.ui.dtable, s.ol.activeVector);
	}
}

firesource.ol.toggleLabels = function(layer, labeledStyleMap, unlabeledStyleMap) {
	if (layer.styleMap == labeledStyleMap) {
		layer.styleMap = unlabeledStyleMap;
	} else {
		layer.styleMap = labeledStyleMap;
	}
	layer.redraw(true);
}

firesource.ol.zoomToSelected = function() {
    var feature_ids = $.map($('#vectors input[id^="toggle-"]:checked'), function(i) {return i.id.slice(7)});
    var features = $.grep(s.ol.activeVector.strategies[0].features, function(e) {return $.inArray(e.id, feature_ids) > -1});
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
}

firesource.ol.handleMeasurements = function(event) {
	var geometry = event.geometry;
	var units = event.units;
	var order = event.order;
	var measure = event.measure;

	var nautmiles;
	var ha;
	if (order == 1) {
		if (units == "m") {
			nautmiles = measure * 0.0005399568034557236;
		} else if (units == "km") {
			nautmiles = measure * 0.5399568034557235;
		}
		$('span#messagetext').text("Distance: " + measure.toFixed(3) + " " + units + " / " + nautmiles.toFixed(3) + " Nm").stop(true).fadeTo(0, 1);
	}
	else {
		// Convert to hectares
		if (units == "m") {
			ha = measure * 0.0001;
		} else if (units == "km") {
			ha = measure * 100;
		};
		$('span#messagetext').text("Area: " + ha.toFixed(3) + " ha").stop(true).fadeTo(0, 1);
	}
}

//calculate total distance of a line feature
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
}

firesource.ol.zoomToFid = function(fid) {
	var feature = s.ol.activeVector.getFeatureByFid(fid);
	var lonlat = new OpenLayers.LonLat(feature.geometry.getCentroid().x, feature.geometry.getCentroid().y);
	s.ol.olmap.panTo(lonlat);
}


goog.provide('firesource.ui');
goog.require('firesource.session');
firesource.ui.actions = {
}; //button actions etc
s.ui.global = {
}
firesource.ui.geocode = function (query) {
  var lon = Math.round(s.ol.olmap.getCenter().lon * 10) / 10;
  var lat = Math.round(s.ol.olmap.getCenter().lat * 10) / 10;
  var mapcenter = new OpenLayers.Geometry.Point(lat, lon);
  var lonlat = lon + ',' + lat;
  var mapbox_apikey = "pk.eyJ1IjoiZHBhd2FzaSIsImEiOiJtVjY5WmlFIn0.whc76euXLk2PkyxOkZ5xlQ";
  s.last_geocode = query;
  $.ajax({
    url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '+wa+au.json?' + $.param({proximity: lonlat, access_token: mapbox_apikey}),
    xhrFields: {
      withCredentials: false
    },
    success: function (data) {
      s.geocode_results = data
      var feature = data.features[0]
      var closest = mapcenter.distanceTo(new OpenLayers.Geometry.Point(feature.center[1], feature.center[0]))
      $.each(data.features, function (index, f) {
        var fpoint = new OpenLayers.Geometry.Point(f.center[1], f.center[0])
        if ((closest - mapcenter.distanceTo(fpoint)) > 20) {
          feature = f;
          closest = mapcenter.distanceTo(fpoint);
        }
      })
      if (closest < 20 && feature.place_name != "Western Australia, Australia") {
          firesource.ui.setMessageText("Panning to " + feature.place_name)
          s.ol.olmap.panTo(feature.center)
      } else {
          firesource.ui.setMessageText("No results found in 2000km radius from centre of map.")
      }
    }
  })
}
firesource.ui.geocodeSetup = function() {
    //setup before functions
    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms, 5 second for example
    var ginput = $("#geocodequery");

    //on keyup, start the countdown
    ginput.keyup(function(){
        clearTimeout(typingTimer);
        if (ginput.val() != "" && ginput.val() != s.last_geocode) {
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        }
    });

    //user is "finished typing," do something
    function doneTyping () {
      firesource.ui.geocode(ginput.val())
    }
}
firesource.ui.geocodeSetup();

firesource.ui.setMessageText = function (text) {
  $('span#messagetext').text(text).stop(true).fadeTo(0, 1, function () {
    $(this).delay(4000).fadeOut(1000);
  });
  return true;
}
$('span#messagetext').ajaxError(function (e, xhr, settings, exception) {
  firesource.ui.setMessageText('Error loading ' + settings.url + ': ' + exception);
});
firesource.ui.actions.layerChange = function (e) {
  var toggle = $(e.target)
  var listitem = toggle.parents('li.listitem')
  var layerid = listitem.attr('itemid')
  var type = listitem.attr('itemtype')
  var lyr = s.ol.layers[type][layerid];
  var vectorselector = $('select#vectors-select');
  var current = vectorselector.val();
  if (type == 'vector') { // rescan vector layers for dropdown
    vectorselector.empty();
    var newval = false;
    $('ul#layers').find('li[itemtype=vector]').find('[id^=toggle]:checked').parents('li.listitem').each(function () {
      layerid = $(this).attr('itemid');
      if (current == layerid) {
        newval = layerid;
      }
      vectorselector.append('<option value="' + $(this).attr('itemid') + '">' + $(this).find('label.itemname').text() + '</option>');
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
  if (type == 'imagery') { //update overview map
    var prevstack = s.ol.navigationHistory.previousStack;
    var nextstack = s.ol.navigationHistory.nextStack;
    $.each(s.ol.olmap.getControlsByClass('OpenLayers.Control.OverviewMap'), function (index, ovmap) {
      s.ol.olmap.removeControl(ovmap);
      ovmap.destroy();
    });
    s.ol.olmap.setBaseLayer(lyr);
    s.ol.olmap.addControl(firesource.ol.maps.overMap('#overviewmapdiv'));
    $('div.olControlOverviewMapElement').height('100%').css('padding','0px');
    $('div.olControlOverviewMapElement').children('div.olMap').width('auto').height('100%');
    firesource.ol.jiggleMap(s.ol.olmap);
    s.ol.navigationHistory.previousStack = prevstack;
    s.ol.navigationHistory.nextStack = nextstack;
    $('ul#layers').find('li[itemtype=imagery]').find('.hideonselect').hide()
  } else if (toggle[0].checked) {
    lyr.setVisibility(true);
    if (lyr.query_vector) { //refresh vector layer on select
      if (lyr.name != current || !s.ui.states.vectorsBuilt) {
        lyr.query_vector();
      }
    }
  } else {
    lyr.setVisibility(false);
  }
  if (toggle[0].checked) {
    listitem.find('div.showonselect').show();
  } else {
    listitem.find('.hideonselect').hide();
  }
}
firesource.ui.actions.layerSlide = function (e, ui) {
  var listitem = $(e.target).parents('li.listitem')
  var layerid = listitem.attr('itemid')
  var type = listitem.attr('itemtype')
  var lyr = s.ol.layers[type][layerid];
  lyr.setOpacity(ui.value / 100);
}
firesource.ui.actions.layerMouseUp = function (e) {
  var item = $(e.target)
  var listitem = item.parents('li.listitem')
  var layerid = listitem.attr('itemid')
  if (item.text() == 'Tags') {
    var tagsp = listitem.find('p.tags');
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide()
    } else {
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show()
    }
  } else if (item.text() == 'Detail') {
    var detailsdiv = listitem.find('div.details-layer');
    var legend = listitem.find('.legend-layer');
    var layeritem = jLinq.from(s.results.layers).equals('id', layerid).select();
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
      legend.hide();
    } else {
      item.removeClass('ui-state-default').addClass('ui-state-active');
      detailsdiv.empty().append(fssoy.layerdetaildiv({
        'item': layeritem[0]
      })).show();
      legend.show();
    }
  } else if (item.text() == 'Refresh') {
    var type = listitem.attr('itemtype')
    var layer = s.ol.layers[type][layerid];
    if (layer.query_vector) {
      layer.query_vector();
    } else {
      layer.redraw(true);
    }
  } else if ($(item).hasClass('inspect-features')) {
    if (item.hasClass('ui-state-active')) {
      s.inspect = false;
      item.removeClass('ui-state-active').addClass('ui-state-default');
    } else {
      $('.inspect-features.ui-state-active').removeClass('ui-state-active').addClass('ui-state-default');
      item.removeClass('ui-state-default').addClass('ui-state-active');
      var type = listitem.attr('itemtype');
      var layer = s.ol.layers[type][layerid];
      s.inspect = function (xy) {
        $.get(layer.url + '?' + $.param({
          LAYERS: layer.params.LAYERS,
          SRS: layer.params.SRS,
          SERVICE: layer.params.SERVICE,
          VERSION: layer.params.VERSION,
          REQUEST: 'GetFeatureInfo',
          BBOX: s.ol.olmap.getExtent().toBBOX(),
          INFO_FORMAT: 'text/plain',
          X: xy.x,
          Y: xy.y,
          HEIGHT: $(s.ol.olmap.div).height(),
          WIDTH: $(s.ol.olmap.div).width()
        }), function (data) {
          if (data.slice(0, 2) == 'no') {
            alert(data)
          } else {
            alert(s.ol.olmap.getLonLatFromPixel(xy) + '\n' + data.split('\n').slice(1).join('\n'));
          }
        });
      }
    }
  }
}
// This gets called by each layer on load

firesource.ui.layerSliderOpacity = function (element) {
  var listitem = $(element).parents('li.listitem');
  var layerid = listitem.attr('itemid');
  var type = listitem.attr('itemtype');
  var layer = s.ol.layers[type][layerid];
  if (layer.shown) {
    listitem.find('input[id^=toggle-]').prop('checked', true).change();
  }
  if (layer.opacity != undefined) {
    return layer.opacity;
  } else {
    return 1;
  }
}
$('ul#layers').live('change', firesource.ui.actions.layerChange).live('slide', firesource.ui.actions.layerSlide).live('mouseup', firesource.ui.actions.layerMouseUp);
firesource.ui.actions.contentSearch = function (e) {
  // expects a link with an attribute of searchid
  var tags = $(e.target).attr('searchid')
  $('div#contents input[id*=searchtext]:visible').val(tags).keyup();
}
$('div.listtags ul.list a').live('click', firesource.ui.actions.contentSearch);
//add map hover handler
firesource.ui.mapMouseOver = function (e) {
  if (e.target._featureId) {
    var layerid = $(e.target).parents('div.olLayerDiv').attr('id');
    var layer = s.ol.olmap.getLayersBy('id', layerid) [0];
    var feature = layer.getFeatureById(e.target._featureId);
    firesource.ol.hoverdetails(feature);
  } else {
    firesource.ol.hoverdetails(null);
  }
}
$('div#map').live('mouseover', firesource.ui.mapMouseOver);
firesource.ui.restoreLayerState = function (layerid) {
  //get layer states
  //add handlers
  var layers = $('ul#layers');
  var activelayerstoggle = layers.find('input[id^=toggle-]:checked');
  if (layerid) {
    layersliders = layers.find('li.listitem[itemid^=' + layerid + ']').find('div[id^="slider-"]'); //slider for layer in parameter
  } else {
    layersliders = layers.children('li.listitem').find('div[id^="slider-"]').reverse(); //starts with imagery
  }
  layersliders.each(function () {
    var slider = $(this)
    slider.slider({
      range: 'min',
      value: Math.round(firesource.ui.layerSliderOpacity(slider) * 100)
    });
  });
  s.ol.olmap.resetLayersZIndex();
  if (!layerid) {
    $.each(activelayerstoggle, function (index, layertoggle) {
      layertoggle.checked = true;
    });
    activelayerstoggle.change();
    layers.sortable({
      placeholder: 'ui-state-highlight',
      update: function (e, ui) {
        var listitem = ui.item;
        var newindex = listitem.siblings().length - listitem.index();
        var layerid = listitem.attr('itemid')
        var type = listitem.attr('itemtype')
        var layer = s.ol.layers[type][layerid];
        s.ol.olmap.setLayerIndex(layer, newindex);
        s.ol.olmap.resetLayersZIndex();
      }
    });
  }
}
firesource.ui.actions.vectorChange = function (e) {
  var toggle = $(e.target)
  if (!toggle.is('input[id^=toggle-]')) {
    return;
  }
  var listitem = toggle.parents('li.listitem')
  var featureid = listitem.attr('featureid')
  var feature = s.ol.activeVector.getFeatureById('OpenLayers.Feature.' + featureid);
  if (feature) {
    if (toggle[0].checked) {
      s.ol.controls.select.select(feature);
    } else {
      s.ol.controls.select.unselect(feature);
    }
  }
}
firesource.ui.actions.vectorMouseUp = function (e) {
  var item = $(e.target);
  var listitem = item.parents('li.listitem');
  var featureid = listitem.attr('featureid');
  var editdiv = listitem.find('div.edit-vector');
  var othereditdivs = listitem.siblings().find('div.edit-vector');
  var detailsdiv = listitem.find('div.details-vector');
  var tagsp = listitem.find('p.tags');
  if (item.text() == 'Tags') {
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show();
    }
  } else if (item.text() == 'Detail') {
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      var feature = firesource.ol.getFeaturesBy('id', s.ol.activeVector, featureid) [0];
      feature.attributes.symboltext = feature.attributes.symbol.split('/') [1].replace(/_/g, ' ')
      detailsdiv.empty().append(fssoy.resourcedetaildiv({
        'item': feature.attributes
      })).show();
    }
  }
}
$('ul#vectors').live('change', firesource.ui.actions.vectorChange).live('mouseup', firesource.ui.actions.vectorMouseUp);
firesource.ui.returnFeatureData = function (feature) {
  var searchtags = '';
  $.each(feature.attributes, function (key, value) {
    if (value && key[0] != '_') {
      value = value + '';
      if (key == 'tags') {
        searchtags += value;
      } else {
        searchtags += key.replace(/\W+/g, '_') + ':' + value.replace(/\W+/g, '_') + ', ';
      };
    }
  });
  searchtags = searchtags.toLowerCase().slice(0, - 2);
  feature.attributes.logged_time_str = dateFormat(timezoneDate(feature.attributes.logged_time), 'dd/mm/yyyy HH:MM');
  var data = {
    'attributes': feature.attributes,
    'id': feature.id.split('.').pop(),
    'searchtags': searchtags,
    'is_staff': django_permissions.is_staff
  }
  return data;
}
firesource.ui.updateDataTable = function (table, layer) {
  if (!layer.features || layer.features.length == 0) {
    return false;
  } else {
    firesource.ui.setMessageText('Updating attributes...');
  }
  table.fnClearTable();
  var columns = [
  ]
  table.find('th').each(function () {
    columns.push($(this).text())
  })
  var rows = jLinq.from(layer.features).select(function (f) {
    var row = [
    ]
    if (f.fid == null) {
      f.fid = layer.name + '.-1';
    }
    $.each(columns, function (index, value) {
      if (value == 'fid') {
        row.push('<a onclick="firesource.ol.zoomToFid(\'' + f.fid + '\'); return false;">' + f.fid.split('.') [1] + '</a>'); // just get number
      } else {
        row.push(f.attributes[value]);
      }
    });
    return row;
  });
  s.ui.dtable.fnAddData(rows);
  return true;
}
firesource.ui.actions.viewsMouseUp = function (e) {
  var item = $(e.target);
  var listitem = item.parents('li.listitem');
  var viewid = listitem.attr('itemid');
  var editdiv = listitem.find('div.edit-view');
  var othereditdivs = listitem.siblings().find('div.edit-view');
  var detailsdiv = listitem.find('div.details-view');
  var tagsp = listitem.find('p.tags');
  var viewobject = s.ol.userviews[viewid];
  if (item.text() == 'Tags') {
    if (tagsp.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      tagsp.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      tagsp.show();
    }
  } else if (item.text() == 'Detail') {
    if (detailsdiv.is(':visible')) {
      item.removeClass('ui-state-active').addClass('ui-state-default');
      detailsdiv.hide();
    } else {
      if (editdiv.is(':visible')) {
        item.siblings('a.edit').removeClass('ui-state-active').addClass('ui-state-default');
        editdiv.hide();
      }
      item.removeClass('ui-state-default').addClass('ui-state-active');
      detailsdiv.empty().append('details div').show();
    }
  } else if (item.text() == 'Load') { //load map to screen
    firesource.ol.loadView(viewobject);
  } else if (item.text() == 'Update') {
    firesource.ui.createView(viewobject.type, viewobject.name);
  }
}
$('ul#views').live('mouseup', firesource.ui.actions.viewsMouseUp);
firesource.ui.renderVectors = function (layer) {
  var vectors = $('ul#vectors');
  vectors.empty();
  if (layer.features.length > 0) {
    $.each(layer.features, function (index, feature) {
      if (feature.cluster) {
        $.each(feature.cluster, function (index, f) {
          if (f.cluster == undefined) {
            vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(f)));
          }
        });
      } else if (feature.cluster == undefined) {
        vectors.append(fssoy.vectorItem(firesource.ui.returnFeatureData(feature)));
      }
    });
    if (!django_permissions.is_staff) {
      vectors.find('a[text=Edit]').remove();
    }
  }
}
jQuery.expr[':'].regex = function (elem, index, match) {
  regexFlags = 'ig',
  regex = new RegExp(match[3], regexFlags);
  return regex.test(jQuery(elem).text());
}
jQuery.expr[':'].toggled = function (elem, index, match) {
  return jQuery(elem).find('input[id^=toggle]:checked').length == 1;
}
// search is a space separated string of search terms
// list is a $(element) containing listitems to filter by id
// matches to the search

firesource.ui.search = function (search, list) {
  if (search == '') {
    //show everything on blank search
    list.find('li.listitem').show();
    return true;
  } else {
    // hide everything
    list.find('li.listitem').hide()
    if (search.search('regex:') == 0) {
      list.find('li.listitem:regex("' + search.slice(6) + '")').show();
      return true;
    } else {
      //basic and/or
      var terms = search.split(' ');
      var andstring = '';
      var orstring = '';
      var extras = '';
      $.each(terms, function (index, term) {
        if (term == 'checked') {
          extras += ':toggled';
        } else {
          orstring += term + '|';
          andstring += '(?=.*' + term + ')';
        }
      });
      if (orstring != '') {
        orstring = ':regex("' + orstring.slice(0, - 1) + '")';
      };
      if (andstring != '') {
        andstring = ':regex("' + andstring + '")';
      };
      var results = list.find('li.listitem' + andstring + extras);
      if (results.length > 0) {
        results.show();
      } else {
        list.find('li.listitem' + orstring + extras).show();
      }
      return true;
    }
  }
}
firesource.ui.setHistoryFields = function (milliseconds) {
  now = new Date();
  $('input#vector-history-to-date').val(now.format('dd/mm/yyyy'));
  $('input#vector-history-to-time').val(now.format('HH:MM'));
  from = new Date(now.getTime() - milliseconds);
  $('input#vector-history-from-date').val(from.format('dd/mm/yyyy'));
  $('input#vector-history-from-time').val(from.format('HH:MM'));
}
firesource.ui.renderMapControls = function () {
  //zoomslider for map
  s.ui.zoomslider = $('div.slider-ui-zoom');
  s.ui.zoomslider.children('.slider').slider({
    range: 'min',
    min: 0,
    max: 17,
    orientation: 'vertical',
    stop: function (event, ui) {
      s.ol.olmap.zoomTo(ui.value);
    }
  });
  s.ui.zoomslider.children('.gisicon-zoomin').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomin'
    }
  }).click(function () {
    s.ol.olmap.zoomIn()
  });
  s.ui.zoomslider.children('.gisicon-zoomout').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomout'
    }
  }).click(function () {
    s.ol.olmap.zoomOut()
  });
  //make awesome layouts
  s.ui.bodyLayout = $('body').layout({
    fxName: 'none',
    north__size: 26,
    north__resizable: false,
    west__size: 420,
    west__minSize: 360,
    west__maxSize: ($(window).width() * 0.5),
    west__onresize: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    west__onopen: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    west__onclose: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__initHidden: true,
    south__size: ($(window).height() * 0.3),
    south__maxSize: ($(window).height() * 0.5),
    south__minSize: ($(window).height() * 0.1),
    south__onresize: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__onopen: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()',
    south__onclose: 'firesource.ol.jiggleMap(s.ol.olmap);s.ui.contentsLayout.resizeAll()'
  });
  s.ui.contentsLayout = $('div#contents').layout({
    fxName: 'none',
    north__size: 30,
    north__closable: false,
    north__resizable: false,
    center__onresize: 's.ui.contentdivLayout.resizeAll',
    center__onopen: 's.ui.contentdivLayout.resizeAll',
    south__size: ($(window).height() * 0.3),
    south__maxSize: ($(window).height() * 0.5),
    south__minSize: ($(window).height() * 0.1)
  });
  s.ui.contentdivLayout = $('div#contents').children('.ui-layout-center').layout({
    fxName: 'none',
    north__size: 28,
    north__closable: false,
    north__resizable: false,
    west__size: 120,
    west__resizable: false,
    south__initHidden: true,
    south__resizable: false,
    south__size: 150
  });
  //left toolbar buttons
  $('input#controlpan').button({
    text: false,
    icons: {
      primary: 'gisicon-pan'
    }
  }).click(function () {
    firesource.ol.toggleControl('navigate')
    s.ol.olmap.resetLayersZIndex();
  });
  $('input#controlselect').button({
    text: false,
    icons: {
      primary: 'gisicon-select'
    }
  }).click(function () {
    firesource.ol.toggleControl('select')
    s.ol.olmap.resetLayersZIndex();
  });
  $('button#controldeselect').button({
    text: false,
    icons: {
      primary: 'gisicon-deselect'
    }
  }).click(function () {
    while (s.ol.activeVector.selectedFeatures.length > 0) {
      s.ol.controls.select.unselect(s.ol.activeVector.selectedFeatures[0]);
    };
    $('ul#vectors').find('li.listitem').find('input[id^=toggle-]').attr('checked', false);
  });
  $('input#controlmline').button({
    text: false,
    icons: {
      primary: 'gisicon-mline'
    }
  }).click(function () {
    firesource.ol.toggleControl('measureLine')
  });
  s.ol.controls.measureLine.events.on({
    'measure': firesource.ol.handleMeasurements,
    'measurepartial': firesource.ol.handleMeasurements
  });
  $('input#controlmarea').button({
    text: false,
    icons: {
      primary: 'gisicon-marea'
    }
  }).click(function () {
    firesource.ol.toggleControl('measureArea')
  });
  s.ol.controls.measureArea.events.on({
    'measure': firesource.ol.handleMeasurements,
    'measurepartial': firesource.ol.handleMeasurements
  });
  $('button#controlnewdrawing').button({
    text: false,
    icons: {
      primary: 'gisicon-new'
    }
  }).click(function () {
    var drawingname = window.prompt('Please enter a name for your new drawing');
    if (drawingname == null || drawingname == '') {
      firesource.ui.setMessageText('Can\'t create a drawing with no name!')
    } else {
      firesource.ui.createDrawing(drawingname);
    }
  });
  $('button#controlnewview').button({
    text: false,
    icons: {
      primary: 'gisicon-newview'
    }
  }).click(function () {
    $('div#createviewdialog').dialog('open')
  });
  $('button#controlquickpdf').button({
    text: false,
    icons: {
      primary: 'gisicon-quickpdf'
    }
  }).click(function () {
    var name = window.prompt('Map title?', 'Quick Print');
    url = '/apps/spatial/print.pdf?' + $.param({
      'name': name
    }) + '&' + document.location.hash.slice(1);
    window.open(url);
  });
  $('button#controlquickjpg').button({
    text: false,
    icons: {
      primary: 'gisicon-quickjpg'
    }
  }).click(function () {
    var name = window.prompt('Map title?', 'Quick Print');
    url = '/apps/spatial/print.jpg?' + $.param({
      'name': name
    }) + '&' + document.location.hash.slice(1);
    window.open(url);
  });
  $('#controlzoomselect').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomselect'
    }
  }).click(function () {
    firesource.ol.zoomToSelected()
  });
  $('#controlzoomdefault').button({
    text: false,
    icons: {
      primary: 'gisicon-zoomdefault'
    }
  }).click(function () {
    s.ol.olmap.zoomToExtent(s.ol.bounds)
  });
  $('#controlprevview').button({
    text: false,
    icons: {
      primary: 'gisicon-prevview'
    }
  }).click(function () {
    s.ol.navigationHistory.jump('previous', 1)
  });
  $('#controlnextview').button({
    text: false,
    icons: {
      primary: 'gisicon-nextview'
    }
  }).click(function () {
    s.ol.navigationHistory.jump('next', 1)
  });
  $('input#toggletools').button().toggle(function () {
    s.ui.zoomslider.hide();
    $('div#declogo').hide();
    $('div#openlogo').hide();
    $('div#mouseposition').hide();
    $('span.tools').hide();
    $('input#toggletools') [0].checked = false;
    $('input#toggletools').button('refresh');
  }, function () {
    s.ui.zoomslider.show();
    $('div#declogo').show();
    $('div#openlogo').show();
    $('div#mouseposition').show();
    $('span.tools').show();
    $('input#toggletools') [0].checked = true;
    $('input#toggletools').button('refresh');
  }).attr('checked', true).button('refresh');
  $('label[for=toggletools]').mouseenter(function () {
    if (!$(this).is('.ui-state-active')) {
      $('span.tools').fadeIn();
    }
  });
  $('span#toolset').buttonset();
  $('span#viewset').buttonset();
  $('input#toggletools').attr('checked', true);
  $('input#toggletools').change();
  $('span.tools').fadeIn();
  $('span#editset').buttonset().hide();
  //right toolbar buttons
  $('button#buttonrefresh').button({
    text: false,
    icons: {
      primary: 'ui-icon-refresh'
    }
  }).click(function () {
    $('ul#layers li.listitem input:checked').parents('li.listitem').find('a:contains(Refresh)').mouseup()
  });
  $('#refreshset').buttonset();
  //add icon classes
  $('span[class*=\'gisicon\']').addClass('gis-icon');
  //render about dialog
  $('div#aboutdialog').dialog({
    resizable: false
  }).bind('dialogclose', function (event, ui) {
    $('input#toggleabout').attr('checked', false).button('refresh');
  }).bind('dialogopen', function (event, ui) {
    $('input#toggleabout').attr('checked', true).button('refresh');
  });
  //reset about dialog position
  var aboutlabel = $('label[for=toggleabout]')
  var aboutx = aboutlabel.position() ['left'] + aboutlabel.width();
  var abouty = aboutlabel.position() ['top'] + aboutlabel.height() + 6;
  firesource.ui.anchor({
    'x': aboutx,
    'y': abouty
  }, $('div#aboutdialog'), 'top-right');
  //DateTime widgets for resource history
  $('input#vector-history-from-date').datepicker({
    'dateFormat': 'dd/mm/yy',
    'showAnim': '',
    'maxDate': '+0d'
  });
  $('input#vector-history-to-date').datepicker({
    'dateFormat': 'dd/mm/yy',
    'showAnim': '',
    'maxDate': '+0d'
  });
  $('a#clear-history-button').click(function () {
    s.ol.layers.vector.history.destroyFeatures();
    s.ol.layers.vector.history_lines.destroyFeatures();
    s.ol.layers.vector.history_lines.setVisibility(false);
    s.ol.layers.vector.history.setVisibility(false);
  });
  $('a#go-history-button').click(function () {
    //get selected vectors
    var selectedVectors = new Array();
    $('ul#vectors').find('input[id^=toggle-]:checked').parents('li.listitem').each(function () {
      selectedVectors.push(firesource.ol.getFeaturesBy('id', s.ol.activeVector, $(this).attr('featureid')) [0].attributes.deviceid);
    });
    if (selectedVectors.length < 1) {
      firesource.ui.setMessageText('Please select one or more vectors.');
    }
    //validate both timefields, if false, return out of function

    if (!firesource.ui.checkTimeField($('input#vector-history-from-time')) || !firesource.ui.checkTimeField($('input#vector-history-to-time'))) {
      firesource.ui.setMessageText('Validate time fields');
      return;
    }
    //get timezone offset

    var offset = new Date().getTimezoneOffset() * 60000;
    var datefrom = $('input#vector-history-from-date').val();
    datefrom = datefrom.split('/');
    var timefrom = $('input#vector-history-from-time').val();
    //rearrange day and month - required for javascript Date
    var datefrom = datefrom[1] + '/' + datefrom[0] + '/' + datefrom[2] + ' ' + timefrom + ':00';
    //convert to milliseconds using getTime()
    var unixdatefrom = new Date(datefrom).getTime();
    //apply timezone offset
    unixdatefrom += offset;
    datefrom = new Date(unixdatefrom).format('yyyy-mm-dd HH:MM');
    var dateto = $('input#vector-history-to-date').val();
    dateto = dateto.split('/');
    var timeto = $('input#vector-history-to-time').val();
    //rearrange day and month - required for javascript Date
    var dateto = dateto[1] + '/' + dateto[0] + '/' + dateto[2] + ' ' + timeto + ':00';
    //convert to milliseconds using getTime()
    var unixdateto = new Date(dateto).getTime();
    //apply timezone offset
    unixdateto += offset;
    dateto = new Date(unixdateto).format('yyyy-mm-dd HH:MM');
    //get queried layer index and adjust by one
    s.ol.historyLayerIndex = s.ol.olmap.getLayerIndex(s.ol.activeVector) - 1;
    s.ol.activeVector.query_history(datefrom, dateto, selectedVectors);
  });
  //render maps, layers and vector stuff
  $('label[for=views-tab]').mouseup(function () {
    //hide other divs
    $('div#views-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#views-div-north'));
    pane.children('div.ui-layout-west').append($('div#views-div-west'));
    pane.children('div.ui-layout-center').append($('div#views-div-center'));
    s.ui.contentdivLayout.hide('south');
    $('select#vectors-select').removeClass('ui-state-active').addClass('ui-state-default');
  });
  $('label[for=layers-tab]').mouseup(function () {
    //hide other divs
    $('div#layers-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#layers-div-north'));
    pane.children('div.ui-layout-west').append($('div#layers-div-west'));
    pane.children('div.ui-layout-center').append($('div#layers-div-center'));
    s.ui.contentdivLayout.hide('south');
    s.ui.contentdivLayout.show('west');
    $('select#vectors-select').removeClass('ui-state-active').addClass('ui-state-default');
  });
  $('label[for=vectors-tab]').mouseup(function () {
    //hide other divs
    $('div#vectors-div').siblings().each(function () {
      $(this).append($('div[id^=' + this.id + '-]'))
    });
    //show div for clicked button
    var pane = $('#contents').children('div.ui-layout-center');
    pane.children('div.ui-layout-north').append($('div#vectors-div-north'));
    pane.children('div.ui-layout-west').append($('div#vectors-div-west'));
    pane.children('div.ui-layout-center').append($('div#vectors-div-center'));
    pane.children('div.ui-layout-south').append($('div#vectors-div-south'));
    s.ui.contentdivLayout.show('south');
    s.ui.contentdivLayout.show('west');
    s.ui.contentdivLayout.sizePane('south', 150);
    $('select#vectors-select').removeClass('ui-state-default').addClass('ui-state-active');
  });
  $('div#contentstabs').buttonset();
  $('input#viewsearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#views'));
  });
  $('label[for=layers-tab]').click().mouseup();
  $('input#layersearchtoggle').change(function () {
    var state = this.checked;
    $('ul#layers').find('input[type!=radio][id^=toggle-]:visible').each(function () {
      this.checked = state;
      $(this).change()
    });
  });
  $('input#layersearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#layers'));
  });
  $('input#vectorsearchtoggle').change(function () {
    var state = this.checked;
    $('ul#vectors').find('input[id^=toggle-]:visible').each(function () {
      this.checked = state;
      $(this).change()
    });
  });
  $('input#vectorsearchtext').keyup(function () {
    firesource.ui.search($(this).val(), $('ul#vectors'));
  });
  $('select#vectors-select').change(function () {
    if (s.ol.activeVector && s.ol.activeVector.protocol && s.ol.activeVector.protocol.CLASS_NAME == 'OpenLayers.Protocol.WFS.v1_1_0') {
      // bail if edit session active
      return;
    }
    var layerid = $(this).val();
    if (layerid != s.ui.states.selectedVector) {
      s.ui.states.vectorsBuilt = false;
      s.ui.states.selectedVector = layerid;
      s.ol.activeVector = s.ol.layers.vector[layerid];
    }
    if (!s.ui.states.vectorsBuilt && s.ol.activeVector) {
      if ($('ul#vectors').find('input[id^=toggle-]:checked').length > 0) {
        firesource.ui.setMessageText('Refreshing Vectors - selections have been cleared');
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
    if ($('ul#vectors').is(':visible')) {
      $('label[for=vectors-tab]').mouseup();
    }
    $('input#vectorsearchtext').keyup();
  });
  // complex click events
  $('input#controlcreatemap').click(firesource.ui.createMap);
  $('input#controlcreatetheme').click(firesource.ui.createTheme);
  $('form#layerlegendform a').click(firesource.ui.createLayerLegend);
  $('a#lasthour-history').click(function () {
    firesource.ui.setHistoryFields(60 * 60 * 1000);
  }).click(); //1 hour in milliseconds
  $('a#last3hours-history').click(function () {
    firesource.ui.setHistoryFields(3 * 60 * 60 * 1000);
  }); //3 hours in milliseconds
  $('a#lastday-history').click(function () {
    firesource.ui.setHistoryFields(24 * 60 * 60 * 1000);
  }); //1 day in milliseconds
  $('a#lastweek-history').click(function () {
    firesource.ui.setHistoryFields(7 * 24 * 60 * 60 * 1000);
  }); //1 week in milliseconds
  $('a#lastmonth-history').click(function () {
    firesource.ui.setHistoryFields(31 * 24 * 60 * 60 * 1000);
  }); //31 days in milliseconds
  // simple click events
  $('a#allvectors').click(function () {
    $('input#vectorsearchtext').val('').keyup()
  });
  $('a#selectedvectors').click(function () {
    $('input#vectorsearchtext').val('checked').keyup()
  });
  //wire buttons
  $('div#createviewdialog').dialog({
    'modal': true,
    'draggable': false,
    'resizable': false,
    'width': 'auto',
    'height': 'auto'
  }).dialog('close');
  $('div#aboutdialog').dialog('close');
  $('input#toggleabout').button().toggle(function () {
    $('div#aboutdialog').dialog('open');
    $(e.target).attr('checked', true).button('refresh');
  }, function () {
    $('div#aboutdialog').dialog('close');
    $(e.target).attr('checked', false).button('refresh');
  });
  $('div#settingsdialog').dialog('close');
  $('input#togglesettings').button().toggle(function (e) {
    $('div#settingsdialog').dialog('open');
    $(e.target).attr('checked', true).button('refresh');
  }, function (e) {
    $('div#settingsdialog').dialog('close');
    $(e.target).attr('checked', false).button('refresh');
  });
  $('input#togglecontents').button().toggle(function (e) {
    s.ui.bodyLayout.close('west');
    $(e.target).attr('checked', false).button('refresh');
  }, function (e) {
    s.ui.bodyLayout.open('west');
    $(e.target).attr('checked', true).button('refresh');
  }).attr('checked', true).button('refresh');
}
//dialog anchor function
//position - dict of x,y e.g. [200,300]
//dialog_box - jquery dialog-content
//corner - corner of the dialog you wish to anchor to the given position

firesource.ui.anchor = function (position, dialog_box, corner) {
  x = position['x']
  y = position['y']
  if (corner == 'top-left') {
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'top-right') {
    x -= dialog_box.width();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'bottom-left') {
    y -= dialog_box.height();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  } else if (corner == 'bottom-right') {
    x -= dialog_box.width();
    y -= dialog_box.height();
    dialog_box.dialog('option', 'position', [
      x,
      y
    ]);
  }
}
firesource.ui.checkTimeField = function (field) {
  if (field.val) { //case jquery for input object
    value = field.val()
  } else { //case html input object
    value = field.value
  }
  // regular expression to match required time format

  re = /^(\d{1,2}):(\d{2})$/;
  if (value != '') {
    if (regs = value.match(re)) {
      // 24-hour time format
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
}


//requires openlayers and proj4js
goog.provide('firesource');
goog.require("firesource.session");//creates global vars and shortcuts
goog.require("firesource.ui");
goog.require('firesource.forms');
goog.require("firesource.ol");

firesource.setupmap = function() {
    //build ui framework
    firesource.ui.renderMapControls();

    s.ol.bounds = new OpenLayers.Bounds(
                115.866, -38.242,
                132.001, -16.51
    );
    //firesource.ol.maps.gda94 takes a div and bounds
    s.ol.olmap = firesource.ol.maps.gda94(document.getElementById("map"), s.ol.bounds);
    s.ol.sldformat = new OpenLayers.Format.SLD.v1();
    s.ol.geojsonformat = new OpenLayers.Format.GeoJSON();
    $(window).resize(function() {
        firesource.ol.jiggleMap(s.ol.olmap);
    });

    //loading for ajax
    $.loading({onAjax:true, delay:100, pulse:'ellipsis'});
    var trackingUpdate = function() {
        $("li[itemid^=resource_tracking] a:contains(Refresh)").mouseup();
    }
    setInterval(trackingUpdate, 60000)

    //get layers & maps, probably should be renamed to static assets
    $.get('/apps/spatial/layers.json', function(data) {
        firesource.session.updateResults(data);
    });
}

//loads once dom is ready
$(document).ready(function() {
    //should detect divs and load appropriate js
    if ($('#map').length) {
        firesource.setupmap()
    } else {
        firesource.forms.decorate()
    }
});

