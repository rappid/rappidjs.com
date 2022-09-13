On this page you should learn, how to create and share a component you have build for rAppid.js.

As an Example project you can use [rappidjs-google](https://github.com/rappid/rappidjs-google) which is a module we build to integrate Google Analytics to your rAppid.js based application.

### Create a library project

First you have to create a directory for your root namespace, for example `mystuff`. Then place your components inside this directory and create a `package.json`-file and set the lib name to `mystuff`.

    {
        "name": "rappidjs-mystuff",
        "preferGlobal": "false",
        "version": "0.1.0",
        "author": "you@example.org",
        "contributors": [
            "You <you@example.org>",
        ],
        "description": "Mystuff-library for rAppid.js.",
        "lib": "mystuff",
        "repository": {
            "type": "git",
            "url": "git://github.com/you/rappidjs-mystuff.git"
        },
        "dependencies": {
            "rAppid.js": "latest"
        },
        "devDependencies": {
            "chai": "*",
            "mocha": "*"
        },
        "license": "MIT",
        "engine": {
            "node": ">=0.4"
        },
        "engines": {
            "node": "*"
        },
        "homepage": "http://mystuff-rappidjs.example.org",
        "optionalDependencies": {},
        "rAppid": {
            "type": "lib",
            "dependencies": {
                "rAppid.js": "latest"
            }
        }
    }

As you can see, we use *rappidjs* as prefix for the module name on npm, to mark it as a rappidjs-compatible module. This is not required but recommended.

You should structure your project like in the following example:

```
/ 
  /bin                   // contains all commands/scripts needed for un-/installation
  /mystuff               // this is where you put the components of your library
    /ProgressBar.xml     // example component
    /ProgressBarClass.js 
  /test                  // contains all component tests
  /package.json          // package.json for npm installation
```


### Test your custom library

**TODO**

### Publish your library

Since we use [npm](http://npmjs.org) as package manager, you simple run

    npm publish

inside the directory.

### Install your library elsewhere

To use this library, define it either as rAppid dependency in the `package.json` or run `rappidjs install rappidjs-mystuff`. The `rappid` command will then link the library folder in the public dir as `mystuff`.

    {
        ...
        "rAppid": {
            "type": "app",
            "dependencies": {
                "rAppid.js": "latest",
                    "rAppid.js-mystuff": "latest"
            }
        }
        ...
    }

### Use your library

**TODO**

### Find existing libraries

**TODO**

