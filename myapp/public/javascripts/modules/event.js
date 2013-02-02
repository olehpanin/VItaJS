answer('event', ['s#utils'], function(u) {
	var events,
		_callbacks = {},
		ALL_EVENTS_STR = 'all';
		
	events = {
			
		on : function(events, callback, context) {
	
			var evts = u.isArray(events) ? events : [events],
				event;
			
			while (event = evts.shift()) {
				if (!_callbacks[event]) {
					_callbacks[event] = [];
				}
				_callbacks[event].push({
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
				_callbacks = {};
				return this;
			}
			
			while (event = evts.shift()) {
				if (event in _callbacks) {
					if (!callback) { //remove all event handlers for current event
						delete _callbacks[event];
					} else {
						if (!context) { //remove all event handlers for current event with current callback
							_callbacks[event] = u.without(_callbacks[event], {
								callback : callback
							});
						} else { //remove all event handlers for current event with current callback and context
							_callbacks[event] = u.without(_callbacks[event], {
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
				if (_callbacks[event]) {
					u.forEach(_callbacks[event], call);
				}
				if ('all' in _callbacks) {
					u.forEach(_callbacks.all, call);
				}
			} 
		
			return this;
		}
	}

	return events;
	
});