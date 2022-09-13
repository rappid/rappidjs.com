# ModuleLoader

The ```ModuleLoader``` is a UIComponent from the package ```js.core``` which loads independent parts of the application - called modules - at runtime into its views. The load action can be triggered either by a defined routed or invoked manually.

The following XAML shows the declaration of an application containing a router with the ```cid="router"``` and a ModuleLoader which binds its router attribute to those.

## Configure modules

The ModuleLoader defines two modules with the ```js.conf.ModuleConfiguration``` tag which references a ```moduleClass``` by it's full qualified name. The route attribute is transformed into a new route which triggers the loading of the module.

## ContentPlaceHolder

Because the ModuleLoader is an ```UIComponent``` it can contain visual components as children. Inside the ModuleLoader one or more ```ContentPlaceHolder```s has to be defined. If a module is loaded, the content from the module is set into the corresponding ContentPlaceHolder. In addition to ContentPlaceHolders each UIComponent and html tags can be used. In the example a html ```header``` tag is used to hold the logo. 

```xml
<?xml version="1.0"?>
<js:Application xmlns="http://www.w3.org/1999/xhtml"
                   xmlns:js="js.core" xmlns:ui="js.ui" xmlns:conf="js.conf">

    <js:Router cid="router" />
        
    <js:ModuleLoader router="{router}">

        <conf:ModuleConfiguration name="articles" moduleClass="app.module.Articles" route="^articles.*$"/>
        <conf:ModuleConfiguration name="details" moduleClass="app.module.Detail" route="^article\/(\d+)$"/>

        <header>
             <a href="#" id="logo" />
             <ui:ContentPlaceHolder name="nav">
        </header>

        <ui:ContentPlaceHolder name="main" />
    </js:ModuleLoader>

</js:Application>
```

# Module

A Module is a separated part of an application, which gets loaded during runtime. It must be inherit from ```js.core.Module```and define at least one ```js.core.Content``` which will be set in the corresponding ContentPlaceHolder after the module gets started.

## Define a Module

By convention modules will be defined in the ```app/module``` directory with XAML. The [[CodeBehind]]-Technology file can be used  of cause.

```xml
<?xml version="1.0"?>
<js:Module xmlns="http://www.w3.org/1999/xhtml"
                      xmlns:js="js.core" xmlns:ui="js.ui" xmlns:conf="js.conf">

    <js:Router>
        <conf:RouteConfiguration name="deeplink" route="^articles\/page\/(\d+)?$" onexec="showPage"/>
        <conf:RouteConfiguration name="default" route="^articles$" onexec="defaultRoute"/>
    </js:Router>

    <js:Content name="nav">
        <h2>Articles Module</h2>
    </js:Content>

    <js:Content name="main">
        <h2>This goes in the main</h2>
    </js:Content>
</js:Module>
```

## Content - ContentPlaceHolder relation

In the example module one ```Router``` and two ```js.core.Content``` elements are defined. The Content-Tags must have a name matching the name of the ContentPlaceHolder in which the module will be loaded. If the module gets loaded the Content will be placed inside the corresponding ContentPlaceHolder. If no Content for the ContentPlaceHolders in the ModuleLoader can be found, the ContentPlaceHolder will be empty.

## Router inside a Module 

Inside the module an additional ```Router``` can be defined, which will be added to the [[History]] after the module is loaded. If the module gets loaded the first time the current history fragment will evaluated against the router in the module.

With this technic, it is possible to load a module by a router '^articles.*$' and evaluates the routes defined in a module ^articles$ and ^articles\/page\/(\d+)$ after the load. Starting the application with 'articles/page/5' as deeplink will first load the module and the execute the ```showPage``` function defined in the router. 