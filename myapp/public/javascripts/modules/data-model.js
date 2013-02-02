answer('data-model', ['s#utils', 's#new-event', 's#data-schema'], function(u, E, DataSchema) {

    function DataModel(params) {

        this._schema = params.schema instanceof DataSchema ? params.schema : new DataSchema(params.schema);
        this._data = {};
        this._callbacks = params.callback || {};

        if('error' in params) {
            this.on('error', params.error);
        }

        this.set(params.data)
    }

    u.mixin(DataModel.prototype, true, true, new E(), {

        get : function(key) {
            //this.trigger('test', this);
            if (key) return this._data[key];
            return this._data;
        },

        set : function(key, val) {
            var self = this;

            function setParam(val, key) {
                var validationRes = self.validate(val, key);
                if (validationRes) {
                    self._data[key] = val;
                    self.trigger(['change-' + key, 'change'], {
                        value : self._data[key]
                    });
                } else {
                    self.trigger(['error-' + key, 'error'], {
                        error : validationRes,
                        value : self._data[key]
                    });
                }
            }

            if (u.isObject(key)) {
                u.forEach(key, setParam)
            } else {
                setParam(val, key);
            }
        },

        validate : function(key, val) {
            if (this._schema.check(key, val)) {
                return true;
            } else {
                return this._schema.getMessage(key, val);
            }
        }

    });

    return DataModel;
});