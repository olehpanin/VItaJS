// ask module that cache result of answer module function(callback)
!function(ask) {

    var _cache = {};

    ask.module('script', 's#', 'text/javascript', 'js', function(url, callback, deps) {

        if (!(url in _cache)) {
            _cache[url] = callback.apply(this, deps);
        }

        return _cache[url];
    });

}(ask);