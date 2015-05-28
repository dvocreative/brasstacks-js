(function(root, factory){

    var ns = 'BrassTacks';

    if (typeof define === 'function' && define.amd) {
        define(factory);

    } else if (typeof exports === 'object') {
        module.exports = factory();

    /*} else if (typeof root.export === 'object') {
        export default factory();*/

    } else {
        root[ns] = factory();
    }

})(this, function() {

    var BTRoute = function(config, parentStack) {

        this.parentStack = parentStack;

        this.children = [];
        this.redirect = false;
        this.controllerScope = false;
        this.runParentRoutes = true;

        if (config) {
            this.build(config);
        }

    };

    BTRoute.prototype = {

        build : function(config) {

            for (var prop in config) {
                if (config.hasOwnProperty(prop) && prop !== 'routes') {
                    this[prop] = config[prop];
                }
            }

            if (typeof this.url === 'string') {

                if (this.parentStack.length) {
                    this.url = this.parentStack[this.parentStack.length-1].originalUrl + this.url;
                }

                this.originalUrl = this.url;

                var toReg = this._routeToRegExp(this.url);

                this.url = toReg.url;
                this.params = toReg.params;

            }

        },

        getId : function() {

            return this.id || false;

        },

        matchTo : function(urlToCompare) {

            return urlToCompare.match(this.url);

        },

        addChild : function(route) {
            this.children.push(route);
        },

        run : function(BT, args, payload, parentControllerResponse, overrideRunParents) {

            var controllerResponse = null;

            if (this.redirect) {
                BT.route(this.redirect, payload);
                return;
            }

            if (!overrideRunParents && this.runParentRoutes && this.parentStack.length) {
                for (var i = 0, len = this.parentStack.length; i < len; i++) {
                    if (!BT.halted) {
                        parentControllerResponse = this.parentStack[i].run(BT, args, payload, parentControllerResponse, true);
                    }
                }
            }

            if (!BT.halted && this.controller && typeof(this.controller) === 'function') {
                controllerResponse = this.controller.apply(this.controllerScope || BT, [args, payload, parentControllerResponse]);
            }

            return controllerResponse;

        },

        mapArgs : function(args) {

            var mapped = {};

            if (args && this.params) {
                for (var i = 0; i < args.length; i++) {
                    if (this.params[i]) {
                        mapped[this.params[i]] = args[i];
                    }
                }
            }

            return mapped;

        },

        //the following adapted from BackboneJS

        _routeToRegExp: function(route) {

            var optionalParam = /\((.*?)\)/g;
            var namedParam    = /(\(\?)?:\w+/g;
            var splatParam    = /\*\w+/g;
            var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

            var params = route.match(namedParam);

            if (params) {
                for (var i = 0; i < params.length; i++) {
                    params[i] = params[i].substring(1);
                }
            }

            route = route
                .replace(escapeRegExp, '\\$&')
                .replace(optionalParam, '(?:$1)?')
                .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^/?]+)';
                })
                .replace(splatParam, '([^?]*?)');

            return {
                url : new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$'),
                params : params
            };

        }

    };

    var BrassTacks = function(config) {

        this.routes = [];
        this.routesById = {};

        this.halted = false;

        if (config) {
            this.add(config);
        }

    };

    BrassTacks.prototype = {

        /**
         * Adds a route configuration to the BT instance
         * @param {object} routeConfig - Route configuration (see documentation)
         * @param {object} [parent] - If this route is nested, pass in its parent BTRoute for upward referencing
         */

        add : function(routeConfig, parent) {

            var route = null;

            //add a route to the router

            if (typeof routeConfig.url === 'string' || routeConfig.id) {
                //TODO this is gross code
                var stack = (parent && parent.parentStack.length) ? parent.parentStack.slice() : [];
                if (parent) {
                    stack.push(parent);
                }
                route = this._processRoute(routeConfig, ((typeof routeConfig.runParentRoutes !== 'undefined' && routeConfig.runParentRoutes === false) ? [] : stack));
            }

            //add children

            if (routeConfig.routes) {

                for (var i = 0; i < routeConfig.routes.length; i++) {

                    var child = this.add(routeConfig.routes[i], route);

                    if (route && child) {
                        route.addChild(child);
                    }

                }

            }

            return route;

        },

        /**
         * Triggers a route by either URL or ID, if a matching BTRoute exists
         * @param {string} urlOrRouteId - Either a route's ID, or a URL
         * @param {object} [payload] - An object containing a custom payload to be pass through the route execution
         */

        route : function(urlOrRouteId, payload, hooks) {

            this.halted = false;

            payload = payload || {};

            var splitUrlorId = urlOrRouteId.split('&');

            for (var i = 0, len = splitUrlorId.length; i < len; i++) {

                var route = null,
                    params = null;

                route = this.routesById[splitUrlorId[i]];

                if (!route) {
                    var parsed = this._parseUrl(splitUrlorId[i]);
                    route = parsed[0];
                    params = parsed[1];
                }

                if (route) {
                    var mappedArgs = route.mapArgs(params);
                    if (hooks && hooks.beforeRoute) {
                        hooks.beforeRoute.apply(this, [splitUrlorId[i], mappedArgs, payload]);
                    }
                    route.run(this, mappedArgs, payload);
                    if (hooks && hooks.afterRoute) {
                        hooks.afterRoute.apply(this, [splitUrlorId[i], mappedArgs, payload]);
                    }
                } else if (hooks && hooks.notFound) {
                    hooks.notFound.apply(this, [splitUrlorId[i]]);
                }

            }

        },

        /**
         * Grabs a function to be assigned to window.onHashChange, for use in browser of course
         * @param {Object} win - Reference to the browser's root (window) object
         * @param {Object} [payload] - An object containing a custom payload to be pass through the route execution
         */

        getHashChangeHandler : function(win, payload) {

            return (function(win, btInstance){
                return function() {
                    btInstance.route(win.location.hash.substr(1), payload);
                };
            })(win, this);

        },

        /**
         * Callable within route controllers, used to halt propagation through a stack of parents
         */

        halt : function() {
            this.halted = true;
        },

        /**
         * Creates a new BTRoute instance, adds
         * @param {Object} config - The route's configuration
         * @param {Object} [parentStack] - An array of references to all parents, ordered by oldest parent first
         */

        _processRoute : function(config, parentStack) {

            var route = new BTRoute(config, parentStack);

            this.routes.push(route);

            var id = route.getId();

            if (id) {
                this.routesById[id] = route;
            }

            return route;

        },

        /**
         * Identifies the route to run (if any) when a route-by-URL is triggered
         * @param {string} urlString - An incoming URL, potentially with parameters
         */

        _parseUrl : function(urlString) {

            var route = null,
                i = this.routes.length,
                args = null;

            while (i--) {

                var result = this.routes[i].matchTo(urlString);

                if (result) {
                    result.shift();
                    args = result;
                    route = this.routes[i];
                    break;
                }

            }

            return [route, args];

        }

    };

    return BrassTacks;

});