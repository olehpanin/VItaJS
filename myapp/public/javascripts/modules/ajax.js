answer('ajax', ['s#utils'], function(u) {

    var _defaults = {
        type : 'get',
        dataType : 'json',
        async : true,
        url : ''
    };

    var _getRequestObject = function() {
        var requestObject;

        function getMsxmlActiveXObject() {
            return new ActiveXObject('Msxml2.XMLHTTP');
        }

        function getMicrosoftActiveXObject() {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }

        function getXMLHttpRequest() {
            return new XMLHttpRequest();
        }

        if ('XMLHttpRequest' in window) {
            requestObject = getXMLHttpRequest();
            _getRequestObject = getXMLHttpRequest;
        } else if ('ActiveXObject' in window) {
            try {
                requestObject = getMicrosoftActiveXObject();
                _getRequestObject = getMicrosoftActiveXObject;
            } catch (e) {
                try {
                    requestObject = getMsxmlActiveXObject();
                    _getRequestObject = getMsxmlActiveXObject;
                } catch (e) {
                    throw new Error('Your browser dont support AJAX');
                }
            }
        }

        return requestObject;
    };

    var _executeFunction = function(object, property, params) {
        if (property in object) {
            object[property](params);
        }
    }

    return {
        ajax : function(options) {
            var req = _getRequestObject(),
                mixOpts = u.mixin(_defaults, true, true, options);

            req.onreadystatechange = function() {
                if (req.readyState === 4) {
                    _executeFunction(mixOpts, 'on' + req.status, req.responseText);

                    if (200 === req.status) {
                        _executeFunction(mixOpts, 'success', req.responseText);
                    } else {
                        _executeFunction(mixOpts, 'error', req.responseText);
                    }
                    _executeFunction(mixOpts, 'complete', req.responseText);
                }
            };

            req.open(mixOpts.type, mixOpts.url, mixOpts.async);
            //req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
            req.setRequestHeader("Content-type", "text/xml");
            req.setRequestHeader('Access-Control-Allow-Origin', mixOpts.url);
            req.send(null);
        },

        setDefaults : function(defaults) {
            _defaults = u.mixin(_defaults, true, true, defaults);
        },

        ajaxStart : function() {

        },

        ajaxEnd : function() {

        }
    }

});
