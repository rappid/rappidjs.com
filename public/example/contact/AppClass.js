define(["js/core/Application", "js/core/List", "example/contact/model/Person"],
    function (Application, List, Person) {

        return Application.inherit({

            defaults: {
                contacts: List,
                p: Person
            },

            addContact: function (e) {

                var newPerson = this.get('p');
                if (newPerson.hasContent()) {
                    this.get('contacts').add(newPerson);
                    this.set('p', new Person());
                }

                e.preventDefault();
            }
        });
    }
);