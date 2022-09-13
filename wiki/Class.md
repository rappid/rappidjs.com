# Class

rAppid.js uses **requirejs** and **inherit.js** to define and extend classes.

The full qualified name of your class is defined by it's file path. For example:
```
// Path                 Full-qualified class name
/app/data/MyClass.js -> app.data.MyClass
/app/Example.js      -> app.Example
```

The class definition of `MyClass` could then look like this:
```javascript
define(['app/data/MySuperClass'],function(MySuperClass){
  var someStatic;
  
  // inherit from Model class
  return MySuperClass.inherit('app.data.MyClass',{
      // class constructor
      ctor: function(){
         // call base constructor
         this.callBase();
      },
      // class methods
      foo: function(){
      
      }
  }
});
```

The first parameter of `define` expects an array of dependencies with their full-qualified class names. In this example we only need `app/data/MySuperClass`. The second parameter of `define` takes a function which will return the defined class `app/data/MyClass`. The function get's all required dependencies as input parameters.

Classes are defined and extended with **inherit.js** `MySuperClass.inherit(...)`. As first parameter of `inherit` you can set a custom class name, which will be accessible on the prototype of your class instances.
The second parameter of inherit is a hash, which contains all class methods and static attributes.

### Calling the super
The super of an overridden method can be called with `this.callBase()`. If you define no arguments, all arguments of your child method are passed. (See `foo`) Otherwise you can pass your own arguments. (See `bar`)
```javascript
  return MySuperClass.inherit('app.data.MyClass',{
      ...
      // simple use of callBase
      foo: function(x,y){
         // passes x and y silently
         this.callBase();
      }
      // advanced use of callBase
      bar: function(a,b,c){
          var t;
          // passes t and c
          this.callBase(t,c);
      }
  }
```

###  Test type of class
To check the type of a class instance, you can use `instanceof`:

```javascript
...
if(myObject instanceof MyClass){
  // do something
}
...
```



