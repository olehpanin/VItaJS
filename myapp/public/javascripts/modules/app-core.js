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
            //te.compile(_head, appCoreController);
            newTE.compile(_head, appCoreController, {});
        };

        _retObj = u.mixin({}, true, true, new E(), {

            init : function(url, view, config) {
                _socket = io.connect(url);
                ask(['s#proxy-loader'], function(p) {

                    p(view, 'template', function(content) {
                        _render(content);
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