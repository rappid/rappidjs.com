define(
    ["js/core/Application",
    "example/todo/model/TodoList",
    "example/todo/model/Todo"],
    function (Application, TodoList, Todo) {

        return Application.inherit({
            /**
             *  initializes the application variables
             */
            initialize:function () {
                this.set('appName','Simple App');
                this.set('todoList',new TodoList());
                this.set('newTodo',new Todo());
            },
            archive: function(){
                 this.$.todoList.clearCompleted();
            },
            add: function(e){
                this.$.todoList.add(this.$.newTodo);
                this.set('newTodo',new Todo());

                e.$.preventDefault();
            }
        });
    }
);