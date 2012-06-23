define(
    ["js/core/TextElement", "app/lib/highlight/highlight"], function (TextElement, hljs) {
        return TextElement.inherit("app/view/CodeTextElement", {


            _initializeBindings: function(){
                if(this.$descriptor.nodeType !== 4){
                    this.callBase();
                }
                this._initializationComplete();
            },
            render: function () {

                if (!this.$initialized) {
                    this._initialize(this.$creationPolicy);
                }

                this.$el = this.$stage.$document.createElement('ol');
                this.$el.setAttribute('class','linenums');
                if (!_.isUndefined(this.$.textContent)) {
                    this._renderTextContent(this.$.textContent);
                }

                return this.$el;
            },
            _renderTextContent: function (textContent) {
                textContent = hljs.highlightAuto(textContent).value;

                if (this.$.preRenderText) {
                    textContent = this.$.preRenderText(textContent);
                }

                var lines = textContent.split('\n'), j = 1, k = 0;
                while(lines.length > k && !lines[k].trim().length){k++;}
                if(lines.length > k){
                    while (lines[k].charCodeAt(j) === 10 || lines[k].charCodeAt(j) === 32) {
                        j++;
                    }
                }



                var li, line;
                for (var l = 0; l < lines.length; l++) {
                    line = lines[l];
                    if(!line.trim().length){
                        continue;
                    }
                    li = this.$stage.$document.createElement('li');
                    li.innerHTML = lines[l].substr(j - 1);

                    this.$el.appendChild(li);
                }
            }
        });
    }
);