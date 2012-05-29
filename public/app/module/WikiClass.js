define(['js/core/Module', "rAppid"], function(Module, rAppid) {

    return Module.inherit("app.module.WikiClass", {

        defaults: {
            text: ""
        },

        defaultRoute: function(routeContext) {
            routeContext.router.navigate('wiki/Home');
        }.async(),

        showPage: function(routeContext, page) {

            console.log("showpage", page);
            var url = "wiki/" + page + ".md",
                self = this;

            rAppid.ajax(url, null, function(err, xhr) {
                if (err) {
                    if (page !== "Home") {
                        routeContext.router.navigate('wiki/Home');
                    } else {
                        routeContext.callback(err);
                    }
                } else {
                    self.set("text", xhr.responses.text);
                    routeContext.callback();
                }

            });

        }.async()
    });
});