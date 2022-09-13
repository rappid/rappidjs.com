## Understanding view components

In most cases a view component consists of a layout and some logic behind that layout. To keep the structure and the logic separated a component is split up into two files.

1. **The XAML file** which defines the layout and children of the component
2. **The Code-behind file** which handles events, loads data, controls rendering of attributes, talks with injected services

Both files represent classes, where the XAML class inherits from the code-behind class.
The code-behind file should inherit from `js.ui.View` which represents the base for all HTML view components.

**Note:** Be sure to run the `rappidjs config` command after creating a XAML component. Otherwise rAppid.js won't find the file.

Inside the XAML file HTML and every other component can be used. This makes the code highly reusable. Through the decoupling of structure and logic it's also possible to create different views for one code-behind file.

## Default attributes

Every component has default attributes which should be defined by overriding the "defaults" property in the code-behind file. This is important when using bindings on the attributes in the XAML file. Additionally it's helpful when generating the documentation and XSD schema file for the component.  
 
The following default attributes are inherited from `js.ui.View`:

* **tagName**: "div" - the tagName that the component renders
* **componentClass**: "" - the CSS class that is added to the rendered node 

There are some more attributes that can be looked up in the docs.

## The initialization process

Before a view component is rendered it get's initialized. In this process the bindings are evaluated, children are created and the annotated services are injected. The following methods can be overridden for this:

1. `initialize()`
 - default attributes are set
 - additional attributes can be set
 - event listeners can be bound
 - **bindings are NOT evaluated yet**  
2. `_initializationComplete()`        
 - bindings are evaluated and all initial attributes are available
 - **don't forget to call `this.callBase()`**

If you want to create children inside the initialization process you can override `createChildren()`


The last method that is called is `_initializationComplete()`. When you need to work with bound attributes or injected services, override this method. When doing so be sure to first call `this.callBase()`. After this all attributes and injected services are ready to use.

```
...
_initializationComplete: function(){
   this.callBase();
   // now bindings and injected services are ready
}
...
```

When the initialization process is done the component get's rendered. 

# Rendering

Every Component has a render method which returns a DOM element. Usually this method doesn't need to be overridden. The render method creates a DOM node with the given tagName, renders all attributes for this node and adds the DOM event handlers to the element.  

## Rendering single attributes

To define how a single attribute is rendered, rAppid.js provides a generic render method. 
Let's say we have a attribute named **loading** which is true or false. And we want to add a css class "loading" to the component every time the attribute is set to true.
To do this we just need to add a method `_renderLoading` in the code-behind file. rAppid.js automatically maps this render method to the attribute by comparing the attribute name. The code for adding and removing the css class could then look like this:

```
...
_renderLoading: function(loading, wasLoading){
   if(loading) {
      this.addClass('loading');  
   } else {
      this.removeClass('loading');
   }
}
...
```

## Rendering using Bindings

Inside the XAML file bindings can be used to render DOM attributes or to control sub components. Let's say we have a component that calculates some value out of two other and renders the calculated result.

The XAML of such component could look like this.

```
<view:CalculatorClass xmlns:view="app.view" xmlns="http://www.w3.org/1999/xhtml">
   <span>{a} x {b}</span> 
   <span> = </span>
   <span>{multiply(a, b)}</span>
</view:CalculatorClass>
```

The code-behind file contains the logic for calculating the value. Here the attributes "a" and "b" are multiplied.

```
define(["js/ui/View"], function(View){

  return View.inherit('app.view.CalculaterClass', {
    defaults: {
      a: 0,
      b: 0
    },
    multiply: function(a, b){
       return a * b;
    }
  });
})

```

# Event handlers

Components like a slider or a date picker need to listen for user inputs. The event handlers for these  elements should be registered in the XAML file by using HTML syntax. The following example code describes a component with a **+** and a **-** button to increase and decrease a score. The event handlers are registered by defining a function name for the *onclick* attributes in the buttons. 

```
<view:ExampleComponentClass xmlns:view="app.view" xmlns="http://www.w3.org/1999/xhtml">
   <button onclick="increaseScore">+</button> 
   <button onclick="decreaseScore">-</button>
   <div>Score: {score}</div>
</view:ExampleComponentClass>

```

The functions are defined in the code-behind file which could look like this:

```
define(["js/ui/View"], function(View){

  return View.inherit('app.view.ExampleComponentClass', {
    score: {
      score: 0
    },
    increaseScore: function(event){
       // event.domEvent contains the original DOM Event
       this.set('score', this.$.score+1);
    },
    decreaseScore: function(event){
       // event.domEvent contains the original DOM Event
       this.set('score', this.$.score-1);
    }
  });
})
```

It is also possible to register functions with parameters as event handlers. Through this you can define a function which increases or decreases the score by a given value. This can look like this:

```
<view:ExampleComponentClass xmlns:view="app.view" xmlns="http://www.w3.org/1999/xhtml">
   <button onclick="changeScoreBy(+1,event)">+</button> 
   <button onclick="changeScoreBy(-1,event)">-</button>
   <div>Score: {score}</div>
</view:ExampleComponentClass>
```

The function in the code-behind file then get's the value as input. If the event is also needed in the event handler you can pass this by declaring the **event** parameter. 

```
  changeScoreBy: function(value, event){
       // event.domEvent contains the original DOM Event
       this.set('score', this.$.score+value);
  }
```

**Note**: It is also possible to use binding paths inside an event handler declaration. The handler function then get's the current value of the path. 

Event handlers can also be registered in the code-behind file. Therefor override the method `_bindDomEvents` which get's called in the render process. The following examples demonstrates how to bind programmatically to the click event.


```
define(["js/ui/View"], function(View){

  return View.inherit('app.view.ExampleComponentClass', {
    score: {
      score: 0
    },
    ...
    // override
    _bindDomEvents: function(el){
      // call the super method 
      this.callBase();
      // bind to a DOM event
      this.bindDomEvent('click', function(e){
         alert("Hello");
      });
    } 
  });
})
```

The counterpart to the `bindDomEvent` method is `unbindDomEvent`. These methods can also be used in the attribute render functions to register and deregister event handlers.

# Defining custom events

Custom events are useful to notify other components about specific states. To define custom events overwrite the events property in the code-behind file like in the following example:

```
define(["js/ui/View"], function(View){

  return View.inherit('app.view.ExampleComponentClass', {
    ...
    // custom event definition
    events: ["on:buttonClick"],
    
    // method which triggers the event
    _triggerEvent: function(){
      var eventData = {
          "foo": "bar"
      };
      this.trigger("on:buttonClick",eventData);
    }
   
  });
})
```

To trigger the event use the `trigger` method like above. External components are now able to register event handlers via XAML like in the following code snippet.

*Note*: The colon is only needed in the code-behind file. 

```xml

<div>
  <view:ExampleComponent onbuttonClick="doSomething('crazy')"/>
</div>

``` 
