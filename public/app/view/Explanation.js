define(['js/core/Component'], function (Component) {
    return Component.inherit("app/view/Explanation", {

        defaults: {
            template: '<span class="explanation" data-title="%title%" data-content="%description%">%content%</span>',
            search: null,
            title: null
        },

        execute: function (text) {

            if (this.$.search) {
                var search = this.$.search;
//                text = text.replace(search, this.generateExplanationPopUp(search, this._getTextContentFromDescriptor(this.$descriptor), this.$.title));
                var description = this._getTextContentFromDescriptor(this.$descriptor).replace(/\n/g, "").trim();
                text = text.replace(search, this.generateExplanationPopUp(search, description, this.$.title))
            }

            return text;
        },
        generateExplanationPopUp: function (content, description, title) {
            return this.$.template.replace('%content%', content).replace('%description%', description).replace('%title%', title);
        }

    });
});