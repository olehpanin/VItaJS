answer('new-template-engine', ['s#utils', 's#dom-core'], function(u, $) {

    var retObj,
        _modules = {};

    retObj = {

        /**
         *
         * @param attribute
         * @param tag
         * @param callback (controller, ..)
         */
        addAttrModule : function(attribute, callback) {
            _modules[attribute] = {
                callback : callback
            }
        },

        isTextNode : function(el) {
            if (el.nodeType === 3) return true;
            return false;
        },

        isBind : function(str) {
            if (/{{[\w.#]*}}/.test(str)) return true;
            return false;
        },

        checkAttributes : function(el, controller) {
            u.forEach(_modules, function(val, key, context) {
                var attr = el.getAttribute(key);
                if (attr) {
                    _modules[key].callback.call(context, el, attr, controller);
                }
            }, this);
        },

        getScopeVal : function(tr, el, $scope, controller) {
            var trArr= tr.split('.'),
                scopeKey = trArr.shift(),
                dataModelField = trArr.shift(),
                cashedElData = el.data;

            function callback() {
                console.log('callback called', this.el.data, this.dataModelField);
                this.el.data = this.cashedElData.replace('{{' + tr + '}}', this.$scope[this.scopeKey].model.get(this.dataModelField));
            }

            callback = u.bind(callback, {
                cashedElData : cashedElData,
                el : el,
                $scope : $scope,
                scopeKey : scopeKey,
                dataModelField : dataModelField
            });

            $scope[scopeKey].model.on('change-' + dataModelField, callback);
            $scope[scopeKey].collection.on('change', u.bind(function(e) {
                this.$scope[this.scopeKey].model.off('change-' + this.dataModelField, this.callback);
            }, {
                $scope : $scope,
                scopeKey : scopeKey,
                dataModelField : dataModelField,
                callback : callback
            }));

            return $scope[scopeKey].model.get(dataModelField);
        },

        executeModule : function(tr, el, $scope, controller) {
            //console.info('executeModule', arguments);
            var scopeObj;
            if (tr.indexOf('#') === 0) {

            } else {
                return this.getScopeVal(tr, el, $scope, controller);
            }
        },

        iterate: function(head, controller, $scope) {
            u.forEach(head.childNodes, function(el, key, context) {
                if (el.nodeName === '#comment') return;

                if (!context.isTextNode(el)) {
                    context.checkAttributes(el, controller);
                }

                if (el.childNodes.length > 0) {
                    context.iterate(el, controller, $scope);
                } else if (context.isTextNode(el) && context.isBind(el.data)) {
                    el.data = el.data.replace(/{{[\w#.]*}}/g, function(tr) {
                        return context.executeModule(tr.substr(2, tr.length - 4), el, $scope, controller);
                    });
                }
            }, this);
        },

        compile : function(head, controller, $scope) {
            $scope = u.isObject($scope) ? $scope : {};
            this.iterate(head, controller, $scope);
        }

    };

    retObj.addAttrModule('data-vita-repeat', function(el, attr, controller) {
        var repeatArr = attr.split(' in '),
            scopeVal = repeatArr.shift(),
            param = repeatArr.shift(),
            collection = controller.model.get(param),
            cloneEl = el.cloneNode(),
            self = this;

        function go(collection, el, cloneEl) {;
            var cloneChildNode;

            el.innerHTML = '';

            collection.forEach(function(dataModel, key) {
                var i,
                    scopeObj = {};

                for (i = 0; i < cloneEl.children.length; i++) {
                    cloneChildNode = cloneEl.children[i].cloneNode();
                    scopeObj[scopeVal] = {
                        collection : collection,
                        model : dataModel
                    };
                    self.iterate(cloneChildNode, controller, scopeObj);
                    el.appendChild(cloneChildNode);
                }
            });
        }

        collection.on('change', function(e) {
            go(collection, el, cloneEl);
        });
        go(collection, el, cloneEl);

    });

    retObj.addAttrModule('data-vita-form', function(el, dataModelFormAttr, controller) {
        console.log(arguments);
        $(el).on('submit', function(e) {
            var i,
                nodeType,
                setObj = {},
                key,
                value,
                fieldType;

            for (i = 0; i < e.target.length; i++ ) {
                nodeType = e.target[i].getAttribute('type');
                key = e.target[i].getAttribute('data-model-form-key');
                value = e.target[i].value;
                switch(nodeType) {
                    case 'checkbox' :
                    case 'radio' :
                        /*console.info(e.target[i].checked + ' ' + e.target[i].value);*/
                        if (e.target[i].checked) {
                            //@TODO fieldType = model.getSchema().getFieldType(dataModelFormAttr, key);
                            /*fieldType = _controller.model.getFieldType(dataModelFormAttr, key);
                             switch (fieldType) {
                             case 'Array' :
                             if (!(key in setObj)) {
                             setObj[key] = [];
                             }
                             setObj[key].push(value);
                             break;
                             default :
                             setObj[key] = value;
                             break;
                             }*/

                        }
                        break;
                    case 'submit' :
                        break;
                    default:
                        /*console.log(e.target[i].getAttribute('data-model-form-key') +
                         ' ' + e.target[i].value);*/
                        setObj[key] = value;
                        break;
                }
            }

            console.log(setObj);

            controller.model.get(dataModelFormAttr).push(setObj);
            el.reset();
            return false;
        })
    });

    return retObj;

});