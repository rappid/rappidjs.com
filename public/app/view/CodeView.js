define(
    ["js/ui/View", "app/view/CodeTextElement"], function (View) {
        return View.inherit({
            defaults: {
                tagName: 'pre'
            },
            _createTextElement: function(node,rootScope){
                return this.$systemManager.$applicationContext.createInstance('app/view/CodeTextElement', [
                    null,
                    node,
                    this.$systemManager,
                    this,
                    rootScope
                ]);
            }
        });
    }
);