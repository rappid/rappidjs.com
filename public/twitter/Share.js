define(['require', 'js/html/HtmlElement'], function(require, HtmlElement){

    return HtmlElement.inherit({

        defaults: {
            tagName: "a",
            "class": "twitter-share-button",
            via: '',
            showCount: true,
            url: '',
            href: "https://twitter.com/share"
        },

        _renderUser: function() {
            this.$el.setAttribute("href", "https://twitter.com/" + this.$.user);
            this.$el.innerHTML = "Follow @" + this.$.user;
        },

        _renderVia: function(via) {
            if (via) {
                this.$el.setAttribute("data-via", via);
            }
        },

        _renderUrl: function(url) {
            if (url) {
                this.$el.setAttribute('data-url', url);
            } else {
                this.$el.removeAttribute('data-url');
            }
        },

        _renderShowCount: function(showCount) {
            if (showCount) {
                this.$el.removeAttribute('data-count');
            } else {
                this.$el.setAttribute('data-count', 'none');
            }
        },

        applicationRendered: function() {
            if (this.runsInBrowser()) {
                require(['twitter/widgets'], function (twitter) {
                    twitter && twitter.widgets && twitter.widgets.load();
                });
            }
        }.bus('Application.Rendered')
    })

});