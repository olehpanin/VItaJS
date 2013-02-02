answer('proxy-loader', ['s#app-core'], function(a) {

    return function(url, prefix, renderCallback, updateCallback) {
        var socket = a.getSocket(),
            template = localStorage.getItem(prefix + '@' + url),
            jsonParseTpl;

        if (template) {
            jsonParseTpl = JSON.parse(template);
            renderCallback(jsonParseTpl.content);
            socket.emit('template-check', url, jsonParseTpl.date);
        } else {
            socket.emit('template-check', url);
        }

        socket.on('template-' + url + '-update', function(data) {
            if (data.update) {
                delete data.update;
                localStorage.setItem(prefix + '@' + url, JSON.stringify(data));
                updateCallback(data.content);
            }/* else {
                callback(JSON.parse(template).content);
            }*/
        });

    };
});