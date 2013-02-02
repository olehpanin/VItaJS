answer('router', ['s#history', 's#utils', 's#event', 's#dom-core'], function(h, u, e, $) {

	var router,
		_routs = {},
        _currentPageController = null;
	
	router = {

        /**
         *
         * @return {*}
         */
        start : function() {
            this.navigate(window.location.href.split('#')[1]);

            return this;
        },

        /**
         *
         * @return {object}
         */
        getCurrentPageController : function() {
            return _currentPageController.controller;
        },

        /**
         *
         * @param url
         * @param controller
         * @return {*}
         */
		setRoute : function(url, controller) {
            if (u.isObject(url)) {
                u.mixin(_routs, true, true, url);
            } else {
			    _routs[url] = controller;
            }

            return this;
        },

        /**
         *
         * @param url
         * @return {*}
         */
		getRoute : function(url) {
		    return this;
		},

        /**
         *
         * @param url
         * @return {*}
         */
		removeRoute : function(url) {
			return this;
		},

        /**
         *
         * @param url
         * @return {*}
         */
		navigate : function(url) {
			var controllerUrl,
				controllerParams,
                controllerAction,
				urlArr = [];

			if (url.indexOf('/') === -1) {
				controllerUrl = url;
				controllerParams = undefined;
                controllerAction = undefined;
			} else {
				urlArr = url.split('/');
				controllerUrl = urlArr.shift();
                controllerAction = urlArr.shift();
				controllerParams = urlArr;

			}

			if (controllerUrl in _routs) {
				ask([_routs[controllerUrl]], function(c) {

                    if (_currentPageController !== null) {
                        if ((_currentPageController.url !== _routs[controllerUrl])) {
                            _currentPageController.controller.__destructor__();
                            c.__constructor__(controllerAction, controllerParams);
                        } else {
                            c.init(controllerAction, controllerParams);
                        }
                    } else {
                        c.__constructor__(controllerAction, controllerParams);
                    }

                    _currentPageController = {
                        controller : c,
                        url : _routs[controllerUrl]
                    };
				});
			}

            return this;
		}
	};
	
	u.mixin(router, true, true, e);
	
	$(window).on('hashchange', function(e) {
		router.navigate(e.originalEvent.newURL.split('#')[1]);
	});
	
	return router;
});