define(['js/data/Model', 'documentation/entity/Method', 'underscore'], function (Model, Method, _) {

    var stripTrainingUnderscore = /^_/,
        baseUrl = "https://github.com/it-ony/rAppid.js/blob/master",
        nodeBaseUrl = "https://github.com/joyent/node/tree/master/lib",
        fileNameMap = {
            underscore: "js/lib/underscore",
            flow: "js/lib/flow",
            inherit: "js/lib/inherit",
            parser: "js/lib/parser"
        },
        documentationMap = {
            underscore: "http://http://underscorejs.org/",
            flow: "https://github.com/it-ony/flow.js",
            require: "http://requirejs.org/",
            inherit: "https://github.com/it-ony/inherit.js"
        };

    var Class = Model.inherit('documentation.model.Class', {

        schema: {
            methods: [Method]
        },

        packageName: function () {
            var path = this.$.id.split('.');
            path.pop();
            return path.join('.');
        },

        className: function () {
            return this.$.id.split('.').pop();
        },

        fileName: function () {
            var path = this.getPath();

            if (this.isNodeModule(path)) {
                return path;
            } else {
                return path.replace(/\./g, "/") + ".js";
            }
        }.onChange("id"),

        fileLink: function () {
            var path = this.getPath();

            if (/^http/.test(path)) {
                return path;
            } else if (this.isNodeModule(path)) {
                return nodeBaseUrl + "/" + path + ".js";
            } else {
                return baseUrl + "/" + path.replace(/\./g, "/") + ".js";
            }

        }.onChange("id"),

        isNodeModule: function (name) {
            return name.indexOf(".") === -1 && name.indexOf("/") === -1;
        },

        getPath: function () {
            var name = this.$.id;
            return fileNameMap[name] || name;
        },

        documentationLink: function () {
            var path = this.getPath();

            if (documentationMap.hasOwnProperty(this.$.id)) {
                return documentationMap[this.$.id];
            }
            else if (this.isNodeModule(path)) {
                return "http://nodejs.org/api/" + path + ".html";
            } else {
                return "api/" + this.$.id;
            }

        }.onChange("id"),

        hasSee: function () {
            return !!(this.$.see && this.$.see.length > 0);
        },

        getSees: function () {
            var ret = [],
                self = this;

            if (this.$.see) {
                _.each(this.$.see, function (value) {
                    ret.push(self.$context.createEntity(Class, value));
                });
            }

            return ret;
        },

        inheritancePath: function () {

            var ret = [];

            // build the inheritance path with real objects
            var inheritancePath = this.$.inheritancePath;

            if (inheritancePath) {
                for (var i = 0; i < inheritancePath.length; i++) {
                    ret.push(this.$context.createEntity(Class, inheritancePath[i]));
                }
            }

            return ret;

        }.onChange('inheritancePath'),

        dependencies: function () {
            var ret = [];

            // build the inheritance path with real objects
            var dependencies = this.$.dependencies;

            if (dependencies) {
                for (var i = 0; i < dependencies.length; i++) {
                    ret.push(this.$context.createEntity(Class, dependencies[i]));
                }
            }

            return ret;

        }.onChange('dependencies'),

        /***
         *
         * @param {String} [type=''] shows either 'all' or 'protected' or 'public' methods
         * @param {Boolean} [showInherit=false]
         * @return {Array}
         */
        getMethods: function (type, showInherit) {

            var ret = [],
                ctor = null;

            this.$.methods.each(function (method) {
                if ((type === 'all' || type === method.$.visibility)) {

                    if (showInherit || (!showInherit && !method.$.hasOwnProperty('definedBy'))) {

                        if (method.$.name === 'ctor') {
                            // save ctor and add later
                            ctor = method;
                        } else {
                            ret.push(method);
                        }
                    }
                }
            });

            ret.sort(function (a, b) {

                a = (a.$.name || "").replace(stripTrainingUnderscore, '');
                b = (b.$.name || "").replace(stripTrainingUnderscore, '');

                return a > b ? 1 : -1;
            });

            if (ctor) {
                ret.unshift(ctor);
            }

            return ret;

        }

    });

    return Class;
});