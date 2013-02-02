answer('app-core-controller', ['s#utils','s#new-event', 's#app-core-model'], function(u, E, model) {
	/**
	 * @TODO create i18n,conf ask.js plugins
	 * @TODO create app-core-model module extends vita-model
	 * @TODO app-core-controller should extends from vita-controller
	 **/
    return {
        
		i18n : {
            title : 'Hello World !'
        },
		
		model : model

    };

});
