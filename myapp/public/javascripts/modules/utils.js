answer('utils', [], function() {

	var toString      = Object.prototype.toString,
		objectStr     = '[object Object]',
        arrayStr      = '[object Array]',
		historyStr    = '[object History]',
        stringStr     = '[object String]',
		utils,
		slice         = Array.prototype.slice,
		ctor          = function() {};
	
	utils = {
		// array functions
		forEach : function(obj, callback, context) {
			var i;
			context = context ? context : obj;
			for (i in obj) {
				if (obj.hasOwnProperty(i)) {
					callback(obj[i], i, context);
				}
			}
			
		},
		
		clone : function(data, deep) {
            var res;

            if (this.isArray(data)) {
                res = [];
                this.forEach(data, this.bind(function(val) {
                    var cloneVal = deep && (this.isObject(val) || this.isArray(val)) ? this.clone(val) : val;
                    res.push(cloneVal);
                }, this));
            } else {
                // Object
                res = {};
                this.forEach(data, this.bind(function(val, key) {
                    var cloneVal = deep && (this.isObject(val) || this.isArray(val)) ? this.clone(val) : val;
                    res[key] = cloneVal;
                }, this));
            }

            return res;
        },

        has : function(obj, param) {
            var status = true,
                i;
            if (this.isEmpty(param)) return false;
            if (this.isObject(param)) {
                this.forEach(param, function(val, key) {
                    if (!((key in obj) && (obj[key] === val))) status = false;
                });
                return status;
            } else if (this.isArray(obj)) {
                for (i = 0; i < obj,length; i++) {
                    if (obj[i] === param) return true;
                }
            } else {
                return (param in obj);
            }

        },

        isEmpty : function(obj) {
            var key;
            if (!obj) return true;
            if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
            for(key in obj) if (this.has(obj, key)) return false;
            return true;
        },

        /**
		 * @param array
		 * @param *values
		 */
		without : function(array) {
			var values = slice.call(arguments, 1),
				newArr = [],
				i,
				y;
			
			this.forEach(array, this.bind(function(value, index, context) {

				if (this.isObject(value) || this.isArray(value)) {
					for (i = 0; i < values.length; i += 1) {					
						for (y in values[i]) {
							if (values[i].hasOwnProperty(y)) {
								if ((y in value) && (value[y] === values[i][y])) {
									return ;
								}
							}
						}
					}
					newArr.push(value);
				} else {
					if (-1 === this.indexOf(values, value)) {
						newArr.push(value);
					}
				}
			}, this));
			
			return newArr;
		},
		
		indexOf : function(array, value) {
			var i;
			
			for (i = 0; i < array.length; i++) {
				if (array.hasOwnProperty(i)) {
					if (array[i] === value) {
						return i;
					}
				}
			}
			
			return -1;
		},
		// object functions
		/**
		 * @param {Object} target
		 * @param {Boolean} force
		 * @param {Boolean} deep
		 * @param {Object} []
		 */
		mixin : function(target, force, deep) {
			var sources = slice.call(arguments, 3);
			
			if(!target) target = {};
			this.forEach(sources, function(source, index, context) {
				var prop;
				
				if (!source) return;
				for (prop in source) {
					if (!(prop in target) || force) {
						target[prop] = source[prop];
					}
				}
			});
			
			return target;
		},
		
		isObject : function(obj) {
			if (toString.call(obj) === objectStr) return true;	
			return false;
		},

        isArray : function(obj) {
            if (toString.call(obj) === arrayStr) return true;
            return false;
        },

        isString : function(obj) {
            if (toString.call(obj) ===stringStr) return true;
            return false;
        },
		
		isHistory : function(obj) {
			if (toString.call(obj) === historyStr) return true;
			return false;	
		},

		// function utils
		/**
		 * @param func
		 * @param obj
		 * @param *args
		 */
		bind : function(func, context) {
		   var args = slice.call(arguments, 2);
					
			return function () {
				var unshiftArgs = args.concat(slice.call(arguments));
				func.apply(context, unshiftArgs)
			}
		},
		
		// from Backbone.js -> goog,inherit
		inherit : function(parent, protoProps, staticProps) {
			var child;
			
			if (protoProps && protoProps.hasOwnProperty('constructor')) {
				child = protoProps.constructor;
			} else {
				child = function(){ parent.apply(this, arguments); };
			}
			
			// Inherit class (static) properties from parent.
		    this.mixin(child, true, true, parent);

		    // Set the prototype chain to inherit from `parent`, without calling
		    // `parent`'s constructor function.
		    ctor.prototype = parent.prototype;
		    child.prototype = new ctor();

		    // Add prototype properties (instance properties) to the subclass,
		    // if supplied.
		    if (protoProps) this.mixin(child.prototype, true, true, protoProps);

		    // Add static properties to the constructor function, if supplied.
		    if (staticProps) this.mixin(child, true, true, staticProps);

		    // Correctly set child's `prototype.constructor`.
		    child.prototype.constructor = child;

		    // Set a convenience property in case the parent's prototype is needed later.
		    child.__super__ = parent.prototype;

		    return child;			
		}
		
	};
	
	return utils;
	
});
