# Tutorials

Some Tutorials and examples ...
## Simple Hello World Application

Our hello.xml looks like this :
```html
<?xml version="1.0"?>
<js:Application xmlns="http://www.w3.org/1999/xhtml"
                xmlns:js="js.core" xmlns:ui="js.ui" xmlns:conf="js.conf">

    <js:Imports>
        js.core.Bindable;
    </js:Imports>

    <js:Script>
        <![CDATA[
        (function (Bindable) {
            return {
                _defaults:{

                },
                /**
                 * Initializes the app
                 * this method is used to initialize variables
                 */
                initialize:function () {
                    this.set('name','Bob');
                },
                /**
                 * This method should be called from outside to start the application
                 */
                start:function () {
                    this.render(document.body);
                }
            }
        })]]>
    </js:Script>
    <div class="container">
      Hello {name}, How are you?
    </div>
</js:Application>
```

## Binding Examples


## Extending a existing component

## Providing own markup for existing UI component

## Using Drag and Drop