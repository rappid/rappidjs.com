
define('xaml',[], function () {
    var fs, createXhr,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        fetchXaml = function (url, callback) {
            throw new Error('Environment unsupported.');
        },
        buildMap = {},
        importRegEx = /((?:xaml!)?[a-z]+(\.[a-z]+[a-z0-9]*)*)/mgi;


    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        }
    }

    /**
     * IE8 FIXES
     * @param domNode
     */
    var localNameFromDomNode = function (domNode) {
        if (domNode.localName) return domNode.localName;

        var st = domNode.tagName.split(":");
        return st[st.length - 1];
    };

    function hasContent(string) {
        return /\S/.test(string);
    }

    function getDependency(namespace, localName, namespaceMap, xamlClasses, rewriteMap) {

        namespaceMap = namespaceMap || {};
        rewriteMap = rewriteMap || {};
        xamlClasses = xamlClasses || [];

        namespace = (namespaceMap[namespace] || namespace).replace(/\./g, '/');
        var fqClassName = [namespace, localName].join("/");


        for (var i = 0; i < rewriteMap.length; i++) {
            var entry = rewriteMap[i];
            if (entry.$from && entry.$to) {
                if (entry.$from.test(fqClassName)) {
                    fqClassName = fqClassName.replace(entry.$from, entry.$to);

                    break;
                }
            }
        }

        if (xamlClasses.indexOf(fqClassName) !== -1) {
            fqClassName = "xaml!" + fqClassName;
        }

        return fqClassName.replace(/\./g, "/");
    }

    function getTextContentFromNode(a) {
        var b = a.textContent || a.text || a.data;
        if (!b) {
            b = "";
            for (var c = 0; c < a.childNodes.length; c++) {
                var d = a.childNodes[c];
                if (d.nodeType == 1 || d.nodeType == 4) b += this._getTextContentFromDescriptor(d);
            }
        }
        return b;
    }

    function findDependencies(xaml, namespaceMap, xamlClasses, rewriteMap, imports) {

        var ret = [];

        function findDependencies(domNode) {

            var localName = localNameFromDomNode(domNode);

            var dep = getDependency(domNode.namespaceURI, localName, namespaceMap, xamlClasses, rewriteMap);
            // console.log(dep);
            if (dep == "js/core/Imports") {
                for (var t = 0; t < domNode.childNodes.length; t++) {
                    var importNode = domNode.childNodes[t];
                    if (importNode.nodeType == 3) {
                        // text node
                        var m;

                        var textContent = getTextContentFromNode(importNode);
                        while ((m = importRegEx.exec(textContent + " ")) != null) {
                            var importClass = m[0].replace(/\./g, "/");
                            if (importClass !== "undefined") {
                                if (ret.indexOf(importClass) == -1) {
                                    ret.push(importClass);
                                }

                                if (imports) {
                                    imports.push(importClass);
                                }
                            }
                        }
                    }
                }
            }

            if (ret.indexOf(dep) == -1) {
                ret.push(dep);
            }

            for (var i = 0; i < domNode.childNodes.length; i++) {
                var childNode = domNode.childNodes[i];
                // element
                if (childNode.nodeType == 1) {
                    findDependencies(childNode);
                }
            }

        }

        if (xaml) {
            findDependencies(xaml);
        }

        return ret;
    }

    function findScripts(xaml, namespaceMap, xamlClasses, rewriteMap) {
        var ret = [];

        for (var i = 0; i < xaml.childNodes.length; i++) {
            var node = xaml.childNodes[i];
            if (node.nodeType == 1) {
                if ("js/core/Script" == getDependency(node.namespaceURI, localNameFromDomNode(node), namespaceMap, xamlClasses, rewriteMap)) {
                    ret.push(node);
                }
            }
        }

        return ret;
    }

    function getDeclarationFromScripts(scripts) {
        var ret = {};

        if (scripts) {
            for (var s = 0; s < scripts.length; s++) {
                var script = scripts[s];
                for (var fn in script) {
                    if (script.hasOwnProperty(fn)) {
                        ret[fn] = script[fn];
                    }
                }
            }
        }

        return ret;
    }

    if ((typeof window !== "undefined" && window.navigator && window.document) || typeof importScripts !== "undefined") {
        // Browser action
        createXhr = function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else {
                for (i = 0; i < 3; i++) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {
                    }

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            if (!xhr) {
                throw new Error("getXhr(): XMLHttpRequest not available");
            }

            return xhr;
        };

        fetchXaml = function (url, callback) {
            var xhr;

            try {
                xhr = createXhr();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.responseXML) {
                            callback(null, xhr.responseXML);
                        } else {
                            callback("no responseXML found");
                        }
                    }
                };
                xhr.send(null);
            } catch (e) {
                callback(e);
            }
        };
        // end browser.js adapters
    } else if (typeof process !== "undefined" && process.versions && !!process.versions.node) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        fetchXaml = function (path, callback) {
            try {
                var content = fs.readFileSync(path, 'utf8');
                callback(null, require.nodeRequire('libxml').parseFromString(content));
            } catch (e) {
                callback(e);
            }
        };
    }


    return {

        write: function (pluginName, name, write) {

            if (name in buildMap) {
                var text = buildMap[name];
                write.asModule(pluginName + "!" + name, text);
            }
        },

        version: '0.2.0',

        load: function (name, parentRequire, load, config) {

            var url = parentRequire.toUrl(name + ".xml");

            fetchXaml(url, function (err, xml) {
                if (!err && xml) {

                    // require all dependencies
                    var imports = [],
                        importStartIndex = 1;

                    var dependencies = findDependencies(xml.documentElement,
                        config.namespaceMap, config.xamlClasses, config.rewriteMap, imports);

                    var scripts = findScripts(xml.documentElement,
                        config.namespaceMap, config.xamlClasses, config.rewriteMap);

                    if (scripts.length > 1) {
                        throw "only one script block allowed in XAML";
                    }

                    if (scripts.length > 0) {
                        // at least one script
                        dependencies.splice(1, 0, "js/core/Script");
                        importStartIndex++;
                    }

                    if (imports.length > 0) {
                        // add imports after start index
                        dependencies = dependencies.slice(0, importStartIndex)
                            .concat(imports)
                            .concat(dependencies.slice(importStartIndex));
                    }

                    if (config.isBuild) {

                        dependencies.splice(1, 0, "js/core/Element");
                        importStartIndex++;

                        var text = "define(%dependencies%, %function%)";
                        var fn = "function(baseClass, ELEMENT %parameter%){return baseClass.inherit({ %classDefinition% _$descriptor: ELEMENT.xmlStringToDom(%descriptor%)})}";

                        for (var i = 0; i < dependencies.length; i++) {
                            dependencies[i] = "'" + dependencies[i] + "'";
                        }

                        text = text.replace('%dependencies%', '[' + dependencies.join(',') + ']');

                        var xmlContent = xml.documentElement.toString()
                            .replace(/((\r\n|\n|\r)[\s\t]*)/gm, "")
                            .replace(/'/g, "\\'")
                            .replace(/<js:Script[^>]*>[\s\S]*<\/js:Script[^>]*>/, "");

                        var parameter = "",
                            classDefinition = "";

                        if (scripts.length > 0) {
                            var script = scripts[0].toString();

                            var rScriptExtractor = /^[\s\S]*?function\s*\(([\s\S]*?)\)[\s\S]*?\{[\s\S]*?return[\s\S]*?\{([\s\S]*)\}[\s\S]*?\}[\s\S]*?\)[^)]*$/;
                            var result = rScriptExtractor.exec(script);

                            if (result) {
                                // get parameter and trim
                                if (hasContent(result[1])) {
                                    // add comma for separate from baseClass
                                    parameter = ",SCRIPT," + result[1];
                                }

                                if (hasContent(result[2])) {
                                    classDefinition = result[2] + ','
                                }

                            } else {
                                throw "Error parsing script block";
                            }

                        }

                        fn = fn.replace('%parameter%', parameter);
                        fn = fn.replace('%classDefinition%', classDefinition);
                        fn = fn.replace('%descriptor%', "'" + xmlContent + "'");

                        text = text.replace('%function%', fn);
                        load.fromText(name, "(function () {"+text+"}).call(this);");

                        buildMap[name] = text;

                        parentRequire([name], function (value) {
                            load(value);
                        });
                    } else {
                        // first item should be the dependency of the document element
                        parentRequire(dependencies, function (value) {

                            // dependencies are loaded
                            var baseClass = arguments[0],
                                Script = arguments[1];

                            var args = Array.prototype.slice.call(arguments);

                            var scriptObjects = [];
                            var importedClasses = args.slice(importStartIndex);

                            if (scripts.length > 0) {
                                for (var s = 0; s < scripts.length; s++) {
                                    try {
                                        var scriptInstance = new Script(null, scripts[s]);
                                        scriptObjects.push(scriptInstance.evaluate(importedClasses));
                                    } catch (e) {
                                        load.error(new Error(name + ": Script cannot be loaded" + e));
                                    }
                                }
                            }

                            var xamlFactory = baseClass.inherit(
                                getDeclarationFromScripts(scriptObjects)
                            );

                            xamlFactory.prototype._$descriptor = xml.documentElement;

                            load(xamlFactory);
                        }, function(err) {
                            load.error(err);
                        });
                    }
                } else {
                    load.error(new Error("XML " + url + " not found." + err));
                }
            });
        }
    }
});



define('inherit', function () { var inherit;

(function (global, exports) {

    /**
     *
     * @param {String} [constructorName] The name of the constructor
     * @param {Object} classDefinition The definition for the prototype methods
     * @param {Object} [staticDefinition] The definition for the prototype methods
     * @param {Function} [baseClass] The prototype to inherit from
     *
     * @return {Function} returns a constructor function describing the class
     */
    inherit = function (constructorName, classDefinition, staticDefinition, baseClass) {

        var args = Array.prototype.slice.call(arguments);

        if (args[0] instanceof Object) {
            args.unshift(null);
        }

        if (args[2] instanceof Function) {
            args.splice(2, 0, null);
        }

        constructorName = args[0];
        classDefinition = args[1] || {};
        staticDefinition = args[2] || {};
        baseClass = args[3] || Object;

        var newClass = function () {
            if (this.ctor) {
                return this.ctor.apply(this, arguments);
            }
        };

        if (baseClass.constructor instanceof Function) {

            function Inheritance() {
            }

            Inheritance.prototype = baseClass.prototype;

            newClass.prototype = new Inheritance();
            newClass.prototype.constructor = classDefinition;

            if (classDefinition && constructorName) {
                newClass.prototype.constructor.name = constructorName;
            }

            newClass.prototype.base = baseClass.prototype;

        } else {
            newClass.prototype = baseClass;
            newClass.prototype.constructor = classDefinition;
            newClass.prototype.base = baseClass;
        }

        for (var publicMethod in classDefinition) {
            if (classDefinition.hasOwnProperty(publicMethod)) {
                var baseFunction = newClass.prototype[publicMethod];
                newClass.prototype[publicMethod] = classDefinition[publicMethod];

                if (baseFunction instanceof Function) {
                    newClass.prototype[publicMethod].baseImplementation = baseFunction;
                }
            }
        }

        for (var staticMethod in staticDefinition) {
            if (staticDefinition.hasOwnProperty(staticMethod)) {
                newClass[staticMethod] = staticDefinition[staticMethod];
            }
        }

        newClass.prototype.callBase = inherit.callBase;

        return newClass;

    };

    inherit.callBase = function () {
        // get arguments
        var args = Array.prototype.slice.call(arguments);

        if (args.length == 0) {
            // use arguments from call
            args = Array.prototype.slice.call(arguments.callee.caller.arguments);
        }

        return arguments.callee.caller.baseImplementation.apply(this, args);
    };



    /***
     *
     * @param {String} [constructorName]
     * @param {Object} classDefinition The definition for the prototype methods
     * @param {Object} [staticDefinition]
     * @return {Function} returns a constructor function describing the class
     */
    Function.prototype.inherit = function (constructorName, classDefinition, staticDefinition) {

        var args = Array.prototype.slice.call(arguments);

        if (args[0] instanceof Object) {
            args.unshift(null);
        }

        return inherit(args[0], args[1], args[2], this);
    };

    Function.prototype.callBase = function () {
        var args = Array.prototype.slice.call(arguments);
        var that = args.shift();

        if (that && that.base) {
            var caller = arguments.callee.caller;

            if (this == caller) {
                return this.baseImplementation.apply(that, args);
            } else {
                return this.apply(that, args);
            }
        } else {
            throw "base not definied";
        }
    };

    Function.prototype.classof = function(factory) {
        if (!factory) {
            return false;
        }

        if (!(factory instanceof Function)) {
            throw new Error("factory must be a function");
        }

        return (factory === this || this.prototype instanceof factory);
    };

    /**
     * @property {Function} base class
     */
    inherit.Base = inherit({
        ctor: function () {
        }
    });

    exports.inherit = inherit;

})(this, typeof exports === "undefined" ? this : exports);

; return inherit; });
define("inherit", function(){});

define('js/core/Base',["inherit"], function(inherit){

    var cid = 0;

    var Base = inherit.Base.inherit("js.core.Base",{

        ctor: function () {
            // generate unique id
            this.$cid = ++cid;

        },

        /***
         * determinate if the application runs in the browser or on node
         *
         * @return {Boolean} true if the application runs in a browser
         */
        runsInBrowser: function () {
            return typeof window !== "undefined";
        },

        /***
         * logs messages to configured logging functions
         *
         * @param {String|Array} message the message to log
         * @param {String} [level="info"] the service level of (debug, info, warn, error)
         */
        log: function(message, level) {
            level = level || Base.LOGLEVEL.INFO;

            if (message instanceof Error) {
                message = message.toString();
            }

            if (Base.logger.length) {
                for (var i = 0; i < Base.logger.length; i++) {
                    Base.logger[i].log(message, level);
                }
            } else if (typeof console !== "undefined") {
                (console[level] || console.log).call(console, message);
            }
        }
    });

    Base.logger = [];
    Base.LOGLEVEL = {
        DEBUG: 'debug',
        INFO: 'info',
        WARN: 'warn',
        ERROR: 'error'
    };

    return Base;
});
define('js/core/EventDispatcher',["js/core/Base"], function (Base) {

        /***
         * @param {arguments} eventTypes
         * */
        Function.prototype.on = function () {

            var events = Array.prototype.slice.call(arguments);
            this._events = this._events || [];
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                this._events.push(event);
            }

            return this;
        };


        /***
         * @param {arguments} changeEvents results in change:eventName
         * */
        Function.prototype.onChange = function () {
            var events = Array.prototype.slice.call(arguments);
            this._events = this._events || [];
            this._attributes = this._attributes || [];
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                this._attributes.push(event);
                event = "change:" + event;
                this._events.push(event);

            }
            return this;
        };

        Function.prototype.bus = function() {

            var events = Array.prototype.slice.call(arguments);
            this._busEvents = this._busEvents || [];
            for (var i = 0; i < events.length; i++) {
                this._busEvents.push(events[i]);
            }

            return this;
        };

        var undefinedValue;

        /** @class */
        var EventDispatcher = Base.inherit("js.core.EventDispatcher",
            /** @lends EventDispatcher.prototype */
            {

                /**
                 * @class Allows binding and triggering of custom events
                 * @constructs
                 */
                ctor: function () {
                    this.callBase();
                    this._eventHandlers = {};
                },
                /**
                 * Binds a callback and a scope to a given eventType
                 *
                 * @param {String} eventType The name of the event
                 * @param {Function} callback The callback function - signature callback({@link EventDispatcher.Event},[caller])
                 * @param {Object} [scope]  This sets the scope for the callback function
                 */
                bind: function (eventType, callback, scope) {
                    if (callback) {
                        scope = scope || this;
                        // get the list for the event
                        var list = this._eventHandlers[eventType] || (this._eventHandlers[eventType] = []);
                        // and push the callback function
                        list.push(new EventDispatcher.EventHandler(callback, scope));
                    } else {
                        console.warn('no eventHandler for "' + eventType + '"');
                    }

                    return this;
                },
                /**
                 * Triggers an event
                 *
                 * @param {String} eventType
                 * @param {EventDispatcher.Event|Object} event If you use an Object the object is wrapped in an Event
                 * @param target
                 */
                trigger: function (eventType, event, target) {

                    if (this._eventHandlers[eventType]) {
                        if (!(event instanceof EventDispatcher.Event)) {
                            event = new EventDispatcher.Event(event);
                        }

                        if (!target) {
                            target = arguments.callee.caller;
                        }
                        event.target = target;
                        event.type = eventType;

                        var list = this._eventHandlers[eventType];
                        for (var i = 0; i < list.length; i++) {
                            if (list[i]) {
                                var result = list[i].trigger(event, target);

                                if (result !== undefinedValue) {
                                    ret = result;
                                    if (result === false) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }

                                if (event.isImmediatePropagationStopped) {
                                    break;
                                }
                            }
                        }
                    }

                    return event;
                },
                /***
                 * Unbinds callbacks for events
                 *
                 * @param {String} eventType
                 * @param {Function} callback
                 */
                unbind: function (eventType, callback, scope) {
                    if (!eventType) {
                        // remove all events
                        this._eventHandlers = {};
                    } else if (!callback) {
                        // remove all callbacks for these event
                        this._eventHandlers[eventType] = [];
                    } else if (this._eventHandlers[eventType]) {
                        var list = this._eventHandlers[eventType];
                        for (var i = list.length - 1; i >= 0; i--) {
                            if (list[i].$callback == callback && (!scope || scope === list[i].scope)) {
                                list.splice(i, 1);  // delete callback
                            }
                        }
                    }
                },
                destroy: function(){
                    // remove all events
                    this._eventHandlers = {};
                }
            });

        EventDispatcher.Event = Base.inherit(
            /** @lends EventDispatcher.Event.prototype */
            {
                /**
                 * Description of constructor.
                 * @class Description of class.
                 * @constructs
                 * @params {Object} attributes Hash of attributes
                 */
                ctor: function (attributes, target) {
                    this.$ = attributes;

                    this.target = target;
                    this.isDefaultPrevented = false;
                    this.isPropagationStopped = false;
                    this.isImmediatePropagationStopped = false;

                },
                /**
                 * Prevent default triggering
                 *
                 */
                preventDefault: function () {
                    this.isDefaultPrevented = true;

                    var e = this.$.orginalEvent;

                    if (e) {
                        if (e.preventDefault) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;  // IE
                        }
                    }
                },

                /**
                 * Call this to stop propagation
                 *
                 */
                stopPropagation: function () {
                    this.isPropagationStopped = true;
                },
                /**
                 *
                 */
                stopImmediatePropagation: function () {
                    this.isImmediatePropagationStopped = true;
                    this.stopPropagation();
                }
            });


        EventDispatcher.EventHandler = Base.inherit(
            /** @lends EventDispatcher.EventHandler.prototype */
            {
                /**
                 * Simple EventHandler
                 * @class
                 * @constructs
                 * @params {Function} callback The callback function
                 * @params {Object} scope The callback scope
                 */
                ctor: function (callback, scope) {
                    this.scope = scope;
                    this.$callback = callback;
                },
                /**
                 *
                 * @param {EventDispatcher.Event} event
                 * @param {Object} caller
                 */
                trigger: function (event, caller) {
                    this.$callback.call(this.scope, event, caller);
                    return !event.isPropagationStopped;
                }
            });

        return EventDispatcher;
    }
);
define('js/lib/parser', function () { var exports = (typeof(exports) === "undefined" ? this : exports); exports.parser = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "binding": parse_binding,
        "boolean": parse_boolean,
        "float": parse_float,
        "fnc": parse_fnc,
        "index": parse_index,
        "number": parse_number,
        "parameter": parse_parameter,
        "parameterArray": parse_parameterArray,
        "path": parse_path,
        "pathElement": parse_pathElement,
        "staticBinding": parse_staticBinding,
        "string": parse_string,
        "text": parse_text,
        "twoWayBinding": parse_twoWayBinding,
        "var": parse_var,
        "varName": parse_varName
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "text";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_varName() {
        var cacheKey = 'varName@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        if (input.substr(pos).match(/^[a-zA-Z$_]/) !== null) {
          var result5 = input.charAt(pos);
          pos++;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("[a-zA-Z$_]");
          }
        }
        if (result5 !== null) {
          var result6 = [];
          if (input.substr(pos).match(/^[a-zA-Z0-9$_\- ]/) !== null) {
            var result7 = input.charAt(pos);
            pos++;
          } else {
            var result7 = null;
            if (reportMatchFailures) {
              matchFailed("[a-zA-Z0-9$_\\- ]");
            }
          }
          while (result7 !== null) {
            result6.push(result7);
            if (input.substr(pos).match(/^[a-zA-Z0-9$_\- ]/) !== null) {
              var result7 = input.charAt(pos);
              pos++;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed("[a-zA-Z0-9$_\\- ]");
              }
            }
          }
          if (result6 !== null) {
            var result3 = [result5, result6];
          } else {
            var result3 = null;
            pos = savedPos2;
          }
        } else {
          var result3 = null;
          pos = savedPos2;
        }
        var result4 = result3 !== null
          ? (function(start, end) {return start ? start + end.join("") : false; })(result3[0], result3[1])
          : null;
        if (result4 !== null) {
          var result2 = result4;
        } else {
          var result2 = null;
          pos = savedPos1;
        }
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var savedPos0 = pos;
          var result1 = [];
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_string() {
        var cacheKey = 'string@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "'") {
          var result3 = "'";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"'\"");
          }
        }
        if (result3 !== null) {
          var result4 = [];
          var savedPos2 = pos;
          if (input.length > pos) {
            var result7 = input.charAt(pos);
            pos++;
          } else {
            var result7 = null;
            if (reportMatchFailures) {
              matchFailed('any character');
            }
          }
          var result8 = result7 !== null
            ? (function(char) { return char === "'" ? null : char; })(result7)
            : null;
          if (result8 !== null) {
            var result6 = result8;
          } else {
            var result6 = null;
            pos = savedPos2;
          }
          while (result6 !== null) {
            result4.push(result6);
            var savedPos2 = pos;
            if (input.length > pos) {
              var result7 = input.charAt(pos);
              pos++;
            } else {
              var result7 = null;
              if (reportMatchFailures) {
                matchFailed('any character');
              }
            }
            var result8 = result7 !== null
              ? (function(char) { return char === "'" ? null : char; })(result7)
              : null;
            if (result8 !== null) {
              var result6 = result8;
            } else {
              var result6 = null;
              pos = savedPos2;
            }
          }
          if (result4 !== null) {
            if (input.substr(pos, 1) === "'") {
              var result5 = "'";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"'\"");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(s) { return s.join(""); })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_number() {
        var cacheKey = 'number@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "-") {
          var result6 = "-";
          pos += 1;
        } else {
          var result6 = null;
          if (reportMatchFailures) {
            matchFailed("\"-\"");
          }
        }
        var result3 = result6 !== null ? result6 : '';
        if (result3 !== null) {
          if (input.substr(pos).match(/^[0-9]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[0-9]");
            }
          }
          if (result5 !== null) {
            var result4 = [];
            while (result5 !== null) {
              result4.push(result5);
              if (input.substr(pos).match(/^[0-9]/) !== null) {
                var result5 = input.charAt(pos);
                pos++;
              } else {
                var result5 = null;
                if (reportMatchFailures) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(n, digits) { return parseInt(digits.join(""), 10) * (n ? -1 : 1); })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_float() {
        var cacheKey = 'float@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_number();
        if (result3 !== null) {
          if (input.substr(pos, 1) === ".") {
            var result4 = ".";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result4 !== null) {
            if (input.substr(pos).match(/^[0-9]/) !== null) {
              var result6 = input.charAt(pos);
              pos++;
            } else {
              var result6 = null;
              if (reportMatchFailures) {
                matchFailed("[0-9]");
              }
            }
            if (result6 !== null) {
              var result5 = [];
              while (result6 !== null) {
                result5.push(result6);
                if (input.substr(pos).match(/^[0-9]/) !== null) {
                  var result6 = input.charAt(pos);
                  pos++;
                } else {
                  var result6 = null;
                  if (reportMatchFailures) {
                    matchFailed("[0-9]");
                  }
                }
              }
            } else {
              var result5 = null;
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(n, d2) { return parseFloat(n+"."+d2.join(""), 10) })(result1[0], result1[2])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_boolean() {
        var cacheKey = 'boolean@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        if (input.substr(pos, 4) === "true") {
          var result5 = "true";
          pos += 4;
        } else {
          var result5 = null;
          if (reportMatchFailures) {
            matchFailed("\"true\"");
          }
        }
        var result6 = result5 !== null
          ? (function() { return true; })()
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          if (input.substr(pos, 5) === "false") {
            var result2 = "false";
            pos += 5;
          } else {
            var result2 = null;
            if (reportMatchFailures) {
              matchFailed("\"false\"");
            }
          }
          var result3 = result2 !== null
            ? (function() { return false; })()
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_index() {
        var cacheKey = 'index@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "[") {
          var result3 = "[";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"[\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse_number();
          if (result4 !== null) {
            if (input.substr(pos, 1) === "]") {
              var result5 = "]";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"]\"");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(n) { return n; })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_parameter() {
        var cacheKey = 'parameter@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var result6 = parse_string();
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var result5 = parse_boolean();
          if (result5 !== null) {
            var result0 = result5;
          } else {
            var result4 = parse_float();
            if (result4 !== null) {
              var result0 = result4;
            } else {
              var result3 = parse_number();
              if (result3 !== null) {
                var result0 = result3;
              } else {
                var result2 = parse_staticBinding();
                if (result2 !== null) {
                  var result0 = result2;
                } else {
                  var result1 = parse_binding();
                  if (result1 !== null) {
                    var result0 = result1;
                  } else {
                    var result0 = null;;
                  };
                };
              };
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_parameterArray() {
        var cacheKey = 'parameterArray@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result10 = parse_parameter();
        var result3 = result10 !== null ? result10 : '';
        if (result3 !== null) {
          var result4 = [];
          var savedPos2 = pos;
          var savedPos3 = pos;
          if (input.substr(pos, 1) === ",") {
            var result8 = ",";
            pos += 1;
          } else {
            var result8 = null;
            if (reportMatchFailures) {
              matchFailed("\",\"");
            }
          }
          if (result8 !== null) {
            var result9 = parse_parameter();
            if (result9 !== null) {
              var result6 = [result8, result9];
            } else {
              var result6 = null;
              pos = savedPos3;
            }
          } else {
            var result6 = null;
            pos = savedPos3;
          }
          var result7 = result6 !== null
            ? (function(r) {return r;})(result6[1])
            : null;
          if (result7 !== null) {
            var result5 = result7;
          } else {
            var result5 = null;
            pos = savedPos2;
          }
          while (result5 !== null) {
            result4.push(result5);
            var savedPos2 = pos;
            var savedPos3 = pos;
            if (input.substr(pos, 1) === ",") {
              var result8 = ",";
              pos += 1;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("\",\"");
              }
            }
            if (result8 !== null) {
              var result9 = parse_parameter();
              if (result9 !== null) {
                var result6 = [result8, result9];
              } else {
                var result6 = null;
                pos = savedPos3;
              }
            } else {
              var result6 = null;
              pos = savedPos3;
            }
            var result7 = result6 !== null
              ? (function(r) {return r;})(result6[1])
              : null;
            if (result7 !== null) {
              var result5 = result7;
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(s, rp) {return s ? [s].concat(rp) : []; })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_var() {
        var cacheKey = 'var@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_varName();
        if (result3 !== null) {
          var result5 = parse_index();
          var result4 = result5 !== null ? result5 : '';
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(n, ind) { return {name: n, type: 'var', index: ind}; })(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_fnc() {
        var cacheKey = 'fnc@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_varName();
        if (result3 !== null) {
          if (input.substr(pos, 1) === "(") {
            var result4 = "(";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"(\"");
            }
          }
          if (result4 !== null) {
            var result9 = parse_parameterArray();
            var result5 = result9 !== null ? result9 : '';
            if (result5 !== null) {
              if (input.substr(pos, 1) === ")") {
                var result6 = ")";
                pos += 1;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("\")\"");
                }
              }
              if (result6 !== null) {
                var result8 = parse_index();
                var result7 = result8 !== null ? result8 : '';
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(n, pa, ind) {return {name: n, type: 'fnc', parameter: pa, index: ind  }; })(result1[0], result1[2], result1[4])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_pathElement() {
        var cacheKey = 'pathElement@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result4 = parse_index();
        var result5 = result4 !== null
          ? (function(ind) { return {type: 'index', index: ind }; })(result4)
          : null;
        if (result5 !== null) {
          var result3 = result5;
        } else {
          var result3 = null;
          pos = savedPos0;
        }
        if (result3 !== null) {
          var result0 = result3;
        } else {
          var result2 = parse_fnc();
          if (result2 !== null) {
            var result0 = result2;
          } else {
            var result1 = parse_var();
            if (result1 !== null) {
              var result0 = result1;
            } else {
              var result0 = null;;
            };
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_path() {
        var cacheKey = 'path@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        var result3 = parse_pathElement();
        if (result3 !== null) {
          var result4 = [];
          var savedPos2 = pos;
          var savedPos3 = pos;
          if (input.substr(pos, 1) === ".") {
            var result8 = ".";
            pos += 1;
          } else {
            var result8 = null;
            if (reportMatchFailures) {
              matchFailed("\".\"");
            }
          }
          if (result8 !== null) {
            var result9 = parse_pathElement();
            if (result9 !== null) {
              var result6 = [result8, result9];
            } else {
              var result6 = null;
              pos = savedPos3;
            }
          } else {
            var result6 = null;
            pos = savedPos3;
          }
          var result7 = result6 !== null
            ? (function(r) {return r;})(result6[1])
            : null;
          if (result7 !== null) {
            var result5 = result7;
          } else {
            var result5 = null;
            pos = savedPos2;
          }
          while (result5 !== null) {
            result4.push(result5);
            var savedPos2 = pos;
            var savedPos3 = pos;
            if (input.substr(pos, 1) === ".") {
              var result8 = ".";
              pos += 1;
            } else {
              var result8 = null;
              if (reportMatchFailures) {
                matchFailed("\".\"");
              }
            }
            if (result8 !== null) {
              var result9 = parse_pathElement();
              if (result9 !== null) {
                var result6 = [result8, result9];
              } else {
                var result6 = null;
                pos = savedPos3;
              }
            } else {
              var result6 = null;
              pos = savedPos3;
            }
            var result7 = result6 !== null
              ? (function(r) {return r;})(result6[1])
              : null;
            if (result7 !== null) {
              var result5 = result7;
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(s, rp) {return [s].concat(rp);})(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_binding() {
        var cacheKey = 'binding@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "{") {
          var result3 = "{";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"{\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse_path();
          if (result4 !== null) {
            if (input.substr(pos, 1) === "}") {
              var result5 = "}";
              pos += 1;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"}\"");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(path) { return path ? {path: path,type:'normal'} : false; })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_twoWayBinding() {
        var cacheKey = 'twoWayBinding@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 2) === "{{") {
          var result3 = "{{";
          pos += 2;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"{{\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse_path();
          if (result4 !== null) {
            var savedPos4 = pos;
            var savedPos5 = pos;
            if (input.substr(pos, 1) === "|") {
              var result16 = "|";
              pos += 1;
            } else {
              var result16 = null;
              if (reportMatchFailures) {
                matchFailed("\"|\"");
              }
            }
            if (result16 !== null) {
              var result17 = parse_path();
              if (result17 !== null) {
                var result14 = [result16, result17];
              } else {
                var result14 = null;
                pos = savedPos5;
              }
            } else {
              var result14 = null;
              pos = savedPos5;
            }
            var result15 = result14 !== null
              ? (function(p) {return p;})(result14[1])
              : null;
            if (result15 !== null) {
              var result13 = result15;
            } else {
              var result13 = null;
              pos = savedPos4;
            }
            var result5 = result13 !== null ? result13 : '';
            if (result5 !== null) {
              var savedPos2 = pos;
              var savedPos3 = pos;
              if (input.substr(pos, 1) === "|") {
                var result11 = "|";
                pos += 1;
              } else {
                var result11 = null;
                if (reportMatchFailures) {
                  matchFailed("\"|\"");
                }
              }
              if (result11 !== null) {
                var result12 = parse_path();
                if (result12 !== null) {
                  var result9 = [result11, result12];
                } else {
                  var result9 = null;
                  pos = savedPos3;
                }
              } else {
                var result9 = null;
                pos = savedPos3;
              }
              var result10 = result9 !== null
                ? (function(p) {return p;})(result9[1])
                : null;
              if (result10 !== null) {
                var result8 = result10;
              } else {
                var result8 = null;
                pos = savedPos2;
              }
              var result6 = result8 !== null ? result8 : '';
              if (result6 !== null) {
                if (input.substr(pos, 2) === "}}") {
                  var result7 = "}}";
                  pos += 2;
                } else {
                  var result7 = null;
                  if (reportMatchFailures) {
                    matchFailed("\"}}\"");
                  }
                }
                if (result7 !== null) {
                  var result1 = [result3, result4, result5, result6, result7];
                } else {
                  var result1 = null;
                  pos = savedPos1;
                }
              } else {
                var result1 = null;
                pos = savedPos1;
              }
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(path, a, b) { return path ? {path: path,type:'twoWay', transformBack: a || false, transform: b || false} : false; })(result1[1], result1[2], result1[3])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_staticBinding() {
        var cacheKey = 'staticBinding@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 1) === "$") {
          var result3 = "$";
          pos += 1;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"$\"");
          }
        }
        if (result3 !== null) {
          var result4 = parse_binding();
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(b) { b.type = 'static'; return b; })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_text() {
        var cacheKey = 'text@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var result7 = parse_twoWayBinding();
        var result8 = result7 !== null
          ? (function(t) { return [t]; })(result7)
          : null;
        if (result8 !== null) {
          var result6 = result8;
        } else {
          var result6 = null;
          pos = savedPos0;
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var result1 = [];
          var result5 = parse_staticBinding();
          if (result5 !== null) {
            var result2 = result5;
          } else {
            var result4 = parse_binding();
            if (result4 !== null) {
              var result2 = result4;
            } else {
              if (input.length > pos) {
                var result3 = input.charAt(pos);
                pos++;
              } else {
                var result3 = null;
                if (reportMatchFailures) {
                  matchFailed('any character');
                }
              }
              if (result3 !== null) {
                var result2 = result3;
              } else {
                var result2 = null;;
              };
            };
          }
          while (result2 !== null) {
            result1.push(result2);
            var result5 = parse_staticBinding();
            if (result5 !== null) {
              var result2 = result5;
            } else {
              var result4 = parse_binding();
              if (result4 !== null) {
                var result2 = result4;
              } else {
                if (input.length > pos) {
                  var result3 = input.charAt(pos);
                  pos++;
                } else {
                  var result3 = null;
                  if (reportMatchFailures) {
                    matchFailed('any character');
                  }
                }
                if (result3 !== null) {
                  var result2 = result3;
                } else {
                  var result2 = null;;
                };
              };
            }
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
; return this.parser; });
define("js/lib/parser", function(){});

define('underscore', function () { //     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
; return _; });
define("underscore", function(){});

define('js/core/Binding',["js/core/EventDispatcher", "js/lib/parser", "underscore"], function (EventDispatcher, Parser, _) {

    /**
     * Returns false if path includes function
     * @param path
     */
    var pathToString = function (path) {
        var str = [];
        for (var i = 0; i < path.length; i++) {
            var el = path[i];
            if (el.type == TYPE_VAR) {
                str.push(el.name);
            } else {
                return false;
            }
        }
        return str.join(".");
    };
    var Bindable;
    var Binding = EventDispatcher.inherit("js.core.Binding",
        /** @lends Binding */
        {
            defaults: {
                event: 'change',
                path: null,
                twoWay: false
            },

            ctor: function (attributes) {
                if(!Bindable){
                    try {
                        Bindable = requirejs('js/core/Bindable');
                    } catch(e) {
                        Bindable = null;
                    }
                }
                this.callBase();

                this.$ = attributes;
                _.defaults(this.$,this.defaults);

                this.initialize();
            },

            transform: function (val) {
                return val;
            },

            transformBack: function (val) {
                return val;
            },

            initialize: function () {
                this._checkAttributes();
                this.$parameters = [];
                this.$events = [];
                this.$subBinding = null;

                if (!this.$.rootScope) {
                    this.$.rootScope = this;
                }
                var scope = this.$.scope;
                if(_.isString(this.$.path)){
                    this.$.path = Parser.parse(this.$.path,'path');
                }
                // split up first key
                this.$.key = this.$.path[0];
                var self = this;

                if (this.$.key.type == TYPE_FNC) {
                    var fncName = this.$.key.name, parameters = this.$.key.parameter;

                    if (_.isFunction(scope[fncName])) {
                        var fnc = scope[fncName];
                        var events = [];
                        if (fnc._attributes && fnc._attributes.length > 0) {
                            this.$.scope.bind("change", this._changeCallback, this);
                            this.$events.push({eventType: "change", callback: this._changeCallback});
                        } else {
                            if (fnc._events) {
                                events = fnc._events;
                            } else {
                                events = [];
                            }

                            var event, path;
                            for (var i = 0; i < events.length; i++) {
                                event = events[i];
                                scope.bind(event, this._callback, this);
                                this.$events.push({eventType: event, callback: this._callback});
                            }
                        }

                        var cb = function () {
                            self.trigger();
                        };

                        var para;
                        this.$parameters = [];
                        for (var j = 0; j < parameters.length; j++) {
                            para = parameters[j];
                            if(_.isObject(para)) {
                                para = this.$.bindingCreator.create(para, this.$.target, cb);
                            }
                            this.$parameters.push(para);

                        }
                        this.$.fnc = fnc;
                        this.$.fnc.trigger = function () {
                            self.trigger();
                        };
                    }

                } else {
                    this.$.event = "change:" + this.$.key.name;
                    this.$events.push({eventType: this.$.event, callback: this._callback});
                    // on change of this key
                    scope.bind(this.$.event, this._callback, this);
                }

                if (this.$.twoWay === true && this.$.path.length === 1) {
                    this.$.targetEvent = 'change:' + this.$.targetKey;

                    this.$.target.bind(this.$.targetEvent, this._revCallback, this);
                }

                this._createSubBinding();
                scope.bind('destroy', function () {
                    self.destroy();
                });


                if (this.$.path.length === 1) {
                    this.trigger();
                }
            },
            _checkAttributes: function () {
                // check infrastructur
                if (!this.$.path) {
                    throw "No path defined!";
                }

                if (!this.$.scope) {
                    throw "No scope defined!"
                }

                if (this.$.twoWay) {
                    if (!this.$.target) {
                        throw "TwoWay binding, but no target defined!";
                    }
                    if (!this.$.target instanceof Bindable) {
                        throw "Target is not a Bindable!";
                    }

                    if (!this.$.targetKey) {
                        throw "TwoWay binding, but no target key defined!";
                    }

                }

                if(!this.$.bindingCreator){
                    this.$.bindingCreator = this;
                }

                if(this.$.transform){
                    this.transform = this.$.transform;
                }

                if (this.$.transformBack) {
                    this.transformBack = this.$.transformBack;
                }


            },
            _createSubBinding: function () {
                if (this.$.path.length > 1) {
                    var nScope;
                    if (this.$.fnc) {
                        nScope = this.getValue();
                    } else {
                        nScope = this.$.scope.$[this.$.key.name];
                    }
                    // if keys are left and has value && is bindable
                    // get value for first child
                    if (nScope) {
                        if(nScope instanceof Bindable){
                            // init new binding, which triggers this binding
                            this.$subBinding = new Binding({scope: nScope, path: this.$.path.slice(1), target: this.$.target, targetKey: this.$.targetKey, rootScope: this.$.rootScope, callback: this.$.callback, context: this.$.context, twoWay: this.$.twoWay, transform: this.$.transform, transformBack: this.$.transformBack, bindingCreator: this.$.bindingCreator});
                        } else {
                            // TODO: find next bindable var
                        }


                    }
                }
            },
            _revCallback: function (e) {
                if (this.$.fnc) {
                    var params = this._getFncParameters();
                    params.unshift(e.$);
                    this.$.fnc.apply(this.$.scope, params);
                } else {
                    this.$.scope.set(pathToString(this.$.path), this.transformBack(e.$));
                }
            },
            _changeCallback: function (event) {
                for (var i = 0; i < this.$.fnc._attributes.length; i++) {
                    if (!_.isUndefined(event.$[this.$.fnc._attributes[i]])) {
                        this.trigger();
                        return;
                    }
                }
            },
            _callback: function () {
                // remove subBindings!
                if (this.$subBinding) {
                    this.$subBinding.destroy();
                    this.$subBinding = null;
                }

                // try to create subBinding
                this._createSubBinding();

                this.trigger();
            },
            destroy: function () {
                var e;
                for (var j = 0; j < this.$events.length; j++) {
                    e = this.$events[j];
                    this.$.scope.unbind(e.eventType, e.callback);
                }

                if (this.$.twoWay === true) {
                    this.$.target.unbind(this.$.targetEvent, this._revCallback);
                }
                if (this.$subBinding) {
                    this.$subBinding.destroy();

                    delete this.$subBinding;
                }

                // destroy parameter bindings
                for (var i = 0; i < this.$parameters.length; i++) {
                    var par = this.$parameters[i];
                    if (par instanceof Binding) {
                        par.destroy();
                    }
                }
            },
            _getFncParameters: function () {
                var parameters = [];
                for (var i = 0; i < this.$parameters.length; i++) {
                    var para = this.$parameters[i];
                    if (para instanceof Binding) {
                        para = para.getValue();
                    }
                    parameters.push(para);
                }
                return parameters;
            },
            getValue: function () {
                if (this.$subBinding) {
                    return this.$subBinding.getValue();
                } else {
                    if (this.$.fnc) {
                        return this.$.fnc.apply(this.$.scope, this._getFncParameters());
                    } else if (this.$.path.length == 1) {
                        return this.$.scope.get(this.$.key.name);
                    } else {
                        return null;
                    }
                }
            },
            getContextValue: function () {
                if (this.$.context && this.$.context.length > 1) {
                    return Binding.contextToString(this.$.context);
                } else {
                    return this.getValue();
                }
            },
            // trigger
            trigger: function () {
                // get value
                var val = this.getContextValue();
                if (this.$.targetKey) {
                    this.$.target.set(this.$.targetKey, this.transform(val));
                } else if (this.$.callback) {
                    this.$.callback.call(this.$.target, this.transform(val));
                }

            },
            toString: function () {
                return this.getValue();
            },
            create: function(bindingDef, target, callback){
                var options = {scope: this.$.scope, target: target, callback: callback, path: bindingDef.path, twoWay : bindingDef.type === TYPE_TWOWAY, bindingCreator: this.$.bindingCreator};

                var fncEl;
                var fncScope;
                if(bindingDef.transform) {
                    fncEl = bindingDef.transform.pop();
                    fncScope = this.get(bindingDef.transform);
                    if(fncScope){
                        options.transform = fncScope[fncEl.name];
                    }
                }
                if(bindingDef.transformBack){
                    fncEl = bindingDef.transformBack.pop();
                    fncScope = this.get(bindingDef.transform);
                    if (fncScope) {
                        options.transformBack = fncScope[fncEl.name];
                    }
                }
                return new Binding(options);
            }
        });

    var TYPE_FNC = Binding.TYPE_FNC = "fnc";
    var TYPE_VAR = Binding.TYPE_VAR = "var";
    var TYPE_STATIC = Binding.TYPE_STATIC ="static";
    var TYPE_TWOWAY = Binding.TYPE_TWOWAY ="twoWay";

    Binding.contextToString = function (context) {
        var str = "", el;
        for (var i = 0; i < context.length; i++) {
            el = context[i];
            if (el instanceof Binding) {
                el = el.getValue();
            }
            if (el !== null && typeof(el) !== "undefined") {
                str += el;
            }
        }
        return str;
    };

    return Binding;
});
define('js/core/Bindable',["js/core/EventDispatcher", "js/lib/parser", "js/core/Binding","underscore"],
    function (EventDispatcher, Parser, Binding, _) {

        var indexExtractor = /^(.*)\[(\d+)\]$/,
            undefined, List;


        var Bindable = EventDispatcher.inherit("js.core.Bindable",
            {
                /***
                 * creates a new instance of bindable, which can be bound to components
                 *
                 * @param {Object} [attributes] the default attributes which will be set during instantiation
                 */
                ctor: function (attributes) {
                    this.$eventBindables = [];

                    // call the base class constructor
                    this.callBase(null);

                    this.$ = {};

                    _.extend(this._eventAttributes, this.base._eventAttributes || {});

                    attributes = attributes || {};

                    var defaultAttributes = this._defaultAttributes();
                    for (var key in defaultAttributes) {
                        if (defaultAttributes.hasOwnProperty(key)) {
                            if (!attributes.hasOwnProperty(key)) {
                                if (_.isFunction(defaultAttributes[key])) {
                                    // Function as default -> construct new Object
                                    attributes[key] = new (defaultAttributes[key])();
                                } else {
                                    attributes[key] = _.clone(defaultAttributes[key]);
                                }
                            }
                        }
                    }

                    this.$ = attributes;
                    // TODO: clone and keep prototype for attribute the same -> write own clone method
                    this.$previousAttributes = _.clone(attributes);

                },
                /**
                 * Here you can define the default attributes of the instance.
                 *
                 * @static
                 */
                defaults: {
                },

                /***
                 *
                 * @return {Object} returns the default attributes and includes the defaults from base classes
                 * @private
                 */
                _defaultAttributes: function () {
                    return this._generateDefaultsChain("defaults");
                },

                /***
                 * generates a default chain containing the values from this instance and base classes
                 *
                 * @param {String} property - the name of the static property used to find defaults
                 * @return {*}
                 * @private
                 */
                _generateDefaultsChain: function (property) {
                    var ret = this[property],
                        base = this.base;

                    while (base) {
                        _.defaults(ret, base[property]);
                        base = base.base;
                    }

                    return ret;
                },

                /**
                 * Sets new values for attributes and notify about changes
                 *
                 * @param {String} key The attribute key
                 * @param {String} value The attribute value
                 * @param {Object} options A hash of options
                 * @param {Boolean} [options.silent=false] if true no event is triggered on change
                 * @param {Boolean} [options.unset=false] if true the attribute gets deleted
                 */
                set: function (key, value, options) {
                    var attributes = {};

                    if (_.isString(key)) {
                        // check for path
                        var path = key.split(".");
                        if (path.length > 1) {
                            var scope = this.get(path.shift());
                            if (scope && scope.set) {
                                scope.set(path.join("."), value, options);
                                return this;
                            }

                        }

                        attributes[key] = value;
                    } else {
                        options = value;
                        attributes = key;
                    }

                    options = options || {silent: false, unset: false};

                    // for un-setting attributes
                    if (options.unset) {
                        for (key in attributes) {
                            if (attributes.hasOwnProperty(key)) {
                                attributes[key] = void 0;
                            }
                        }
                    }

                    var changedAttributes = {},
                        now = this.$,
                        val, prev;

                    for (key in attributes) {
                        if (attributes.hasOwnProperty(key)) {
                            // get the value
                            val = attributes[key];
                            // unset attribute or change it ...
                            if (options.unset === true) {
                                delete now[key];
                            } else {
                                if (!_.isEqual(now[key], attributes[key])) {
                                    prev = now[key];
                                    this.$previousAttributes[key] = prev;
                                    now[key] = attributes[key];
                                    changedAttributes[key] = now[key];
                                }
                            }
                        }
                    }

                    this._commitChangedAttributes(changedAttributes);

                    if (options.silent === false && _.size(changedAttributes) > 0) {
                        for (key in changedAttributes) {
                            if (changedAttributes.hasOwnProperty(key)) {
                                this.trigger('change:' + key, changedAttributes[key], this);
                            }
                        }
                        this.trigger('change', changedAttributes, this);
                    }

                    return this;
                },


                /***
                 * evaluates a path to retrieve a value
                 *
                 * @param {Object} [scope=this] the scope where the path is evaluated
                 * @param {String} key
                 * @returns the value for the path or undefined
                 */
                get: function(scope, key) {
                    if(!key){
                        key = scope;
                        scope = this;
                    }

                    if(!key) {
                        return null;
                    }

                    var path;

                    // if we have a path object
                    if(_.isArray(key)){
                        path = key;
                    // path element
                    }else if(_.isObject(key)){
                        path = [key];
                    }else{
                        path = Parser.parse(key, "path");
                    }


                    var pathElement;
                    // go through the path
                    while (scope && path.length > 0) {
                        pathElement = path.shift();
                        if (pathElement.type == "fnc") {
                            var fnc = scope[pathElement.name];
                            var parameters = pathElement.parameter;
                            for (var i = 0; i < parameters.length; i++) {
                                var param = parameters[i];
                                if (_.isObject(param)) {
                                    param.type = "static";
                                    parameters[i] = this.get(param.path);
                                }
                            }
                            scope = fnc.apply(scope, parameters);
                        } else if (pathElement.type == "var") {
                            if (scope instanceof Bindable) {
                                if(path.length === 0){
                                    scope = scope.$[pathElement.name];
                                }else{
                                    scope = scope.get(pathElement.name);
                                }

                            } else {
                                scope = scope[pathElement.name];
                            }
                        }

                        if(scope && pathElement.index !== ''){
                            // if it's an array
                            if(_.isArray(scope)){
                                scope = scope[pathElement.index];
                            // if it's a list
                            }else if(scope.at){
                                scope = scope.at(pathElement.index);
                            }
                        }
                    }
                    return scope;
                },

                /***
                 * determinate if a attribute is available
                 *
                 * @param {String} path - to get the value
                 * @returns {Boolean} true if attribute is not undefined
                 */
                has: function (path) {
                    return !_.isUndefined(this.get(path));
                },

                /***
                 * called after attributes has set and some of the has been changed
                 *
                 * @param {Object} attributes - contains the changed attributes
                 *
                 * @abstract
                 * @private
                 */
                _commitChangedAttributes: function (attributes) {
                    // override
                },

                /***
                 * Unset attribute on $
                 * @param {String|Object} key - the attribute or attributes to unset
                 * @param {Object} [options]
                 * @return {this}
                 */
                unset: function (key, options) {
                    (options || (options = {})).unset = true;
                    return this.set(key, null, options);
                },

                /***
                 * Clears all attributes
                 * @return {this}
                 */
                clear: function () {
                    return this.set(this.$, {unset: true});
                },

                /***
                 * Binds an event handler function to an EventDispatcher
                 *
                 * @param {String} path - a binding path e.g. a.b.c
                 * @param {String} event - the type of the event which should be bound
                 * @param {Function} callback - the event handler function
                 * @param {Object} [thisArg] - the thisArg used for calling the event handler
                 */
                bind: function (path, event, callback, thisArg) {
                    if (event instanceof Function && _.isString(path)) {
                        this.callBase(path, event, callback);
                    } else {
                        if(_.isArray(path) && path.length > 0){
                            thisArg = callback;
                            callback = event;
                            event = path[1];
                            path = path[0];
                        }
                        var eb = new EventBindable({
                            path: path,
                            event: event,
                            scope: thisArg,
                            callback: callback,
                            value: null
                        });
                        eb.set('binding', new Binding({path: path, scope: this, target: eb, targetKey: 'value'}));
                        this.$eventBindables.push(eb);
                    }
                },

                /***
                 * Unbinds an bound event handler from an EventDispatcher.
                 *
                 * @param {String} [path] - the path from which the event should be unbound
                 * @param {String} event - the type of the event
                 * @param {Function} callback - the event handler which is currently bound
                 * TODO: why a scope is passed here?
                 * @param {Object} [scope]
                 */
                unbind: function (path, event, callback, scope) {
                    if (event instanceof Function) {
                        this.callBase(path, event, callback);
                    } else {
                        var eb;
                        for (var i = this.$eventBindables.length - 1; i >= 0; i--) {
                            eb = this.$eventBindables[i];
                            if (eb.$.scope === scope && eb.$.path === path && eb.$.event === event && eb.$.callback === callback) {
                                // unbind
                                eb.destroy();
                                this.$eventBindables.slice(i, 1);
                            }
                        }
                    }
                },

                /***
                 * Destroys all event bindings and triggers a destroy event
                 * @return {this}
                 */
                destroy: function() {
                    this.callBase();
                    for(var i = 0; i < this.$eventBindables.length; i++){
                        this.$eventBindables[i].destroy();
                    }

                    this.trigger('destroy',this);
                    return this;
                }
            });

        var EventBindable = Bindable.inherit({
            _commitChangedAttributes: function (attributes) {
                this.callBase();
                this._unbindEvent(this.$previousAttributes['value']);
                if (!_.isUndefined(attributes.value)) {
                    this._bindEvent(attributes.value);
                }
            },
            _unbindEvent: function (value) {
                if (value && value instanceof EventDispatcher) {
                    value.unbind(this.$.event, this.$.callback, this.$.scope);
                }
            },
            _bindEvent: function (value) {
                if (value && value instanceof EventDispatcher) {
                    value.bind(this.$.event, this.$.callback, this.$.scope);
                }
            },
            destroy: function () {
                this._unbindEvent(this.$.value);
                this.$.binding.destroy();

                this.callBase();
            }
        });

        return Bindable;

    });
define('js/core/BindingCreator',['js/core/EventDispatcher','js/lib/parser','js/core/Binding', 'underscore'], function(EventDispatcher,Parser, Binding, _){

    function findTransformFunction(path, scope) {
        var pathElement = path[0];
        if (pathElement.type == Binding.TYPE_FNC) {
            scope = scope.getScopeForFncName(pathElement.name);
        } else {
            scope = scope.getScopeForKey(pathElement.name);
        }

        var nScope = scope;
        while (nScope && path.length > 0) {
            pathElement = path.shift();
            if (pathElement.type == Binding.TYPE_FNC) {
                return nScope[pathElement.name];
            } else if (pathElement.type == Binding.TYPE_VAR) {
                nScope = nScope.get(pathElement.name);
            }
        }

        return false;
    }

    return EventDispatcher.inherit('js.core.BindingCreator',{

        create: function(bindingDef, targetScope, attrKey, context){
            var path = bindingDef.path;
            var pathElement = path[0];

            var scope;
            var searchScope = targetScope;
            if (pathElement.type != Binding.TYPE_FNC && attrKey == pathElement.name) {
                searchScope = searchScope.$parentScope;
            }

            if (pathElement.type == Binding.TYPE_FNC) {
                scope = searchScope.getScopeForFncName(pathElement.name);
            } else {
                scope = searchScope.getScopeForKey(pathElement.name);
            }

            if(scope){
                if (bindingDef.type !== "static") {
                    var cb;
                    if (_.isFunction(attrKey)) {
                        cb = attrKey;
                    }

                    var twoWay = (bindingDef.type == Binding.TYPE_TWOWAY);


                    var options = {scope: scope, path: path, target: targetScope, twoWay: twoWay, context: context, bindingCreator: this};

                    if (twoWay) {
                        if (bindingDef.transform) {
                            var transformFnc = findTransformFunction(bindingDef.transform, searchScope);
                            if (transformFnc) {
                                options.transform = transformFnc;
                            }
                        }

                        if (bindingDef.transformBack) {
                            var transformBackFnc = findTransformFunction(bindingDef.transformBack, searchScope);
                            if (transformBackFnc) {
                                options.transformBack = transformBackFnc;
                            }
                        }
                    }

                    if (cb) {
                        options['callback'] = cb;
                    } else {
                        options['targetKey'] = attrKey;
                    }
                    return new Binding(options);

                } else {
                    return scope.get(bindingDef.path);
                }
            }else{
                throw "Couldn't find scope for " + pathElement.name;
            }

        },

        evaluate: function (text, scope, attrKey) {
            if (!_.isString(text)) {
                return text;
            }
            var bindingDefs = Parser.parse(text, "text"), binding, bindings = [];
            for (var i = 0; i < bindingDefs.length; i++) {
                var bindingDef = bindingDefs[i];
                if (bindingDef.length) {
                    bindingDefs[i] = bindingDef;
                } else {
                    binding = this.create(bindingDef, scope, attrKey, bindingDefs);
                    if (binding instanceof Binding) {
                        bindings.push(binding);
                    }
                    bindingDefs[i] = binding;
                }

            }

            if (bindings.length > 0) {
                return bindings[0].getContextValue();
            } else if (bindingDefs.length > 0) {
                if (bindingDefs.length === 1) {
                    return bindingDefs[0];
                }
                return Binding.contextToString(bindingDefs);
            } else {
                return text;
            }

        }
    });

});
define('js/core/Element',["js/core/Bindable", "underscore", "js/core/BindingCreator"], function (Bindable, _, BindingCreator) {

        var undefined;
        var bindingCreator = new BindingCreator();

        function stringToPrimitive(str) {
            // if it's not a string
            if (_.isString(str)) {

                var num = Number(str);
                if (!isNaN(num)) {
                    return num;
                }

                if (str === "true") {
                    return true;
                } else if (str === "false") {
                    return false;
                }
            }
            return str;
        }

        var Element = Bindable.inherit("js.core.Element", {
            ctor: function (attributes, descriptor, systemManager, parentScope, rootScope) {

                attributes = attributes || {};

                if (!descriptor) {
                    // created from node
                    if (!rootScope) {
                        rootScope = this;
                    }
                }

                this.$descriptor = descriptor;
                this.$stage = systemManager;
                this.$parentScope = parentScope || null;
                this.$rootScope = rootScope || null;
                this.$attributesNamespace = this.$attributesNamespace || {};
                this.$bindingCreator = bindingCreator;

                this.callBase(attributes);

                this._initializeAttributes(this.$);

                // manually constructed
                if (descriptor === undefined || descriptor === null) {
                    this._initialize(this.$creationPolicy);
                }

            },

            _getAttributesFromDescriptor: function (descriptor) {

                this.$attributesNamespace = this.$attributesNamespace || {};

                var attributes = {};

                if (descriptor && descriptor.attributes) {
                    var node, localName;

                    for (var a = 0; a < descriptor.attributes.length; a++) {
                        node = descriptor.attributes[a];
                        // don't add xmlns attributes
                        if(node.nodeName.indexOf("xmlns") !== 0){
                            localName = this._getLocalNameFromNode(node);
                            attributes[localName] = stringToPrimitive(node.value);

                            if (node.namespaceURI) {
                                this.$attributesNamespace[localName] = node.namespaceURI;
                            }

                        }

                    }
                }

                return attributes;
            },
            _getLocalNameFromNode: function(node){
                return node.localName ? node.localName : node.name.split(":").pop();
            },
            defaults: {
                creationPolicy: "auto"
            },

            _initializeAttributes: function (attributes) {
            },

            _initializeDescriptors: function () {
            },

            /**
             *
             * @param creationPolicy
             *          auto - do not overwrite (default),
             *          all - create all children
             *          TODO none?
             */
            _initialize: function (creationPolicy, withBindings) {
                if (this.$initialized) {
                    return;
                }

                this._preinitialize();

                this.initialize();

                this._initializeDescriptors();

                if (this == this.$rootScope || withBindings || this.$descriptor === false) {
                    this._initializeBindings();
                }

            },

            _initializeBindings: function () {
                this._initializationComplete();
            },
            initialize: function () {

            },
            find: function (key) {
                var scope = this.getScopeForKey(key);
                if (this === scope) {
                    return this.get(key);
                } else if (scope != null) {
                    return scope.get(key);
                } else {
                    return null;
                }
            },
            getScopeForKey: function (key) {
                // try to find value for first key
                var value = this.$[key];

                // if value was found
                if (!_.isUndefined(value)) {
                    return this;
                } else if (this.$parentScope) {
                    return this.$parentScope.getScopeForKey(key);
                } else {
                    return null;
                }
            },
            getScopeForFncName: function (fncName) {
                var fnc = this[fncName];
                if (!_.isUndefined(fnc) && _.isFunction(fnc)) {
                    return this;
                } else if (this.$parentScope) {
                    return this.$parentScope.getScopeForFncName(fncName);
                } else {
                    return null;
                }
            },
            _preinitialize: function () {

            },
            _initializationComplete: function () {

                // call commitChangedAttributes for all attributes
                this._commitChangedAttributes(this.$);

                this.$initialized = true;
            },
            _getTextContentFromDescriptor: function (desc) {
                var textContent = desc.textContent || desc.text || desc.data;
                if (!textContent) {
                    textContent = "";
                    for (var i = 0; i < desc.childNodes.length; i++) {
                        var node = desc.childNodes[i];
                        // element or cdata node
                        if (node.nodeType == 1 || node.nodeType == 4) {
                            textContent += this._getTextContentFromDescriptor(node);
                        }
                    }
                }
                return textContent;
            }
        });

        Element.xmlStringToDom = function(xmlString) {

            if (window && window.DOMParser) {
                return (new DOMParser()).parseFromString(xmlString, "text/xml").documentElement;
            } else if (typeof(ActiveXObject) !== "undefined") {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);
                return xmlDoc.documentElement;
            } else {
                throw "Couldn't parse xml string";
            }


        };

        return Element;
    }
);
define('js/core/TextElement',
    ["js/core/Element", "underscore"], function (Element, _) {

        return Element.inherit("js.core.TextElement", {
            _initializeBindings: function () {
                this.$.textContent = this.$bindingCreator.evaluate(this.$.textContent || "", this, "textContent");
                this.callBase();
            },
            _initializeDescriptors: function(){
                if (this.$descriptor) {
                    this.$.textContent = this._getTextContentFromDescriptor(this.$descriptor);
                }
            },
            render: function () {
                if (!this.$initialized) {
                    this._initialize(this.$creationPolicy);
                }

                this.$el = this.$stage.$document.createTextNode("");
                this._renderTextContent(this.$.textContent);


                return this.$el;
            },
            _renderTextContent: function (textContent) {
                if(_.isUndefined(this.$.textContent) || textContent === null){
                    textContent = "";
                }
                this.$el.nodeValue = textContent;

            },
            _commitChangedAttributes: function (attributes) {
                if (this.$el) {
                    if (!_.isUndefined(attributes.textContent)) {
                        this._renderTextContent(attributes.textContent);
                    }
                }
            }
        });
    }
);
define('js/core/Component',["require", "js/core/Element", "js/core/TextElement", "js/core/Bindable", "js/core/EventDispatcher", "underscore"],

    function (require, Element, TextElement, Bindable, EventDispatcher, _) {

        var Template,
            Configuration;


        var Component = Element.inherit("js.core.Component",

            {
                /***
                 * What up??
                 * @param attributes The attributes of the component
                 * @param {String} attributes.style The style of the component
                 * @param {Node} descriptor
                 * @param {js.core.Stage} stage
                 * @param {Element} parentScope
                 * @param {Element} rootScope
                 * @constructs
                 */
                ctor: function (attributes, descriptor, stage, parentScope, rootScope) {
                    if (_.isUndefined(Template)) {
                        try {
                            Template = require('js/core/Template');
                        } catch(e) {
                            Template = null;
                        }
                    }

                    if (_.isUndefined(Configuration)) {
                        try {
                            Configuration = require('js/conf/Configuration');
                        } catch(e) {
                            Configuration = null;
                        }
                    }
                    this.$eventDefinitions = [];
                    this.$internalDescriptors = [];
                    this.$xamlDefaults = {};
                    this.$xamlAttributes = {};
                    var current = this, last;
                    while (current) {
                        if (current._$descriptor && last != current) {
                            this._cleanUpDescriptor(current._$descriptor);
                            this.$internalDescriptors.unshift(current._$descriptor);

                            _.extend(this.$xamlDefaults, this._getAttributesFromDescriptor(current._$descriptor));
                        }
                        current = current.base;
                    }

                    if (descriptor) {
                        this._cleanUpDescriptor(descriptor);
                        this.$xamlAttributes = this._getAttributesFromDescriptor(descriptor);
                    }

                    this.$elements = [];

                    this.$templates = {};
                    this.$configurations = [];
                    this.$children = [];

                    attributes = attributes || {};
                    _.extend(attributes, this.$xamlAttributes, this.$xamlDefaults);

                    this.callBase();
                },

                /**
                 * @name Component#ontest
                 * @event
                 * @param {Event} e Custom Event
                 * @param {String} e.$.value Your value
                 *
                 */
                events: [
                ],
                /**
                 * values to be injected
                 * @key {String} name of the variable for this.$key
                 * @value {Required Class}
                 */
                inject: {},
                _injectChain: function () {
                    return this._generateDefaultsChain("inject");
                },
                _preinitialize: function () {
                    this.callBase();

                    this._inject();
                    this._bindBus();
                },

                _bindBus: function() {
                    for (var f in this) {
                        var fn = this[f];
                        if (fn instanceof Function && fn._busEvents) {
                            for (var i = 0; i < fn._busEvents.length; i++) {
                                this.$stage.$bus.bind(fn._busEvents[i], fn, this);
                            }
                        }
                    }
                },

                _inject: function () {

                    var inject = this._injectChain();

                    if (_.keys(inject).length > 0) {
                        // we need to inject at least on item

                        // synchronous singleton instantiation of Injection,
                        // because if module requires injection, application also depends on
                        // Injection.js and class should be installed.
                        var injection = this.$stage.$injection;
                        if (injection) {
                            for (var name in inject) {
                                if (inject.hasOwnProperty(name)) {
                                    this.$[name] = injection.getInstance(inject[name]);
                                }
                            }
                        } else {
                            throw "injection not available in systemManager";
                        }

                    }

                },
                /***
                 * adds a children
                 * @param {js.core.Element} child
                 */
                addChild: function (child) {
                    if (!(child instanceof Element)) {
                        throw "only children of type js.core.Component can be added"
                    }

                    // initialize auto
                    if (this.$creationPolicy == "auto") {
                        child._initialize(this.$creationPolicy);
                    }

                    if (child.$rootScope && child.$.cid) {
                        // register component by cid in the root scope
                        child.$rootScope.set(child.$.cid, child);
                    }

                    child.$parent = this;
                    // save under elements
                    this.$elements.push(child);

                    // handle special elements
                    if (Template && child instanceof Template) {
                        this._addTemplate(child);
                    } else if (Configuration && child instanceof Configuration) {
                        this._addConfiguration(child);
                    }
                },

                removeChild: function (child) {
                    if (!(child instanceof Element)) {
                        throw "only children of type js.core.Component can be removed"
                    }

                    var index = this.$elements.indexOf(child);
                    if (index != -1) {
                        // child found
                        child.$parent = null;
                        this.$elements.splice(index, 1);
                    }

                    if (this.$templates.hasOwnProperty(child.$.name)) {
                        // remove it from templates
                        delete this.$templates[child.$.name];
                    }

                    index = this.$elements.indexOf(child);
                    if (index != -1) {
                        this.$configurations.splice(index, 1);
                    }

                },

                _addTemplate: function (template) {
                    if (!template.$.name) {
                        throw "template without name";
                    }
                    this.$templates[template.$.name] = template;
                },

                _addConfiguration: function (config) {
                    this.$configurations.push(config);
                },

                getTemplate: function (name) {
                    var tpl = this.$templates[name];
                    if (tpl) {
                        return tpl;
                    } else if (this.$parent && this.$parent != this) {
                        return this.$parent.getTemplate(name);
                    } else {
                        return null
                    }
                },
                _initializeChildren: function (childComponents) {
                    for (var i = 0; i < childComponents.length; i++) {
                        // add the children
                        this.addChild(childComponents[i]);
                    }
                },
                /***
                 *
                 * @param attributes
                 */
                _initializeAttributes: function (attributes) {
                    this.callBase();

                    if (this.$creationPolicy != "full") {
                        if (attributes.hasOwnProperty("creationPolicy")) {
                            this.$creationPolicy = attributes.creationPolicy;
                            delete attributes.creationPolicy;
                        }
                    }

                },
                /***
                 *  Initializes all internal and external descriptors
                 */
                _initializeDescriptors: function () {
                    var children = [];

                    var desc;
                    for (var d = 0; d < this.$internalDescriptors.length; d++) {
                        desc = this.$internalDescriptors[d];
                        children = children.concat(this._getChildrenFromDescriptor(desc, this));
                    }

                    children = children.concat(this._getChildrenFromDescriptor(this.$descriptor));

                    var extraChildren = this.createChildren();
                    if (extraChildren) {
                        children = children.concat(extraChildren);
                    }

                    this._initializeChildren(children);

                    this._childrenInitialized();

                    this._initializeEventAttributes(this.$xamlDefaults, this);
                    this._initializeEventAttributes(this.$xamlAttributes, this.$rootScope);
                },

                createChildren: function() {

                },

                _cleanUpDescriptor: function (desc) {
                    if (desc && desc.childNodes) {
                        var node, text;
                        // remove empty text nodes
                        for (var i = desc.childNodes.length - 1; i >= 0; i--) {
                            node = desc.childNodes[i];
                            if (node.nodeType === 3) {
                                text = node.textContent || node.text || node.data;
                                if (!text || text.trim().length === 0) {
                                    desc.removeChild(node);
                                }

                            }
                        }
                    } else {
                        console.warn("Descriptor not defined or not correct");
                    }
                },
                /**
                 * an array of attributes names, which will expect handler functions
                 */
                _isEventAttribute: function (attributeName) {
                    return attributeName.indexOf("on") == 0;
                    // return this._eventAttributes.hasOwnProperty(attributeName);
                },
                /**
                 * Returns true if event is defined in Component event list
                 * @param event
                 */
                _isComponentEvent: function (event) {
                    for (var i = 0; i < this.events.length; i++) {
                        if (event == this.events[i]) {
                            return true;
                        }
                    }
                    return false;
                },
                _getEventTypeForAttribute: function (eventName) {
                    // TODO: implement eventAttribites as hash
                    return this._eventAttributes[eventName];
                },
                _initializeEventAttributes: function (attributes, rootScope) {
                    var event = '';
                    for (var key in attributes) {
                        if (attributes.hasOwnProperty(key)) {
                            var value = attributes[key];

                            if (this._isEventAttribute(key)) {
                                if (rootScope[value]) {

                                    this.$eventDefinitions.push({
                                        name: key,
                                        scope: rootScope,
                                        fncName: value
                                    });
                                    event = key.substr(2);
                                    if (this._isComponentEvent(event)) {
                                        this.bind(event, rootScope[value], rootScope);
                                    }

                                } else {
                                    throw "Couldn't find callback " + value + " for " + key + " event";
                                }
                            }
                        }
                    }
                },
                /***
                 * Initialize all Binding and Event attributes
                 */
                _initializeBindings: function () {
                    var attributes = this.$;

                    var value;
                    // Resolve bindings and events
                    for (var key in attributes) {

                        if (attributes.hasOwnProperty(key)) {
                            value = attributes[key];
                            this.$[key] = this.$bindingCreator.evaluate(value, this, key);
                        }
                    }

                    for (var c = 0; c < this.$elements.length; c++) {
                        this.$elements[c]._initializeBindings();
                    }

                    this.callBase();
                },
                /***
                 * Create {@link Component} for DOM Node with given attributes
                 * @param {DOM} node
                 * @param [attributes] for new Component
                 */
                _createComponentForNode: function (node, attributes, rootScope) {
                    if (!node) return null;

                    attributes = attributes || {};
                    rootScope = rootScope || this.$rootScope;
                    // only instantiation and construction but no initialization

                    if (node.nodeType == 1) { // Elements

                        var fqClassName = this.$stage.$applicationContext.getFqClassName(node.namespaceURI, this._localNameFromDomNode(node), true);
                        var className = this.$stage.$applicationContext.getFqClassName(node.namespaceURI, this._localNameFromDomNode(node), false);

                        return this.$stage.$applicationContext.createInstance(fqClassName, [attributes, node, this.$stage, this, rootScope], className);

                    } else if (node.nodeType == 3 || node.nodeType == 4) { // Text nodes
                        // remove whitespaces from text text nodes
                        var text = node.textContent ? node.textContent : node.text;
                        if (node.textContent) {
                            node.textContent = text;
                        }
                        // only instantiation and construction but no initialization
                        return this._createTextElement(node, rootScope);
                    }

                    return null;
                },

                createComponent: function(factory, attributes) {
                    attributes = attributes || [];
                    return this.$stage.$applicationContext.createInstance(factory, [attributes, false, this.$stage, this, this.$rootScope]);
                },

                _createTextElement: function(node, rootScope) {
                    return this.$stage.$applicationContext.createInstance('js/core/TextElement', [null, node, this.$stage, this, rootScope]);
                },

                /***
                 * Converts all child nodes of a descriptor to instances of Components or TextElement
                 * @param descriptor
                 */
                _getChildrenFromDescriptor: function (descriptor, rootScope) {
                    var childrenFromDescriptor = [], node, component;

                    if (descriptor) {
                        for (var i = 0; i < descriptor.childNodes.length; i++) {
                            node = descriptor.childNodes[i];
                            component = this._createComponentForNode(node, null, rootScope);
                            if (component) {
                                childrenFromDescriptor.push(component);
                            }
                        }
                    }

                    return childrenFromDescriptor;
                },
                /***
                 * @private
                 * This method is called after all children are initialized
                 */
                _childrenInitialized: function () {

                },
                /***
                 * This method should overridden by custom components to set initial variables
                 * @param scope
                 */
                initialize: function (scope) {
                },
                /**
                 * IE8 FIXES
                 * @param domNode
                 */
                _localNameFromDomNode: function (domNode) {
                    if (domNode.localName) return domNode.localName;

                    var st = domNode.tagName.split(":");
                    return st[st.length - 1];
                }
            });

        return Component;
    }
);
define('js/core/Content',["require","js/core/Component"], function (require,Component) {
    return Component.inherit("js.core.Content", {
        getChildren: function(){
            var el, children = [];
            for(var i = 0; i < this.$elements.length; i++){
                el = this.$elements[i];
                if(el instanceof require("js/core/DomElement")){
                    children.push(el);
                }
            }
            return children;
        }
    });
});
define('js/core/DomElement',["require", "js/core/EventDispatcher","js/core/Component", "js/core/Content", "js/core/Binding", "inherit", "underscore"],
    function (require, EventDispatcher, Component, Content, Binding, inherit, _) {

        var rspace = /\s+/;

        var ContentPlaceHolder;

        var DomElementFunctions = {

            $classAttributes: [
                /^\$/,
                /^data/,
                /^xmlns/,
                /^on/,
                "cid",
                /^_/ // private attributes
            ],

            ctor: function (attributes, descriptor, systemManager, parentScope, rootScope) {
                this.$renderMap = {};
                this.$children = [];
                this.$contentChildren = [];
                this.$domEventHandler = {};
                // go inherit tree up and search for descriptors
                var current = this;
                while (current) {
                    if (current.$classAttributes) {
                        this.$classAttributes = this.$classAttributes.concat(current.$classAttributes);
                    }
                    current = current.base;
                }


                this.callBase();

                if (descriptor) {
                    if (!this.$tagName) {
                        this.$tagName = descriptor.tagName;
                    }
                    if (!this.$namespace) {
                        this.$namespace = descriptor.namespaceURI;
                    }
                }
            },

            _inject: function () {
                this.callBase();

                var inject = this._injectChain();

                for (var name in inject) {
                    if (inject.hasOwnProperty(name)) {
                        this.$classAttributes.push(name);
                    }
                }

            },

            _initializeAttributes: function (attributes) {
                this.callBase();

                if (attributes.tagName) {
                    this.$tagName = attributes.tagName;
                    delete(attributes.tagName);
                }

                if (attributes.namespace) {
                    this.$namespace = attributes.namespace;
                    delete (attributes.namespace);
                }
            },

            addChild: function (child) {
                this.callBase();

                if (child instanceof DomElement || child.render) {
                    this.$children.push(child);
                    if (this.isRendered()) {
                        this._renderChild(child);
                    }
                } else if (child instanceof Content) {
                    this.$contentChildren.push(child);
                }
            },

            removeChild: function (child) {
                this.callBase();
                if (child instanceof DomElement || child.render) {
                    if (this.isRendered()) {
                        this._removeRenderedChild(child);
                    }
                    var i = this.$children.indexOf(child);
                    this.$children.splice(i, 1);
                }
            },

            getPlaceHolder: function (name) {
                for (var i = 0; i < this.$children.length; i++) {
                    if (this.$children[i].$.name === name) {
                        return this.$children[i];
                    }
                }
                var placeholder;
                for (i = 0; i < this.$children.length; i++) {
                    if (this.$children[i].getPlaceHolder) {
                        placeholder = this.$children[i].getPlaceHolder(name);
                        if (placeholder) {
                            return placeholder;
                        }
                    }

                }
                return null;
            },

            remove: function () {
                if (this.$parent) {
                    this.$parent.removeChild(this);
                }
            },

            getContentPlaceHolders: function () {

                if (!ContentPlaceHolder) {
                    ContentPlaceHolder = require('js/ui/ContentPlaceHolder');
                }

                var ret = [];

                var child;
                for (var i = 0; i < this.$children.length; i++) {
                    child = this.$children[i];

                    if (ContentPlaceHolder && child instanceof ContentPlaceHolder) {
                        ret.push(child);
                    } else if (child instanceof DomElement) {
                        ret = ret.concat(child.getContentPlaceHolders());
                    }
                }

                return ret;

            },

            findContent: function (name) {

                var child,
                    content;

                for (var i = 0; i < this.$elements.length; i++) {
                    child = this.$elements[i];
                    if (child instanceof Content && child.$.name === name) {
                        return child;
                    }
                }

                for (i = 0; i < this.$elements.length; i++) {
                    child = this.$elements[i];
                    if (child.findContent) {
                        content = child.findContent(name);
                        if (content) {
                            return content;
                        }
                    }

                }

                return null;
            },

            render: function () {

                if (!this.$initialized) {
                    this._initialize(this.$creationPolicy);
                }
                // check if it is already rendered
                if (this.isRendered()) {
                    return this.$el;
                }

                this.$renderedChildren = [];

                if (this.$stage.$document.createElementNS && this.$namespace && /^http/.test(this.$namespace)) {
                    this.$el = this.$stage.$document.createElementNS(this.$namespace, this.$tagName);
                } else {
                    this.$el = this.$stage.$document.createElement(this.$tagName);
                }

                this._initializeRenderer(this.$el);
                this._renderChildren(this.$children);
                this._renderContentChildren(this.$contentChildren);
                this._renderAttributes(this.$);
                this._bindDomEvents(this.$el);

                return this.$el;
            },
            _bindDomEvents: function (el) {
                var eventDef, es;

                for (var i = 0; i < this.$eventDefinitions.length; i++) {
                    eventDef = this.$eventDefinitions[i];
                    es = eventDef.name.substr(2);
                    this.bind(es, eventDef.scope[eventDef.fncName], eventDef.scope);
                }
            },

            _initializeRenderer: function (el) {
                // hook
            },

            _renderChildren: function (children) {
                // for all children
                var child;
                for (var i = 0; i < children.length; i++) {
                    child = children[i];
                    this._renderChild(child);
                }
            },

            _renderContentChildren: function (children) {
                var child;
                for (var i = 0; i < children.length; i++) {
                    child = children[i];
                    var ref = child.get('ref');
                    var placeHolder = this.getPlaceHolder(ref);
                    if (placeHolder) {
                        placeHolder.set({content: child});
                    }
                }
            },

            _renderChild: function (child) {
                if (_.isFunction(child.render)) {
                    var el = child.render();
                    this.$renderedChildren.push(child);
                    if (el) {
                        this.$el.appendChild(el);
                    }
                }
            },

            _renderComponentClass: function (cls, oldCls) {
                if (oldCls) {
                    this.removeClass(oldCls);
                }
                if (cls) {
                    this.addClass(cls);
                }
            },

            _renderClass: function (className) {
                if (className) {
                    this.addClass(className);
                }

            },

            _removeRenderedChild: function (child) {
                if (this.isRendered()) {
                    var rc;
                    for (var i = this.$renderedChildren.length - 1; i >= 0; i--) {
                        rc = this.$renderedChildren[i];
                        if (child === rc) {
                            this.$el.removeChild(rc.$el);
                            this.$renderedChildren.splice(i, 1);
                            return;
                        }
                    }
                }
            },

            _clearRenderedChildren: function () {
                if (this.isRendered()) {
                    var rc;
                    for (var i = this.$renderedChildren.length - 1; i >= 0; i--) {
                        rc = this.$renderedChildren[i];
                        this.$el.removeChild(rc.$el);
                    }
                }
                this.$renderedChildren = [];
            },

            _getIndexOfPlaceHolder: function (placeHolder) {
                if (this.$layoutTpl) {
                    var child;
                    for (var i = 0; i < this.$layoutTpl.$children.length; i++) {
                        child = this.$layoutTpl.$children[i];
                        if (placeHolderId == child.$cid) {
                            return i;
                        }
                    }
                }
                return -1;
            },

            isRendered: function () {
                return typeof (this.$el) !== "undefined";
            },

            _renderAttributes: function (attributes) {
                var attr;
                for (var key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        attr = attributes[key];
                        this._renderAttribute(key, attr);
                    }
                }
            },

            _renderAttribute: function (key, attr) {
                var method = this.$renderMap[key];
                var prev = this.$previousAttributes[key];

                if (_.isUndefined(method)) {
                    // generic call of render functions

                    var k = key.charAt(0).toUpperCase() + key.substr(1);
                    var methodName = "_render" + k;
                    method = this[methodName];

                    if (!_.isFunction(method)) {
                        method = false;
                    }

                    this.$renderMap[key] = method;
                }
                if (method !== false) {
                    method.call(this, attr, prev);
                } else {
                    var cAttr;
                    for (var i = 0; i < this.$classAttributes.length; i++) {
                        cAttr = this.$classAttributes[i];
                        if (cAttr instanceof RegExp) {
                            if (cAttr.test(key)) {
                                return;
                            }
                        } else {
                            if (cAttr == key) {
                                return;
                            }
                        }
                    }
                    this._setAttribute(key, attr);
                }
            },
            _setAttribute: function (key, value, namespaceUri) {

                if (!_.isUndefined(value)) {

                    namespaceUri = namespaceUri || this.$attributesNamespace[key];

                    if (this.$el.setAttributeNS && namespaceUri) {
                        this.$el.setAttributeNS(namespaceUri, key, value)
                    } else {
                        this.$el.setAttribute(key, value);
                    }
                }
            },


            _commitChangedAttributes: function (attributes) {
                if (this.isRendered()) {
                    this._renderAttributes(attributes);
                }
            },
            destroy: function () {
                this.callBase();

                if (this.$children) {
                    for (var i = 0; i < this.$children.length; i++) {
                        this.$children[i].destroy();
                    }
                }
            },
            html: function () {
                if (!this.isRendered()) {
                    this.render();
                }
                return this.$el.innerHTML;

            }.on('change'),
            dom: function (element) {
                return new DomManipulation(element || this);
            },
            setChildIndex: function (child, index) {
                if(index < 0){
                    index += this.$children.length;
                }
                if(index >= this.$children.length ){
                    index -= this.$children.length;
                }
                var oldIndex = this.$children.indexOf(child);
                if (oldIndex !== index) {
                    this.$children.splice(oldIndex, 1);
                    this.$children.splice(index, 0, child);
                    if (this.isRendered() && child.isRendered()) {
                        if (this.$renderedChildren.length > 1) {
                            this.$el.removeChild(child.$el);
                            if (index < this.$el.childNodes.length) {
                                this.$el.insertBefore(child.$el, this.$el.childNodes[index]);
                            } else {
                                this.$el.appendChild(child.$el);
                            }
                        }
                    }
                }
            },
            bringToFront: function () {
                if (this.$parent) {
                    this.$parent.setChildIndex(this, this.$parent.$children.length - 1);
                }
            },
            sendToBack: function () {
                if (this.$parent) {
                    this.$parent.setChildIndex(this, 0);
                }
            },
            bind: function (type, eventHandler, scope) {
                var self = this;
                this.callBase();
                if (this.isRendered() && !this.$domEventHandler[type] && !this._isComponentEvent(type))  {
                    var cb = this.$domEventHandler[type] = function (originalEvent) {
                        var e = new DomElement.Event(originalEvent);
                        try {
                            self.trigger(type, e, self);
                        } catch(e) {}
                        if (e.isPropagationStopped) {
                            return false;
                        }
                    };
                    this.bindDomEvent(type,cb);
                }
            },

            unbind: function (type, handle, scope) {
                this.callBase();
                var handlers = this._eventHandlers[type];
                if (handlers && handlers.length === 0) {
                    var cb = this.$domEventHandler[type];
                    if(cb){
                        this.unbindDomEvent(type,cb);
                    }
                }
            }
        };

        var DomManipulationFunctions = {
            hasClass: function (value) {
                return this.$el.className.split(" " + value + " ").length != 1;
            },
            addClass: function (value) {
                var classNames = value.split(rspace);

                if (!this.$el.className && classNames.length === 1) {
                    this.$el.className = value;
                } else {
                    var setClasses = this.$el.className.split(rspace);

                    for (var i = 0; i < classNames.length; i++) {
                        if (setClasses.indexOf(classNames[i]) == -1) {
                            setClasses.push(classNames[i]);
                        }
                    }

                    this.$el.className = setClasses.join(" ");

                }
            },

            removeClass: function (value) {

                if (!(this.$el.className && this.$el.className.length !== 0)) {
                    return;
                }
                var removeClasses = value.split(rspace);

                var classes = this.$el.className.split(rspace);

                for (var i = 0; i < removeClasses.length; i++) {
                    var index = classes.indexOf(removeClasses[i]);
                    if (index != -1) {
                        classes.splice(index, 1);
                    }
                }

                if (classes.length === 0) {
                    this.$el.removeAttribute('class');
                } else {
                    this.$el.className = classes.join(" ");
                }
            },
            bindDomEvent: function (type, cb) {
                if (this.$el.addEventListener) {
                    this.$el.addEventListener(type, cb, false);

                } else if (this.$el.attachEvent) {
                    this.$el.attachEvent("on" + type, cb);
                }
            },
            unbindDomEvent: function (type, cb) {
                if (this.$el.removeEventListener) {
                    this.$el.removeEventListener(type, cb, false);
                } else if (this.$el.detachEvent) {
                    this.$el.detachEvent("on" + type, cb);
                }
            }
        };

        var DomManipulation = inherit.Base.inherit(_.extend({
            ctor: function (elm) {
                this.$el = elm;
            }
        }, DomManipulationFunctions));

        var DomElement = Component.inherit("js.html.DomElement",
            _.extend(DomElementFunctions, DomManipulationFunctions));

        DomElement.Event = EventDispatcher.Event.inherit({
            ctor: function (domEvent) {
                this.domEvent = domEvent;
                this.callBase(domEvent);
            },
            stopPropagation: function () {
                this.callBase();

                var e = this.domEvent;
                if (e) {
                    if (e.stopPropagation) {
                        e.stopPropagation();
                    }
                    e.cancelBubble = true;
                }
            },
            preventDefault: function () {
                this.callBase();
                var e = this.domEvent;
                if (e) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;  // IE
                    }
                }
            }
        });

        return DomElement;
    }
);
define('js/html/HtmlElement',['js/core/DomElement'], function(DomElement) {

    var HTML_Namespace = "http://www.w3.org/1999/xhtml";

    var HtmlElement = DomElement.inherit("js.html.HtmlElement", {

        defaults: {
            selected: undefined,
            selectable: undefined,
            namespace: HTML_Namespace
        },

        _renderVisible: function (visible) {
            if (visible === true) {
                this.removeClass('hide');
            } else if (visible === false) {
                this.addClass('hide');
            }
        },

        _renderHidden: function (hidden) {
            if (typeof(hidden) !== "undefined") {
                this.set({visible: !hidden});
            }
        },

        _renderSelected: function (selected) {
            if (selected === true) {
                this.addClass('active');
            } else if (selected === false) {
                this.removeClass('active');
            }
        },

        _renderSelectable: function (selectable) {
            if (selectable === true) {
                if (!this._onSelect) {
                    var self = this;
                    this._onSelect = function () {
                        self.set({selected: !self.$.selected});
                    };
                }
                this.bindDomEvent('click', this._onSelect);
            } else {
                if (this._onSelect) {
                    this.unbindDomEvent('click', this._onSelect);
                }
            }
        },
        _renderWidth: function (width) {
            if (width) {
                if (typeof(width) !== "string") {
                    width += "px";
                }
                this.$el.style.width = width;
            }
        },
        _renderHeight: function (height) {
            if (height) {
                if (typeof(height) !== "string") {
                    height += "px";
                }
                this.$el.style.height = height;
            }
        }

    });

    HtmlElement.HTML_Namespace = HTML_Namespace;

    return HtmlElement;
});
define('js/core/UIComponent',["js/html/HtmlElement"], function (HtmlElement) {
    return HtmlElement.inherit("js.core.UIComponent", {
        defaults: {
            tagName: "div"
        }
    });
});
define('js/conf/Configuration',["js/core/Component"], function (Component) {
    return Component.inherit("js.core.Configuration", {
    });
});
define('js/conf/Route',["js/conf/Configuration"], function (Configuration) {
    return Configuration.inherit("js.conf.Route", {});
});
define('js/core/Router',["js/core/Component", "underscore", "js/conf/Route"],

    function (Component, _, Route) {

        return Component.inherit("js.core.Router", {
            ctor: function () {

                this.$routes = [];

                this.callBase();
            },

            initialize: function () {
                this.callBase();

                if (this.$.history) {
                    this.history = this.$.history;
                } else {
                    this.history = this.$stage.$history;
                }

                this.history.addRouter(this);
            },

            _initializeChildren: function (childComponents) {
                this.callBase();
            },

            _childrenInitialized: function () {
                this.callBase();

                for (var c = 0; c < this.$configurations.length; c++) {
                    var config = this.$configurations[c];

                    if (config instanceof Route) {
                        this.addRoute(config.$);
                    }
                }
            },


            /**
             *
             * @param {Regexp|Object} route
             * @param {Function} [fn]
             */
            addRoute: function () {

                var route;
                if (arguments.length == 2) {
                    route = {
                        route: arguments[0],
                        fn: arguments[1]
                    }
                } else {
                    route = arguments[0];
                }

                if (route.onexec) {
                    route.fn = this.$rootScope[route.onexec];
                }

                _.defaults(route, {
                    name: null,
                    route: null,
                    fn: null
                });

                if (route.route && !(route.route instanceof RegExp)) {
                    // build regex from string
                    route.route = new RegExp(route.route);
                }

                if (!(route.fn && route.route)) {
                    throw "fn and route required"
                }

                this.$routes.push(route);
            },

            generateRoutingStack: function(fragment) {

                var delegates = [],
                    rootScope = this.$rootScope,
                    self = this;

                function addDelegate(route, params) {

                    delegates.push(function(cb) {

                        var fragment = params.shift();
                        var routeContext = {
                            callback: cb,
                            router: self,
                            params: _.clone(params),
                            fragment: fragment,
                            // breaks the routeStack execution
                            end: function() {
                                cb.end();
                            },
                            navigate: function(fragment, createHistoryEntry, triggerRoute)  {
                                if (_.isUndefined(createHistoryEntry)) {
                                    createHistoryEntry = false;
                                }

                                self.navigate(fragment, createHistoryEntry, triggerRoute, cb);
                            }
                        };

                        params.unshift(routeContext);

                        if (route.fn._async) {
                            try {
                                route.fn.apply(rootScope, params);
                            } catch (e) {
                                cb(e);
                            }
                        } else {
                            // exec route sync, call callback after execution
                            try {
                                cb(null, route.fn.apply(rootScope, params));
                            } catch (e) {
                                cb(e);
                            }
                        }
                    });
                }

                for (var i = 0; i < this.$routes.length; i++) {
                    // get the route
                    var route = this.$routes[i];
                    // and test against regexp
                    var params = route.route.exec(fragment);

                    if (params) {
                        // route matches
                        addDelegate(route, params);
                    }
                }

                return delegates;
            },

            executeRoute: function (fragment, callback) {
                // Test routes and call callback
                for (var i = 0; i < this.$routes.length; i++) {
                    var route = this.$routes[i];
                    var params = route.route.exec(fragment);
                    if (params) {

                        var cb = function (err, data) {
                            if (callback) {
                                callback(err, data);
                            }
                        };

                        params.shift();

                        var routeContext = {
                            callback: cb,
                            router: this,
                            params: _.clone(params),
                            fragment: fragment
                        };

                        params.unshift(routeContext);

                        var thisArg = this.$rootScope;

                        if (route.fn._async) {
                            route.fn.apply(thisArg, params);
                        } else {
                            // exec route sync, call callback after execution
                            try {
                                cb(null, route.fn.apply(thisArg, params));
                            } catch (e) {
                                cb(e);
                            }
                        }

                        return true;
                    }
                }

                return false;
            },

            /**
             * shortcut to history.navigate
             * @param to
             * @param createHistoryEntry
             * @param triggerRoute
             */
            navigate: function (to, createHistoryEntry, triggerRoute, callback) {
                return this.history.navigate(to, createHistoryEntry, triggerRoute, callback);
            }
        });
    });
define('js/core/Module',["js/core/UIComponent", "js/core/Router"], function (UIComponent, Router) {
    return UIComponent.inherit("js.core.Module", {

        ctor: function() {
            this.callBase();
            this.$routers = [];
        },

        /**
         * loads the
         * @param callback
         * @param [routeContext]
         */
        start: function (callback, routeContext) {
            if (callback) {
                callback();
            }
        },

        render: function (target) {
            // module won't render anything, but delivers content via js:Content
            // content is rendered inside ContentPlaceHolders
        },

        addChild: function(component) {
            this.callBase();

            if (component instanceof Router) {
                this.$routers.push(component);
            }
        }
    });
});
define('js/html/a',['js/html/HtmlElement'], function (HtmlElement) {

    var externalLink = /^(([^:]+:\/\/)|(javascript:))/i,
        stripHashSlash = /^#?\/?/,
        hashBankUrl = /^#?(.*)$/;

    return HtmlElement.inherit("js.html.a", {
        defaults: {
            tagName: 'a',
            target: null,
            href: null
        },
        _renderHref: function (href) {
            href = href || "javascript:void(0);";

            if (!(this.$.target === "external" || externalLink.test(href) || this.$.target === "_blank")) {

                href = "#/" + href.replace(stripHashSlash, '');

                if (!this.runsInBrowser()) {
                    // node rendering -> hash bang url
                    href = href.replace(hashBankUrl, "#!$1");
                }
            }

            this.$el.setAttribute("href", href);
        },

        _renderTarget: function(target) {
            if (target && target !== "external") {
                this.$el.setAttribute("target", target);
            }
        }
    });
});
define('xaml!app/module/License',['js/core/Module','js/core/Element','js/core/Content','js/html/HtmlElement','js/html/a'], function(baseClass, ELEMENT ){return baseClass.inherit({  _$descriptor: ELEMENT.xmlStringToDom('<js:Module xmlns="http://www.w3.org/1999/xhtml" xmlns:js="js.core" xmlns:ui="js.ui" xmlns:module="app.module" xmlns:md="md" xmlns:conf="js.conf"><js:Content name="main"><h1>License</h1><p>Copyright (c) 2012 Tony Findeisen, Marcus Krejpowicz</p><p>Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the "Software"), to dealin the Software without restriction, including without limitation the rightsto use, copy, modify, merge, publish, distribute, sublicense, and/or sellcopies of the Software, and to permit persons to whom the Software isfurnished to do so, subject to the following conditions:</p><p>The above copyright notice and this permission notice shall be included inall copies or substantial portions of the Software.</p><p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS ORIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THEAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHERLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS INTHE SOFTWARE.</p><h2>Libraries</h2><ul><li><a href="https://github.com/jrburke/requirejs/blob/master/LICENSE">requirejs (BSD, MIT)</a></li><li><a href="https://github.com/it-ony/flow.js/blob/master/LICENSE">flow.js (MIT)</a></li><li><a href="https://github.com/it-ony/inherit.js/blob/master/LICENSE">inherit.js (MIT)</a></li><li><a href="https://github.com/documentcloud/underscore/blob/master/LICENSE">underscore</a></li></ul></js:Content></js:Module>')})});