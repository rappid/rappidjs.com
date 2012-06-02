define(["js/data/Model"], function (Model) {
    return Model.inherit("example.todo.model.Todo", {
        defaults: {
            title: "",
            completed: false
        },
        setCompleted: function (completed) {
            this.set("completed", completed);
        },
        isCompleted: function () {
            return this.$.completed;
        },
        status: function () {
            return this.$.completed ? "done" : '';
        }.onChange("completed"),
        hasTitle: function () {
            return this.$.title.trim().length;
        }.onChange("title")
    });
});