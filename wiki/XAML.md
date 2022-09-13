# XAML

XAML stands for Extensible Application Markup Language and is the way of defining views based on HTML and ready to use components in rAppid:js. 

XAML is [XML](http://en.wikipedia.org/wiki/XML) and so we could make use of 
* Namespaces
* Schemas / Validation
* Generation and transformation of views

## The basics

XML is a markup language defined by text characters, which forms either `markup` or `content`. XML is specified by the [W3C](http://www.w3.org/) and used to define many languages of the internet - e.g. HTML5, SVG, RSS and hunders more. The markup is enclosed in `<` and `>` chars or between `&` and `;` - the rest of the document is content. 

### Element

XML consists of Elements (e.g. `<p>An Element</p>`) which are defined by a start-tag `<tag>` and the matching end-tag `</tag>`. The content between the tags can consist of text and Elements, which are called child elements. If there are no children of the element the element can be defined as empty-element-tag `<tag />`.

### Attribute

Each elements can have a set of attributes, which are a combination of key and value influencing the behavior of the element. The attributes are written as `<p class="foo" />` either in the start tag or the empty-element-tag.

### Namespace

Each element of an xml document consists of a `namespaceUri` and a `localName` defining the full qualified name of the element. A namespace is declared using the `xmlns` attribute in the element node, mostly the root Element of the XML document and is inherit to all it's children until a new `xmls` declaration is found. Beside the default namespace defined using the `xmlns` more namespaces can pre-defined using a `prefix` with `xmlns:uniquePrefix="my.namespace.uri"`.

## Usage in rAppid:js

XAML is the declarative way to describe a view. Defining a view with XAML creates a class!

Because rAppid:js is a Javascript Web MVC Framework the Views are defined in XHTML. The default namespace uri for every view component must be `http://www.w3.org/1999/xhtml` to allow the usage of all HTML5 elements.

### Code- behind

If you start using rAppid:js by scaffolding an application with the following command

```  
rappidjs create app App /path/of/my/application/root
```

you'll find an `App.xml` and an `AppClass.js` inside the public directory of your application root (see [[Project]]). The `App.xml` is the main application XAML and the the `AppClass.js` the corresponding code behind file.

```html
<?xml version="1.0"?>
<app:AppClass xmlns="http://www.w3.org/1999/xhtml"
               xmlns:js="js.core" xmlns:ui="js.ui" xmlns:app="app">
    <div class="container">
        Your Application {appName} is running!
    </div>
</app:AppClass>
```

The root element of the `App.xml` defines the default namespace `http://www.w3.org/1999/xhtml` and the three more namespaces. Each of the namespace declaration has a prefix and a namespace uri (beside the default namespace), which maps to a directory under the public folder of your application root. 

The prefix `js` maps to the namespace uri `js.core` which stands for the directory `js/core` inside the public folder. The prefix `app` maps to the namespace uri `app` which stands for the directory `app` where all you application code should be located.

### Relation between View and Code-Behind 

As described above, the `App.xml` has the `AppClass.js` as Code-Behind file. How are the related?
Each XAML defines a class where the full qualified name of the class is the path to the .xml file from the project public directory.

**Important! You really need to keep this in mind**
* **XAML defines a class!**
* **The full qualified name of the class is the path to the .xml file**
* **Each XAML class inherits from a base class**

Each XAML class inherits from a base class. The base class is determinated by the full qualified element name of the root tag. In the above example this means:

* the full qualified element name of the root node is `app.AppClass`, because
    * the prefix `app` maps to the namespace uri **app** 
    * and the local name is **AppClass**
* our XAML class `app.App` inherit from `app.AppClass`
* all methods and variables from `app.AppClass` will be known in `app.App`

That's code behind! 
With this technic you could also write different views e.g. for browser and mobile devises with the same code-behind file which is the `Controller` of the application.

## Example

The example is based on the simple ToDo application which can be found at http://www.rappidjs.com. 

```html
<?xml version="1.0"?>
<app:AppClass xmlns="http://www.w3.org/1999/xhtml"
              xmlns:js="js.core" xmlns:ui="js.ui" xmlns:app="example.todo">
    <h2>Todo</h2>


    <ui:ListView items="{todoList}" itemKey="todo" class="unstyled">
        <js:Template name="item">
            <label class="checkbox">
                <input type="checkbox" checked="{{$todo.completed}}"/>
                <span class="{$todo.status()}">{$todo.title}</span>
            </label>
        </js:Template>
    </ui:ListView>

</app:AppClass>
```

The App.xml inherits from the code-behind file is located at public/example/todo/AppClass.js, because the prefix `app` of the root node maps to `example.todo` and the local name is `AppClass`. 

The `ui:ListView` element will map to `js/ui/ListView.js` and the `js:Template` to `js/core/Template.js`.

The h2, label and span tag used in the view are inside the `http://www.w3.org/1999/xhtml` namespace and will be mapped to `js.html.HtmlElement`. The input element would map to `js.html.

WTF and why?

### Namespace and RewriteMap

In rAppid.js we introduced a `RewriteMap` which will map namespace uris to an uri, which can resolved inside the public directory of the application. In addition there is a `RewriteMap` mapping some full qualified elements to different classes e.g. the `js.html.HtmlElement`. 

Theses mechanismen allows to use tags which haven't any special implementation to map to a generic implementation, like the HtmlElement. In addition it allows to implement some special logic e.g. for the Input element, which doesn't allow `Bindings` by default. 

The same technic is used for SVG, which maps to js.svg.SvgElement.
