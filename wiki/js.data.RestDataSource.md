## Setup a RestDataSource
```xml
<data:RestDataSource gateway="api" endPoint="http://rappidjs.com/api">
    <conf:Type path="baskets" className="app.model.Basket" alias="Basket"/>
    
    <!-- optional alias, if no alias is defined alias will be determinated automatically -->
    <conf:Type path="product" className="app.model.sprd.Product" />
    
    <!-- Model can be specified via className, if className is obmitted js.data.Model is used but alias have to be specified -->
    <conf:Type path="shops" alias="Shop" />

</data:SprdApiDataSource>

```

