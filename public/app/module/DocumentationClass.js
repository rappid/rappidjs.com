define(['js/core/Module', "json!doc/index", "js/core/List", "documentation/model/Class", "underscore"], function(Module, classIndex, List, Class, _) {

    return Module.inherit("app.module.DocumentationClass", {

        defaults: {
            classes: List,
            doc: null,
            searchString: ""
        },

        _initializationComplete: function() {
            for (var i = 0; i < classIndex.length; i++) {
                this.$.classes.add(this.$.api.createEntity(Class, classIndex[i]));
            }
        },
        initialize: function(){
            this.set('filterDocs', function(doc, index, filterList){
                return !filterList.$.searchString || doc.$.id.toLowerCase().indexOf(filterList.$.searchString.toLowerCase()) > -1;
            });
        },

        hasCurrentDocumentation: function() {
            return !!this.$.doc;
        }.onChange('doc'),

        showClass: function(routeContext, fqClassName) {

            var self = this;
            this.$.api.createEntity(Class, fqClassName).fetch(null, function(err, classDoc) {

                self.set('doc', err ? null : classDoc);
                routeContext.callback(err);

                if (self.runsInBrowser()) {
                    window.scrollTo(window.scrollX, 0);
                }
            })

        }.async()
    });
});