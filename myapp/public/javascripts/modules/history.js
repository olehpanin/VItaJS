answer('history', ['utils'], function(u) {
	// history.js clone
	
	var w = window,
		history;
	
	history = !u.isHistory(w.history) ? w.history : (function (w) {
		
		var _states = [{
			data : {},
			title : '',
			url : ''
		}],
			_activeStateIndex = 0;
		
		return  {
			
			length : 1,
			
			state : null,
			
			go : function(n) {
				var newActiveStateIndex = _activeStateIndex + n;
				if ((newActiveStateIndex >= 0) && (newActiveStateIndex < _states.length)) {
					_activeStateIndex = newActiveStateIndex;
					w.location.href = _states[_activeStateIndex].url;
					this.state = _states[_activeStateIndex].data;		
				}
			},
			
			back : function() {
				if (_activeStateIndex -1 >= 0) {
					_activeStateIndex -= 1;
					w.location.href = _states[_activeStateIndex].url;
					this.state = _states[_activeStateIndex].data;
				}
			},
			
			forward : function() {
				if (_activeStateIndex + 1 <  _states.length) {
					_activeStateIndex += 1;
					w.location.href = _states[_activeStateIndex].url;
					this.state = _states[_activeStateIndex].data;
				}
			},
			
			/**
			 * @param {Object} data
			 * @param {String} title
			 * @param {String} url
			 */
			pushState : function(data, title, url) {			
				var state = {
					data : data,
					title : title,
					url : url
				};
				
				_activeStateIndex += 1;
				this.length += 1;
				
				this.state = {
					data : data
				};
				
				_states.push(state);
				
				w.location.href = url;
			},
			
			replaceState : function (data, title, url) {
				this.state = {
					data : data
				};
				
				_states[_activeStateIndex] = {
					data : data,
					title : title,
					url : url
				}
				
				window.location.href = url;
			},
			
			getActiveStepIndex : function() {
				return _activeStateIndex;
			}
		};

	})(w);	
	
	return history
	
});
