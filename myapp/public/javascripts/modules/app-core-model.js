answer('app-core-model', ['s#utils', 's#new-event', 's#data-model-collection'], function(u, E, Collection) {

    var _schema,
        _cashed = true,
        _data = {
            vitaUsers : new Collection({
                schema : 'app-core-model-schema',
                data : [{
                    name : 'Vladimir',
                    age : 22
                }, {
                    name : 'Vita',
                    age : 19
                }]
            })
        },
        _model = u.mixin({}, true, true, new E(), {

            _callbacks : [],

            init : function(name, cashed) {

            },

            get : function(key) {
                if (key) return _data[key];
                return _data;
            },

            set : function(key, val, method) {
                if (method) {
                    _data[key][method](val);
                    this.trigger('change-' + key, {
                        value : _data[key]
                    });
                } else {
                    _data[key] = val;
                    this.trigger('change-' + key, {
                        value : val
                    });
                }

            }

        });

    return _model;

});