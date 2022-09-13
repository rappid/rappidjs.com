# Creating Custom View Components

Before you start creating your own components, please have a look at the [[XAML]] section.
 
Custom view components can be defined either in XML or in Javascript. Components which have an inner layout should be defined in XML to make them more readable. Every view component, which uses placeholders and has a inner layout should inherit from `js.ui.View`. If there is no layout needed, the component can also inherit from `js.html.HTMLElement` or, if it's not a HTML element (e.g. SVG), from `js.core.DomElement`.     

An example of a custom view component with a layout is the Checkbox component:

```html
<?xml version="1.0"?>
<ui:CheckboxClass xmlns="http://www.w3.org/1999/xhtml" xmlns:js="js.core" xmlns:ui="js.ui" tagName="label">
    <js:Template name="layout">
        <input type="checkbox" name="{name}" checked="{{selected}}" value="{{value}}"/> <ui:PlaceHolder name="label"/>
    </js:Template>
    <js:Template name="label">{label}</js:Template>
</ui:CheckboxClass>
```

All logic of a view component like rendering special attributes or handle DOM events can be written in the script tag of the XML file or (like in the example) in the code behind file (see [[XAML]]). 

Inside a component every other component can be used. This makes the code highly reusable. 

If the component has no inner HTML layout or default children, the component can also be defined in Javascript like the following example.   

```javascript
define(["js/ui/View"], function (View) {
        return View.inherit({
            defaults: {
                'componentClass': 'btn'
            }
        });
    }
);
```

## Initialization

Every component get's initialized while added to the shadow DOM. The initialization process can be extended by overriding the following methods. (The methods are listed in the order of calling)

1. `initialize()`
 - default attributes are set
 - additional attributes can be set
 - event listeners can be bound
 - **bindings are NOT evaluated yet**  
2. `_initializationComplete()`        
 - bindings are evaluated and all initial attributes are available
 - **don't forget to call `this.callBase()`**

If you want to create children inside the initialization process you can override `createChildren()`

## Attribute rendering

There are two ways to specify how attributes of a custom component are rendered.

### The Generic Render Method

The first way is the generic render method. For each attribute of the component rAppid.js is looking for a render method in the format `_render{AttributeName}`. In the button component the render methods for the type and the size look like this:

```javascript
define(["xaml!js/ui/Link", "js/core/Content"], function (Link) {
        return Link.inherit({
            defaults: {
                'componentClass': 'btn'
            },
            _renderType: function (type, oldType) {
                if (oldType) {
                    this.removeClass("btn-" + oldType);
                }
                if (type) {
                    this.addClass("btn-" + type);
                }
            },
            _renderSize: function (size, oldSize) {
                if (size) {
                    this.removeClass("btn-" + size);
                }
                if (oldSize) {
                    this.addClass("btn-" + oldSize);
                }
            }
        });
    }
);
```

Every render method get's the new and the old attribute value as parameters.
Within this method the DOM element `this.$el` can be modified.

### Bindings

The second way to render attributes is to use bindings inside your XML or Javascript file.
In the following example, a function binding is used to calculate the src attribute for an IMG element.

```html
<ui:View xmlns="http://www.w3.org/1999/xhtml"
         xmlns:ui="js.ui" xmlns:js="js.core"
         src="{imageUrl()}" alt="{alt()}" tagName="img">
    <js:Script>
        <![CDATA[
        (function () {
            return {    
                defaults: {
                    article: null
                },
                $classAttributes: ['article'],
                imageUrl: function () {
                    return "http://someurl.com/articles/" + this.$.article.$.id + ".png";
                }.onChange('article'),
                alt: function () {
                    return this.$.article.$.name;
                }.onChange('article')
            }
        })
        ]]>
    </js:Script>
</ui:View>
```

### Class Attributes

Generally every attribute of a component is rendered, unless there is a specific render method or it is defined in `$classAttributes`. This tells the renderer not to add this attribute to the DOM element. Besides the attribute name it is also possible to define a regular expression to exclude a specific format of attribute names.


## An exchangeable Layout

To make the inner children of a view component exchangeable, a layout template can be specified for the inner children. An example shows the Checkbox component from above. The layout template and every other template can be overwritten from outside. So if the input element of the checkbox should be on the right side, this can be written as follows:


```html
<ui:Checkbox label="Click me">
    <js:Template name="layout">
        <ui:PlaceHolder name="label"/>
        <input type="checkbox" name="{name}" checked="{{selected}}" value="{{value}}"/> 
    </js:Template>
</ui:Checkbox>
```
 
It is also possible to overwrite the label template, which defines how to render the label attribute in the label placeholder. This would look like this:

```html
<ui:Checkbox label="Click me">
    <js:Template name="label">
        <p>{label}</p> 
    </js:Template>
</ui:Checkbox>
```

Now the label attribute of the checkbox component is rendered inside a P tag.

## DOM Event Handling

There are two ways to define a DOM Event Handler. One way is to overwrite the `_bindDomEvents` method. This method should be used to add native event handlers with the `bindDomEvent(callback)` method. The callback gets the native DOM event as parameter. A often use case for this method is to hold the component attributes in sync with attributes of the DOM Element. Like for example the value of an input field or a select field (See js.html.Input)

The second and more elegant way to define DOM event handler is to use event attributes.
Every attribute, which starts with "on" is an event attribute. The value of an event attribute must be the function name of the callback in the root scope.    

### Adding Custom Events

Custom events can be added by declaring the `events` attribute. The following example shows an item component, which triggers a `on:remove` event with the given item, when the user clicks on the remove button. 

```html
<ui:View xmlns="http://www.w3.org/1999/xhtml"
         xmlns:js="js.core" xmlns:ui="js.ui">
    <js:Script>
        <![CDATA[
        (function () {
            return {
                defaults: {
                    editing: false
                },
                $classAttributes: ['item'],
                events: ["on:remove"], // custom event declaration
                triggerOnRemove: function () {
                    this.trigger("on:remove", this.get("item"));
                }
            }
        })
        ]]>
    </js:Script>
    <js:Template name="layout">
            <label>{item.title}</label>
            <button class="destroy" onclick="triggerOnRemove"/>
    </js:Template>
</ui:View>
```

Now an event handler can be registered by adding the `onremove` attribute: 

```html
<ui:ItemView onremove="_onRemoveHandler" item="{item}"/>
```

```javascript
   _onRemoveHandler: function (e) {
     var item = e.$, self = this;
     // REMOVE THE ITEM
   }
```
 