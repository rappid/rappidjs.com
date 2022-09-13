# Project

There are two types of rAppid.js projects which can be created:
* Application - rAppid.js application using libraries
* Library - library which can be used in applications

The difference between these projects types is that an application project defines a public folder holding an application which can be run. A library project isn't runnable and defines classes and components which can be used from an application project. 

## Application project

An application project defines an application, which is runnable in the browser and can be rendered on the server side with [node][Node Rendering].

A new application project can be created with the `rappidjs` command.

```
rappidjs create app <ApplicationName> [<TargetDirectory>]
```

The target directory parameter is optional. By default the current working directory is used.

### Project structure

The following project structure will be created from the command.

``` 
/doc                        your application documentation
/node_modules               rAppid.js packages and node modules
    /rAppid.js                  rAppid.js core package
        /js       <----|            rAppid.js core package root 
/public                |    web root
    /app               |        application root
        App.xml        |        application main class
        AppClass.js    |        application code behind
        /entity        |            entities go here (ns: app.entity.*)
        /locale        |            i18n files
        /model         |            models go here (ns: app.model.*)
        /module        |            modules (ns: app.module.*)
        /view          |            views (ns: app.view.*)
    config.json        |    configuration
    index.html         |    start html file
    js   ---symlink----|    linked rAppid.js package
package.json                package description file for publish per npm
/test                       application tests 
/xsd                        application schemas
```