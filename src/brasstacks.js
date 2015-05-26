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

    var BTRoute = function(config, parent) {

        this.controllerScope = this;

        this.parent = parent;
        this.children = [];
        this.redirect = false;

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

            if (this.url) {

                if (this.parent) {
                    this.url = this.parent.originalUrl + this.url;
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

        run : function(args, runParents, customRequestObj, customResponseObj, parentControllerReponse) {

            var controllerResponse = null;

            if (this.redirect) {
                BT.route(this.redirect, runParents, customRequestObj, customResponseObj);
                return;
            }

            if (runParents && this.parent) {
                parentControllerReponse = this.parent.run(args, runParents, customRequestObj, customResponseObj, parentControllerReponse);
            }

            if (this.controller && typeof(this.controller) === 'function') {
                controllerResponse = this.controller.apply(this.controllerScope, [args, customRequestObj, customResponseObj, parentControllerReponse]);
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
                route = this._processRoute(routeConfig, parent);
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
         * @param {boolean} [runParents] - If the route is nested, whether to run its parent routes first
         */

        route : function(urlOrRouteId, runParents, customRequestObj, customResponseObj) {

            if (urlOrRouteId === '') {
                urlOrRouteId = '/';
            }

            var route = this.routesById[urlOrRouteId],
                params = null;

            if (!route) {
                var parsed = this._parseUrl(urlOrRouteId);
                route = parsed[0];
                params = parsed[1];
            }

            if (route) {
                route.run(route.mapArgs(params), runParents, customRequestObj || {}, customResponseObj || {});
            }

        },

        /** Grabs a function to be assigned to window.onHashChange, for use in browser of course */

        getHashChangeHandler : function(win, runParents, customRequestObj, customResponseObj) {

            return (function(win, btInstance){
                return function() {
                    btInstance.route(win.location.hash.substr(1), runParents, customRequestObj, customResponseObj);
                };
            })(win, this);

        },

        /** Creates a new BTRoute object from a raw route config object **/

        _processRoute : function(config, parent) {

            var route = new BTRoute(config, parent);

            this.routes.push(route);

            var id = route.getId();

            if (id) {
                this.routesById[id] = route;
            }

            return route;

        },

        /** Identifies the route to run (if any) when a route-by-URL is triggered **/

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