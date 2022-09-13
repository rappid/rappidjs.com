# Bindable

Bindables are the base classes of every Component, Model and List. A Bindable can be seen as an attribute container, which encapsulates all logic for triggering events on attribute changes.
If you define your own Model or Component, you are always dealing with a Bindable. Therefor it is important, to know what you can do with Bindables. A simple class which inherits from Bindable could look like this: 

## Definition
```javascript
define(["js/core/Bindable"], function (Bindable) {
    return Bindable.inherit("app.data.Person", {
        ctor: function(attributes) {
           
            this.callBase();
           
        },
        defaults: {
            firstname: "",
            lastname: ""
        },
        fullname: function(){
          return this.$.firstname + " " + this.$.lastname;
        }
    });
});
```

The constructor of Bindable get's an hash of attributes as input parameter. These attributes are then registered on `this.$` as you can see in the `fullname()` method.

### Defaults

The `defaults` property allows you to set a hash of default attributes, which are automatically registered on `this.$`. If your super class already has default attributes, these defaults can be simply extended and overridden like this:

```javascript
  // base class
  return Bindable.inherit("app.data.Task", {
        defaults: {
            completed: false,
            title: "",
            priority: 1,
            comments: List
        }
        ...
    });
  ...
  // sub class
  return Task.inherit("app.data.SpecialTask", {
        defaults: {
            priority: 5,
            secret: true
        }
        ...
    });
```

To create a new instance of a class during the creation process of the Bindable, just use a function as value for the default key. In the above example, the attribute comments will be created as new instance of [[List]].

## Setter and Getter
Attributes should be set via the `set` method. You can call this method in several ways.

```javascript
  var task = new Task(title: 'Write some Documentation'});
   
  // variant #1
  task.set('completed',true);

  // variant #2
  task.set({completed: true, title : 'Do something great'});
```

The `set` method checks which attributes have changed and triggers the following event types:

* change:**attributeKey** - for each attribute that changed 
* change - if one ore more attributes changed

You can listen for attribute changes by binding on this event types.

```javascript
  task.bind('change:completed',function(e){
     console.log(e.$); // outputs the completed attribute
  });

  task.bind('change',function(e){
      console.log(e.$); // outputs a hash of all changed attributes
  });
```
Sometime it's necessary to prevent triggering the **change** events. In this case you can pass an option hash into the `set` method with `{silent: true}`.

```javascript
  // variant #1
  task.set('completed',true, {silent: true});
  // variant #2
  task.set({completed: true}, {silent: true});
```

The option parameter can also be used to **unset** and **delete** attributes. For example:

```javascript
  // variant #1
  task.set('completed',true, {unset: true});
  // variant #2
  task.set({completed: null, title: null}, {unset: true});
```


To access an attribute from outside you can call the `get` method or use the `$`.

```javascript
  var title = task.get('title');
  ...
  title = task.$.title; 
```