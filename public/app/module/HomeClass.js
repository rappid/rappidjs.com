define(['js/core/Module',

    'raw!example/basic/index.html',
    'raw!example/basic/App.xml',
    'raw!example/basic/AppClass.js',

    'raw!example/todo/App.xml',
    'raw!example/todo/AppClass.js',
    'raw!example/todo/model/Todo.js',
    'raw!example/todo/model/TodoList.js',

    'raw!example/contact/App.xml',
    'raw!example/contact/AppClass.js',
    'raw!example/contact/view/Card.xml',
    'raw!example/contact/model/Person.js'


], function(Module,
            BasicIndex, BasicAppXML, BasicAppClassText,
            TodoAppXML, TodoAppClassText, TodoModelText, TodoListText,
            ContactAppXML, ContactAppClass, ContactCardXML, ContactPersonModel) {

    return Module.inherit("app.module.HomeClass", {

        initialize: function () {
            this.set('example', {
                basic: {
                    Index: BasicIndex,
                    AppClass: BasicAppClassText,
                    App: BasicAppXML
                },
                todo: {
                    AppClass: TodoAppClassText,
                    App: TodoAppXML,
                    TodoModel: TodoModelText,
                    TodoList: TodoListText
                },
                contact: {
                    App: ContactAppXML,
                    AppClass: ContactAppClass,
                    Card: ContactCardXML,
                    PersonModel: ContactPersonModel
                }
            });

            this.callBase();
        }
    });
});