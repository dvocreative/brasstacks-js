# BrasstacksJS
That minimal, low-magic, low-sugar, high-versatility JavaScript 'framework' you've always wanted. And yes, it works on both the browser and server.

[Motivation](#motivation)
[Configuration](#configuration)

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