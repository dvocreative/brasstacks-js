# BrasstacksJS
That minimal, low-magic, low-sugar, high-versatility JavaScript 'framework' you've always wanted. And yes, it works on both the browser and server.

### Motivation

If you're like me, most of your JavaScript apps start with a router that triggers some functionality depending on the route. Most, if not all modern JS frameworks assume this. But how those frameworks implement and extend this very simple concept varies widely. BrasstacksJS is an attempt to trim away all of that framework fat and give you just what you need.

### Example

```javascript

var bt = new BrassTacks({

	routes : [

		{
			 url : '/',
			 controller : function() {
				// do some homepage stuff!
			 }
		},
	
		{
			 id : 'dashboard',
			 url : '/dashboard',
			 controller : function(pars, request) {
			 		// custom request/response objects let you do whatever you want
					if (!request.isAuthenticated()) {
						this.halt();
					}
			 },
			 routes : [
			 
				  {
						id : 'add',
						url : '/add',
						controller : function(pars, request, response) {
							// do some add page stuff, then probably modify the response obj
						}
				  },
				  
				  {
						id : 'remove',
						url : '/remove/:id',
						controller : myReferencedRemoveController
				  }
				  
			 ]
		}
	]
	
});

```

Initialized on a client-side environment...

```javascript

// hash change

window.onhashchange = bt.getHashChangeHandler(window, true);

// or maybe just manually...

bt.route('dashboard');

```

Initialized on a server-side environment...

```javascript

require('http').createServer(function(req, res) {

	bt.route(req.url, true, myRequestObject, myResponseObject);
	
	res.writeHead(200);
	res.end(myResponseObject.hurl());

});


```