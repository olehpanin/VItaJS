answer('test-controller', ['page-controller', 'utils'], function(p, u) {

    var testController = {};

    u.mixin(testController, true, true, p, {
        actions : {
            'login'  : 'login',
            'logout' : 'logout'
        },

        login : function(username, password) {
            console.info('login method called with params ' + username + ' ' + password);
        },

        logout : function() {

        }
    });

    return testController;

});