define(['js/core/Module', "json!doc/index"], function(Module, index) {

    return Module.inherit("app.module.DocumentationClass", {

        initialize: function() {
            this.callBase();
            this.set('classes', index);
        }
    });
});