/**
 * Created by fengc on 20170124.
 * utils v0.6
 */
(function(global, factory){
	global.$ = factory();
})(this, function(){
	'use strict';

	// ALL
	var toString = Object.prototype.toString,
		isW3C = !!document.getElementsByClassName,
		emptyFn = function () {},
		uuid = 1,
		ESVersion = (function(){
			if(Object.values) return 6;
			if(Object.keys) return 5;
			return 3;
		})();


	var REGEXP = {
		TRIM : /^\s+|\s+$/
	};

	var type = function (dest) {
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
		Observer = function(){
			this.$observer = {};
		},
		Delay = function(callback, clearQueue){
			this.q = [];
			this.callback = callback;
			this.clearQueue = !!clearQueue;
			this.tid = null;
		};
	Observer.prototype = {
		$on : function(type, fn){
			(this[type] || (this[type] = [])).push(fn);
			return this;
		},
		$off : function(type, listener){
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
		$emit : function (type, event) {
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
		$pipe : function(type, event){
			var listeners = this[type],
				val = '',
				i = 0, listener;
			if (listeners) {
				if (event && !event.type) event.type = type;
				for (; listener = listeners[i]; i++) {
					val = i === 0 ? listener(event) : listener(val);
				}
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
	Delay.prototype.add = function(item){
		var self = this;
		this.q.push(item);
		if(this.tid) clearTimeout(this.tid);
		this.tid = setTimeout(function(){
			self.callback(self.q);
			if(self.clearQueue) self.q.length = 0;
		}, 0);
	};

	// 字符串
	var stringPrototypeTrim = function(str){
			return str.replace(REGEXP.TRIM, '');
		},
		stringPrototypeRepeat = function(str, time){
			return times(time, function(){ return str; }).join('');
		},
		stringPrototypePadStart = function(str, length, replenish){
			if(length < str.length + replenish.length){
				return replenish.substring(0, length - str.length) + str;
			}else{
				return replenish + str;
			}
		},
		stringPrototypePadEnd = function(str, length, replenish){
			if(length < str.length + replenish.length){
				return str + replenish.substring(0, length - str.length);
			}else{
				return str + replenish;
			}
		};

	// 整数
	var mathTrunc = function(number){
		return number | 0;
	};

	// 数组
	var toArray = function(iterator){
				if(iterator instanceof Array) return iterator;
				if (iterator.length !== undefined) return [].slice.call(iterator);
				return [iterator];
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
			reduce = function (iterator, fn, initialValue, context) {
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
				return previousValue;
			},
			pipe = function(queue, initValue){
				return reduce(queue, function(p, c){ return c(p);}, initValue);
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
			arrayFrom = function(iterator, fn, context){
				var result = toArray(iterator);
				if(typeof fn == 'function'){
					result = map(result, fn, context);
				}
				return result;
			},
			arrayPrototypeFind = function(iterator, fn, context){
				var i=0, l=iterator.length, item;
				if(context){
					for(; i<l; i++){
						if(fn.call(context, iterator[i], i, iterator) === true){
							item = iterator[i];
							break;
						}
					}
				}else{
					for(; i<l; i++){
						if(fn(iterator[i], i, iterator) === true){
							item = iterator[i];
							break;
						}
					}
				}
				return item;
			},
			arrayPrototypeFindIndex = function(iterator, fn, context){
				var i=0, l=iterator.length, index = -1;
				if(context){
					for(; i<l; i++){
						if(fn.call(context, iterator[i], i, iterator) === true){
							index = i;
							break;
						}
					}
				}else{
					for(; i<l; i++){
						if(fn(iterator[i], i, iterator) === true){
							index = i;
							break;
						}
					}
				}
				return index;
			},
			arrayPrototypeFill = function(iterator, value, start, end){
				// [1,2,3].fill(7,1,2) = [1,7,7];
				start = start || 0;
				end = end || iterator.length;
				for(var i=0, l=iterator.length; i<l; i++){
					if(i >= start && i <= end){
						iterator[i] = value;
					}
				}
				return iterator;
			};

	// 对象
	var extend = function () {
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
		isEqual = function (newValue, oldValue) {
			return JSON.stringify(newValue) === JSON.stringify(oldValue);
		},
		objectKeys = function(obj){
			var result = [];
			if(typeof obj === 'object'){
				for(var key in obj){
					if(obj.hasOwnProperty(key)) result.push(key);
				}
			}
			return result;
		},
		objectValues = function(obj){
			var result = [];
			if(typeof obj === 'object'){
				for(var key in obj){
					if(obj.hasOwnProperty(key)) result.push(obj[key]);
				}
			}
			return result;
		},
		isEmpty = function (obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) return false;
			}
			return true;
		};


	// DOM
	var dataManager = {},
		expando = 'fengc' + Date.now(),
		guidCounter = 1,
		handlerGUID = 1;
	var parseHTML = function(html){
			var fragment = document.createDocumentFragment(),
				wrap = document.createElement('div');
			html = html.replace(/<script[\s\S]*?script>/g, '');
			wrap.insertAdjacentHTML('beforeend', html);
			forEach(wrap.childNodes, function (childNode) {
				fragment.appendChild(childNode);
			});
			wrap = null;
			return fragment;
		},
		getData = function(el){
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
		addEvent = function (el, type, fn) {
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
		removeEvent = function (el, type, fn) {
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
		getDOM = function (selector) {
			return document.querySelector(selector);
		},
		getDOMAll = function (selector) {
			return toArray(document.querySelectorAll(selector));
		},
		hasClass = function (el, classname) {
			return some(el.className.split(' '), function (token) {
				if (classname === token) {
					return true;
				}
			});
		},
		addClass = function (el, classname) {
			var newClass,
				oldClass = el.className;
			if (oldClass) {
				newClass = classname.split(' ');
				el.className = unique(newClass.concat(oldClass.split(' '))).join(' ');
			} else {
				el.className = classname;
			}
		},
		removeClass = function (el, classname) {
			var cls = el.className;
			if (cls) {
				classname = classname.split(' ');
				el.className = unrepeat2(cls.split(' '), classname).join(' ');
			}
		},
		addScriptUrl = function (src, fn) {
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
		cssRuleInstance = new Delay(function(items){
			var cssText = reduce(items, function(p, c){
				return p + c + '\n';
			}, '\n');
			var style = document.getElementById('lib-css');
			if(style){
				// TODO
				style.appendChild(document.createTextNode(cssText));
			}else{
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = 'lib-css';
				isW3C ? style.appendChild(document.createTextNode(cssText)) : (style.styleSheet.cssText = cssText);
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		}, true),
		addCSS = function (cssText) {
			cssRuleInstance.add(cssText);
		},
		getStyle = function (dom, prop) {
			return isW3C ? document.defaultView.getComputedStyle(dom, null).getPropertyValue(prop) : dom.currentStyle(prop);
		},
		ready = function (handler) {
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
		adapt = {
			/*
			@param {Number} deviceWidth 设备宽度
			@param {Number} psdWidth psd设计稿宽度
			@discussion rem(640, 640); 如此1rem = 100px，640px的psd稿里，100px的图层宽度就是1rem
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
		};

	// 兼容处理
	var compatible= function(obj, prototype, props, compatibleFns){
		if(typeof prototype === 'string'){
			obj = obj[prototype];
			forEach(props, function(prop, i){
				if(!obj.hasOwnProperty(prop)){
					obj[prop] = function(fn, context){
						return compatibleFns[i](this, fn, context);
					};
				}
			});
		}else{
			forEach(props, function(prop, i){
				if(!obj.hasOwnProperty(prop)){
					obj[prop] = compatibleFns[i];
				}
			});
		}
	};
	if(ESVersion < 6){
		compatible(Math, null, ['trunc'], [mathTrunc]);
		compatible(Array, null, ['from'], [arrayFrom]);
		compatible(Object, null, ['assign', 'values'], [extend, objectValues]);
		compatible(String, 'prototype', ['replace', 'padStart', 'padEnd'], [stringPrototypeRepeat, stringPrototypePadStart, stringPrototypePadEnd]);
		compatible(Array, 'prototype', ['find', 'findIndex', 'fill'], [arrayPrototypeFind, arrayPrototypeFindIndex, arrayPrototypeFill]);
	}
	if(ESVersion < 5){
		compatible(Object, null, ['keys'], [objectKeys]);
		compatible(String, 'prototype', ['trim'], [stringPrototypeTrim]);

	}
	// 动画
	/*
		@param {Object} options 参数对象
		@discussion
			var dom = document.getElementById('div');
			var a = new Animate({
				from : 100,
				to : 500,
				duration : 2000,
				start : function(){},
				progress : function(p){ dom.style.transform = 'translateX(' + p + 'px)'; },
				end : function(){}
			});
			a.start();
	*/
	// 时间扭曲函数 by easing
	var easeOutQuart = function (pos) {
		return -(Math.pow((pos - 1), 4) - 1);
	};
	var Animate = function(opts){
		this.running = false;
		this.timing = 0;
		this.init(opts);
	};
	Animate.prototype = {
		init : function(opts){
			this.opts = extend({
				from: 0,
				to: 0, //to是起始点到目的点的距离, 不是0到目的点的距离. to就是步长!
				duration: 1000,
				easing: easeOutQuart,
				progress: emptyFn,
				start: emptyFn,
				end: emptyFn
			}, opts || {});
			return this;
		},
		config: function (opts) {
			this.opts = extend(this.opts, opts);
			return this;
		},
		start: function () {
			var that = this,
				startstamp = null,
				// startstamp = Date.now(),
				opts = this.opts,
				from = opts.from,
				to = opts.to,
				duration = opts.duration,
				progress = opts.progress,
				easing = opts.easing;
			// 基于时间的动画
			var move = function (timestamp) {
				cancelAnimationFrame(that.timing);
				if(startstamp === null){
					startstamp = timestamp;
					that.timing = requestAnimationFrame(move);
				}else{
					var p = Math.min(1, (timestamp - startstamp) / duration);
					progress(Number((to * easing(p)).toFixed(2)) + from);
					if (p < 1) {
						that.timing = requestAnimationFrame(move);
					} else {
						that.running = false;
						opts.end();
					}
				}
			};
			/*var move = function(){
				clearTimeout(that.timing);
				var p = Math.min(1, +((Date.now() - startstamp) / duration)).toFixed(2);
				progress(to * easing(p) + from);
				if (p < 1) {
					that.timing = setTimeout(move, 20);
				} else {
					that.running = false;
					opts.end();
				}
			}*/
			this.running = true;
			opts.start();
			requestAnimationFrame(move);
		}
	};

	// http
	var defaultsHttp = {
		headers : {
			get : {
				Accept : 'application/json,text/html,*/*',
				// 'Content-Type' : 'text/html;charset=utf-8'
			},
			post : {
				Accept : 'application/json,text/plain,*/*',
				'Content-Type' : 'application/json;charset=utf-8'
			}
		},
		transformRequest : [function(data){
			var dataType = type(data);
			if(dataType === 'object' || dataType === 'array'){
				JSON.stringify(data);
			}else{
				return data;
			}
		}],
		transformResponse : [function(data, headers){
			/*if(typeof data === 'string'){
				var contentType = headers('Content-Type');
				if(contentType && contentType.indexOf('application/json') === 0){
					return JSON.parse(data);
				}
			}*/
			return data;
		}]
	};
	var transformData = function(data, headers, status, transform){
			var result = '';
			forEach(transform, function(fn, i){
				result = fn(i===0 ? data : result, headers, status);
			});
			return result;
		},
		extendHttpConfig = function(opts){
			opts = extend({
				method: 'get',
				url: '',
				timeout: 10000,
				success: emptyFn,
				failed: emptyFn,
				headers: {},
				transformRequest : [],
				transformResponse : []
			}, opts || {});

			opts.method = opts.method.toLowerCase();

			extend(opts.headers, defaultsHttp.headers[opts.method]);

			opts.transformRequest = defaultsHttp.transformRequest.concat(opts.transformRequest);
			opts.transformResponse = defaultsHttp.transformResponse.concat(opts.transformResponse);
			return opts;
		};
	var http = function (opts) {
		opts = extendHttpConfig(opts);

		// 转换请求
		var reqData = transformData(opts.data, opts.headers, undefined, opts.transformRequest);

		var xhr = new XMLHttpRequest();
		// TODO
		xhr.onload = function () {
			// console.log(xhr.getAllResponseHeaders());
			var response = ('response' in xhr) ? xhr.response : xhr.responseText,
				requestData = {
					status : xhr.status,
					// 转换响应
					// data : transformData(response, xhr.getAllResponseHeaders(), xhr.status, opts.transformResponse)
					data : transformData(response, '', xhr.status, opts.transformResponse)
				};
			if (xhr.status >= 200 && xhr.status < 300) {
				opts.success(requestData);
			} else {
				opts.failed(requestData);
			}
			delete opts.transformRequest;
			delete opts.transformResponse;
		};
		xhr.onerror = function () {
			// opts.failed(-1, 'network error');
			opts.failed({
				status : -1,
				data : transformData('network error', '', -1, opts.transformResponse)
			});
		};
		xhr.ontimeout = function () {
			// opts.failed(-2, 'timeout');
			opts.failed({
				status : -2,
				data : transformData('timeout', xhr.headers, -2, opts.transformResponse)
			});
		};

		xhr.open(opts.method, opts.url, true);

		for (var key in opts.headers) {
			// xhr.setRequestHeader('Content-Type', 'text/html;charset=utf-8');
			xhr.setRequestHeader(key, opts.headers[key]);
		}

		xhr.timeout = opts.timeout;
		xhr.send(opts.method === 'post' ? JSON.stringify(reqData) : null);
	};

	// other
	var diff_time = function (time1, time2) {
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
		};

	var countDown = function(times, progressFn, endFn){
		if(times > 0){
			progressFn(times);
			times--;
			setTimeout(function(){
				countDown(times, progressFn, endFn);
			}, 1000);
		}else{
			endFn();
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
		// EXPR_FILTER = /[^\+\-\*\/\%\=\!\?\:\>\<\&\|\d\s\{\}\[\]\(\)\,]+/g,
		EXPR_FILTER = /[^\+\-\*\/\%\=\!\?\:\>\<\&\|\s\{\}\[\]\(\)\,]+/g,
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
				};
			}
		},
		'ng-show' : {
			compile : function(){
				return function(node, model){
					model.$watch(node.getAttribute('ng-show'), function(newValue){
						if(newValue){
							removeClass(node, 'ng-hide');
						}else{
							addClass(node, 'ng-hide');
						}
					});
				};
			}
		},
		// <input type="text" ng-text="a"> {{a}}
		'ng-text' : {
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
			var expr = text.replace(REGEXP.TRIM, '').replace(EXPR_FILTER, function(a){
				// TODO
				if(a.indexOf('.') !== -1){
					forEach(a.split('.'), ensureSafeMemberName);
				}
				ensureSafeMemberName(a);
				if(a[0] in TOKENS || a in TOKENS) {
					return a;
				}
				else if(INTEGER.test(a)){
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
				listenerFn : listenerFn || emptyFn,
				valueEq : !!valueEq,
				last : emptyFn
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
			} while (dirty);
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
								(oldValue === emptyFn ? newValue : oldValue),
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
	(function(){
		var key;
		for(key in directivesManage){
			if(typeof directivesManage[key] === 'function'){
				directivesManage[key] = directivesManage[key]();
			}
		}
	})();
	addCSS('.ng-hide{display:none !important;}');


	//
	var _ = function(selector){
		if (selector[0] === '<') {
			return parseHTML(selector);
		} else {
			return getDOM(selector);
		}
	};

	extend(_, {
		type : type,
		extend : extend,
		clone : clone,
		isEqual : isEqual,
		toArray: toArray,
		times: times,
		forEach: forEach,
		map: map,
		every: every,
		some: some,
		filter: filter,
		indexOf: indexOf,
		reduce: reduce,
		pipe : pipe,
		bind: function (fn, context) {
			return function () {
				fn.apply(context, arguments);
			};
		},
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
		trim: stringPrototypeTrim,
		unique: unique,
		unrepeat: unrepeat,
		unrepeat2: unrepeat2,
		hasClass: hasClass,
		addClass: addClass,
		removeClass: removeClass,
		addScriptUrl: addScriptUrl,
		addCSS: addCSS,
		getStyle: getStyle,
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
		on: addEvent,
		off: removeEvent,
		ready: ready,
		adapt: adapt,
		cookie : {
			/*
			Set-Cookie: name=value; expires=Mon, 22-Jan-07 07:10:24 GTM; domain=.wrox.com
			这个头信息指定了一个叫name的cookie，它会在GMT时间2007年1月22日7:10:24失效，同时对www.wrox.com和wrox.com的任何子域(如p2p.wrox.com)都有效
			*/
			get : function(name){
				var cookieName = encodeURIComponent(name) + "=",    //解码
					cookieStart = document.cookie.indexOf(cookieName),
					cookieValue = '',
					cookieEnd = 0;
				if(cookieStart > -1){
					cookieEnd = document.cookie.indexOf(";", cookieStart);
					if(cookieEnd === -1){
						cookieEnd = document.cookie.length;
					}
					cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
				}
				return cookieValue;
			},
			set : function(name, value, expires, path, domain, secure){
				/*JavaScript中日期是以0为起始，所以new Date(2015,5,15)实际为2015年6月16日*/
				var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);    //编码
				if(expires instanceof Date) cookieText += "; expires=" + expires.toGMTString();     //设置cookie过期时间
				if(path) cookieText += "; path=" + path;    //域名下的路径
				if(domain) cookieText += "; domain=" + domain;  //域名
				if(secure) cookieText += "; secure";    //标识符，SSL连接才能传输
				document.cookie = cookieText;
				return this;
			},
			unset : function(name, path, domain, secure){
				this.set(name, "", new Date(0), path, domain, secure);
				return this;
			}
		},
		storage : {
			getLocal: function (key) {
				var value = localStorage[key];
				return value ? JSON.parse(value) : {};
			},
			setLocal: function (key, value) {
				localStorage[key] = typeof value === "string" ? value : JSON.stringify(value);
			},
			removeLocal: function (key) {
				if (key !== undefined) {
					localStorage.removeItem(key);
				} else {
					localStorage.clear();
				}
			},
			getSession: function (key) {
				var value = sessionStorage[key];
				return value ? JSON.parse(value) : {};
			},
			setSession: function (key, value) {
				sessionStorage[key] = typeof value === "string" ? value : JSON.stringify(value);
			},
			removeSession: function (key) {
				if (key !== undefined) {
					sessionStorage.removeItem(key);
				} else {
					sessionStorage.clear();
				}
			}
		},
		Observer : Observer,
		Delay : Delay,
		dom: getDOM,
		domAll: getDOMAll,
		parseHTML: parseHTML,
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
		date: {
			diff_time: diff_time,
			date_to_string: date_to_string,
			string_to_date: string_to_date
		},
		countDown : countDown,
		http : http,
		Animate : Animate,
		MVC : MVC

	});

	return _;
});
