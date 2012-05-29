define(['js/html/DomElement', 'md/MarkdownTextElement'], function(DomElement) {


    return DomElement.inherit('md/View', {

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