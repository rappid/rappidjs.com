# Changelog

## 0.10.0

* extended Radio and Checkox with inputId and inputValue
* moved parsePayloadOnCreate, parsePayloadOnUpdate into hooks
* optimized getContextForChild in DataSource
* input type='email' supported
* optimized render method caching
* optimized caching or rendered attributes
* mediaQueries for componentLoader
* draggable and title are now dom attributes
* fixed cloning of default attributes that are binding definitions
* updated underscore
* moved cleanUpDescriptors into the build process
* optimized parsing of text with bindings
* fixed autofill for safari
* changed initialization of invisible children
* fixed order of visible children
* fixed setting style attribute of dom element
* pass option to getQueryParameter

## 0.9.0

### features

* extended Dialog with header and content placeholder
* added close behavior to menu button
* updated moment.js
* new component AutoSuggestionBox
* refactored I18n to DataFormatter
* field gets active class, when control has focus
* added clear method to component loader
* two way bindings in formatted xml for text area
* make binding parser robust to line breaks
* support for resultType in Models -> you can now PUT to resources that return an entity
* fieldText now tunneling all attributes
* added support for pure JS applications
* added inverse flag and replaceRegEx to RegExValidator
* optimized composing of entity references
* added defaults to FilterDataView
* added transformers to Entity
* added workaround for devices supporting touch and mouse events

### fixes

* fixed getComputedStyle for FF
* fixed checked attribute bug in IE9+
* fixed browser detection for IE11
* fixed possible null pointer exception in VirtualItemsView
* fixed click event in VirtualItemsView
* fixed slider for android devices
* fixed composing and parsing of dependent object models
* fixed converting empty string to primitive
* fixed reading binding paths that re undefined
* fixed cloning of injected elements in Bindable
* fixed getPathComponentsForModelClass for sub resources
* fixed slider to allow steps like 0.5 or 1.3
* fixed rendering of label of Checkbox if set to empty string
* fixed handling of empty keys in I18n
* fixed RadioGroup behavior if not valid value is found
* fixed dependentObjectCache if parent has no dependentObjectCache
* fixed menu button close behavior to just primary mouse button 
* fixed endpoint problem, if endpoint is not consistent belong requests

### commands

* improved build command
* added packages support for build command

## 0.8.0

### features

* added possibility to create collection items of a specific type
* ComponentLoader: lazy load components
* tooltip manager
* relative routes for ModuleLoader
* added routeNotFound hook on history
* added capture phase support for event listeners
* added alternative selection mode to VirtualItemsView
* added scrollBarSize attribute for TileList
* added topPadding and leftPadding for ScrollContainer in VirtualItemsView

### fixes

* fixed RadioGroup for null values
* fixed setting items to null in js:Repeat
* removed support for js:Script and js:Import
* options for a element to create history entries in pushstate
* href rendering for pushstate urls
* exit code != 0, for rappidjs commands exiting with an error
* support for navigation within module.start sequence
* wrap dialog within dialog container
* fixed determination of child context in data source
* fixed changing baselist and pageIndex in PagedDataView
* fixed handling of SelectedItems list in SelectionView
* don't add non callbacks to callback stack for synchronizeFunctionCall
* free memory after synchronizeFunctionCall returned
* fixed find parent scope for Entity without determinateScopeAttribute
* fixed $context lose of cloned collections

## 0.7.2

### features

* implemented cid scope - you can now use cid in xaml within Repeat 
* RadioGroup now working with repeat
* support for value binding in `RadioGroup`
* added support for header parameter in `RestDataSource`
* added selected state for ui:Checkbox
* implemented validator inheritance
* introduced server side validators for ResourceHandler 
* added find to `List`
* removed `this.break()` and `this.return` from `List.each`

### fixes

* Injection values are set via `set`
* changed "add:dom" to "dom:add"
* keep async annotation for `ExternalInterface` callbacks 
* fixed handling of plain js objects in bindings
* fixed context determination for sub models in entities
* fixed missing callBase for ExceptionHandler
* fixed path handling in `StaticFileHandler` 
* fixed checking of linked `Models` of `Entites` in `ResourceHandler`
* fixed passing validation options
* fixed auto close in NotificationManager
* preserve license information by default in `rappidjs build`
* fixed clear of ContentPlaceHolders in ModuleLoader, just clear external descriptors
* fixed using of SchemaValidator
* do not navigate with empty href and enabled pushState
* fixed localStorage implementation determination (3rd party, chrome)
* removed js:Script from several components
* fixed classAttributes of ModuleLoader
* cleanup code

### optimization

* optimized bind and unbind bus
* optimized attribute evaluation
* added BindingParser cache
* cache isDomNodeAttribute result



### CLI

* exit code for `rappidjs build` command
 
## 0.7.1

* rappidjs version command now can set the version
* moved js/html/a.js to js/html/A.js
* fixed missing dependency to esprima
* added NotificationManager
* fixed Checkbox Component
* re-enabled all web tests

## 0.7.0

* fixed scoping issue which let internal children access external scope of a component
* fixed visible rendering for last component in a list
* Added *back* method to History
* Added web tests for TabView
* Added more web tests for visible attribute
* Added more web tests for SelectionView
* changed attribute initialization for template components 
* Optimized SelectionView by differentiating between multiSelect = true and false

## 0.6.9

* enableInspection for rappidjs-devtools extension (https://chrome.google.com/webstore/detail/rappidjs-devtools/oalmajpfbgkkfeamkmgmmccnjfojogbh)
* fixed rendering in SelectionView
* introduced `serverOnly`, `compose` to schema
* fixed binding on list items
* added Flag for evaluation of Bindings in the constructor of Bindables
* fixed back button of browser
* respect preventDefault for push state navigation
* clear src attribute for image nodes
* fixed schema validation for sub entity lists
* added createWindow function to WindowManager
* fixed hasClass method in DomElement
* added placeholder support for input element
* documentation
* better IE support
* introduced beforeModelFetch hook
* rows & cols for textarea
* new AppClass template
* fixed path bindings for onChange("some.path")
* fixed SegmentedView

### UI

* slider

### Server

* fixed query merging in MongoDataSource
* Default port for web server is now :8080

### CLI

* respect absolute urls in rappidjs build command
* added version command


## 0.6.8

* browser object now contains vendor prefixes
* added **animationClass** to DomElement (animation class for adding and removing children)
* options for **fetch** method are now optional
* implemented push state support in History
* **onChange** annotation now supports paths
* fixed adding and removing of loading class in VirtualItemsView
* fixed some problems with SelectionView
* fixed querying and sorting in DataGrid
* fixed IE9 compatibility
* fixed MSPointer event mapping
* fixed *.woff font-loading in Svg.FontLoader

### Server

* added AuthroizationProvider
* added tests for authentication and authorization
* fixed encoding and decoding of paths and hrefs in RestHandler
* fixed server command for latest requirejs (shim warnings)
* fixed some bugs in MongoDataSource


## 0.6.7

* introduced js:Repeat
* Refactored ItemsView and SelectionView to use js:Repeat
* added support for data uri's in XAML plugin
* added template for tabs of TabView 
* fixed event target in EventHandler
* introduced ErrorProvider for translating ui:Field

### Server

* fixed composing in MongoDataSource
* added support for authentication & registration


## 0.6.6

* fixed ignoring of bindings in CDATA sections
* new feature: parameterizable XAML event handlers     

## 0.6.5

* fixed sync scroll position in VirtualItemsView

## 0.6.4

* fixed Bindings initialization
* fixed caching of queryCollection
* fixed visible attribute 
* fixes in SelectionView & ItemsView
* added fallback signature for Model.fetch()
* fixed pop method in List
* fixed modal windows in WindowManager
* fixed enabled=false
* removed unused prepare method in Model

* added tests

### Server

* fixed endpoint initialization
* fixed DELETE for REST Handler
* added like operator for MongoDataSource
* added context check for RestHandler
* added check if referenced Models exists 
* fixed context composing and parsing
* fixed $itemsCount bug in ResourceHandler and MongoDataSource

## 0.6.3

* minor fixes in TreeView

## 0.6.2

* fixed removing of non-visible children
* new UI component TreeView
* fixed handling of zero items in SelectionView
* introduced TemplatePlaceHolder
* added documentation for many functions, defaults, events
* fixed recursive XAML loading
* PARAMETER() binding to bind application start parameter
* removed inline `js:Script` code
* fixed memory leak in NodeRenderingHandler
* fixed binding evaluation for string
* added openMenu, toggleMenu, to MenuButton
* handle multiple save calls in Model
* added possibility to set limit and offset for collection fetch calls
* removed combined files from build

### tests

* added more REST-API tests

### `rappidjs doc`

* added support for xaml attributes
* inner classes
* @inherit annotation
* line numbers

## 0.6.1

* improved XSD schema generation
* refactored script blocks to code behind files
* fixed rAppid.js dependency in build command
* added support for events in doc generator
* added further documentation and schema definitions 

## 0.6.0

* improved doc command (includes now default attributes, static methods, etc.) 
* added option for XSD schema generation
* extended tests for REST api
* fixed HTMLView
* fixed rendering of checked state in input elements
* added a lot of documentation


## 0.5.7

* fixed destroying of EventBindables
* introduced idField - field attribute for entities and models
* added fqClassname support for type definition in schema 
* provided hook for Collection paging parameters
* fixed parsing loops for collection
* added resourcePathToUri hook
* added js/type/Color
* implemented js/ui/ColorPicker
* switched order of transform and transformBack methods in Bindings & fixed scoping problem
* fixed DataView

## 0.5.6

* fixed input event for IE
* fixed itemsCount for LocalStorageDataSource
* fixed cloning of sub models
* fixed some tests

## 0.5.5

* fixed empty string to primitiv bug
* fixed destroying of bindings 

## 0.5.4

* removed dependency to libxml and jsdom. Replaced with xmldom
* introduced pointer events
* annotated Bus event handlers for `Bindable`
* fixed initial _commit_field invokation
* fixed unbinding of nested events
* fixed invokation order in destroy phase
* fixed rendering of selectedItems
* link instead of clone injected attributes during clone phase
* polyfill for window.getComputedStyled
* fixed handling of white spaces in IE

### Server

* fixed node rendering for duplicate url parameter

## 0.5.3

* update to latest query.js version
* optimize require.js during the build command
* fixed binding initialization
* load external svg font asynchron 
* injection support for `Bindable`
* introduced browser object 
* introduced pointer events
* Color picker
* fixed Binding initialization for multiple bindings on the same object with two-way-binding
* pass xhr object within the error object in `RestDataSource``
* allow functions as injection instance
* moved renderSelected to `DomElement``
* removed copying of node_modules folder within `rappidjs create app` command

## 0.5.2

* updated to latest flow.js version
* added DataPicker 
* closable property for dialog
* added xaml notation for event handlers
* added globalToLocal and LocalToGlobal method
* introduced query.js with MongoQueryMapper implementation 
* fixed build command, added removeSpaces option 
* introduced ArrayExecuter
* refactored List, Collection
* load module by name
* fixed context determination for collection parsing
* added support for internal cid's, excluded them from being rendered
* environments
* fixed scope problem for ExternalInterface, added return
* fixed many tiny bugs in SelectionView
* fixed '*' event in List
* added timing variables to track bootstrapping of applications
* added os and browser classes to stage
* added svg font manager
* fixed template creation with cloneNode
* added support for classes in tabs
* selection via selectedTab for TabView

### CLI

* added web test environment based on webdriver with https://github.com/admc/wd and mocha 
* added `rappidjs webtest` command 

## 0.5.1

* added ScrollDirection to VirtualItemsView
* support auto calculated values for TileList (rows, cols, itemWidth, itemHeight)
* fixed add to DOM event
* introduced * event type to handle all events 
* added smart syntax to add event listeners to items of a List
* improved Binding evaluation
* composing of Entity attributes by schema definition
* added ExternalInterface - provide an interface for the outside world
* introduced InterCommunicationBus to communicate between different rAppid.js applications 
* better SVG support
* use same dependent object cache for all Entities of a Model
* href parsing for DataSource Context determination
* fixed TestRunner for new requirejs version
* moved contextModel from RestDataSource.Context into DataSource.Context
* fixed tagName attribute
* added support for Function-Binding-Inheritance e.g. ().onChange("size()")
* introduced extension library 
* fixed schema inheritance
* added support for Entity references inside a Model
* fixed composing of Entities
* extended .clone() support
* added support for null parameter in function binding

### Server

* automatic href creation
* fixed context determination for Collections

## 0.5.0

* render css styles by setting them as attribute
* simplified custom components, no need for classAttributes anymore
* fixed error bindings
* fixed rendering of styles
* advanced select component
* i18n.ts to search translation within special area
* IE7, IE8 compatibility
* GarbageCollection for IE
* useSafeHttpMethods for RestDataSource
* removed collectionClassName as datasource configuration
* ProgressBar component
* support uploading of FormData
* ajax hooks
* added SortCollection cache
* fixed cloning of objects
* fixed missing default variables for TabView
* added schema caching
* sort handling
* invalidate page cache 

### CLI

* extend build command to build versions in version directories

### Server 

* implemented authentication
* fixed schema validation
* enum validator
* REST-API: referenced models, href's for referenced models
* baseUri for request
* Spdy-EndPoint
* simplified DataSourceSwitchHandler
* fixed ExceptionHandler
* fixed writeHead
* simplified and stabilized MongoDataSource
 

## 0.4.2

* fixed rappidjs create app command
* added sorting
* upgraded to the latest version of inherit.js
* set constructor.name for xaml classes
* fixed a history callback invokation bug, and show start errors 
* introduced ModuleLoader.isModuleActive
* added schema validator
* added auto generated value support
* read payload for REST PUT and POST, if the server supports it
* fixed multiple end calls in rappidjs server
* start server session



## 0.4.1

* rappidjs server command
    * end points
    * handlers
    * filters
    * request pipeline modus
    * ServerSessions
    * CookieManager
    * MongoDataSource
* rappidjs build command now optimizes the config.json file
* added createQueryCollection for Collections
* LocalStorage as DataSource
* Each DataSource now have a DataSourceConfiguration
* Rewritten DataSource Context creation
* KeyPath for comparison in ItemsView
* Model Validators
* noCache Option for Model.fetch
* Extended schema for Models
* Device specific classes on stage 
* field:Textarea
* Date formatting in i18n with moment.js
* Relative linking of rappidjs modules
* Coping from global installed rappidjs during creation of new project
* States for ModuleLoader
* fixed optimizing of XAML 
* fixed input type="number"
* clear of rendered children
* Rendering in VirtualItemsView (DataGrid, TileList)
* fixed History and Navigation
* Model.delete
* Corrected default i18n path
* Bindings
* removed Alias option for anonym models for RestDataSource
* itemKey and itemIndex of ItemsView and SelectionView no longer use the $ prefix 
* all configuration classes were renamed to *Configuration 
* added DataSourceConfiguration and ResourceConfiguration 
* the "plugins" folder was renamed to "plugin" 
* $schema was renamed to schema 
* $classAttributes are now only used for components below js.ui.View 
* added $domAttributes for js.ui.View to whitelist attributes which should be rendered directly -> defaults are id, style, class

## 0.3.4
* added "build" command to create packaged and optimized builds
* added "exclude" option for clone method
* added linked sources to lib folder
* added enabled attribute for input elements
* added scrollToIndex attribute for VirtualItemsView
* invisible elements are now removed from the DOM (no "hide" class needed anymore)
* fixed tab handling for iOS browsers
* fixed syntax issues of older iOS browsers


## 0.3.3

* fixed .clone() method to create new cloned instance -> new inherit.js version
* removed unused UIComponents class
* refactored content.ref into content.name
* simplified Dialog, ESC & Enterkey for Dialog
* added RadioGroup
* Simplified usage of Field in combination with input elements, eg. field:Text, field:Password, field:RadioGroup
* fixed Binding initialization
* added Entity (server side) validation
* Implemented key handling and selection handling in VirtualItemsView -> DataGrid + TileList
* Updated rappidjs.com
* Fixed a lot of minor bugs

## 0.3.2

* Simplify usage of Template and Content
* Implemented .clone() and .sync() for Bindable and List
* New components
    VirtualItemsView
    DataGrid
    TileList
    Checkbox
    Radio
    Field
* Fixed some minor issues in bindings
* support for not() in bindings
* Added Nodejs >= 0.8 support
* Added TypeResolver for polymorphic associations in schema 
* Implemented a head manager

## 0.3.0

* Bootstrap applications with one line
* SystemManager is now Stage
* Added WindowManager which supports modal dialogs
* fixed component creation at runtime
* support for hash redirects
* rappidjs doc command

## 0.2.9

* injectable MessageBus

## 0.2.8

* refactored addComponent to addChild
* support of SVG
* js.ui.ListView
* new way to add event listeners for DOM events
* allow #! urls to be used
* requirejs 2.0 -> error handling 

## 0.2.7 - 0.1.0

* Stuff we didn't documented