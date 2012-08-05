define(['js/core/Module', 'sprd/model/Shop'], function (Module, Shop) {

    return Module.inherit("app.module.UiClass", {

        defaults: {
            shop: null
        },

        start: function () {

            if (!this.$.shop) {
                var shop = this.$.api.createEntity(Shop, 205909);
                shop.fetch();
                this.set("shop", shop);
            }

            this.callBase();
        },

        visit: function(e) {
            // TODO: http://www.spreadshirt.net/-C4408A{data.id}
        }
    });
});