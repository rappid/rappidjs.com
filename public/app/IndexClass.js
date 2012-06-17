define(
    ["js/core/Application"],
    function (Application) {

        return Application.inherit({
            /**
             *  initializes the application variables
             */
            initialize:function () {
                this.set('pages', ['home', 'wiki', 'license', 'disclaimer']);
            },
            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start:function (parameter, callback) {
                this.callBase(parameter, callback);
            },
            defaultRoute: function(routeContext) {
                routeContext.navigate('home');
            }.async(),
            firstCharToUpper: function(name){
                return name.charAt(0).toUpperCase() + name.substr(1);
            }
        });
    }
);