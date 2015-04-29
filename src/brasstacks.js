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

        this.parent = parent;
        this.children = [];

        if (config) {
            this.build(config);
        }

    };

    BTRoute.prototype = {

        getId : function() {

            return this.id || false;

        },

        getUrl : function() {
            return this.url;
        },

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

        matchTo : function(urlToCompare) {

            return urlToCompare.match(this.url);

        },

        addChild : function(route) {
            this.children.push(route);
        },

        run : function(args, runParents, BT) {

            var response = false;

            if (runParents) {
                this.parent.run(args);
            }

            args = this._mapArgs(args);

            if (this.controller) {
                response = this.controller.apply(BT, [args]);
            }

            if (this.redirect) {
                BT.route(this.redirect);
            }

            if (response && this.parent && this.parent.container) {
                this.parent.container.innerHTML = '';
                this.parent.container.appendChild()
            }

        },

        _mapArgs : function(args) {

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

            route = route.replace(escapeRegExp, '\\$&')
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

    var BTRequest = function() {



    };

    BTRequest.prototype = {

        buildFromWindow : function(win) {

            this.window = win;


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

        route : function(urlOrRouteId, runParents) {

            /*if (!requestOrurlOrRouteId.url) {
                requestOrurlOrRouteId = new BTRequest();
            }*/

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
                route.run(params, runParents, this);
            }

        },

        listen : function(win, routeOnStart) {
            var self = this;

            if (routeOnStart || (typeof routeOnStart === 'undefined')) {
                self.route(win.location.hash.substr(1));
            }

            if (typeof win.onhashchange !== 'undefined') {
                win.onhashchange = function(){
                    //var req = new BTRequest();
                    //req.buildFromWindow(win);
                    self.route(win.location.hash.substr(1));
                };
            }

        },

        _processRoute : function(config, parent) {

            var route = new BTRoute(config, parent);

            this.routes.push(route);

            var id = route.getId();

            if (id) {
                this.routesById[id] = route;
            }

            return route;

        },

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