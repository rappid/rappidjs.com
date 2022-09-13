# Command Line Interface

rAppid.js ships with a command-line interface, which is automatically available if you install rAppid.js globally using npm.

```
npm install -d -g rAppid.js
```

## Invoke 

Invoke the rappidjs command from your command-line by simply type `rappidjs`.

If you haven't installed rAppid.js using npm and want to use the command-line interface execute 

```
node your/path/to/rAppid.js/bin/rappidjs
```


## Commands

The list of available commands is shown you just execute `rappidjs`.

```
rappidjs <command>
Commands:
   build
   config
   create
   export
   help
   init
   install
   interactive
   optimize
   postinstall
   server

For command usage: rappidjs help <command>
```

Each command comes with an argument list and description, which is shown by using the help command

```
rappidjs help <command>
```

## Commands

### create
```
rappidjs create lib <libName> [<dir>] - Creates a rappidjs lib directory structure
rappidjs create app <AppName> [<dir>] - Creates empty rappidjs application
```

### config
```
rappidjs config [file:=config.json]
	creates or update the given config.json file to incluce all xaml classes
```

### init
```
rappidjs init <dir>
	Links all dependencies in the project dir
```

### install
```
rappidjs install <pkg>
rappidjs install <pkg>@<version>
rappidjs install <pkg> <version>
rappidjs install <pkg> <version> <dir>
	Installs rAppidjs dependencies from ./package.json.
```

### interactive
```
rappidjs interactive
	user interactive installation helper
```

### build
```
rappidjs build [file:=build.json] [-v version]
        packages the application with the given build config and version
```

The build config can look like this:

```
{
    "modules" : [
        {
            "name": "app/Todo",  // name of new packaged module 
            "include": [
                "xaml!app/Todo"  // list of files to include
            ]
        }
    ],
    "indexFile": "index.html",  // the index file to use
    "targetDir" : "build",  // the target dir
    "uglify" : true, // uglify src
    "usePackageVersion": true  // use version from package.json -> creates a new director inside target dir  
    "removeCombined": false  // removes all packaged files if true
}
``` 
