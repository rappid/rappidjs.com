define(['js/core/Module', "json!doc/index", "js/core/List", "documentation/model/Class"], function(Module, classIndex, List, Class) {

    return Module.inherit("app.module.DocumentationClass", {

        defaults: {
            classes: List,
            doc: null
        },

        _initializationComplete: function() {
            for (var i = 0; i < classIndex.length; i++) {
                this.$.classes.add(this.$.api.createEntity(Class, classIndex[i]));
            }
        },

        hasCurrentDocumentation: function() {
            return !!this.$.doc;
        }.onChange('doc'),

        showClass: function(routeContext, fqClassName) {

            var self = this;
            this.$.api.createEntity(Class, fqClassName).fetch(null, function(err, classDoc) {
                self.set('doc', classDoc);
                routeContext.callback(err);

                if (self.runsInBrowser()) {
                    window.scrollTo(window.scrollX, 0);
                }
            })

        }.async()
    });
});