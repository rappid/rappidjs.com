define(['js/core/Module',
    'raw!example/basic/index.html',
    'raw!example/basic/App.xml',
    'raw!example/basic/AppClass.js',
    'raw!example/todo/App.xml',
    'raw!example/todo/AppClass.js',
    'raw!example/todo/model/Todo.js',
    'raw!example/todo/model/TodoList.js'

], function(Module, BasicIndex, BasicAppXML, BasicAppClassText, TodoAppXML, TodoAppClassText, TodoModelText, TodoListText) {

    return Module.inherit("app.module.WikiClass", {

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
                }
            });

            this.callBase();
        }
    });
});