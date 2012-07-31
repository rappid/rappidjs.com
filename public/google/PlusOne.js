define(['require', 'js/html/HtmlElement'], function (require, HtmlElement) {

    return HtmlElement.inherit({
        defaults: {
            tagName: "div",
            size: "medium",
            "class": "g-plusone"
        },
        _renderHref: function (href) {
            if (href) {
                this.$el.setAttribute('data-href', href);
            }
        },
        _onDomAdded: function (e) {
            if (this.runsInBrowser()) {
                require(['google/plusone'], function(gapi) {
                    if (gapi && gapi.plusone) {
                        gapi.plusone.go();
                    }
                });
            }
            this.callBase();
        }

    })

});


