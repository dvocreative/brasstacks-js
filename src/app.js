(function(window, factory){

    var ns = 'BrassTacks';

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module === 'object') {
        module.exports = factory();
    } else {
        window[ns] = factory();
    }

})(window, function(){

    var BrassTacks = function(configuration) {

        this.config = configuration;

        this.session = null;
        this.state = null;
        this.request = null;

    };

    BrassTacks.prototype = {

        run : function(request, session, state) {

            this.request = request;
            this.session = session;
            this.state = state;

            //sanitize
            if (this.config.method.preformat) {
                this.request = this.config.method.preformat(this.request);
            }

            //authenticate
            if (this.config.method.authenticate) {
                this.session = this.config.method.authenticate(this.request, this.session);
            }

            //decorate
            if (this.config.method.decorate) {
                this.state = this.config.method.decorate(this.request, this.session);
            }

            //route
            this.response = this.config.method.route(this.request);

            //format
            if (this.config.method.format) {
                this.response = this.config.method.format(this.response, this.state);
            }

        },

        dump : function() {

        }

    };

    return BrassTacks;

});