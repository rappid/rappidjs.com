# rAppid.js - the declarative Rich Internet Application Javascript MVC Framework.
## Introduction

rAppid.js is a declarative JavaScript web application for rapid web application development. It uses XML to define the structure of applications, modules, components, views and JavaScript for the business logic of the application. The XML (XAML) gets translated to javascript components during runtime which will render itself as HTML5 DOM elements. This enables a rapid development of applications.

rAppid.js is under rapid development by the authors Tony Findeisen and Marcus Krejpowicz. Visit the [project home](http://www.rappidjs.com), have a look to the [[Changelog]] and take a look at our [Roadmap](https://trello.com/b/KZIYvyUQ). 
 
[Follow us](https://twitter.com/rappidjs), [contact us](mailto:support@rappidjs.com) and help us develop rAppid.js - the way we wan't to do it.    

**We are looking for collaborators!**

## Table of contents

* [[Installation]]
* Setup a [[Project]] - Project structure
* [[XAML]] write your application 
* Defining a [[Class]]
* [[Creating Custom View Components]] 
* Define modules and load them with the [[ModuleLoader]]
* [[Optimize]] and deploy your application
* Create the [[Server]] side
* Build and provide your own modules as [[Component Library Project]]

## Features 
* Combination of [[XAML]]-Components and HTML5
* Model-View / View-Model [[Bindings]]
* Dependency loading (via requirejs)
* Code-Behind
* Dependency [[Injection]]
* [Inline JavaScript](Script) usage in [[XAML]]
* Active Record Pattern for Models / Single Instance Model Stores
* [[Datasources]] with Processors ([[RestDataSource]] + JSON Processor, XMLProcessor in future)
* Abstract data access layer, which will later supports MongoDb
* [[I18n]]
* [[Command-Line-Interface]]
* Search engine friendly [Node-Rendering]
* [[History]] and Router
* [[Events]] & lazy event binding
* [[MessageBus]]
* [[DataView]] transforming input data lists (PagedDataView, FilterDataView)
* [[Window-Manager]]
* [[Command-Line-Interface]]
* [[Collection]]s and [[List]]s

## Installation
The installation of rAppid.js is simple done via [npm](http://npmjs.org/). For more information see [[Installation]].

```
npm install rAppid.js -d -g
```

## Setup an rAppid.js application project

```
rappidjs create app <ApplicationName> [<TargetDirectory>]
```

The ```create``` command will setup the directory structure and install the required modules, so that you can concentrate on developing application. Under the target directory there will be an directory named ```public```. Open the ```index.html``` file in your Browser or even better configurate the public directory as website root in your preferred web-server.

*Note: If you want to test your application without configuring a web-server in a Google Chrome Browser, you have to start Chrome with the follwing parameters ```--disable-web-security```*

## Working Live Examples

* [TodoMVC Example](http://todo.rappidjs.com/#/) (not build)
* [Spreadshirt T-Shirt Designer](http://www.spreadshirt.net/-C59?tablomat)
* [Mobile Shop build on Spreadshirt API](http://m.spreadshirt.com/#/articles/page/1)