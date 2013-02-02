answer('data-schema', ['s#utils'], function(u) {
    //@TODO
    function DataSchema(schema) {
        var _schema = schema;
    }

    u.mixin(DataSchema.prototype, true, true, {

        check : function(key, val) {
            return true;
        },

        getMessage : function(key, val) {
            return {
                message       : 'Param ' + key + ' can\'t be "' + val + '"',
                example       : 'example@gmail.com',
                successRules  : this.getSuccessRules(key, val),
                errorRules    : this.getErrorRules(key, val)
            }
        },

        getSuccessRules : function(key, val) {
            return ['More Than 8 symbols']
        },

        getErrorRules : function(key, val) {
            return ['Should have at least one number and one special sumbol']
        },

        getName : function() {
            return 'UNIQUE-SCHEMA-NAME';
        }

    });

    return DataSchema;

})