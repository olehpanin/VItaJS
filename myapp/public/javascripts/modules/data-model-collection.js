answer('data-model-collection', ['s#utils', 's#new-event', 's#data-model', 's#data-schema'],
function(u, E, DataModel, DataSchema) {

    function DataModelCollection(params) {

        this._data = [];
        this._schema = new DataSchema(params.schema);
        this._callbacks = {};

        if ('error' in params) {
            this.on('error', params.error);
        }

        this.set(params.data);
    }

    u.mixin(DataModelCollection.prototype, true, true, new E(), (function() {

        function _createDataModel(data, schema) {
            var dataModel = new DataModel({
                data : data,
                schema : schema,
                error : function(e) {
                    this.trigger('error', {
                        event : e,
                        instance : dataModel
                    });
                }
            });

            return dataModel;
        }

        function _getDataModel(data, schema) {
            if (data instanceof DataModel) {
                if (data._schema.getName() === schema.getName()) {
                    return data;
                } else {
                    this.trigger('unable-to-set', {
                        data : data
                    });
                    return false;
                }
            } else {
                return _createDataModel(data, schema);
            }
        }

        return {

            add : function(data) {
                if (u.isArray(data)) {
                    u.forEach(data, u.bind(function(val) {
                        this._data.push(_createDataModel(val, this._schema));
                    }, this));
                    this.trigger('add', {
                        data : this.get(-1 * data.length)
                    });
                } else {
                    this._data.push(_createDataModel(data, this._schema));
                    this.trigger('add', {
                        data : this.get(-1)
                    });
                }

                return this;
            },

            set : function(data) {
                u.forEach(data, u.bind(function(val, key) {
                    var dataModel = _getDataModel(val, this._schema);
                    if (dataModel) this._data.push(dataModel);
                }, this));

                return this;
            },

            /**
             * get(-2) return last 2
             * get(2) return first 2
             * get(2, 4) returns from 2 to 4
             * get(-4, 2) return x-3 x-4
             */
            get : function(startIndex, length) {
                var res = []

                if(!length) return this._data[startIndex];

                startIndex = startIndex > 0 ?
                    startIndex >= this._data.length ? startIndex : this._data.length
                    :
                    this._data.length + startIndex >= 0 ? this._data.length + startIndex : 0;
                length = length ?
                    length > this._data.length - startIndex ? this._data.length - startIndex : length
                    :
                    this._data.length - startIndex;

                for (startIndex; startIndex < length; startIndex++) {
                    res.push(this._data[startIndex]);
                }
                if (res.length === 1) return res[0];
                return new DataModelCollection({
                    schema : this._schema,
                    data : res
                });

                //return res;
            },

            push : function(val) {
                var dataModel = _getDataModel(val, this._schema);
                if (dataModel) this._data.push(dataModel);
                this.trigger('push', {
                    data : this.get(-1)
                });
                this.trigger('change', {
                    data : this.get()
                });
                return this;
            },

            pop : function() {
                var res = this._data.pop();
                this.trigger('pop', {
                    data : res
                });
                return res;
            },

            shift : function() {
                var res = this._data.shift();
                this.trigger('shift', {
                    data : res
                });
                return res;
            },

            unshift : function(val) {
                var dataModel = _getDataModel(val, this._schema);
                if (dataModel) this._data.push(dataModel);
                this.trigger('push', {
                    data : this.get(-1)
                });
                return this;
            },

            size : function() {
                return this._data.length;
            },

            where : function(obj) {
                var res = [];
                u.forEach(this._data, function(val) {
                    if (u.has(val.get(), obj)) {
                        res.push(val);
                    }
                });
                return new DataModelCollection({
                    schema : this._schema,
                    data : res
                });
                //return res;
            },

            forEach : function(callback) {
                u.forEach(this._data, callback, this);
            }
        }

    })());

    return DataModelCollection;

});