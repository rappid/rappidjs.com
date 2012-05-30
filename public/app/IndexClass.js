define(
    ["js/core/Application"],
    function (Application) {

        return Application.inherit({
            /**
             *  initializes the application variables
             */
            initialize:function () {
                this.set('modules', ['home', 'wiki', 'license', 'imprint']);
                this.set('appName','Docu');
            },
            /***
             * Starts the application
             * @param parameter
             * @param callback
             */
            start:function (parameter, callback) {
                // false - disables autostart
                this.callBase(parameter, false);

                callback();
            },

            defaultRoute: function(routeContext) {
                routeContext.router.navigate('home');
            }.async()
        });
    }
);