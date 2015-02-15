(function(BrassTacks, methods){

    BrassTacks['Mixin'] = BrassTacks.Mixin || {};

    BrassTacks.Mixin['Router'] = methods;

})(window.BrassTacks, {

    route : function(loc, provider, session, state) {

        if (this._route) {
            this._route(loc, provider, session, state);
        }

    }

});