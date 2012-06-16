define(['js/html/HtmlElement', 'google/plusone'], function (HtmlElement, gapi) {

    return HtmlElement.inherit({

        defaults: {
            tagName: "div",
            size: "medium",
            "class": "g-plusone"
        },

        applicationRendered: function (e) {
            if (gapi && gapi.plusone) {
                gapi.plusone.go();
            }
        }.bus('Application.Rendered')

    })

});