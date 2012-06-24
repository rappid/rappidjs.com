define(['js/data/Model', 'underscore'], function(Model, _) {

    var Class = Model.inherit('documentation.model.Class', {

        packageName: function() {
            var path = this.$.id.split('.');
            path.pop();
            return path.join('.');
        },

        className: function () {
            return this.$.id.split('.').pop();
        },

        inheritancePath: function() {

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

        /***
         *
         * @param {String} [type=all]
         * @param {Boolean} [showInherit=true]
         * @return {Array}
         */
        getMethods: function(type, showInherit) {

            type = type || 'all';

            var ret = [],
                methodNames = [],
                methods = this.$.methods,
                method;

            // TODO: show inherit methods

            if (methods) {
                for (method in methods) {
                    if (methods.hasOwnProperty(method)) {
                        var isPublic = method.substr(0, 1) !== '_';

                        if (type === 'all' || (isPublic && type === 'public') || (!isPublic && type === 'protected')) {
                            // method for requested type
                            methodNames.push(method);
                        }
                    }
                }

                methodNames.sort();

                for (var i = 0; i < methodNames.length; i++) {
                    var methodName = methodNames[i];
                    method = methods[methodName];

                    if (method) {
                        method.name = methodName;

                        if (methodName === 'ctor') {
                            ret.unshift(method);
                        } else {
                            ret.push(method);
                        }
                    }

                }

            }

            return ret;
        }

    });

    return Class;
});