//ask module that load js template file from the server
ask.module('template', 't#', 'text/ask-template', 'xhtml', function(url, callback, deps) {

    return callback;

}, function(moduleUrl, callback, askModule, baseUrl) {

    var context = this.context;

    ask(['s#modules^proxy-loader'], function(p) {
        p(baseUrl + moduleUrl + '.' + askModule.fileType, 'template', function(data) {
            context[moduleUrl] = {
                callback : data
            };
            callback();
        });
    });

});