answer('page-controller', ['utils', 'event', 'template-loader'], function(u, e, t) {

    var pageController = u.mixin({}, true, true, e, {

        actions : {},

        template : undefined,

        locale : 'en',

        config : undefined,

        __constructor__ : function() {
            this.trigger('construct');
            console.log('constructor called');
            //load view and cashe it in local storage if its needed - so i need to develop @TODO template loader module
            //develop auto updating template in local storage when they are changing(via NodeJS) in the server
            //or when time is expired
            t.load(this.el, this.template, this.locale, this.config, u.bind(function() {
                this.init(this.arguments);
            }, {
                arguments : arguments,
                init : this.init
            }));
        },

        __destructor__ : function() {
            this.trigger('destruct');
            console.log('destructor called');
        },

        init : function(action, params) {
            if (action in this.actions) {
                this[this.actions[action]].apply(this, params);
            }
        }
    });

    return pageController;

});