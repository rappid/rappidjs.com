# Data Sources

DataSources provide an abstract interface to connect to any kind of persistence layer. While designing the interface we always took an eye on connecting

* to web services
* to LocalStorage
* and even to databases (like MongoDB)

Using a data source should be transparent to the developer, so that the concrete implementation can be replaced without changing the application logic.

## Concepts

Before going into the depth of DataSources some terms and concepts have to be clarified.

* `DataSource`: store and retrieve data
* `[[Bindable]]`: A thing which can be bound to components triggering events on data change
* `Entity`: A bindable, with a schema defining the structure 
* `Model`: An entity resource which can be loaded from, saved to and deleted from a `DataSource`
* `Collection`: An list of model resources which can be loaded from a `DataSource`
  
Just keep the following inheritance in mind:

```
Bindable <-- Entity <-- Model
Entity: Bindable + Schema
Model: Entity + Load/Save/Delete
List <-- Collection
```

For loading and saving models or collections, rAppid.js follows the [Active Record pattern](http://en.wikipedia.org/wiki/Active_record_pattern) and [REST](http://en.wikipedia.org/wiki/REST). So you call the load and save methods directly on the instances.

Furthermore rAppid.js comes with a **Single Instance Cache** which means that every model instance only exists one time inside a an application. With this technique the developer doesn't need to worry that somewhere in the application is a model instance which is not updated.  

## Using a DataSource

This part explains how to configure a DataSource and work with models and collections. The following concepts apply on every DataSource implementation. 

### Configuration of a DataSource

Before a DataSource can be used it must be configured. This is usually done in XAML. The following example shows a RestDataSource which is configured for a **users** and a **companies** resource. The ResourceConfigurations are used to map the REST paths to the model classes. The same configurations can be used for a LocalStorageDataSource or a MongoDataSource. 

```xml
   <data:RestDataSource cid="dataSource" cid="api" gateway="api" endPoint="api">
        <conf:DataSourceConfiguration>
            <conf:ResourceConfiguration modelClassName="app.model.User" path="users">
               <conf:ResourceConfiguration modelClassName="app.model.Image" path="images" />
            </conf:ResourceConfiguration>
            <conf:ResourceConfiguration modelClassName="app.model.Company" path="companies" upsert="true"/>
        </conf:DataSourceConfiguration>
    </data:MongoDataSource>
```

The model classes contain the schema of the data. Have a look [[here|Defining-a-Model]] for how to define the schema.

### Instantiation of a collection

Collections need to be instantiated in the context of a specific DataSource or a Model. In the root context of the datasource a collection can be created by calling `createCollection` and pass in the Factory of the collection. To create a sub collection in the context of the Model call `getCollection` with the name of the reference. The following example shows both cases:

```js
var dataSource = this.$.dataSource; // some dataSource
var users = dataSource.createCollection(Collection.of(User)); // creates a user collection instance
var user = users.createItem(2) // creates a user instance with ID = 2
var images =  user.getCollection("images") // returns the sub collection 'images' of the user
```

This returns a collection instance for fetching users. This collection is automatically cached inside the dataSource. So when this statement is called again the same collection instance will be returned. 

### Fetching collections

Collections are fetched page wise in the background. This prevents the developer to load big amounts of data at once, which could slow down your application. The following examples shows the two methods for fetching items of a collection. 

```js
users.fetch({}, function(err, users){

  // returns the fully fetched collection with user models

});

users.fetchPage(4, {}, function(err, userPage){

  // returns the page with index 4  

});
```
The page size of of a collection can be defined in the DataSource by setting the **collectionPageSize** attribute. 

If you want to fetch a specific set of data you can also use the options object and pass in some **offset** and **limit**. This will return a collection page with the size of the given **limit**.

```js
users.fetch({
  offset: 100,
  limit: 2
  }, function(err, userPage){

  // returns a collection page with exact 2 users.

});
```





### Instantiation of a model 

Before a model can be fetched or saved we need to create a instance of the model. A model is strongly related to a collection. Therefor it also should be instantiated in the context of the collection.

```js
var dataSource = this.$.dataSource; // dataSource from injection
var users = dataSource.createCollection(Collection.of(User)); // creates a user collection instance 

var user = users.createItem();  // instantiates a fresh user without ID 
var knownUser = users.createItem(2);  // instantiates a known user with ID

```
 

### Fetching a model

To fetch a model the instance must be instantiated with an ID in the given collection. The model data can then be easily fetched like this:

```js

person.fetch({}, function(err, person){
  // callback with fetched person
});

```

The first parameter is an option object which can contain extra query parameters or dataSource specific options.

If the model is already fetched the callback is called immediately.

### Saving a Model

To update or save a new a model the common *save* method is used. rAppid.js differentiates internally between new and existing models by checking the ID field. 

```js

var newUser = users.createItem(); // creates a user instance without an id
var user = users.createItem(1); // creates a user instance with id = 1

/** creates a new person. After creation the ID field is set */
newUser.save(null, function(err, model){
  // callback
});



/** updates the existing model with ID 1 */
user.set('firstName','Adam');

user.save(null, function(err, model){
  // callback
});
```

## DataSource classes

### DataSource.Context

### DataSource.Processor

### DataSource.FormatProcessor

## RestDataSource
### Save

```
model.save(options, callback) -> model.$context.saveModel(model, options, callback);
processor = DataSource.getFormatProcessor('create' || 'update');
processor.saveSubModels(model, options, cb);

uri = DataSource.gateway + context.getPathComponents() + DataSource.getPathComponentsForModel(model);
params = _.defaults(context.getQueryParameter(), DataSource.getQueryParameter());

data = mode.prepare(model.$);
data = processor.serialize(data);

payload = formatProcessor.serialize(data);

AJAX

handleCreationSuccess() || handleUpdateSuccess() || handleSaveError()
```


Currently there are an abstract DataSource implementation and a `RestDataSource` implementation which can handle `JSON`. XML can be easily used by adding a new FormatProcessor. 