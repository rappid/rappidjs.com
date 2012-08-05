define(['js/core/Module', 'sprd/model/Shop'], function (Module, Shop) {

    return Module.inherit("app.module.UiClass", {

        defaults: {
            shop: null,
            selectedArticle: null
        },

        start: function () {

            if (!this.$.shop) {
                var shop = this.$.api.createEntity(Shop, 205909);
                this.set("shop", shop);
            }

            this.callBase();
        }
    });
});