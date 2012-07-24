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
                    },{
                        label: 'API',
                        link: 'api'
                    },{
                        label: 'Samples',
                        link: 'samples'
                    },{
                        label: 'License',
                        link: 'license'
                    },{
                        label: 'Disclaimer',
                        link: 'disclaimer'
                    }
                ]);
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
            currentPage: function(){

                var fragment = this.get('history.fragment()');
                if(!fragment){
                    return null;
                }
                for(var i = 0; i < this.$.pages.length; i++){
                    if(fragment.indexOf(this.$.pages[i].link) > -1){
                        return this.$.pages[i];
                    }
                }
            }.on(['history', 'change:fragment'])
        });
    }
);