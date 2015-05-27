# BrasstacksJS
That minimal, low-magic, low-sugar, high-versatility JavaScript 'framework' you've always wanted. And yes, it works on both the browser and server.

* [Motivation](#motivation)
* [Configuration](#configuration)
* [Usage](#usage)

<a name="motivation"></a>
### Motivation

If you're like me, most of your JavaScript apps start with a router that triggers some functionality. Most, if not all modern JS frameworks assume this. But how those frameworks implement, extend and ultimately complicate this very simple concept varies widely. BrasstacksJS is an attempt to trim away all of that framework fat and give you just what you need.

### Installation

`bower install brasstacks-js`

`npm install brasstacks-js`


### Example

```javascript

var bt = new BrassTacks({

	 url : '',
	 controller : function(pars, someCustomAppPayload) {
		someCustomAppPayload.logger.log(someCustomAppPayload.request);
	 },

	routes : [
	
		{
			 id : 'dashboard',
			 url : '/dashboard',
			 controller : function(pars, someCustomAppPayload) {
					if (!someCustomAppPayload.isAuthenticated()) {
						this.halt();
					}
			 },
			 routes : [
			 
				  {
						id : 'add',
						url : '/add',
						controller : myAddControllerRef
				  },
				  
				  {
						id : 'remove',
						url : '/remove/:id',
						controller : myRemoveControllerRef
				  }
				  
			 ]
		}
	]
	
});

```

Initialized on a client-side environment...

```javascript

// hash change

window.onhashchange = function() {
    bt.route(window.location.hash.substr(1));
};

// or maybe just manually...

bt.route('dashboard');

```

Initialized on a server-side environment...

```javascript

var srv = require('http').createServer(function(req, res) {

	bt.route(req.url, { request : myReqObj, response : myRespObj });
	
	res.writeHead(200);
	res.end(myRespObj.hurl());

});

srv.listen(80);


```

<a name="configuration"></a>
### Configuration

The initial configuration object passed to a BrassTacks instance always starts with an object, representing the global route. Unlike some similar libraries you can't pass an array
of routes. This difference is by design -- a route by definition has an array of routes as its children; creating a bare array of routes without a parent breaks this
definition. However, you needn't actually specify an ID or URL for this parent route.

```javascript

// Simple example with all possible parameters

var bt = new BrassTacks({

	// url : '',
	// id : 'global',

	routes : [
	
		{
			id : "page1",				// Not required, but encouraged
			url : "/page1"				// Not technically required, unless ID is also not specified 
			controller : function(parameters, payload, returnValueFromParentController) {
				// context inside this controller is the BrassTacks instance by default
			},
			runParentRoutes : true					//OPTIONAL Run any parents controllers before running this one; runs from the highest-level parent downwards
			resetParentStack : false				//OPTIONAL Resets the parent stack; this route nor any below it will run parents above this point
			controllerScope : someOtherObj		//OPTIONAL only for changing the scope the controller executes in,
			redirect : 'page99'						//OPTIONAL make this route immediately execute another route, by ID or URL
			routes : [ ... ]							//OPTIONAL specify an array of child routes
			
		}
	
	]

});


```

<a name="usage"></a>
### Usage

#### URL formats

BrassTacks URL parsing is leveraged from the Backbone.js Router's RegEx matching. So you should be able to use the same URL formats
found here: [http://backbonejs.org/#Router-routes](http://backbonejs.org/#Router-routes)

#### Triggering a route

BrassTacks doesn't attempt to automatically trigger routes. However, it does make it easy to do things like listen to hash changes or trigger a route manually.

```javascript

// trigger a route manually, by its ID

bt.route('page1');

// trigger a route manually, by URL

bt.route('/dashboard/edit/123');

// trigger on hash change

window.onhashchange = function() {
	// Note that BT does NOT strip out the '#' for you
	bt.route(window.location.hash.substr(1));
};

```

The `route()` method also takes in a second argument, a `payload`, described below.

#### Passing in a payload

Odds are whatever business logic your routes trigger will need to read from a current state, assemble some kind of response, manipulate some other data,
change the DOM, render a template, etc., etc.. By passing a payload of your choosing you can ensure your route controllers have reference to everythign they need.

As a very minimal example you might want to have a response object as your payload:
 ---
``` javascript

var response = {
	success : false,
	data : []
};

bt.route('page1', response);

```

As documented in the next section, your payload (`response` in this case) will be available in your route's controller.


#### Controllers

Unless it's a redirect, odds are you want your route to actually trigger some functionality. That's what the controller is for.
You can pass any function in to the route's `controller` property, and it will be called in the context of the BT instance by default, or you
may specify your own context by setting the `controllerScope` property.

Route controllers are passed three arguments:

```javascript

{
	controller : function (arg1, arg2, arg3) {
		// arg1 : if your URL had parameters, i.e. /edit/:id/, you'd have a key-mapped object available here
		// arg2 : your payload reference. If no payload was passed this is an empty object that will persist through any parent controllers
		// arg3 : if a parent controller was called before this and it returned a value, this value will be available here
	}
}

```

#### Handling matchless requests

When the URL or ID passed to `route()` did not find a match, it can trigger an optional callback passable as its third parameter. The 
callback is called with the unmatched string as its argument, and could be called multiple times if multiple faulty routes exist (i.e. in simultaneous routing mode).

```javascript

bt.route('/my/bad/url', payload, function(str){
	console.log('Whoops, ' + str + ' did not match any routes.');
	payload.request.handle404(str);
});

```

#### Nested Routes

Nesting happens naturally with BrassTacks. Every route has an optional `routes` property that is an array of child routes.

When using a nested route, its URL is automatically prepended with the URL(s) of its parents, similarly to [Angular UI Router](https://github.com/angular-ui/ui-router).

So in the following example,

```javascript

{
	url : "/team",
	routes : [
		{
			url : "/john"
		}
	]
}

```

you would access the nested route with `/team/john`.


#### Parent Controllers

The real power of nested routes comes from the ability to execute that route's parent controller(s).

In a way, you can think of nested routes in BrassTacks as extending classes in most programming languages; each can invoke the parent's constructor, and it it's own parents', etc..

By default, routes *do* trigger their parent controllers. To turn this off, simply set `runParentRoutes : false`.

##### Order of the Parent Stack

In BrassTacks, **a stack of parent controllers runs from the oldest parent to youngest; in other words, the controller of the called route will be last to run**.
This ordering allows requests to more naturally proceed through the routing stack, allowing you to perhaps halt a request before it reaches the very specific logic of your
called route. A common usage for this would be to ensure authentication was checked at an appropriate parent before child routes are called.

##### Passing data between parent controllers

There are two ways to persist data along a stack of parent controllers. The first is to simply use a *payload*, as described above, since the payload you pass in will be
passed by referenced through all controllers and therefore each will be seeing the latest modified reference. 

```javascript

{
	url : '/a',
	controller : function(params, payload) {
		payload.foo = 'bar';
	},
	routes : [
		url : '/b',
		runParentRoutes : true,
		controller : function(params, payload) {
			//returns 'barnone' to the result of the initial route() call
			return payload.foo + 'none';
		}
	]
}

```

The second method is to have controllers return a value. If a controller returns a value, the next controller in the execution stack will receive that value as its third argument.

```javascript

{
	url : '/a',
	controller : function() {
		return 'foo';
	},
	routes : [
		url : '/b',
		runParentRoutes : true,
		controller : function(params, payload, lastReturn) {
			//returns 'foobar' to the result of the initial route() call
			return lastReturn + 'bar';
		}
	]
}

```

##### Overriding the depth of a parent stack

Perhaps you don't want *all* of your parent routes to be called for a particular hierarchy of routes. BrassTacks allows you to 'reset' the parent stack
at any point using the `resetParentStack` parameter.

```javascript

{
	url : '/a',
	controller : function() {
		// ...
	},
	routes : [
		url : '/b',
		resetParentStack : true,
		controller : function() {
			// ...
		},
		routes : [
			url : '/c',
			runParentRoutes : true,
			controller : function() {
				// ...
			}
		]
	]
}

```

In the above example, hitting `/a/b/c` will call the controllers for `/b` and `/c`, but not `/a`.


#### Simultaneous Routing

Complex front-end applications may have multiple route-enabled applications operating alongside each other. BrassTacks offers an ability to handle this
problem simply by allowing multiple URLs within a single hash.

`http://myapp.com/#/dashboard/profile&/ticker/add`

By passing in `/dashboard/profile&/ticker/add` to `route()`, BrassTacks will split on the `&` and run any matching routes for both `/dashboard/profile` and `/ticker/add`. Fun!

### License

Use of BrasstacksJS is governed by the [MIT Software License](http://opensource.org/licenses/MIT).
