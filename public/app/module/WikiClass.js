define(['js/core/Module'], function(Module) {

    var rLinks = /\[{2}(.+?)\]{2}/gi, rLinkHrefs = /\]\((.+?)\)/gi;

    return Module.inherit("app.module.WikiClass", {

        defaults: {
            text: ""
        },

        defaultRoute: function(routeContext) {
            routeContext.navigate('wiki/Home');
        }.async(),

        showPage: function(routeContext, page) {

            var url = decodeURIComponent("wiki/" + page + ".md"),
                self = this;

            url = url.replace('%20', '-');

            this.$stage.$applicationContext.ajax(url, null, function(err, xhr) {
                if (!err && (xhr.status === 200 || xhr.status === 304)) {
                    // process links
                    var text = xhr.responses.text;

                    // replace [[Links]] to [Links](#/wiki/Links)
                    text = text.replace(rLinks, "[$1](#/wiki/$1)");
                    // replace [A LONG LINK](A LONG LINK) to [A LONG LINK](A-LONG-LINK)
                    text = text.replace(rLinkHrefs, function ($0) {
                        return $0.replace(/\s/g, "-")
                    });
                    self.set("text", text);

                    routeContext.callback();
                } else {
                    if (page !== "Home") {
                        routeContext.navigate('wiki/Home', false);
                    } else {
                        routeContext.callback(err);
                    }
                }

            });

        }.async()
    });
});