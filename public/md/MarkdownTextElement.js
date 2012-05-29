define(["js/core/TextElement", 'md/lib/marked'], function (TextElement, marked) {

        var rDos = /\r\n/g,
            rMac = /\r/g,
            rUnix = /\n/,
            hasContent = /\S/,
            rIndent = /\s*/;

        return TextElement.inherit("md.MarkdownTextElement", {

            render: function () {
                if (!this.$initialized) {
                    this._initialize(this.$creationPolicy);
                }

                this.$el = this.$systemManager.$document.createElement(this.$tagName);
                if (!_.isUndefined(this.$.textContent)) {
                    this._renderTextContent(this.$.textContent);
                }

                return this.$el;
            },

            normalizeIndent: function(text) {

                var lines = text.split(rUnix),
                    indentSize = null,
                    i,
                    line;

                for (i = 0; i < lines.length; i++) {
                    line = lines[i];

                    if (hasContent.test(line)) {
                        var param = rIndent.exec(line);
                        if (!param) {
                            // indent not found
                            return text;
                        }

                        if (indentSize === null) {
                            indentSize = param[0].length;
                        } else {
                            indentSize = Math.min(indentSize, param[0].length);
                        }

                        if (indentSize === 0) {
                            return text;
                        }
                    }
                }

                var removeIndent = new RegExp("^\\s{" + indentSize + "}");
                for (i = 0; i < lines.length; i++) {
                    // remove indent from lines
                    lines[i] = lines[i].replace(removeIndent, '');
                }

                return lines.join('\n');
            },

            _renderTextContent: function (textContent) {

                // Standardize line endings

                textContent = textContent.replace(rDos, "\n"); // DOS to Unix
                textContent = textContent.replace(rMac, "\n"); // Mac to Unix

                if (this.$.normalizeIndent === true) {
                    textContent = this.normalizeIndent(textContent);
                }

                // Indent code between ``` ``` blocks

//                this.$el.innerHTML = this.$converter.makeHtml(textContent.trim());
                this.$el.innerHTML = marked(textContent.trim());
            }
        });
    }
);