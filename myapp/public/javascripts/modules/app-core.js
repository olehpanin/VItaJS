answer('app-core', ['s#utils', 's#new-event', 's#socket.io', 's#template-engine', 's#app-core-controller', 's#new-template-engine'],

    function(u, E, io, te, appCoreController, newTE) {

        var _socket,
            _view,
            _config,
            _router,
            _retObj,
            _head = document.body;

        var _render = function(content) {
            _head.innerHTML = content;
            newTE.compile(_head, appCoreController, {});
        };

        _retObj = u.mixin({}, true, true, new E(), {

            init : function(url, view, config) {
                _socket = io.connect(url);
                /*
                make proxy-loading or not configurable ( by init param )
                 */
                ask(['s#proxy-loader'], function(p) {
                    p(view, 'template', function(content) {
                        _render(content);
                    }, function(content) {
                        window.location.reload();
                        /*
                        notificate user that there is a newest version of template stored in browser cache
                        Click here to restart the portal
                         */
                    });
                });
                return this;
            },

            getSocket : function() {
                return _socket;
            }



        });

        return _retObj;

});