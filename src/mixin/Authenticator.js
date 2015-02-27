(function(BrassTacks, methods){

    BrassTacks['Mixin'] = BrassTacks.Mixin || {};

    BrassTacks.Mixin['Authenticator'] = methods;

})(window.BrassTacks, {

    authenticate : function(win, provider) {

        return (this._authenticate) ? this._authenticate(win, provider) : null;

    }

});