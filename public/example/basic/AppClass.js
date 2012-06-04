define(["js/core/Application"], function (Application) {
    return Application.inherit({
        // initializes the application variables
        initialize: function () {
            this.set('appName', 'Simple App');
            this.set('name', '');
        },

        //Starts the application
        start: function (parameter, callback) {
            // addition start logic can go here
            this.callBase(parameter, callback);
        }
    });
});