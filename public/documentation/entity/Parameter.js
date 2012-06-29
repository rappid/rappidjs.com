define(['js/data/Entity'], function(Entity) {

    return Entity.inherit('documentation.entity.Parameter', {

        hasTypeDefinition: function() {
            return !!(this.$.types && this.$.types.length > 0);
        },

        getFirstTypeName: function() {
            return (this.get('types[0]') || "").split(".").pop();
        },

        isOptional: function() {
            return this.$.optional === true;
        }
    });

});