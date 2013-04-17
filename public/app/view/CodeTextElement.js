define(
    ["js/core/TextElement", "app/lib/highlight/highlight"], function (TextElement, hljs) {
        return TextElement.inherit("app/view/CodeTextElement", {


            _initializeBindings: function () {
                if (this.$descriptor && this.$descriptor.nodeType !== 4) {
                    this.callBase();
                }
                this._initializationComplete();
            },
            render: function () {

                if (!this.$initialized) {
                    this._initialize(this.$creationPolicy);
                }

                this.$el = this.$stage.$document.createElement('ol');
                if (!_.isUndefined(this.$.textContent)) {
                    this._renderTextContent(this.$.textContent);
                }

                return this.$el;
            },
            _renderTextContent: function (textContent) {
                var lines = textContent.split('\n'), j = 0, k = 0;
                while (lines.length > k && !lines[0].trim().length) {
                    lines.shift();
                }
                var charCode;
                if (lines.length > k) {
                    do {
                        charCode = lines[k].charCodeAt(j);
                        if(charCode === 32){
                            j++;
                        }
                    } while (charCode === 32 || charCode === 10);
                }

                for(k = 0; k < lines.length; k++){
                    lines[k] = lines[k].substr(j);
                }

                textContent = lines.join("\n");
                textContent = hljs.highlightAuto(textContent).value;
                textContent = textContent.replace(/(\?|>)></g, "$1&gt;<");

                if (this.$.preRenderText) {
                    textContent = this.$.preRenderText(textContent);
                }

                var el = this.$stage.$document.createElement("div");

                el.innerHTML = "<div>" + textContent + "</div>";

                this.$el = el;
            }
        });
    }
);