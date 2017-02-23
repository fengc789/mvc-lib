/**
 * Created by fengc on 20170124.
 * utils v0.6
 */
(function (global, factory) {
    global.$ = factory();
})(this, function () {
    'use strict';
    var dataManager = {},
        expando = 'fengc' + Date.now(),
        guidCounter = 1,
        handlerGUID = 1,
        isW3C = !!document.getElementsByClassName,
        toString = Object.prototype.toString,
        uuid = 1,
        TRIMREG = /^\s+|\s+$/g,
        empty_fn = function () { };

    var toArray = function (iterator) {
            if (iterator instanceof Array) return iterator;
            if (!iterator.length) return [iterator];
            var result = [];
            for (var i = 0, l = iterator.length; i < l; i++) result.push(iterator[i]);
            return result;
        },
        extend = function () {
            var len = arguments.length,
                defaultConfig,
                userConfig;
            if (len === 1) {
                return arguments[0];
            }
            else {
                userConfig = arguments[len - 1];
                for (var key in userConfig) {
                    if (userConfig.hasOwnProperty(key)) {
                        defaultConfig = extend.apply(null, [].slice.call(arguments, 0, len - 1));
                        defaultConfig[key] = userConfig[key];
                    }
                }
                // userConfig可能是空对象，因此应该返回arguments[0]
                return defaultConfig || arguments[0];
            }
        },
        clone = function (obj, userJSON) {
            if (userJSON === true) {
                return JSON.parse(JSON.stringify(obj));
            }
            var result, objtype = type(obj), i, l;
            if (objtype === 'object') {
                obj = obj || {};
                result = {};
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        result[i] = clone(obj[i]);
                    }
                }
            }
            else if (objtype === 'array') {
                obj = obj || [];
                result = [];
                i = 0;
                l = obj.length;
                for (; i < l; i++) {
                    result[i] = clone(obj[i]);
                }
            }
            else {
                result = obj;
            }
            return result;
        },
        isEmpty = function (obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) return false;
            }
            return true;
        },
        unique = function (array) {
            var result = [], hash = {}, item;
            for (var i = 0, l = array.length; i < l; i++) {
                item = array[i];
                if (!hash[item]) {
                    result.push(item);
                    hash[item] = true;
                }
            }
            return result;
        },
        unrepeat = function (array) {
            // [a,b,c,a,a,b,d] => [c,d]
            var len = array.length,
                last,
                hasRepeat,
                i;
            while (len > 0) {
                last = array[len - 1];
                hasRepeat = false;
                i = 0;
                for (; i < len - 1; i++) {
                    if (last === array[i]) {
                        hasRepeat = true;
                        array.splice(i, 1);
                        i--;
                    }
                }
                if (hasRepeat) {
                    array.splice(len - 1, 1);
                    len--;
                }
                len--;
            }
            return array;
        },
        unrepeat2 = function (distArray, filterArray) {
            // [1,2,3,4,5] + [1,3] => [2,4,5]
            var filterItem, j, len;
            for (var i = 0, l = filterArray.length; i < l; i++) {
                filterItem = filterArray[i];
                j = 0;
                len = distArray.length;
                for (; j < len; j++) {
                    if (filterItem === distArray[j]) {
                        distArray.splice(j, 1);
                        len--;
                        j--;
                    }
                }
            }
            return distArray;
        },
        trim = function (token) {
            return token.replace(TRIMREG, '');
        },
        type = function (dest) {
            var length;
            switch (toString.call(dest)) {
                case '[object String]': return 'string';
                case '[object Number]':
                    return isNaN(dest) ? 'NaN' : 'number';
                case '[object Undefined]': return 'undefined';
                case '[object Object]':
                    length = dest.length;
                    if (length === 0 || (typeof length === 'number' && length > 0 && (length - 1) in dest)) {
                        return 'arrayLink';
                    } else {
                        return 'object';
                    }
                case '[object Function]': return 'function';
                case '[object Array]': return 'array';
                case '[object Null]': return 'null';
                case '[object Boolean]': return 'boolean';
                case '[object Blob]': return 'blob';
                case '[object File]': return 'file';
                case '[object FormData]': return 'formData';
                default: return 'Unknown Type';
            }
        },
        rest = function(iterator){
            // 去除数组的第一个元素
            var result = toArray(iterator);
            result.shift();
            return result;
        },
        initial = function(iterator){
            // 去除数组的最后一个元素
            var result = toArray(iterator);
            result.pop();
            return result;
        },
        diff_time = function (time1, time2) {
            /*
            20160505 - 20160102
            */
            if (!(time1 instanceof Date)) {
                time1 = string_to_date(time1);
            }
            if (!(time2 instanceof Date)) {
                time2 = string_to_date(time2);
            }
            return (time1 - time2) / 86400000;
        },
        date_to_string = function (date, token1, token2, token3) {
            var y = date.getFullYear(),
                m = date.getMonth() + 1,
                d = date.getDate();
            if (m < 10) m = '0' + m;
            if (d < 10) d = '0' + d;
            return '' + y + (token1 || '') + m + (token2 || '') + d + (token3 || '');
        },
        string_to_date = function (str) {
            str = str.replace(/\D/g, '');
            var y = +str.substring(0, 4),
                m = +str.substring(4, 6) - 1,
                d = +str.substring(6, 8);
            return new Date(y, m, d);
        },
        fixEvent = function (e) {
            e.preventDefault = function () {
                this.returnValue = false;
            };
            e.stopPropagation = function () {
                this.cancelBubble = true;
            };
            e.target = e.srcElement;
            return e;
        },
        getData = function (el) {
            var guid = el[expando];
            if (!guid) {
                guid = el[expando] = guidCounter++;
                dataManager[guid] = {};
            }
            return dataManager[guid];
        },
        removeData = function (el, key1, key2, hasClear) {
            var guid = el[expando],
                handler;
            if (!guid) return;
            handler = dataManager[guid];
            if (key1 !== undefined) delete handler[key1];
            if (key2 !== undefined) delete handler[key2];
            if (hasClear === true || isEmpty(handler.data)) {
                delete dataManager[guid];
                delete el[expando];
            }
        },
        getDOM = function (selector) {
            return document.querySelector(selector);
        },
        getDOMAll = function (selector) {
            return toArray(document.querySelectorAll(selector));
        },
        parseHTML = function (html) {
            var fragment = document.createDocumentFragment(),
                wrap = document.createElement('div');
            html = html.replace(/<script[\s\S]*?script>/g, '');
            wrap.insertAdjacentHTML('beforeend', html);
            $.forEach(wrap.childNodes, function (childNode) {
                fragment.appendChild(childNode);
            });
            wrap = null;
            return fragment;
        },
        pipe = function (iterator, val, useConsume) {
            return reduce(iterator, function (prev, current) {
                return current(prev);
            }, val, null, useConsume);
        },
        Delay = function (callback) {
            this.q = [];
            this.callback = callback;
            this.tid = null;
        },
        times = function (num, fn, context) {
            var i = 1,
                result = [];
            while (i <= num) {
                result.push(fn.call(context, i));
                i++;
            }
            return result;
        },
        forEach = function (iterator, fn, context) {
            var i = 0, l = iterator.length;
            if (context) {
                for (; i < l; i++) {
                    fn.call(context, iterator[i], i, iterator);
                }
            } else {
                for (; i < l && iterator[i] !== undefined; i++) {
                    fn(iterator[i], i, iterator);
                }
            }
        },
        map = function (iterator, fn, context) {
            var result = [], i = 0, l = iterator.length;
            if (context) {
                for (; i < l; i++) {
                    result.push(fn.call(context, iterator[i], i, iterator));
                }
            } else {
                for (; i < l; i++) {
                    result.push(fn(iterator[i], i, iterator));
                }
            }
            return result;
        },
        every = function (iterator, fn, context) {
            // 检查每个元素是否都为true, 全部通过返回true, 否则false。有一个元素为false就短路
            var i = 0, l = iterator.length;
            if (context) {
                for (; i < l; i++) {
                    if (!fn.call(context, iterator[i], i, iterator)) {
                        return false;
                    }
                }
            } else {
                for (; i < l; i++) {
                    if (!fn(iterator[i], i, iterator)) {
                        return false;
                    }
                }
            }
            return true;
        },
        some = function (iterator, fn, context) {
            // 检查是否有至少一个元素为true，有则返回true，否则false。只要有一个元素为true就短路
            var i = 0, l = iterator.length;
            if (context) {
                for (; i < l; i++) {
                    if (fn.call(context, iterator[i], i, iterator)) {
                        return true;
                    }
                }
            } else {
                for (; i < l; i++) {
                    if (fn(iterator[i], i, iterator)) {
                        return true;
                    }
                }
            }
            return false;
        },
        filter = function (iterator, fn, context) {
            var result = [], i = 0, l = iterator.length;
            if (context) {
                for (; i < l; i++) {
                    if (fn.call(context, iterator[i], i, iterator)) {
                        result.push(iterator[i]);
                    }
                }
            } else {
                for (; i < l; i++) {
                    if (fn(iterator[i], i, iterator)) {
                        result.push(iterator[i]);
                    }
                }
            }
            return result;
        },
        indexOf = function (iterator, dst) {
            var index = -1;
            for (var i = 0, l = iterator.length; i < l; i++) {
                if (iterator[i] === dst) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        reduce = function (iterator, fn, initialValue, context, isConsume) {
            var previousValue = initialValue || '',
                i = 0, l = iterator.length;
            if (context) {
                for (; i < l && iterator[i] !== undefined; i++) {
                    previousValue = fn.call(context, previousValue, iterator[i], i, iterator);
                }
            } else {
                for (; i < l && iterator[i] !== undefined; i++) {
                    previousValue = fn(previousValue, iterator[i], i, iterator);
                }
            }
            if (isConsume === true) iterator.length = 0;
            return previousValue;
        };

    Delay.prototype.add = function (item) {
        var self = this;
        this.q.push(item);
        if (this.tid) {
            clearTimeout(this.tid);
        }
        this.tid = setTimeout(function () {
            var val = reduce(self.q, function (previousValue, currentValue) {
                return previousValue + currentValue + '\n';
            }, '\n', null, true);
            self.callback(val);
        }, 0);
    };
    var cssRuleInstance = new Delay(function (cssText) {
        var style = document.createElement('style');
        style.type = 'text/css';
        isW3C ? style.appendChild(document.createTextNode(cssText)) : (style.styleSheet.cssText = cssText);
        document.getElementsByTagName('head')[0].appendChild(style);
    });

    // $q
    var processQueue = function (state) {
            var pending = state.pending,
                status = state.status,
                value = state.value;
            delete state.pending;
            if (pending instanceof Array) {
                forEach(pending, function (handlers) {
                    var deferred = handlers[0],
                        fn = handlers[status];
                    if (typeof fn === 'function') {
                        deferred.resolve(fn(state.value));
                    }
                    else if (state.status === 1) {
                        deferred.resolve(value);
                    } else {
                        deferred.reject(value);
                    }
                });
            }
        },
        scheduleProcessQueue = function (state) {
            setTimeout(function () {
                processQueue(state);
            }, 10);
        },
        markPromise = function (value, resolved) {
            var d = new Deferred();
            if (resolved) d.resolve(value);
            else d.reject(value);
            return d.promise;
        },
        Promise = function () {
            this.$$state = {};
        },
        Deferred = function () {
            this.promise = new Promise();
        },
        defer = function () {
            return new Deferred();
        },
        when = function (value, callback, errback, progressback) {
            var d = defer();
            d.resolve(value);
            return d.promise.then(callback, errback, progressback);
        };

    Promise.prototype = {
        then: function (onFulfilled, onRejected, onProgress) {
            var result = new Deferred();
            this.$$state.pending = this.$$state.pending || [];
            this.$$state.pending.push(
                [result, onFulfilled, onRejected, onProgress]
            );
            if (this.$$state.status > 0) {
                scheduleProcessQueue(this.$$state);
            }
            return result.promise;
        },
        catch: function (onRejected) {
            return this.then(null, onRejected);
        },
        finally: function (callback, progressBack) {
            return this.then(
                function (value) {
                    var callbackValue = callback();
                    if (callbackValue && callbaclValue.then) {
                        return callbaclValue.then(function () { return value; });
                    } else {
                        return value;
                    }
                },
                function (rejection) {
                    var callbackValue = callback();
                    if (callbackValue && callbackValue.then) {
                        return callbackValue.then(function () {
                            return markPromise(rejection, false);
                        });
                    } else {
                        return markPromise(rejection, false);
                    }
                },
                progressBack
            );
        }
    };
    Deferred.prototype = {
        resolve: function (value) {
            if (this.promise.$$state.status) return;
            if (value && typeof value.then === 'function') {
                value.then(
                    $.bind(this.resolve, this),
                    $.bind(this.reject, this),
                    $.bind(this.notify, this)
                );
            } else {
                this.promise.$$state.value = value;
                this.promise.$$state.status = 1;
                scheduleProcessQueue(this.promise.$$state);
            }
        },
        reject: function (reason) {
            if (this.promise.$$state.status) return;
            this.promise.$$state.value = reason;
            this.promise.$$state.status = 2;
            scheduleProcessQueue(this.promise.$$state);
        },
        notify: function (progress) {
            var pending = this.promise.$$state.pending;
            if (pending instanceof Array && !this.promise.$$state.status) {
                setTimeout(function () {
                    forEach(pending, function (handlers) {
                        var deferred = handlers[0],
                            progressBack = handlers[3];
                        deferred.notify(typeof progressBack === 'function' ?
                            progressBack(progress) : progress);
                    });
                }, 10);
            }
        }
    };

    var Observer = function () {
        // this.$$observer = {};
    };
    Observer.prototype = {
        //订阅
        $on: function (type, fn) {
            // 注册一个函数, 注意函数可以用闭包!
            (this[type] || (this[type] = [])).push(fn);
            return this;
        },
        $off: function (type, listener) {
            var listeners = this[type];
            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; i++) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
            return this;
        },
        //发布
        $emit: function (type, event) {
            var emit = function(listeners){
                if(listeners instanceof Array){
                    forEach(listeners, function(fn){
                        if (event && !event.type) event.type = type;
                        fn(event);
                    });
                }
            };
            var key;
            if (type === undefined){
                for(key in this){
                    if(this.hasOwnProperty(key)){
                        emit(this[key]);
                    }
                }
            }else{
                emit(this[type]);
            }

            return this;
        },
        // 管道
        $pipe: function (type, event) {
            var listeners = this[type],
                val = '',
                i = 0, listener;
            if (listeners) {
                if (event && !event.type) event.type = type;
                val = _.pipe(listener(event));
                /*for (; listener = listeners[i]; i++) {
                    // val = i === 0 ? listener.apply(null, [].slice.call(arguments)) : listener(val);
                    val = i === 0 ? listener(event) : listener(val);
                }*/
            }
            return val;
        },
        $clear: function (type) {
            if (type) {
                delete this[type];
            }
            return this;
        }
    };


    // MVC
    /*
    html:
    <div id="div">
        <p ng-click = "add($event, this)">{{ a[0] }} - {{ b }}</p>
        <p ng-show = "c">{{ d(a[1], b) }}</p>
        <p my-dir></p>
        <p id="p"></p>
    </div>

    js:
    var m = new $.MVC({
        el : "#div",
        controller : function(node){
            this.a = [10, 11, 12]
            this.b = 2;
            this.c = false;
            this.d = function(a, b){ return a + b;};
            this.add = function(){ console.log(arguments); this.c = !this.c;};
        },
        directives : {
            'my-dir' : {
                scope : true,
                template : '<span>{{b}}</span>',
                compile : function(node){
                    return {
                        pre : function(node, model){ console.log('pre:', arguments); },
                        post : function(node, model){ console.log('post:', arguments); model.a = 100;}
                    };
                }
            }
        }
    });

    $('#p').appendChild(m.$compile('<span>{{b}}</span>'))

    setTimeout(function(){
        m.$model.b = 99;
        m.$apply();
    }, 2000);
    */
    var INTERPOLATE = /{{.*?}}/,
        INTERPOLATE_ALL = /{{(.*?)}}/g,
        EXPR_FILTER = /[^\+\-\*\/\%\=\!\?\:\>\<\&\|\d\s\{\}\[\]\(\)\,]+/g,
        INTEGER = /^\d+$/,
        SPACE = /\s/g;
    var TOKENS = {
        'true' : true,
        'false' : true,
        '"' : true,
        '\'' : true
    };
    var SAFE_FILTER = {
        'constructor' : true,
        '__proto__' : true,
        '__defineGetter__' : true,
        '__defineSetter__' : true,
        '__lookupGetter__' : true,
        '__lookupSetter__' : true,
        '$ctrl' : true,
        'var' : true,
        'while' : true,
        'for' : true,
        'if' : true,
        'window' : true,
        'return' : true,
        'function' : true
    };
    var ensureSafeMemberName = function(name){
        if(name in SAFE_FILTER){
            throw '->parse: 非法字符"' + name + '"';
        }
    };
    // TODO
    var directivesManage = {
        'ng-click' : {
            priority : 0,
            compile : function(){
                return function(node, model){
                    var expr = parse(node.getAttribute('ng-click'));
                    var handle = function(e){
                        expr(model, {$event : e});
                        // model.$eval(attr, {$event : e})
                        model.$apply();
                    };
                    // _.on(node, 'click', handle);
                    node.addEventListener('click', handle);
                    model.$on('$destroy', function(){
                        // _.off(node);
                        node.removeEventListener('click', handle);
                    });
                }
            }
        },
        'ng-show' : {
            priority : 0,
            compile : function(){
                return function(node, model){
                    model.$watch(node.getAttribute('ng-show'), function(newValue){
                        if(newValue){
                            _.removeClass(node, 'ng-hide');
                        }else{
                            _.addClass(node, 'ng-hide');
                        }
                    });
                };
            }
        },
        // <input type="text" ng-text="a"> {{a}}
        'ng-text' : {
            priority : 0,
            compile : function(){
                return function(node, model){
                    var type = node.getAttribute('type'),
                        prop = node.getAttribute('ng-text');
                    if(type === '') type = 'text';
                    if(type !== 'text') return;
                    var handle = function(){
                        clearTimeout(handle.tid);
                        handle.tid = setTimeout(function(){
                            model.$eval(prop + '="' + node.value + '"');
                            model.$apply();
                        }, 100);
                    };
                    model.$watch(prop, function(val){
                        node.value = val;
                    });
                    node.addEventListener('input', handle);
                    model.$on('$destroy', function(){
                        node.removeEventListener('input', handle);
                    });
                };
            }
        }
    };
    var parse = function(text){
            var expr = text.replace(TRIMREG, '').replace(EXPR_FILTER, function(a){
                // TODO
                if(a.indexOf('.') !== -1){
                    forEach(a.split('.'), ensureSafeMemberName);
                }
                ensureSafeMemberName(a);
                if(a[0] in TOKENS || a in TOKENS) {
                    return a;
                }
                else if (a.substring(0,4) === 'this'){
                    return a.replace('this', 's');
                }
                else {
                    return "((l&&'"+a+"' in l)?l:s)." + a;
                }
            });
            return new Function('s', 'l', 'try{return ' + expr + '}catch(e){}');
        },
        interpolate = function(text){
            var index = 0,
                start = 0, end = 0;
            var parts = [],
                expr = '';
            while(index < text.length){
                start = text.indexOf('{{', index);
                if(start !== -1){
                    end = text.indexOf('}}', start + 2);
                }
                if(start !== -1 && end !== -1){
                    if(start !== index){
                        parts.push(text.substring(index, start));
                    }
                    expr = text.substring(start + 2, end);
                    parts.push(parse(expr));
                    index = end + 2;
                }else{
                    parts.push(text.substring(index));
                    break;
                }
            }
            // console.log(parts);
            return parts;
        },
        byPriority = function (a, b) {
            return b.priority - a.priority;
        },
        addDirective = function(){};
    var initWatchValue = function(){};



    var View = function(ctrl){
        this.$ctrl = ctrl;
        this.$nodes = document.querySelectorAll(ctrl.$options.el);
    };
    View.prototype = {
        $init : function(nodes, model){
            var compileNodes = this.$compileNodes(nodes || this.$nodes, this.$ctrl.$options.directives);
            compileNodes(model || this.$ctrl.$model, nodes || this.$nodes);
        },
        $compileNodes : function(nodes, directives){
            var self = this;
            var linkFns = [];
            forEach(nodes, function(node, i){
                var nodeDirectives = self.$collectDirectives(node, directives),
                    childNodes,
                    nodeLinkFn,
                    childLinkFn;
                if(nodeDirectives.length > 0){
                    nodeLinkFn = self.$applyDirectivesToNode(nodeDirectives, node);
                }
                childNodes = node.childNodes;
                if(childNodes && childNodes.length > 0){
                    childLinkFn = self.$compileNodes(childNodes, directives);
                }
                if(nodeLinkFn || childLinkFn){
                    linkFns.push({
                        nodeLinkFn : nodeLinkFn,
                        childLinkFn : childLinkFn,
                        idx : i
                    });
                }
            });
            return function(model, nodes){
                var stableNodeList = [];
                forEach(linkFns, function (linkFn) {
                    var idx = linkFn.idx;
                    stableNodeList[idx] = nodes[idx];
                });
                forEach(linkFns, function (linkFn) {
                    var node = stableNodeList[linkFn.idx],
                        childModel;
                    if (linkFn.nodeLinkFn) {
                        if(linkFn.nodeLinkFn.scope){
                            childModel = model.$new();
                        }else{
                            childModel = model;
                        }
                        linkFn.nodeLinkFn(linkFn.childLinkFn, childModel, node);
                    } else {
                        linkFn.childLinkFn(model, node.childNodes);
                    }
                });
            };
        },
        // 查找node所有注册的指令
        $collectDirectives : function(node, directives){
            var self = this;
            var nodeDirectives = [];
            // 元素节点
            if(node.nodeType === 1){
                forEach(node.attributes, function(attr){
                    var name = attr.name;
                    if(name in directives){
                        nodeDirectives.push(directives[name]);
                    }
                    self.$addAttrInterpolateDirective(nodeDirectives, attr);
                });
            }
            // 文本节点
            else if (node.nodeType === 3) {
                self.$addTextInterpolateDirective(nodeDirectives, node);
            }
            nodeDirectives.sort(byPriority);
            return nodeDirectives;
        },
        // 给node应用指令
        $applyDirectivesToNode : function(directives, node){
            var self = this,
                templateDirective, terminalPriority = -1,
                preLinkFns = [], postLinkFns = [],
                newScopeDirective;
            var nodeLinkFn = function (childLinkFn, model, node) {
                forEach(preLinkFns, function(pre){
                    pre(node, model)
                });
                if(childLinkFn){
                    childLinkFn(model, node.childNodes);
                }
                for (var i = postLinkFns.length - 1; i >= 0; i--) {
                    postLinkFns[i](node, model);
                }
            };
            var addLinkFns = function (preLink, postLink) {
                if (preLink) {
                    preLinkFns.push(preLink);
                }
                if (postLink) {
                    postLinkFns.push(postLink);
                }
            };
            every(directives, function(dir, i){
                var linkFn;
                if (dir.priority < terminalPriority) return false;
                if(dir.scope === true){
                    newScopeDirective = true;
                }
                if(dir.template){
                    if (templateDirective) {
                        throw 'Multople directives asking for templateUrl!';
                    }
                    templateDirective = dir;
                    node.innerHTML = typeof dir.template === 'function' ?
                        dir.template(node) : dir.template;
                }
                if (dir.templateUrl) {
                    if (templateDirective) {
                        throw 'Multople directives asking for template!';
                    }
                    templateDirective = dir;
                    // TODO
                    nodeLinkFn = self.$compileTemplateUrl();
                    return false;
                } else if (dir.compile) {
                    linkFn = dir.compile(node);
                    if (typeof linkFn === 'function') {
                        addLinkFns(null, linkFn);
                    } else if (linkFn) {
                        addLinkFns(linkFn.pre, linkFn.post);
                    }
                }
                if (dir.terminal) {
                    terminalPriority = dir.priority;
                }
                return true;
            });
            nodeLinkFn.scope = newScopeDirective;
            return nodeLinkFn;
        },
        $compileTemplateUrl : function(){},
        // 属性插值
        $addAttrInterpolateDirective : function(directives, node){
            var self = this,
                value = node.value;
            if(!INTERPOLATE.test(value)) return;
            directives.push({
                priority : 0,
                compile : function(){
                    return function(nodeEl, model){
                        var parts = interpolate(value);
                        model.$watch(function(){
                            return reduce(parts, function(p, c){
                                return p + (typeof c==='function'?c(model):c);
                            });
                        }, function(newValue){
                            node.value = newValue;
                        });
                    };
                }
            });
        },
        // 文本插值
        $addTextInterpolateDirective : function(directives, node){
            var self = this,
                value = node.nodeValue;
            if(!INTERPOLATE.test(value)) return;
            directives.push({
                priority: 0,
                compile: function () {
                    return function (nodeEl, model) {
                        var parts = interpolate(value);
                        model.$watch(function(){
                            return reduce(parts, function(p, c){
                                return p + (typeof c==='function'?c(model):c);
                            });
                        }, function(newValue){
                            node.nodeValue = newValue;
                        });
                    };
                }
            });
        }
    };


    var Model = function(ctrl){
        this.$ctrl = ctrl;
        this.$lastDirtyWatch = null;
        this.$watchers = [];
        this.$postDigestQueue = [];
        this.$listeners = {};
        this.$childrens = [];
        this.$root = this;
    };
    Model.prototype = {
        $init : function(){
            this.$apply();
        },
        $watch : function(watchFn, listenerFn, valueEq){
            var self = this;

            if(typeof watchFn === 'string'){
                watchFn = parse(watchFn);
            }

            var watcher = {
                watchFn : watchFn,
                listenerFn : listenerFn || function(){},
                valueEq : !!valueEq,
                last : initWatchValue
            };

            this.$watchers.unshift(watcher);
            this.$root.$lastDirtyWatch = null;

            return function(){
                var index = indexOf(self.$watchers, watcher);
                if(index >= 0){
                    self.$watchers.splice(index, 1);
                    self.$root.$lastDirtyWatch = null;
                }
            };
        },
        $digest : function(){
            var ttl = 10,
                dirty,
                asyncTask;
            this.$root.$lastDirtyWatch = null;
            do{
                dirty = this.$digestOnce();
                ttl--;
                if(ttl < 0){
                    throw ttl + ' digest iterations reached.';
                }
            } while (dirty)
            while(this.$postDigestQueue.length > 0){
                this.$$postDigestQueue.shift()();
            }
        },
        $digestOnce : function(){
            var self = this,
                dirty;
            this.$everyScope(function(scope){
                var watcher, newValue, oldValue;
                for(var i=scope.$watchers.length-1; i>=0; i--){
                    if(watcher = scope.$watchers[i]){
                        newValue = watcher.watchFn(scope);
                        oldValue = watcher.last;
                        if(!scope.$areEqual(newValue, oldValue, watcher.valueEq)){
                            self.$root.$lastDirtyWatch = watcher;
                            watcher.last = watcher.valueEq ? clone(newValue) : newValue;
                            watcher.listenerFn(newValue,
                                (oldValue === initWatchValue ? newValue : oldValue),
                                scope);
                            dirty = true;
                        }
                        else if(self.$root.$lastDirtyWatch === watcher){
                            dirty = false;
                            return false;
                        }
                    }
                }
                return dirty !== false;
            });
        },
        $areEqual : function(newValue, oldValue, valueEq){
            if(valueEq){
                return JSON.stringify(newValue) === JSON.stringify(oldValue);
            }else{
                return newValue === oldValue ||
                        (typeof newValue === 'number' && typeof oldValue === 'number' &&
                            isNaN(newValue) && isNaN(oldValue));
            }
        },
        $apply : function(expr, isAsync){
            if(typeof expr === 'function') expr(this);
            if(isAsync){
                this.$root.$digest();
            }else{
                setTimeout(function(self){
                    self.$root.$digest();
                }, 0, this);
            }
        },
        $everyScope : function(fn){
            if(fn(this)){
                return every(this.$childrens, function(child){
                    return child.$everyScope(fn);
                });
            }else{
                return false;
            }
        },
        $on : function(evtName, listener){
            var listeners = this.$listeners[evtName];
            if(!listeners){
                this.$listeners[evtName] = listeners = [];
            }
            listeners.push(listener);
            return function(){
                var index = indexOf(listeners, listener);
                if(index >= 0){
                    listeners[index] = null;
                }
            };
        },
        $emit : function(evtName){
            // 向上
            var scope = this,
                event = {
                    name : evtName,
                    target : this,
                    stopPropagation : function(){
                        propagationStopped = true;
                    },
                    preventDefault : function(){
                        event.defaultPrevented = true;
                    }
                };
            var propagationStopped = false,
                listenerArgs = [event].concat([].slice.apply(arguments, 1));
            do{
                event.current = scope;
                scope.$fireEventOnScope(evtName, listenerArgs);
                scope = scope.$parent;
            } while (scope && !propagationStopped)
            delete event.current;
            return event;
        },
        $broadcast : function(evtName){
            // 向下
            var scope = this,
                event = {
                    name : evtName,
                    target: this,
                    preventDefault : function(){
                        event.defaultPrevented = true;
                    }
                };
            var listenerArgs = [event].concat(rest(arguments));
            this.$$everyScope(function(scope){
                event.current = scope;
                scope.$$fireEventOnScope(evtName, listenerArgs);
                return true;
            });
            delete event.current;
            return event;
        },
        $fireEventOnScope : function(evtName, listenerArgs){
            var listeners = this.$listeners[evtName] || [],
                i = 0;
            while(i < listeners.length){
                if(listeners[i] === null){
                    listeners.splice(i, 1);
                }else{
                    listeners[i](listenerArgs);
                    i++;
                }
            }
        },
        $destroy : function(){
            var children, index = -1;
            this.$broadcast('$destroy');
            if(this.$parent){
                children = this.$parent.$children;
                index = indexOf(children, this);
                if(index > 0){
                    children.splice(index, 1);
                }
            }
            delete this.$watchers;
            delete this.$listeners;
        },
        $new : function(parent){
            var child,
                childScope = function(){};
            parent = parent || this;
            childScope.prototype = this;
            child = new childScope();
            parent.$childrens.push(child);
            child.$watchers = [];
            child.$childrens = [];
            child.$listeners = {};
            child.$parent = parent;
            return child;
        },
        $eval : function(expr, locals){
            return parse(expr)(this, locals);
        }
    };

    var MVC = function(options){
        this.$options = options;
        this.$view = new View(this);
        this.$model = new Model(this);
        this.$init();
    };
    MVC.prototype = {
        $init : function(){
            this.$options.directives = this.$initDirectives(this.$options.directives || {});
            this.$options.controller.call(this.$model, this.$view.nodes);
            this.$view.$init();
            this.$model.$init();
        },
        $initDirectives : function(directives){
            var dir,
                dirs = _.create(directivesManage),
                key;
            for(key in directives){
                if(typeof directives[key] === 'function') directives[key] = directives[key]();
                dir = directives[key];
                dir.priority = dir.priority || 0;
                if (typeof dir === 'function') {
                    dir.compile = function () { return dir };
                } else if (dir.link && !dir.compile) {
                    dir.compile = function () { return dir.link; };
                }
            }
            extend(dirs, directives);
            return dirs;
        },
        // TODO
        $compile : function(html, model){
            var fragment;
            if(typeof html === 'string'){
                fragment = parseHTML(html);
            // DocumentFragment
            }else if(html.nodeType === 11){
                fragment = html;
            // node
            }else{
                fragment = document.createDocumentFragment();
                fragment.appendChild(html);
            }
            this.$view.$init(fragment.childNodes, model);
            return fragment;
        },
        $digest : function(){
            this.$model.$digest();
        },
        $apply : function(expr){
            this.$model.$apply(expr);
        },
        $destroy : function(){
            this.$model.$destroy();
            delete this.$model;
            delete this.$view;
            delete this.$options;
        }
    };


    var _ = function (selector) {
        // #div .div span
        // <p></p>
        if (selector[0] === '<') {
            return parseHTML(selector);
        } else {
            return getDOM(selector);
        }
    };

    extend(_, {
        type: type,
        extend: extend,
        clone: clone,
        isEqual: function (newValue, oldValue) {
            return JSON.stringify(newValue) === JSON.stringify(oldValue);
        },
        isEmpty: isEmpty,
        toArray: toArray,
        times: times,
        forEach: forEach,
        map: map,
        every: every,
        some: some,
        filter: filter,
        indexOf: indexOf,
        reduce: reduce,
        bind: function (fn, context) {
            return function () {
                fn.apply(context, arguments);
            };
        },
        rest : rest,
        initial : initial,
        create: function (prototype, property) {
            var Fn = function () { },
                instance;
            Fn.prototype = prototype;
            instance = new Fn();
            if (property) {
                extend(instance, property);
            }
            return instance;
        },
        inherit: function (C, P, prototype) {
            var F = function () { };
            F.prototype = P.prototype;
            C.prototype = new F();
            C.superclass = P;
            C.prototype.constructor = C;

            if (P.prototype.constructor === Object.prototype.constructor) {
                P.prototype.constructor = P;
            }
            if (typeof prototype === 'object') {
                for (var key in prototype) {
                    C.prototype[key] = prototype[key];
                }
            }
        },
        throttle: function (fn, timer, context) {
            clearTimeout(fn.tid);
            fn.tid = setTimeout(function () {
                fn.call(context);
            }, timer || 200);
        },
        uniqueId: function () {
            return uuid++;
        },
        trim: trim,
        unique: unique,
        unrepeat: unrepeat,
        unrepeat2: unrepeat2,
        hasClass: function (el, classname, callback) {
            return some(el.className.split(' '), function (token, i, result) {
                if (classname === token) {
                    callback(result, i);
                    return true;
                }
            });
        },
        addClass: function (el, classname) {
            var newClass,
                oldClass = el.className;
            if (oldClass) {
                newClass = classname.split(' ');
                el.className = unique(newClass.concat(oldClass.split(' '))).join(' ');
            } else {
                el.className = classname;
            }
        },
        removeClass: function (el, classname) {
            var cls = el.className;
            if (cls) {
                classname = classname.split(' ');
                el.className = unrepeat2(cls.split(' '), classname).join(' ');
            }
        },
        addScriptUrl: function (src, fn) {
            var script = document.createElement('script'),
                ieHandler = function () {
                    if (script.readyState === "loaded" || script.readyState === "complete") {
                        script.detachEvent("onreadystatechange", ieHandler);
                        fn();
                    }
                };
            script.type = "text/javascript";
            if (!isW3C) {
                script.attachEvent("onreadystatechange", ieHandler);
                // script.onreadystatechange = ieHandler
            } else {
                script.onload = fn;
            }
            script.src = src;
            document.body.appendChild(script);
        },
        addCSS: function (cssText, index) {
            cssRuleInstance.add(cssText, index);
        },
        getStyle: function (dom) {
            return isW3C ? document.defaultView.getComputedStyle(dom, null) :
                dom.currentStyle;
        },
        compatible: (function () {
            if (document.documentElement.classList) {     //IE10+
                return 10;
            } else if (document.getElementsByClassName) {    //IE9+
                return 9;
            } else if (document.querySelector) {       //IE8+
                return 8;
            } else if (window.XMLHttpRequest) {        //IE7+
                return 7;
            } else {                                  //IE6
                return 6;
            }
        } ()),
        data: function (el, key, value) {
            var data = getData(el);
            if (!data.data) data.data = {};
            if (key == undefined) {
                return data.data;
            }
            else if (value == undefined) {
                return data.data[key];
            }
            else {
                data.data[key] = value;
            }
        },
        on: function (el, type, fn) {
            var data = getData(el);
            if (!data.handlers) data.handlers = {};
            if (!data.handlers[type]) data.handlers[type] = [];
            if (!fn.guid) fn.guid = handlerGUID++;
            data.handlers[type].push(fn);
            if (!data.dispatcher) {
                // 代理函数
                data.dispatcher = function (e) {
                    // e = fixEvent(e);
                    var handlers = data.handlers[e.type];
                    if (handlers) {
                        for (var i = 0, l = handlers.length; i < l; i++) {
                            handlers[i].call(el, e);
                        }
                    }
                };
            }
            // 第一次on同一事件时才用addEventListener绑定一次。因为dispatcher会执行事件管理器的对应事件
            if (data.handlers[type].length === 1) {
                el.addEventListener(type, data.dispatcher, false);
                // el.attachEvent('on' + type, data.dispatcher);
            }
        },
        off: function (el, type, fn) {
            var data = getData(el), handlers, t, i = 0;
            // 只有一个参数时，移除el所有绑定的事件
            if (!type) {
                for (t in data.handlers) {
                    el.removeEventListener(t, data.dispatcher, false);
                }
                removeData(el, 'handler', 'dispatcher');
            }
            // 有两个参数时，移除el绑定的type事件
            else if (!fn) {
                el.removeEventListener(type, data.dispatcher, false);
                delete data.handlers[type];
                if (isEmpty(data.handlers)) {
                    removeData(el, 'handler', 'dispatcher');
                }
            }
            else {
                handlers = data.handlers[type];
                if (!handlers) return;
                if (fn.guid) {
                    // 可能一个'click'数组里会有两个guid相同的fn
                    for (i = 0; i < handlers.length; i++) {
                        if (handlers[i].guid === fn.guid) {
                            handlers.splice(i--, 1);
                        }
                    }
                    if (isEmpty(data.handlers)) {
                        removeData(el, 'handler', 'dispatcher');
                    }
                }
            }
        },
        ready: function (handler) {
            if (isW3C) {
                document.addEventListener("DOMContentLoaded", handler, false);
            } else {
                document.attachEvent("onreadystatechange", function () {
                    if (document.readyState === "interactive" || document.readyState === "complete") {
                        handler();
                    }
                });
            }
        },
        adapt: {
            /*
            @param {Number} deviceWidth 设备宽度
            @param {Number} psdWidth psd设计稿宽度
            @discussion utils.rem(640, 640); 如此1rem = 100px，640px的psd稿里，100px的图层宽度就是1rem
            */
            rem: function (deviceWidth, psdWidth) {
                var docEl = document.documentElement,
                    w = docEl.clientWidth >= deviceWidth ? deviceWidth : docEl.clientWidth;
                docEl.style.fontSize = 100 * (w / psdWidth) + 'px';
            },
            /*
            @param {Number} minWidth 最小设计宽度
            */
            viewPort: function (minWidth) {
                var scale = document.documentElement.clientWidth / minWidth;
                document.getElementsByTagName('viewport')[0].setAttribute('content', 'width=' + minWidth + ',initial-scale=' + scale + ',maxinum-scale=' + scale + ',user-scalable=no');
            }
        },
        date: {
            diff_time: diff_time,
            date_to_string: date_to_string,
            string_to_date: string_to_date
        },
        //本地缓存
        getLocalStorage: function (key) {
            var value = localStorage[key];
            return value ? JSON.parse(value) : {};
        },
        setLocalStorage: function (key, value) {
            localStorage[key] = typeof value === "string" ? value : JSON.stringify(value);
        },
        removeLocalStorage: function (key) {
            if (key !== undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.clear();
            }
        },
        getSessionStorage: function (key) {
            var value = sessionStorage[key];
            return value ? JSON.parse(value) : {};
        },
        setSessionStorage: function (key, value) {
            sessionStorage[key] = typeof value === "string" ? value : JSON.stringify(value);
        },
        removeSessionStorage: function (key) {
            if (key !== undefined) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.clear();
            }
        },
        http: function (opts) {
            opts = extend({
                method: 'get',
                url: '',
                timeout: 10000,
                success: empty_fn,
                failed: empty_fn,
                headers: {}
            }, opts || {});
            extend(opts.headers, { 'Content-Type': 'text/html;charset=utf-8' });

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var response = ('response' in xhr) ? xhr.response : xhr.responseText;
                if (xhr.status >= 200 && xhr.status < 300) {
                    opts.success(xhr.status, response, xhr.getAllResponseHeaders());
                } else {
                    opts.failed(xhr.status, 'request error');
                }
            };
            xhr.onerror = function () {
                opts.failed(-1, 'network error');
            };
            xhr.ontimeout = function () {
                opts.failed(-2, 'timeout');
            };

            xhr.open(opts.method, opts.url, true);

            for (var key in opts.headers) {
                // xhr.setRequestHeader('Content-Type', 'text/html;charset=utf-8');
                xhr.setRequestHeader(key, opts.headers[key]);
            }

            xhr.timeout = opts.timeout;
            xhr.send(opts.method === 'post' ? JSON.stringify(opts.data) : null);
        },
        dom: getDOM,
        domAll: getDOMAll,
        parseHTML: parseHTML,
        pipe: pipe,
        Delayed: Delay,
        interval : function(fn, timeout){
            var args = [];
            var callback = function(){
                if(fn.apply(null, args) !== true){
                    setTimeout(callback, timeout);
                }
            };
            timeout = timeout || 100;
            if(arguments.length > 2){
                args = [].slice.call(arguments, 2);
            }
            var tid = setTimeout(callback, timeout);
        },
        $q: {
            defer: defer,
            reject: function (rejection) {
                var d = defer();
                d.reject(rejection);
                return d.promise;
            },
            when: when,
            resolve: when,
            all: function (promises) {
                var result,
                    counter = 0,
                    key,
                    d = defer();
                var resolve = function (promise, i) {
                    counter++;
                    when(promise).then(function (value) {
                        result[i] = value;
                        counter--;
                        if (counter === 0) d.resolve(result);
                    }, function (rejection) {
                        d.reject(rejection);
                    });
                };
                if (promises instanceof Array) {
                    result = [];
                    forEach(promises, resolve);
                } else if (type(promises) === 'object') {
                    result = {};
                    for (key in promises) {
                        if (promises.hasOwnProperty(key)) {
                            resolve(promises[key], key);
                        }
                    }
                }
                if (counter === 0) d.resolve(result);
                return d.promise;
            },
            race: function (promises) {
                var result = [],
                    counter = 0,
                    d = defer();
                if (promises instanceof Array) {
                    forEach(promises, function (promise, i) {
                        counter++;
                        promise.then(function (value) {
                            d.resolve(value);
                        }, function (rejection) {
                            result[i] = rejection;
                            counter--;
                            if (counter === 0) d.reject(rejection);
                        });
                    });
                }
            }
        },
        Observer: Observer,
        MVC : MVC
    });

    var init = function(){
        var key;
        for(key in directivesManage){
            if(typeof directivesManage[key] === 'function'){
                directivesManage[key] = directivesManage[key]();
            }
        }

        _.addCSS('.ng-hide{display:none !important;}');
    };

    init();

    return _;
});
