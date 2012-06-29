define(['js/data/Entity', 'documentation/entity/Parameter'], function(Entity, Parameter) {

    return Entity.inherit('documentation.entity.Method', {
        $schema: {
            parameter: [Parameter]
        },

        hasReturnType: function() {
            return !!(this.get('returns.types[0]'));
        },

        getFirstReturnTypeName: function () {
            return (this.get('returns.types[0]') || "").split(".").pop();
        }
    });
});