# Injection

Injection is a powerful feature which let's you inject objects, services or components of a specific type or name inside a component. It helps you to wire up the application and components with the services they need. 

Additionally it allows you to work with different implementations of the required services depending on your context or environment. 

Injection is available by default for all `Component`s and for `Bindable`s that are setup on the `Bus`
( **Note**: External injection will be available soon.)


## Setup injection in your application

There are two ways to inject components into the application. The following example shows how to do this in the application XAML.

```
<js:Application xmlns:js="js.core" xmlns:conf="js.conf">
    <js:Injection>
         <js:I18n locale="en_EN" />
         <conf:Configuration type="js.data.LocalStorageDataSource" singleton="true" />
    </js:Injection>
</js:Application>
```

This will create a new instance of I18n and add it to the injection container. Also a configuration is added which configures the injection container to allow the creation of js.data.LocalStorageDataSource if no instance from requested type is available.

## Adding named instances

A named instances can be added at runtime using the following code inside your code behind file.

```js
var myInstance = new MyClass();
this.$stage.$injection.addInstance("globalName", myInstance);
```

## Require injection

A requirement for injection can be defined in each component with the `inject` definition. The definition is a  `Object` taking the name under which the injected object will be available as `key` and the requested type as value. The requested type can either be a `String` for named instances or a factory.

The following example shows how a `DataSource` and a named instance will be injected:

```
define(['js/core/Module', 'js/data/DataSource'], function(Module, DataSource) {

    return Module.inherit({

        inject: {
             api: DataSource,    // will inject the LocalStorageDataSource as this.$.api
             foo: "globalName"   // will inject the manually added MyInstance as this.$.foo
        },

        initialize: function() {
              console.log([this.$.api, this.$.foo]);
        }

    });

});
```

## Injection for Bindables

The application global scope is the `Stage`. It's available by default for all `Component`s created with XAML or with the `createComponent` method. To make `Injection` available for `Bindables` theses instances must be setup via the `Bus` either from a component or from a bindable that is already setup.  

For example image the following specific Bindable

```js
define(["js/core/Bindable", "js/core/Bus", "js/core/I18n"], function(Bindable, Bus, I18n) {

    return Bindable.inherit("app.MyBindable", {

        inject: {
            bus: Bus,
            i18n: I18n
        },

        _postConstruct: function() {
            // injection completed -> stage available
        },

        _preDestroy: function() {
            // before stage & injected types removed
        }

    });
});
```

For example the following app declared the injection.
```
<app:MyApp xmlns:js="js.core" xmlns:app="app">
    <js:Injection>
         <js:I18n locale="en_EN" cid="myI18n"/>
    </js:Injection>
</app:MyApp>
```

The code behind file of the application.
```
define(["js/core/Application", "js/core/Bus", "app/MyBindable"], function(Application, Bus, MyBindable) {
    return Application("app.MyApp", {

         inject: {
              bus: Bus // make the bus available as this.$.bus
         },

         start: function() {

              var b = new MyBindable();
              console.log(b.$.i18n); // undefined

              this.$.bus.setUp(b);
              console.log(b.$.i18n, b.$.18n === this.$.myI18n); // i18n from application, true

              this.callBase();
         }

    });
});
```


