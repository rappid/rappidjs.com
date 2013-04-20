define(['js/data/Entity', 'underscore'], function(Entity, _) {

    return Entity.inherit('documentation.entity.Attribute', {
        schema: {
            name: String,
            value: String,
            defaultType: String,
            visibility: String
        },
        value: function(){
            if(_.isString(this.$.value)){
                return "\""+this.$.value+"\"";
            }
            return String(this.$.value);
        }
    });
});