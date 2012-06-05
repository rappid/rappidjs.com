define(['js/html/HtmlElement', 'md/MarkdownTextElement'], function(HtmlElement) {


    return HtmlElement.inherit('md/View', {

        defaults: {
            tagName: 'span',
            normalizeIndent: true
        },

        _createTextElement: function (node, rootScope) {
            return this.$systemManager.$applicationContext.createInstance('md/MarkdownTextElement', [{
                normalizeIndent: this.$.normalizeIndent
            }, node, this.$systemManager, this, rootScope]);
        }

    });
});