define(
    ["js/core/TextElement", "app/lib/highlight/highlight", "app/lib/highlight/languages/xml", "app/lib/highlight/languages/javascript"], function (TextElement, hljs) {
        return TextElement.inherit("md.MarkdownTextElement", {

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

                this.$el = this.$systemManager.$document.createElement('ol');
                this.$el.setAttribute('class','linenums');
                if (!_.isUndefined(this.$.textContent)) {
                    this._renderTextContent(this.$.textContent);
                }

                return this.$el;
            },
            _renderTextContent: function (textContent) {
                textContent = hljs.highlightAuto(textContent).value;
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
                    li = this.$systemManager.$document.createElement('li');
                    li.innerHTML = lines[l].substr(j - 1);

                    this.$el.appendChild(li);
                }
            }
        });
    }
);