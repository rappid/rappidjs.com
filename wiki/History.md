# History

The history is a bindable component, which manages the navigation in the browser and on the node server.

In rAppid.js an application exists of one html page `index.html` which bootstraps the application and render it to the body of the document. After the initial rendering the document is modified with Javascript and without a page refresh.

An application consists normally of multiple views which are accessible using a resource locator - URL. A URL is a uniform resource located with the following parts:

* protocol/scheme (http, https)
* (username:password)
* host (rappidjs.com)
* port (:80)
* url part (/index.html)
* search (?query=xyz)
* fragment (#/wiki)

Using different URLs for views causes the browser to reload the page, which we do not want because we didn't want to lose the state of our application. But likely there is a solution.

The fragment part of an url isn't send to the server and so every change of the url after the hash won't cause a page refresh. rAppid.js uses this common ajax pattern to identity different views and introduces `Route`s.

The history manages the detection of the hash change for the browsers and for applications which are rendered on node using rAppid.js-server. If a hash change is detected, either by navigate back- or forward, by changing the hash manually or using Javascript code the history will go through all registered [[Router]]s and executes the matching routes.

## Usage

The history object is a single instance which is accessible using the [[SystemManager]] or via [[Injection]]. It provides the `fragment()` attribute which is bindable to get the current fragment.

The history can be `start`ed and `stop`ped. The start is done automatically in the `Application.start()` method, so don't forget to call `this.callBase()` if you overwrite the the `start` function.

In addition the history object has a navigate function which is made available also through the [[Router]]. Navigate takes the following arguments:

* fragment - where to navigate (omit the #/ at the beginning)
* createHistoryEntry - self explained and optional
* triggerRoute - should Routers be acknowledged about the change - optional
* callback - function invoked after the routes are executed
