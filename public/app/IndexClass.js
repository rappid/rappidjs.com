define(
    ["js/core/Application", "js/core/History"],
    function (Application, History) {

        return Application.inherit({
            inject: {
                history : History
            },
            /**
             *  initializes the application variables
             */
            initialize:function () {

                this.set('pages', [
                    {
                        label: 'Home',
                        link: 'home'
                    },{
                        label: 'Wiki',
                        link: 'wiki'
                    }, {
                        label: 'UI Components',
                        link: 'ui'
                    },{
                        label: 'API',
                        link: 'api'
                    },{
                        label: 'License',
                        link: 'license'
                    },{
                        label: 'Disclaimer',
                        link: 'disclaimer'
                    }
                ]);
            },
            isPageSelected: function(page){
                var fragment = this.get('history.fragment()');
                if (!fragment) {
                    return false;
                }
                return fragment.indexOf(page.link) > -1;
            }.on(['history','change:fragment']),

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
            }.async()

        });
    }
);