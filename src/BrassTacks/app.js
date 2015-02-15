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

        this.conf = configuration;

        this.session = null;
        this.state = null;

    };

    BrassTacks.prototype = {

        run : function(win) {

            if (this.conf.components.authenticator) {
                this.session = this.conf.components.authenticate(win, this.conf.provider);
            }

            if (this.conf.components.decorator) {
                this.state = this.conf.components.decorate(win, this.conf.provider, this.session);
            }

            if (this.conf.components.router) {
                this.conf.components.route(win, this.conf.provider, this.session, this.state);
            }

        },

        dump : function() {



        }

    };

    return BrassTacks;

});