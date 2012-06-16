define(['require', 'js/html/HtmlElement'], function(require, HtmlElement){

    return HtmlElement.inherit({

        $classAttributes: ['user'],

        defaults: {
            tagName: "a",
            "class": "twitter-follow-button",
            user: ''
        },

        _renderUser: function() {
            this.$el.setAttribute("href", "https://twitter.com/" + this.$.user);
            this.$el.innerHTML = "Follow @" + this.$.user;
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