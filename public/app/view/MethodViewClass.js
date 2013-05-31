define(["js/ui/View", "documentation/data/DocumentationDataSource"], function (View, DocumentationDataSource) {

    return View.inherit({
        defaults: {
            method: null,

            definedByLink: null
        },

        inject: {
            dataSource: DocumentationDataSource
        },

        methodCSSClasses: function () {
            var ret = [this.$.method.$.visibility];

            if (this.$.method.$.hasOwnProperty('definedBy')) {
                ret.push("inherited");
            }

            return ret.join(" ");
        },

        getClass: function(fqClassName) {

        }
    });
});