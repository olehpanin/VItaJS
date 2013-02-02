answer('help-controller', ['page-controller', 'utils'], function(p, u) {

    var helpController = {}

    u.mixin(helpController, true, true, p);

    return helpController;

});