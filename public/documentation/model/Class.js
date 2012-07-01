define(['js/data/Model', 'documentation/entity/Method', 'underscore'], function (Model, Method, _) {

    var stripTrainingUnderscore = /^_/;

    var Class = Model.inherit('documentation.model.Class', {

        $schema: {
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

        hasSee: function() {
            return !!(this.$.see && this.$.see.length > 0);
        },

        getSees: function() {
            var ret = [],
                self = this;

            if (this.$.see) {
                _.each(this.$.see, function(value) {
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