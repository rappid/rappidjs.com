define(["js/data/RestDataSource", "js/data/DataSource"], function(RestDataSource, DataSource) {

    var PackageProcessor = DataSource.Processor.inherit("documentation.data.DocumentationDataSource.PackageProcessor", {


        parse: function (model, data, action, options) {

            var classes = [];
            data.classes = data.classes || [];

            for (var i = 0; i < data.classes.length; i++) {
                classes.push({
                   id: data.classes[i]
                });
            }

            data.classes = classes;

            return this.callBase(model, data, action, options);
        }

    });

    return RestDataSource.inherit("documentation.data.DocumentationDataSource", {

        $processors: {
            PackageProcessor: PackageProcessor
        }

    });

});