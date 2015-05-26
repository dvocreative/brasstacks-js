# BrasstacksJS
That minimal, low-magic, low-sugar, high-versatility JavaScript 'framework' you've always wanted. And yes, it works on both the browser and server.

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

require('http').createServer(function(req, res) {

	bt.route(req.url, { request : myReqObj, response : myRespObj });
	
	res.writeHead(200);
	res.end(myRespObj.hurl());

});


```