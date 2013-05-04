define(['js/core/Module', "json!doc/index.json", "js/core/List", "documentation/model/Class", "underscore"], function (Module, classIndex, List, Class, _) {

    return Module.inherit("app.module.DocumentationClass", {

        defaults: {
            classes: List,
            doc: null,
            searchString: ""
        },

        showTypes: function (showPublic, showProtected) {

            var type = (showPublic ? 2 : 0) + (showProtected ? 1 : 0);

            return ['', 'protected', 'public', 'all'][type];
        },

        _initializationComplete: function () {
            for (var i = 0; i < classIndex.length; i++) {
                this.$.classes.add(this.$.api.createEntity(Class, classIndex[i]));
            }

            if (!this.runsInBrowser()) {
                var checked = {
                    checked: true
                };

                this.$.showPublic.set(checked);
                this.$.showProtected.set(checked);

                this.$.showPublicStatic.set(checked);
                this.$.showProtectedStatic.set(checked);

                this.$.publicAttributesCheckbox.set(checked);
                this.$.protectedAttributesCheckbox.set(checked);

            }

            this.callBase();
        },

        initialize: function () {
            this.set('filterDocs', function (doc, index, filterList) {
                return !filterList.$.searchString || doc.$.id.toLowerCase().indexOf(filterList.$.searchString.toLowerCase()) > -1;
            });
        },

        hasCurrentDocumentation: function () {
            return !!this.$.doc;
        }.onChange('doc'),

        hasSection: function (what) {

            var doc = this.$.doc;

            if (what && doc && doc.$.hasOwnProperty(what)) {
                var value = doc.$[what];

                if (value instanceof List) {
                    return value.size() > 0;
                } else if (_.isObject(value)) {
                    return _.keys(value) > 0;
                } else if (_.isArray(value)) {
                    return value.length > 0;
                }
            }

            return false;

        }.onChange('doc'),

        title: function (className) {
            return (className ? className + " - " : "") + 'API Reference - rAppid.js';
        },

        showClass: function (routeContext, fqClassName) {

            var self = this;
            this.set('doc', null);
            this.$.api.createEntity(Class, fqClassName).fetch(null, function (err, classDoc) {

                self.set('doc', err ? null : classDoc);
                routeContext.callback(err);

                if (self.runsInBrowser()) {
                    window.scrollTo(window.scrollX, 0);
                }
            })

        }.async()
    });
});