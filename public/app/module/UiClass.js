define(['js/core/Module', 'sprd/model/Shop', 'raw!example/window/CustomDialog.xml'], function (Module, Shop, CustomDialogXML) {
    return Module.inherit("app.module.UiClass", {

        defaults: {
            shop: null,
            customDialogExample: ""
        },
        start: function () {

            if (!this.$.shop) {
                var shop = this.$.api.createEntity(Shop, 205909);
                shop.fetch();
                this.set("shop", shop);
            }
            this.set('customDialogExample', CustomDialogXML);
            this.callBase();
        },
        _itemClickHandler: function(e){
            var dataItem = e.target.find('$dataItem');
            this.visitArticle(dataItem.$.data);
        },
        _keyHandler: function(e){
            if(e.domEvent.keyCode === 13 && e.target.$.selectedItems.size()){
                this.visitArticle(e.target.$.selectedItems.at(0));
            }
        },
        _openDialog: function(e){
            this.$.myDialog.showModal(function(){

            });
        },

        queryCreator: function(){
            return function(searchTerm){
                return {
                    query : searchTerm
                }
            };
        },

        visitArticle: function(article){
            window.open('http://www.spreadshirt.net/-C4408A' + article.$.id);
        }
    });
});