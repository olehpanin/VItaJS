answer('validator', ['utils'], function(u) {
	
	var validator,
		methods = {},
		properties = {};
	
	validator = {
		
		setMethod : function(name, rules, sucMsg, errMsg) {
			methods[name] = {
				rules : rules,
				sucMsg : sucMsg,
				errMsg : errMsg
			};
		},
		
		validate : function(obj, schema) {
			var i,
				res = {};
			
			u.forEach(obj, function(value, index, context) {
				var propResult;
				
				if (value in rules) {
					for (i in rules[value]) {
						// email
						for (m in methods[rules[value]].rules) {
							//regExp
							propResult = properties[m].call(this, value, methods[rules[value]].rules[m]);
							
							if(!propResult) {
								res[value] = {
									success : false,
									message : method[rules[value]].errMsg
								}
								return false;
							}
						}
						res[value] = {
							success : true,
							message : method[rules[value]].sucMsg
						};
					}
				}
			});
			
			return res;
		},
		
		setProperty : function(name, callback) {
			properties[name] = callback;
		}
		
	};
	
	validator.setProperty('regExp', function(value, regExp) {
		if (value.test(regExp)) {
			return true;
		} else {
			return false;
		}
	});
	
	validator.setMethod('email', {
		regExp : /^[-a-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/
	}, 'wrong-email-lang');
	
	/*
	 * validate({
	 * 	key : 'value'
	 * },{
	 * 	key : ['email']
	 * })
	 */
	
	return validator;
	
});
