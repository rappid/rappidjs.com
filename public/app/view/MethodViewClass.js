define(
    ["js/ui/View"], function (View) {


        return View.inherit({
            defaults: {
                method: null
            },

            methodCSSClasses: function(){
                var ret = [this.$.method.$.visibility];

                if(this.$.method.$.hasOwnProperty('definedBy')){
                    ret.push("inherited");
                }

                return ret.join(" ");
            }
        });
    }
);