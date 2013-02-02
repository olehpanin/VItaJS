answer('new-event', ['s#utils'], function(u) {

    var ALL_EVENTS_STR = 'all';

    function Event() {
        //this._callbacks = {};
    }

    u.mixin(Event.prototype, true, true, {

        on : function(events, callback, context) {
            //console.log(this, this._callbacks);
            var evts = u.isArray(events) ? events : [events],
                event;

            while (event = evts.shift()) {
                if (!this._callbacks[event]) {
                    this._callbacks[event] = [];
                }
                this._callbacks[event].push({
                    callback : callback,
                    context : context
                });
            }
            return this;
        },

        off : function(events, callback, context) {

            var evts = u.isArray(events) ? events : [events],
                event;

            if (-1 !== u.indexOf(evts, ALL_EVENTS_STR)) { //remove all event handlers
                this._callbacks = {};
                return this;
            }

            while (event = evts.shift()) {
                if (event in this._callbacks) {
                    if (!callback) { //remove all event handlers for current event
                        delete this._callbacks[event];
                    } else {
                        if (!context) { //remove all event handlers for current event with current callback
                            this._callbacks[event] = u.without(this._callbacks[event], {
                                callback : callback
                            });
                        } else { //remove all event handlers for current event with current callback and context
                           this. _callbacks[event] = u.without(this._callbacks[event], {
                                callback : callback,
                                context : context
                            });
                        }
                    }
                }
            }

            return this;
        },

        trigger : function(events, data) {

            var evts = u.isArray(events) ? events : [events],
                event;

            function call(callObj, index, context) {
                callObj.callback.call(callObj.context, {
                    type : event,
                    data : data
                });

            };

            evts = u.without(evts, ALL_EVENTS_STR);

            while (event = evts.shift()) {
                if (this._callbacks[event]) {
                    u.forEach(this._callbacks[event], call);
                }
                if ('all' in this._callbacks) {
                    u.forEach(this._callbacks.all, call);
                }
            }

            return this;
        }

    });

    return Event;

});