define(['js/data/Model'], function (Model) {
    return Model.inherit('example.contact.model.Person', {
        defaults: {
            firstName: '',
            lastName: '',
            phone: ''
        },

        fullName: function() {
            return this.$.firstName + ' ' + this.$.lastName;
        }.onChange('firstName', 'lastName'),

        hasContent: function() {
            return !!(this.$.firstName || this.$.lastName || this.$.phone);
        }.onChange('firstName', 'lastName', 'phone')
    });
});