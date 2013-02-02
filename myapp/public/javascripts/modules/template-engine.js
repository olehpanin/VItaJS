answer('template-engine', ['s#utils', 's#dom-core'], function(u, $, aop) {

    var _controller,
        _teModules = {

            i18n : function(parArr, el) {
                return _controller.i18n[parArr[0]] || parArr[0];
            },

            conf : function(parArr, el) {
                return 'some-conf-val';
                //return controller.conf.get(parArr[0]);
            },

            model : function(parArr, el) {
                var regExpParam = parArr.join('.'),
                    param = parArr.shift(),
                    cashedElData = el.data,
                    regExp = new RegExp('{{#model.' + regExpParam+ '}}', 'g');

                function getValue(parArr, obj) {
                    var temp = obj;
                    if (parArr.length > 0 ) {
                        u.forEach(parArr, function(val) {
                            temp = temp[val];
                        });
                        return temp;
                    } else {
                        return obj;
                    }
                }

                _controller.model.on('change-' + param, u.bind(function(e) {
                    this.el.data = this.cashedElData.replace(this.regExp, getValue(this.parArr, e.data.value));
                }, {
                    cashedElData : cashedElData,
                    parArr : parArr,
                    el : el,
                    regExp : regExp
                }));

                return getValue(parArr, _controller.model.get(param)) || '';
            },

            converter : function(parArr, el) {

            }
        };

    return {

        compile : function(head, controller) {

            _controller = controller;
            function isTextNode(el) {
                if (el.nodeType === 3) return true;
                return false;
            }

            function isBind(str) {
                if (/{{[\w.#]*}}/.test(str)) return true;
                return false;
            }

            function executeModule(str, el, $scope) {
                var paramArr,
                    module;

                str = str.substr(2, str.length - 4);
                paramArr = str.split('.');
                if (/#\w*./.test(str)) {
                    str.substr(1);
                    paramArr = str.split('.');
                    module = paramArr.shift().substr(1);

                    if (module in _teModules) {
                        return _teModules[module](paramArr, el);
                    }
                } else {
                    return getScopeVal(paramArr, $scope);
                }
            }

            function getScopeVal(strArr, $scope) {
                var key = strArr.pop();

                return $scope.get(key);
            }

            function iterate(head, $scope) {

                function vitaRepeat(repeatStr, el, cloneRepeatEl) {
                    var repeatArr = repeatStr.split(' in '),
                        scopeVal = repeatArr.shift(),
                        param = repeatArr.shift(),
                        collection = _controller.model.get(param),
                        cloneEl = cloneRepeatEl || el.cloneNode();

                    function go(collection, el, cloneEl) {
                        var cloneChildNode;

                        el.innerHTML = '';

                        collection.forEach(function(dataModel) {
                            var i;

                            for (i = 0; i < cloneEl.children.length; i++) {
                                cloneChildNode = cloneEl.children[i].cloneNode();
                                iterate(cloneChildNode, dataModel);
                                el.appendChild(cloneChildNode);
                            }
                        });
                    }

                    collection.on('change', function(e) {
                        go(collection, el, cloneEl);
                    });
                    go(collection, el, cloneEl);

                }

                function dataModel(el) {
                    $(el).keyup(function(e) {
                        _controller.model.set(el.getAttribute('data-model'), $(this).val());
                    });
                    _controller.model.on('validation-error-' + el.getAttribute('data-model'), function(e) {
                        $(el).val(e.data.value);
                    });
                }

                function dataModelForm(el) {
                    var dataModelFormAttr = el.getAttribute('data-model-form');

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

                        _controller.model.get(dataModelFormAttr).push(setObj);
                        el.reset();
                        return false;
                    });
                }

                if (head.hasAttribute('data-vita-repeat')) {
                    vitaRepeat(head.getAttribute('data-vita-repeat'), head);
                }

                u.forEach(head.childNodes, function(el) {
                    if (el.nodeName === '#comment') return;
                    if (!isTextNode(el) && el.hasAttribute('data-model')) {
                        dataModel(el);
                    }
                    if (!isTextNode(el) && (el.hasAttribute('data-model-form'))) {
                        dataModelForm(el);
                    }
                    if (el.childNodes.length > 0) {
                        /*if (el.hasAttribute('data-vita-repeat')) {
                            vitaRepeat(el.getAttribute('data-vita-repeat'), el);
                        } else {
                            iterate(el, $scope);
                        }*/
                        iterate(el, $scope);
                    } else if (isTextNode(el) && isBind(el.data)) {
                        el.data = el.data.replace(/{{[\w#.]*}}/g, function(tr) {
                            return executeModule(tr, el, $scope);
                        });
                    }
                });
            }

            iterate(head);

            return true;
        }

    };

});
