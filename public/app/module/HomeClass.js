define(['js/core/Module',
    'raw!example/basic/Index.html',
    'raw!example/basic/App.xml',
    'raw!example/basic/AppClass.js'], function(Module, BasicIndex, BasicAppXML, BasicAppClassText) {
    console.log(BasicAppClassText);
    return Module.inherit("app.module.WikiClass", {

        defaults: {
            text: ""
        },

        initialize: function(){
            this.set('example',{
                basic : {
                    Index: BasicIndex,
                    AppClass: BasicAppClassText,
                    App: BasicAppXML
                }
            });

            this.callBase();
        }
    });
});