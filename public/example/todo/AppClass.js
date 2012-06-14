define(["js/core/Application",
        "example/todo/model/TodoList", "example/todo/model/Todo"],
    function (Application, TodoList, Todo) {

        return Application.inherit({
            // initializes the application variables
            initialize: function () {
                this.set('todoList', new TodoList());
                this.set('newTodo', new Todo());
            },
            // event handler for archive command
            archiveCompletedItems: function () {
                this.$.todoList.clearCompleted();
            },
            // event handler for form submit
            addTodoItem: function (e) {
                if (this.$.newTodo.hasTitle()) {
                    this.$.todoList.add(this.$.newTodo);
                    this.set('newTodo', new Todo());
                }

                e.preventDefault();
            }
        });
    }
);