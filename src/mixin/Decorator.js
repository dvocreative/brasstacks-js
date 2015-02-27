(function(BrassTacks, methods){

    BrassTacks['Mixin'] = BrassTacks.Mixin || {};

    BrassTacks.Mixin['Decorator'] = methods;

})(window.BrassTacks, {

    decorate : function(win, provider, session) {

        return (this._decorate) ? this._decorate(win, provider, session) : null;

    }

});