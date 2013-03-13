answer('new-template-engine', ['s#utils', 's#dom-core'], function(u, $) {

    var retObj,
        _modules = {};

    retObj = {

        /**
         *
         * @param attribute
         * @param callback (controller, ..)
         * @oaram block (boolean) iterate block status
         */
        addAttrModule : function(attribute, callback, block) {
            _modules[attribute] = {
                callback : callback,
                block : block
            }
        },

        isTextNode : function(el) {
            if (el.nodeType === 3) return true;
            return false;
        },

        isBind : function(str) {
            if (/{{.*}}/.test(str)) return true;
            return false;
        },

        checkAttributes : function(el, controller, $scope) {
            var iterateBLockStatus = false;
            u.forEach(_modules, function(val, key, context) {
                var attr = el.getAttribute(key);
                if (attr) {
                    iterateBLockStatus = _modules[key].block;
                    _modules[key].callback.call(context, el, attr, controller, $scope);
                }
            }, this);
            return iterateBLockStatus;
        },

        getScopeVal : function(tr, el, $scope, controller, cashedElData, setter) {
            var trArr= tr.split('.'),
                scopeKey = trArr.shift(),
                dataModelField = trArr.shift();
                //cashedElData = el.data;
            //console.log(dataModelField, cashedElData, setter);
            function callback() {
                //console.log('callback called', this.el[this.elProperty], this.dataModelField);
                setter(el, this.cashedElData.replace('{{' + tr + '}}',
                    this.$scope[this.scopeKey].model.get(this.dataModelField)));
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

        executeModule : function(tr, el, $scope, controller, cashedElData, setter) {
            //console.info('executeModule', arguments);
            var scopeObj;
            if (tr.indexOf('#') === 0) {

            } else {
                var trArr= tr.split('.'),
                    scopeKey = trArr.shift();

                if (scopeKey in $scope) {
                    return this.getScopeVal(tr, el, $scope, controller, cashedElData, setter);
                } else {
                    console.warn(tr);
                    var obj = this.getValueFromAttr(tr, controller, $scope);
                    return obj.func.call(obj.context, obj.params);
                }

            }
        },

        checkAttrsBinding : function(el, controller, $scope) {
            var attrs = el.attributes,
                i,
                val,
                self = this;

            for (i = 0; i < attrs.length; i++) {
                val = attrs.item(i).value;

                if (this.isBind(val)) {
                    attrs.item(i).value = val.replace(/{{.*}}/g, function(tr) {
                        return self.executeModule(tr.substr(2, tr.length - 4), el, $scope, controller,
                            attrs.item(i).value, u.bind(function(el, val) {
                                el.setAttribute(this.attr, val);
                            }, {
                               attr : attrs.item(i).name
                            }));
                    });
                }
            }
        },

        checkAttrs : function(el, controller, $scope) {
            if (el.nodeName === '#comment') return false;

            if (!this.isTextNode(el) && this.checkAttributes(el, controller, $scope)) {
                return false;
            }
            if (!this.isTextNode(el))
                this.checkAttrsBinding(el, controller, $scope);

            return true;
        },

        iterate : function(head, controller, $scope) {
            u.forEach(head.childNodes, function(el, key, context) {
                if (!context.checkAttrs(el, controller, $scope)) return;

                if (el.childNodes.length > 0) {
                    context.iterate(el, controller, $scope);
                } else if (context.isTextNode(el) && context.isBind(el.data)) {
                    el.data = el.data.replace(/{{[\w#.()]*}}/g, function(tr) {
                        console.info(tr)
                        return context.executeModule(tr.substr(2, tr.length - 4), el, $scope, controller,
                            el.data, function(el, val) {
                                el.data = val;
                            });
                    });
                }
            }, this);
        },

        compile : function(head, controller, $scope) {
            $scope = u.isObject($scope) ? $scope : {};
            this.checkAttrs(head, controller, $scope);
            this.iterate(head, controller, $scope);
        },

        getValueFromAttr : function(str, controller, $scope) {
            var strArr = str.split('.'),
                instance = strArr.shift(),
                modelVar,
                retObj = {};
            console.log('$scope', $scope);
            function parse(arr, instance) {
                var el,
                    obj = instance,
                    first,
                    key,
                    params,
                    paramsArr;

                function getParams(arr) {
                    console.log('--arr', arr)
                    var params = [];

                    u.forEach(arr, function(val) {
                        if (val in $scope) params.push($scope[val].model);
                    });

                    return params;
                }

                while (el = arr.shift()) {
                    //console.log(el.indexOf(')'), el.length, el);
                    if (el.indexOf(')') === el.length - 1) {
                        first = el.indexOf('(');
                        key = el.substr(0, first);
                        params = el.substr(first + 1, el.length - first - 2);
                        paramsArr = params.indexOf(', ') === -1 ? getParams(params.split(', ')) : [];

                        obj = arr.length > 0 ? obj[key].apply(instance, params) : obj[key];
                        console.log(el, 'key', key, 'params', params);
                    }
                }

                return {
                    func : obj,
                    params : paramsArr,
                    context : instance
                }
            }

            if (instance === 'controller') {
                retObj = parse(strArr, controller);
            } else if(instance === 'model') {
                modelVar = controller.model.get(strArr.shift());
                retObj = parse(strArr, modelVar);
            }
            console.log('retObj', retObj);
            return retObj;
        }

    };

    retObj.addAttrModule('data-vita-repeat', function(el, attr, controller, $scope) {
        var repeatArr = attr.split(' in '),
            scopeVal = repeatArr.shift(),
            param = repeatArr.shift(),
            collection = this.getValueFromAttr(param, controller, $scope).func,
            cloneEl = el.cloneNode(),
            self = this;

        function go(collection, el, cloneEl) {
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
                    self.checkAttrs(cloneChildNode, controller, scopeObj);
                    self.iterate(cloneChildNode, controller, scopeObj);
                    el.appendChild(cloneChildNode);
                }
            });
        }

        collection.on('change', function(e) {
            go(collection, el, cloneEl);
        });
        go(collection, el, cloneEl);

    }, true);

    retObj.addAttrModule('data-vita-form', function(el, dataModelFormAttr, controller, $scope) {
        var self = this;

        $(el).on('submit', function(e) {
            var i,
                nodeType,
                setObj = {},
                key,
                value;

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

            //console.log(setObj)
            self.getValueFromAttr(dataModelFormAttr, controller, $scope).func.push(setObj);
            el.reset();
            return false;
        });
    });

    retObj.addAttrModule('data-vita-click', function(el, attr, controller, $scope) {
        //console.log('data-vita-click', attr, el, $scope);
        var self = this,
            //exObj = this.getExObj(attr, el, controller, $scope);
            exObj = this.getValueFromAttr(attr, controller, $scope);

        //console.log(attr, exObj);
        $(el).on('click', function(e) {
            //console.log(exObj.function)
            exObj.func.apply(exObj.context, exObj.params);
        });
    });

    retObj.addAttrModule('data-vita-event', function(el, attr, controller, $scope) {

    });

    return retObj;

});