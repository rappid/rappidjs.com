define(['require', 'js/html/HtmlElement'], function (require, HtmlElement) {

    return HtmlElement.inherit({

        defaults: {
            tagName: "div",
            size: "medium",
            "class": "g-plusone"
        },

        applicationRendered: function (e) {
            if (this.runsInBrowser()) {
                require(['google/plusone'], function(gapi) {
                    if (gapi && gapi.plusone) {
                        gapi.plusone.go();
                    }
                });
            }
        }.bus('Application.Rendered')

    })

});


