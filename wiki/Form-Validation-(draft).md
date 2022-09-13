# Model Validation

This example shows how use model validation.

## 1. Defining the model

First of all we need to define a Model with it's schema. 
Let's say we have a person with the following fields:

* **firstName** - required
* **lastName** - required
* **address** -  required
* **birthdate** - required
* **email** - optional

Therefor we need to create a **Person** class under `app/model` which inherits from `js/data/Model` and define the schema.

```js
define(["js/data/Model", "app/entity/Address"], function(Model, Address){

  return Model.inherit('app.model.Person',{
     schema: {
        firstName: String,
        lastName: String,
        address: Address,
        birthdate: Date,
        email: {
           type: String,
           required: false
        }
     }
  });

});

```

In the schema we can describe which fields are required and which not. The **required** status and the **type** will get validated automatically.

Now we have our person model. What we also need is the **Address** entity. We put this file under `app/entity` . The code for this entity looks like in the following snippet:

```js
define(["js/data/Entity"], function(Entity){

  return Entity.inherit('app.entity.Address',{
     schema: {
        street: String,
        city: String,
        zipCode: String
     }
  });

});
```


The address entity inherits from `js/data/Entity` which means that it is a dependent object that can't exist alone.

// TODO: move this to "Writing validators"

## 2. Adding some validation logic

### Adding validators

For the email field we want to add some more validation logic. Therefor we create a EmailValidator that inherits from a RegExValidator. The RegExValidator validates a field by a regular expression. 
We create the **EmailValidator** class inside the **Person** class and add it to the validators array of **Person**.
  
```js
define(["js/data/Model", "app/entity/Address", "js/data/validation/RegExValidator"], function(Model, Address, RegExValidator){
  // inherits from the imported RegExValidator 
  var EmailValidator = RegExValidator.inherit({
      defaults: {
          errorCode: 'emailError',
          regEx: /^([a-zA-Z0-9_\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
      }   
  });
  
  return Model.inherit('app.model.Person',{
     schema: {
        firstName: String,
        lastName: String,
        address: Address,
        birthdate: Date,
        email: {
           type: String,
           required: false
        }
     }, 
     validators: [
       new EmailValidator({field: "email"})
     ]
  });
   
});

```

While instantiation we tell the Validator the field he needs to validate. In this case **email**.

### A custom validate method

The next step is to write a validator with a custom validate method. The **Validator** base class offers to validate methods to override. 

* `validate: function(entity, options, callback)` - for asynchronous validation
* `_validate: function(entity)` - for synchronous validation

The `validate` method allows asynchronous validation. Therefor it should return the error as **second** parameter of the callback. The following example shows a validator that checks if an email already exists. 

```js
define(["js/data/validator/Validator"], function(Validator){
  return Validator.inherit({
    defaults: {
       errorCode: "emailExists",
       errorMessage: "Email already exists"
    },
    validate: function(entity, options, callback){
       var email = entity.get(this.$.field); // the value to validate
       var self = this;
       // check async. for email, function is just a mock ...
       checkEmail(email, function(exists){
         var error;
         if(exists){
            error = self._createFieldError(); // creates an error object with the errorCode and errorMessage
         }
         callback(null, error);  // returns the error as second parameter
       }); 
    }
  }
});
```

If you don't need asynchronous validation you can override the internal `_validate` method. An example which checks for a given string looks like this:

```js
define(["js/data/validator/Validator"], function(Validator){
  return Validator.inherit({
    defaults: {
       str: "someString",
       errorCode: "containsString",
       errorMessage: "Value does not contain string"
    },
    _validate: function(entity){
       var value = entity.get(this.$.field);
       if(!value || value.indexOf(this.$.str) === -1){
            return this._createFieldError();
       }
    }
  }
});
```

## 3. Validating the model

Every entity or model has a validate method, which needs to be called to validate the fields.

The following example shows how this is done in a synchronous way.

```js

// in some code-behind file
_handleButtonClick: function(){
  // take the person instance 
  var person = this.$.person;
  // call validate
  person.validate();
  
  if(person.isValid()){
    person.save();
  } else {
    alert("Person is not valid");
  }
}

```

If you have registered asynchronous validators then this should look like in the following snippet.

```js

// in some code-behind file
_handleButtonClick: function(){
  // take the person instance 
  var person = this.$.person;
  // call validate
  person.validate({},function(err, validationErrors){
    if(!err){
      if(person.isValid()){
        person.save();
      } else {
        alert("Person is not valid");
      }
    }
  });
  
  
}

```

### Validation options

There are several options you can pass to the validate method:

* **fields** - Array of fields to validate - default null
* **reset** - if true all errors are cleared before validation - default true
* **setErrors** - if true the validation errors are set on the model - default true 

For example a validate call which only validates the email field looks like this:

```js

 person.validate({
     fields: ["email"]
   },function(err, validationErrors){
    if(!err){
      if(person.isValid()){
        person.save();
      } else {
        alert("Person is not valid");
      }
    }
  });

```
