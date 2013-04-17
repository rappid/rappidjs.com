define(
    ["js/ui/View", "app/view/CodeTextElement", "app/view/Explanation"], function (View, CodeTextElement, Explanation) {


        return View.inherit({
            defaults: {
                tagName: 'pre',
                "class": 'prettyprint linenums'
            },
            _createTextElement: function (node, rootScope) {

                var self = this;

                return new CodeTextElement(
                    {
                        preRenderText: function (text) {
                            return self.renderExplanations(text);
                        }
                    },
                    node,
                    this.$stage,
                    this,
                    rootScope
                );
            },

            renderExplanations: function (text) {

                if (this.$children) {
                    for (var i = 0; i < this.$children.length; i++) {
                        var child = this.$children[i];
                        if (child instanceof Explanation) {
                            text = child.execute(text);
                        }
                    }
                }


                return text;
            }

        });
    }
);