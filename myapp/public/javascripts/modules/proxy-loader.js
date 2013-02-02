answer('proxy-loader', ['s#app-core'], function(a) {

    return function(url, prefix, callback) {
        var socket = a.getSocket(),
            template = localStorage.getItem(prefix + '@' + url),
            jsonParseTpl;

        if (template) {
            jsonParseTpl = JSON.parse(template);
            callback(jsonParseTpl.content);
            socket.emit('template-check', url, jsonParseTpl.date);
        } else {
            socket.emit('template-check', url);
        }

        socket.on('template-' + url + '-update', function(data) {
            if (data.update) {
                delete data.update;
                localStorage.setItem(prefix + '@' + url, JSON.stringify(data));
                callback(data.content);
            }/* else {
                callback(JSON.parse(template).content);
            }*/
        });

    };
});