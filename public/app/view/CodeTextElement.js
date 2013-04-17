define(
    ["js/core/TextElement", "app/lib/highlight/highlight"], function (TextElement, hljs) {
        return TextElement.inherit("app/view/CodeTextElement", {


            _initializeBindings: function(){
                if(this.$descriptor && this.$descriptor.nodeType !== 4){
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
                textContent = textContent.replace(/(\?|>)></g, "$1&gt;<");

                if (this.$.preRenderText) {
                    textContent = this.$.preRenderText(textContent);
                }

                var el = this.$stage.$document.createElement("div");

                el.innerHTML = "<div>" + textContent + "</div>";

                var lines = textContent.split('\n'), j = 1, k = 0;
                while(lines.length > k && !lines[k].trim().length){k++;}
                if(lines.length > k){
                    while (lines[k].charCodeAt(j) === 10 || lines[k].charCodeAt(j) === 32) {
                        j++;
                    }
                }
//
//
//
//                var li, line, match;
//                for (var l = 0; l < lines.length; l++) {
//                    line = lines[l];
//                    if(!line.trim().length){
//                        continue;
//                    }
//
//
//                    // find closing tags on front
//                    match = /^(<\/[^<>]+>)(.*)$/.exec(lines[l]);
//                    if(match && match.length){
//                        lines[l] = match[2];
//                        if(l > 0){
//                            lines[l-1] += match[1];
//                        }
//                    }
//
//                    // find open tags at end
//                    match = /^(.*)(<[^/][^<>]*[^/])$/.exec(lines[l]);
//                    if(match && match.length){
//                        lines[l] = match[1];
//                        if(l < lines.length-1){
//                            lines[l+1] = match[2] + lines[l + 1];
//                        }
//                    }
//                }
//
                var child, li, nodeText, isLineBeak, breakIndex, textChild;
                while (el.firstChild.childNodes.length) {
                    child = el.firstChild.firstChild;
                    nodeText = child.textContent;
                    breakIndex = nodeText.indexOf("\n");
                    isLineBeak = nodeText === "\n";
                    if(!li || breakIndex === 0){
                        li = this.$stage.$document.createElement("li");
                        this.$el.appendChild(li);
                    }
                    if(isLineBeak){
                        el.firstChild.removeChild(child);
                    } else {
                        textChild = child;
                        while(textChild.firstChild){
                            textChild = textChild.firstChild;
                        }


                        if (textChild.data && textChild.data.indexOf("\n") > -1) {
                            textChild.data = textChild.data.replace(/\n/g, "").substr(j - 1);
                        }
                        if (breakIndex > 0) {
                            textChild.data = textChild.data.substring(0,breakIndex);
                        }
                        li.appendChild(child);
                    }
                    // only text nodes
                    if(breakIndex > 0 && child.nodeType === 3){
                        var textLines = nodeText.split("\n");
                        for(k = 1; k <textLines.length; k++){
                            li = this.$stage.$document.createElement("li");
                            this.$el.appendChild(li);
                            li.appendChild(this.$stage.$document.createTextNode(textLines[k]));
                        }
                    }

                }
            }
        });
    }
);