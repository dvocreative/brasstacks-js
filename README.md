# BrasstacksJS
That minimal, low-magic, low-sugar, high-versatility JavaScript 'framework' you've always wanted. And yes, it works on both the browser and server.

[Motivation](#motivation)
[Configuration](#configuration)
[Usage](#usage)

<a name="motivation"></a>
### Motivation

If you're like me, most of your JavaScript apps start with a router that triggers some functionality depending on the route. Most, if not all modern JS frameworks assume this. But how those frameworks implement and extend this very simple concept varies widely. BrasstacksJS is an attempt to trim away all of that framework fat and give you just what you need.

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

window.onhashchange = bt.getHashChangeHandler(window);

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
			runParentRoutes : false					//OPTIONAL Run any parents controllers before running this one; runs from the highest-level parent downwards
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
	//Note that BT does NOT strip out the '#' for you
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

#### Nested Routes

TBC

#### Parent Controllers

TBC

#### Simultaneous Routing

TBC


### License

Use of BrasstacksJS is governed by the [MIT Software License](http://opensource.org/licenses/MIT).
