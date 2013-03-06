answer('new-dom-core', ['s#utils'], function(u) {

    function DomWrapper(head) {
        this._head = head;
    }

    u.mixin(DomWrapper.prototype, true, true, {

        one : function(selector) {

        },

        all : function(selector) {

        },

        addClass : function(className) {

        },

        removeClass : function(className) {

        },

        toggleClass : function(className) {

        }

    });

    return DomWrapper;
});