define(["js/data/Model", "documentation/model/Class", "js/data/Collection"], function(Model, Class, Collection) {

    return Model.inherit("documentation.model.Package", {

        schema: {
            name: String,
            description: String,
            classes: Collection.of(Class),
            firstClass: String
        },

        firstClass: function() {
            return this.$.firstClass || this.get("classes[0].id");
        }.onChange("firstClass"),

        id: function() {
            if (this.$.id === "rappid") {
                return "";
            }

            return this.$.id;
        }
    });
});