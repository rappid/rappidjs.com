# Bindings

Bindings are used to keep the view and model ([[Bindable]]) in sync. They can be created via code or declarative in XML. For example:

```html
<div class="{containerClass}">
   Hello {name}!
</div>
```

The first variable of a declarative binding must be defined in the initialization process of the component. For example in the **initialize** method or in the **defaults** properties. Otherwise **rAppid.js** won't find the binding scope. For the mentioned example, the **initialize** method looks like this: 
```javascript
// initialize function in a component
initialize: function(){
   this.set('containerClass','my-class');
   this.set('name', 'Bob');
}
```
Now every time the attributes are changed by the **set** method, the specific parts of the view are re-rendered.

## Binding Paths

To access attributes of models and also sub-models in an easy way, **rAppid.js** provides paths for bindings. For example, there are the following models defined:

```javascript
// initialize function in script tag
initialize: function(){
   var address = new Model({
      street: 'Some Street 11',
      city: 'Some City'
   });
   this.set('person',new Model({
      firstname: 'Bob',
      lastname: 'Bobsen',
      address: address
   }));
}
```
To access the attributes of person, the binding can be written as follows:
```html
<div>
   Hello {person.firstname}!
   <br/>
   You live in {person.address.city}
</div>
```

Binding paths always point to the correct property. Every change of an attribute along the path will cause a refresh of the path. For example, if the _address_ attribute of the person changes the _city_ changes also. The same happens, if the _person_ itself is changed. If the path doesn't exist, NULL will be returned.

### Function Bindings 
You can also access functions inside binding paths. For example, there is a **fullName** method inside the person model, which returns the first- and lastname of the person.
```js
var Person = Bindable.inherit({
   fullName: function(){
      return this.$.firstname + " " + this.$.lastname;
   }.onChange('firstname','lastname')
});
```
The function can be simply accessed like this:
```html
<div>
{person.fullName()}
</div>
```
By calling `onChange('firstname','lastname')` the binding is told when to refresh the **fullName** in the view.

The change events can be defined by **onChange** or **on**.
The **onChange** function is a shortcut for `on('change:property')`. 
The **on** function also accepts paths to listen to events of sub-models. For example: 
```js
var Person = Bindable.inherit({
   fullName: function(){
      return this.$.firstname + " " + this.$.lastname;
   }.on('change:firstname','change:lastname'),
   homeTown: function(){
      return this.get('address.city');
   }.on(['address','change:city'])
});
```

**Using parameters**

You can also pass parameters to a function binding. The following types are allowed:
* Strings: `'myString'` (Important: Use only _'_ not _"_)
* Numbers: `123` `-123`
* Floats: `1.23`  `-1.23` 
* Booleans: `true` `false`
* Bindings like `a.b.c.d()`

If you are using a binding as parameter every change of the binding will trigger the function and so the parent binding. **I18n** is a good example where parameters are used:

```html
<div>
{i18n.translate('dialog.title',person.name)}
</div>
```

## Binding Types

**rAppid.js** provides three different kinds of bindings.

### One-Way Bindings

One-Way Bindings are declared by one surrounding braces like `{person.address.city}`. This tells rAppid.js to propagate every change of the path back to the view. (See examples above)   

### Static Bindings

Static Bindings are defined by a leading **$** like `${person.firstname}`. Static bindings just read out the value of the binding path and render it without registering event handlers. So changes along the path don't cause a refresh of the view.

### Two-Way Bindings

Two-Way bindings are mostly used to propagate changes of view attributes back to the model. The following example shows how to define two-way bindings.
```html
<div>
   <input type="text" value="{{person.firstname}}"/>
   <input type="text" value="{{person.lastname}}"/>
   <br/>
   <input type="text" value="{{person.address.city}}"/>
</div>
```
When the user types something in the input element, the changed value is propagated to the defined attribute of the person model.

**Note:** This works only if all bindable attributes along the path are set. In this case _person_ and _person.address_

For Two-Way bindings you can also specify transform methods to transform the value forth and back.
```html
<div>
   <input type="text" value="{{price|priceToString()|stringToPrice()}}"/>
</div>
```

In this example the price gets transformed to a string which is shown in the input field. When the user changes the value the string is transformed back. The transform methods look like this:

```js
{
   stringToPrice: function(string, originalValue){
      return new Price(string);
   },
   priceToString: function(price){
      return price.toString();
   }
};
```
  
The transform back method gets as second parameter the original price. This should be returned if the input string is not valid for example.  