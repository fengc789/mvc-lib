/**
 * Created by fengc on 20170124.
 * utils
 */
(function(global, factory){
	global.$ = factory();
})(this, function(){
	"use strict";

	var to_string = Object.prototype.toString,
		gid = 1,
		empty_fn = function(){},
		REGEXP = {
			TRIM : /^\s+|\s+$/,
			THOUSANDS : /(\d)(?=(\d{3})+$)/g,
			DOUBLE : /\d+\.?\d*/
		},
		raf = window.requestAnimationFrame || setTimeout,
		nextFrame = function(hook){
			raf(function(){
				raf(hook);
			});
		},
		es_version = (function(){
			if(Object.values) return 6;
			if(Object.keys) return 5;
			return 3;
		}()),
		globalID = function(){ return gid++; },
		constant = function(item){ return item; },
		returnTrue = function(){ return true; },
		everyChild = function(algorithm, node, hook){
			var q = [],
				method = "",
				item = null,
				childs = null,
				i = 0;
			if(!node) return;
			if(algorithm === "DFS") method = "pop";	// 深度优先 队列 先入先出
			else if(algorithm === "BFS") method = "shift";	// 广度优先 栈 先入后出
			else return;
			q.push(node);
			while(q.length !== 0){
				item = q[method]();
				childs = hook(item);
				if(childs === true) return;	// 返回true就停止运行
				if(childs && childs.length > 0){
					if(algorithm === "DFS"){
						for(i=childs.length-1; i>=0; i--) q.push(childs[i]);
					}
					else if(algorithm === "BFS"){
						q.push.apply(q, childs);
					}
				}
			}
		},
		type_of = function (dest) {
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
				case "[object NodeList]" :
				case "[object NamedNodeMap]" :
									return "arrayLink";
				default: return 'Unknown Type';
			}
		},
		trim = function(str){
			return str.replace(REGEXP.TRIM, "");
		},

		toArray = function(iterator){
			if(iterator === null || iterator === undefined) return [];
			if(iterator instanceof Array) return iterator;
			if(iterator.length !== undefined) return [].slice.call(iterator);
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
		foreach = function (iterator, fn, context) {
			var type = type_of(iterator),
				i,
				l,
				key = null;
			if(type === "array" || type === "arrayLink"){
				i = 0;
				l = iterator.length;
				if(context){
					for(; i<l; i++){
						fn.call(context, iterator[i], i, iterator);
					}
				}else{
					for(; i<l; i++){
						fn(iterator[i], i, iterator);
					}
				}
			}
			else if(type === "object"){
				if(context){
					for(key in iterator){
						if(iterator.hasOwnProperty(key)){
							fn.call(context, iterator[key], key, iterator);
						}
					}
				}else{
					for(key in iterator){
						if(iterator.hasOwnProperty(key)){
							fn(iterator[key], key, iterator);
						}
					}
				}
			}else{
				throw new TypeError;
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
			var previousValue = initialValue !== undefined ? initialValue : '',
				i = 0, l = iterator.length;
			if (context) {
				for (; i < l; i++) {
					previousValue = fn.call(context, previousValue, iterator[i], i, iterator);
				}
			} else {
				for (; i < l; i++) {
					previousValue = fn(previousValue, iterator[i], i, iterator);
				}
			}
			return previousValue;
		},
		unique = function(array, action){
			// 数组唯一
			var result = [],
				hash = {},
				item = "";
			if(typeof action !== "function") action = constant;
			for(var i=0, l=array.length; i<l; i++){
				item = action(array[i]);
				if(!hash[item]){
					result.push(array[i]);
					hash[item] = true;
				}
			}
			return result;
		},
		// pipe专用于函数数组的管道, 不适用于非函数数组的管道
		pipe = function(iterator, data){
			var args = Array.prototype.slice.call(arguments, 2);
			var isFirst = true;
			return reduce(iterator, function(prev, fn){
				if(isFirst){
					args.unshift(prev);	// 第一次时添加到数组开头
					isFirst = false;
				}else{
					args[0] = prev;	// 其余情况都是修改数组第一个元素
				}
				return fn.apply(null, args);
			}, data);
		},

		extend = function (default_config) {
			if(default_config == null){ throw new TypeError("Cannot convert undefined or null to object");}
			var user_config = null,
				key = "";
			for(var i=1, l=arguments.length; i<l; i++){
				user_config = arguments[i];
				if(user_config == null) continue;
				for(key in user_config){
					if(user_config.hasOwnProperty(key)){
						default_config[key] = user_config[key];
					}
				}
			}
			return default_config;
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
		bind = function (fn, context) {
			if(typeof fn !== "function"){
				throw new TypeError("bind - what is trying to be bound is not callable");
			}
			var args = Array.prototype.slice.call(arguments, 2);
			return function () {
				fn.apply(context, args.concat(toArray(arguments)));
			};
		},
		isEmpty = function (obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) return false;
			}
			return true;
		},
		// 防抖
		debounce = function (action, timer, context) {
			var tid = 0;
			return function(){
				var args = arguments;
				clearTimeout(tid);
				tid = setTimeout(function () {
					action.apply(context, args);
				}, timer || 200);
			};
		},
		// 节流
		throttle = function(action, timer, context){
			var lock = false,
				tid = 0;
			return function(){
				if(lock) return;
				var args = arguments;
				tid = setTimeout(function(){
					lock = false;
					tid = null;
					action.apply(conext, args);
				}, timer || 100);
				lock = true;
			};
		},

		// DOM
		hasClass = function (el, classname) {
			return some(el.className.split(" "), function (token) {
				if (classname === token) {
					return true;
				}
			});
		},
		addClass = function (el, classname) {
			var newClass = null,
				oldClass = "";
			if(oldClass = el.className){
				newClass = classname.split(" ");
				el.className = unique(newClass.concat(oldClass.split(" "))).join(" ");
			}else{
				el.className = classname;
			}
		},
		removeClass = function (el, classname) {
			var cls = "";
			if(cls = el.className){
				classname = classname.split(" ");
				el.className = filter(trim(cls).split(" "), function(cl){
					var reg = new RegExp("\\b" + cl + "\\b");
					return !reg.test(classname);
				}).join(" ");
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
			if (es_version === 3) {
				script.attachEvent("onreadystatechange", ieHandler);
				// script.onreadystatechange = ieHandler
			} else {
				script.onload = fn;
			}
			script.src = src;
			document.body.appendChild(script);
		},
		addCSS = function (cssText, selector) {
			var style = document.getElementById(selector || "lib-css");
			if(style){
				style.appendChild(document.createTextNode(cssText));
			}else{
				style = document.createElement('style');
				style.type = 'text/css';
				style.id = 'lib-css';
				if(es_version === 3){
					style.styleSheet.cssText = cssText;
				}else{
					style.appendChild(document.createTextNode(cssText));
				}
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		},
		getStyle = function (dom, prop) {
			return es_version > 3 ? getComputedStyle(dom, null).getPropertyValue(prop) : dom.currentStyle(prop);
		},
		getDOM = function (selector) {
			return document.querySelector(selector);
		},
		getDOMAll = function (selector) {
			return toArray(document.querySelectorAll(selector));
		},
		parseHTML = function(html){
			var wrap = document.createElement('div');
			html = html.replace(/<script[\s\S]*?script>/g, '');
			wrap.insertAdjacentHTML('beforeend', html);
			return wrap;
		},
		ready = function (action) {
			var handler = null;
			if (document.readyState === "interactive" || document.readyState === "complete"){
				action();
				return;
			}
			if(es_version > 3){
				handler = function(){
					document.removeEventListener("DOMContentLoaded", handler, false);
					action();
				};
				document.addEventListener("DOMContentLoaded", action, false);
			}else{
				handler = function(){
					if (document.readyState === "interactive" || document.readyState === "complete") {
						document.removeEvent("onreadystatechange", handler);
						action();
					}
				};
				document.attachEvent("onreadystatechange", handler);
			}
		},


		// other
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
		// 倒计时
		countDown = function(times, progressFn, endFn){
			if(times > 0){
				progressFn(times);
				times--;
				setTimeout(function(){
					countDown(times, progressFn, endFn);
				}, 1000);
			}else{
				endFn();
			}
		},
		// 字符串转正则表达式  "/\d/g", "/abc/"
		// var reg = pattern(dom.getAttribute("data-pattern"));
		// reg.lastIndex = 0;
		pattern = function(regText){
			var result = regText.split("/");
			if(result.length >= 2){
				return new RegExp(result[1], result[2]);
			}else{
				throw "无法解析" + regText;
			}
		},
		parseInt = function(text){
			var type = typeof text;
			if(type === "string"){
				var match = text.match(REGEXP.DOUBLE);
				if(match){
					return match[0];
				}
			}
			else if(type === "number"){
				return type;
			}
		},
		inherit = function(sub, sup){
			// 对象与对象之间的继承
			if(type_of(sub) !== "object" || type_of(sup) !== "object"){
				throw "error";
			}
			var f = function(){
				for(var key in sub){
					this[key] = sub[key];
				}
				this.$base = sup;
			};
			f.prototype = sup;
			return new f;
		};

	var Observer = function(){};
	Observer.prototype = {
		$on : function(type, fn){
			var that = this;
			if(this[type] == undefined) this[type] = [];
			this[type].unshift(fn);	// 尾部添加
			return function(){
				that.$off(type, fn);
			};
		},
		$off : function(type, listener){
			var fns = this[type];
			if(listener){
				for(var i=fns.length-1; i>=0; i--){
					if(fns[i] === listener) fns.splice(i, 1);
				}
			}else if(type){
				delete this[type];
			}
		},
		$emit : function (type, event) {
			var fns = this[type];
			if(fns instanceof Array){
				// 从后往前遍历
				for(var i=fns.length-1; i>=0; i--){
					fns[i](event);
				}
			}
		},
		$pipe : function(type, event){
			var fns = this[type],
				val = undefined;
			if(fns instanceof Array){
				fns = fns.slice();	// 使用原数组的一份拷贝
				if(event && !event.type) event.type = type;
				for(var i=fns.length-1; i>=0; i--){
					val = i === fns.length-1 ? fns[i](event) : fns[i](val);
				}
			}
			return val;
		},
		$clear: function (type) {
			if (type) {
				delete this[type];
			}
		}
	};
	// 事件绑定
	var dataManager = {},
		expando = 'fengc' + Date.now(),
		guidCounter = 1,
		handlerGUID = 1;
	var getData = function(el){
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
		};

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
				progress: empty_fn,
				start: empty_fn,
				end: empty_fn
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
			var dataType = type_of(data);
			if(dataType === 'object' || dataType === 'array'){
				JSON.stringify(data);
			}else{
				return data;
			}
		}],
		transformResponse : [function(data){
			// opts.dataType
			if(arguments[3] === 'json'){
				return JSON.parse(data);
			}
			return data;
		}]
	};
	var extendHttpConfig = function(opts){
		opts = extend({
			method : "get",
			url : "",
			timeout : 10000,
			dataType : "text",  // arraybuffer,blob,document,json,text,默认text
			success : empty_fn,
			failed : empty_fn,
			headers : {},
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
		var reqData = pipe(opts.transformRequest, opts.data, opts.headers);

		var xhr = new XMLHttpRequest();
		var xhrObj = {
			getAllResponseHeaders : function(){  return xhr.getAllResponseHeaders(); },
			getResponseHeader : function(){  return xhr.getResponseHeader(); }
		};
		var handler = function(action, response){
			if(!response){
				response = ("response" in xhr) ? xhr.response : xhr.responseText
			}
			// 转换响应
			var data = pipe(opts.transformResponse, response, xhr.status, opts.dataType);
			action(data, xhr.status, xhrObj);
			delete opts.transformRequest;
			delete opts.transformResponse;
			xhrObj = null;
		};

		xhr.open(opts.method, opts.url, true);
		xhr.onload = function () {
			if(xhr.status === 200){
				handler(opts.success);
			}else{
				xhr.onerror();
			}
		};
		xhr.onerror = function () {
			handler(opts.failed);
		};
		xhr.ontimeout = function () {
			handler(opts.failed, "timeout");
		};

		for (var key in opts.headers) {
			xhr.setRequestHeader(key, opts.headers[key]);
		}
		if(opts.dataType) xhr.responseType = opts.dataType;
		xhr.timeout = opts.timeout;

		xhr.send(opts.method === 'post' ? JSON.stringify(reqData) : null);
	};

	/*css transition切换
	.ui-leave{}
	.ui-leave-active{transition:all 2s ease; transform:translateX(100px); opacity:0;}
	.ui-enter{transform:translateX(100px); opacity:0;}
	.ui-enter-active{transition: all 2s ease;}
	*/

	/*var transition = new Transition(document.getElementById('div'));
	transition.toggle();*/
	var Transition = function(el, opts){
		this.el = el;
		this.parseTransition = new ParseTransition();
		this.init(opts);
	};
	Transition.prototype = {
		init : function(opts){
			this.opts = extend({
				cssClass : 'ui',
				onLeave : empty_fn,
				onEnter : empty_fn
			}, opts);
			this.status = getStyle(this.el, "display") !== "none";
			this.tid = null;
		},
		toggle : function(){
			if(this.tid === null){
				this.status ? this.leave() : this.enter();
			}
		},
		leave : function(){
			var that = this,
				el = this.el,
				cssClass = this.opts.cssClass;
			if(this.status !== true) return;
			addClass(el, cssClass + '-leave ' +  cssClass + '-leave-active');
			nextFrame(function(){
				removeClass(el, cssClass + '-leave');
				that.whenAnimationEnds(el, function(){
					addClass(el, 'ui-hide');
					removeClass(el, 'ui-show ' + cssClass + '-leave-active');
					that.status = false;
					that.tid = null;
					that.opts.onLeave();
				});
			});
		},
		enter : function(){
			var that = this,
				el = this.el,
				cssClass = this.opts.cssClass;
			if(this.status !== false) return;
			removeClass(el, 'ui-hide');
			addClass(el, "ui-show " + cssClass + '-enter ' + cssClass + '-enter-active');
			nextFrame(function(){
				removeClass(el, cssClass + '-enter');
				that.whenAnimationEnds(el, function(){
					removeClass(el, cssClass + '-enter-active')
					that.status = true;
					that.tid = null;
					that.opts.onEnter();
				});
			});
		},
		whenAnimationEnds : function(el, hook){
			this.tid = setTimeout(hook, this.parseTransition.getInfo(el));
		}
	};

	var ParseTransition = function(delay){
			this.delay = typeof delay === "number" ? delay : 1;
		},
		transformProp = typeof document.documentElement.style.transform === 'string' ? 'transform' : 'webkitTransform',
		transitionProp = 'transition',
		transitionEndEvent = 'transitionend',
		animationProp = 'animation',
		animationEndEvent = 'animationend';
	if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
		transitionProp = 'WebkitTransition';
		transitionEndEvent = 'webkitTransitionEnd';
	}
	if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
		animationProp = 'WebkitAnimation';
		animationEndEvent = 'webkitAnimationEnd';
	}

	ParseTransition.prototype = {
		getInfo : function(el){
			var cs = window.getComputedStyle(el),
				name = [animationProp + "Name"];
			// 如果没有动画，就用过渡的时间
			if(name === "none" || name === undefined){
				return this.getTransitionInfo(el, cs);
			}
			// 否则就用动画和过渡两者最大的那个时间
			else{
				return Math.max(this.getAnimationInfo(el, cs), this.getTransitionInfo(el, cs));
			}
		},
		getTransitionInfo : function(el, cs){
			if(!cs) cs = window.getComputedStyle(el);
			var delay = cs[transitionProp + 'Delay'],
				duration = cs[transitionProp + 'Duration'];
			return this.getTimeout(delay, duration);
		},
		getAnimationInfo : function(el, cs){
			if(!cs) cs = window.getComputedStyle(el);
			var delay = cs[animationProp + 'Delay'],
				duration = cs[animationProp + 'Duration'],
				count = cs[animationProp + 'IterationCount'];
			// 如果动画是无限次数，则只计算一次的时间
			if(count === "infinite") count = 1;
			return this.getTimeout(delay, duration, count);
		},
		getTimeout : function(delay, duration, count){
			if(count === undefined) count = 1;
			return Number(delay.slice(0, -1)) * 1000 + Number(duration.slice(0, -1)) * 1000 * count + this.delay;
		},
	};

	// 弹框 dialog
	/*
	<div class="ui-dialog">
		<div class="ui-dialog-bg"></div>
		<div class="ui-dialog-wrap"></div>
	</div>

	var popup = new $.Popup({
		cssClass : "",	// 弹框样式
		transitionCSS : "ui-popup",	// 过渡样式前缀
		hasBg : true,	// 是否显示背景
		bgClick : true,	// 点击背景是否要关闭弹框
		onClose : function(){},	// 弹框关闭的回调
		onDestroy : function(){},	// popup实例销毁的回调
		template : ""	// 弹框内容, 字符串或一个函数
	});
	popup.show();
	popup.hide();
	*/
	var hasPopup = false;
	var Popup = function(opt){
		this.dom = null;
		this.status = "hide";
		this.transition = null;
		this.init(opt);
	};
	Popup.prototype = {
		init : function(opt){
			var result = null,
				opt_type = "";
			if(this.status !== "hide" && this.status !== "show"){
				return;
			}
			this.opt = extend({
				cssClass : "",	// 弹框样式
				transitionCSS : "ui-popup",	// 过渡样式前缀
				hasBg : true,	// 是否显示背景
				bgClick : true,	// 点击背景是否要关闭弹框
				onClose : empty_fn,	// 弹框关闭的回调
				onOpen : empty_fn,	// 弹框打开的回调
				onDestroy : empty_fn,	// popup实例销毁的回调
				template : ""	// 弹框内容
			}, opt);
			if(!this.dom){
				this._addDOM();
				// 样式只添加一次
				if(!hasPopup){
					this._addCSS();
					hasPopup = true;
				}
				this.transition = new Transition(this.dom.popup, {
					cssClass : this.opt.transitionCSS
				});
			}else{
				this.transition.status = false;
				this.transition.opts.cssClass = this.opt.transitionCSS;
			}
			this._switchClass();

			opt_type = typeof this.opt.template;
			if(opt_type === "function"){
				result = this.opt.template(this);
				this.render(result);
			}else if(opt_type === "string"){
				this.render(this.opt.template);
			}else{
				throw "template is not a string or function!";
			}
		},
		primaryCSS : {
			popup : "ui-popup ui-hide",
			bg : "ui-popup-bg",
			wrap : "ui-popup-wrap"
		},
		_addDOM : function(){
			var that = this;
			var popup = document.createElement("div"),
				bg = document.createElement("div"),
				wrap = document.createElement("div");
			popup.className = this.primaryCSS.popup;
			wrap.className = this.primaryCSS.wrap;

			this.dom = {
				popup : popup,
				wrap : wrap
			};

			if(this.opt.hasBg){
				bg.className = this.primaryCSS.bg;
				popup.appendChild(bg);
				addEvent(bg, "click", function(){
					if(that.opt.bgClick){
						that.hide();
					}
				});
				this.dom.bg = bg;
			}else{
				bg = null;
			}

			popup.appendChild(wrap);
			document.body.appendChild(popup);
		},
		_addCSS : function(){
			var css = "";
			css += ".ui-popup{position:fixed; left:0; top:0; width:100%; height:100%; z-index:99;}\n";
			css += ".ui-popup-bg{width:100%; height:100%; background-color:#000; opacity:.5;}\n";
			css += ".ui-popup-wrap{position:absolute;background-color:#fff;}";
			addCSS(css);
		},
		_switchClass : function(){
			if(this.opt.hasBg){
				this.dom.bg.className = this.primaryCSS.bg;
			}/* else{
				this.dom.bg.className = this.primaryCSS.bg + " ui-hide";
			} */

			if(this.opt.cssClass){
				this.dom.popup.className = this.primaryCSS.popup + " " + this.opt.cssClass;
			}else{
				this.dom.popup.className = this.primaryCSS.popup;
			}
		},
		render : function(node){
			if(typeof node === "string"){
				node.replace(/<script[\s\S]+?<\/script>/gi, "");
				this.dom.wrap.innerHTML = node;
			}
			else if(node instanceof HTMLElement){
				this.dom.wrap.appendChild(node);
			}else{
				throw "template is not a string or HTMLElement.";
			}
		},
		show : function(){
			if(this.status === "hide"){
				this.status = "show";
				this.transition.enter();
				this.opt.onOpen(this);
			}
		},
		hide : function(){
			if(this.status === "show"){
				this.status = "hide";
				this.transition.leave();
				this.opt.onClose(this);
			}
		},
		toggle : function(){
			if(this.status === "hide") this.show();
			else if(this.status === "show") this.hide();
		},
		destroy : function(){
			this.opt.onDestroy(this);
			removeEvent(this.popupBg, "click");
			this.dom.wrap.innerHTML = "";
			this.status = "destroy";
			document.body.removeChild(this.dom.popup);
			this.opt = null;
			this.dom = null;
			this.transition = null;
		}
	};


	// 异步队列
	/*$.queueTask.combine({
		queues : ["imgs/1.jpg", "imgs/2.jpg", "imgs/3.jpg", "imgs/4.jpg", "imgs/5.jpg", "imgs/9.jpg"],
		async : function(data, def){
			var img = new Image();
			img.src = data.item;
			img.onload = function(e){
				def.resolve("0");
			};
			img.onerror = function(e){
				def.reject("error");
			};
		},
		success : function(data){
			console.log(data);
		},
		failed : function(data){
			console.log(data);
		}
	});*/
	var async = function(){
		var args = toArray(arguments),
			defer = args.pop();
		if(typeof callback !== "function") throw "async function missing callback!";
		setTimeout(function(){
			defer.resolve.apply(null, args);
		}, 1000);
	};
	var queueTask = {
		// 串行
		series : function(opt){
			opt = extend({
				queues : [],
				async : async,
				success : empty_fn,
				failed : empty_fn,
			}, opt);
			var results = [],	// 保存每个异步的返回结果
				index = 0;
			var defer = {
				resolve : function(data){
					results.push(data);
					recursion(opt.queues[index]);
				},
				reject : function(data){
					opt.failed.call(null, data);
					nextFrame(function(){ opt.queues.length = 0; defer = null; });
				}
			};
			var recursion = function(item){
				if(item){
					// 四个参数(当前队列，当前索引，队列，回调)
					opt.async.call(null, {
						item : item,
						index : index++,
						queues : opt.queues
					}, defer);
				}else{
					opt.success.call(null, results);	// 结果
					nextFrame(function(){ opt.queues.length = 0; defer = null; });
				}
			};
			recursion(opt.queues[index]);
		},
		// 并行
		parallel : function(opt){
			opt = extend({
				queues : [],
				async : async,
				success : empty_fn,
				failed : empty_fn,
			}, opt);
			var results = [],
				index = 0;
			var defer = {
				resolve : function(data){
					results.push(data);
					if(results.length === opt.queues.length){
						opt.success.call(null, results);	// 结果
						nextFrame(function(){ opt.queues.length = 0; defer = null; });
					}
				},
				reject : function(data){
					opt.failed.call(null, data);
					nextFrame(function(){ opt.queues.length = 0; defer = null; });
				}
			};
			foreach(opt.queues, function(result, i){
				// 四个参数(当前队列，当前索引，队列，回调)
				opt.async.call(null, {
						item : result,
						index : index++,
						queues : opt.queues
					}, defer);
			});
		},
		// 并行与串行结合
		combine : function(opt){
			opt = extend({
				queues : [],
				async : async,
				success : empty_fn,
				failed : empty_fn,
				limit : 2		// 限制并行个数
			}, opt);
			var results = [],
				item = null,
				index = 0,
				running = 0;
			var defer = {
				resolve : function(data){
					results.push(data);
					running--;
					if(index < opt.queues.length) recursion();
					else if(running === 0){
						opt.success.call(null, results);	// 结果
						nextFrame(function(){ opt.queues.length = 0; defer = null; });
					}
				},
				reject : function(data){
					opt.failed.call(null, data);
					nextFrame(function(){ opt.queues.length = 0; defer = null; });
				}
			};
			var recursion = function(){
				while(running < opt.limit && index < opt.queues.length){
					item = opt.queues[index++];
					// 四个参数(当前队列，当前索引，队列，回调)
					opt.async.call(null, {
						item : item,
						index : index,
						queues : opt.queues
					}, defer);
					running++;
				}
			};
			recursion();
		}
	};

	// 计数器
	var Counter = function(opt){
		this.opt = extend({
			startFn : empty_fn,
			endFn : empty_fn,
			timeoutFn : empty_fn,
			timeout : 10 * 1000	// 默认超时10s
		}, opt);
		this.count = 0;
		this.tid = 0;
	};
	Counter.prototype = {
		increment : function(){
			clearTimeout(this.tid);
			this.tid = setTimeout(function(that){
				that.count = 0;
				that.opt.timeoutFn();
				that.opt.endFn();
			}, this.opt.timeout, this);
			if(this.count++ === 0){
				this.opt.startFn();
			}
		},
		reduction : function(){
			if(this.count === 1){
				this.count = 0;
				clearTimeout(this.tid);
				this.opt.endFn();
			}else if(this.count > 1){
				this.count--;
			}else{
				this.count = 0;
				clearTimeout(this.tid);
			}
		}
	};

	var define = function(obj, key, val, custom){
		Object.defineProperty(obj, key, {
			enumerable : true,
			configurable : true,
			get : function(){
				if(custom && custom.get){
					val = custom.get(obj, key, val);
				}
				return val;
			},
			set : function(newVal){
				if(newVal === val) return;
				if(custom && custom.set){
					val = custom.set(obj, key, newVal);
				}else{
					val = newVal;
				}
			}
		});
	};

	// MVC
	/*
	html:
	<div id="div">
		<p @click = "add($event, this)">{{ a[0] }} - {{ b }}</p>
		<p :show = "c">{{ d(a[1], b) }}</p>
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
	var INTERPOLATE = /{{.*?}}/;
	var LITERALS = {
		'true' : true,
		'false' : true,
		'this' : true,
		'undefined' : true,
		'null' : true,
		'Number' : true,
		'String' : true,
		'Date' : true,
		'Object' : true,
		'Array' : true,
		'Math' : true
	};
	var OPERATORS = {
		'+' : true,
		'!' : true,
		'-' : true,
		'*' : true,
		'/' : true,
		'%' : true,
		'==' : true,
		'!=' : true,
		'===' : true,
		'!==' : true,
		'>' : true,
		'<' : true,
		'<=' : true,
		'>=' : true,
		'=' : true,
		'&&' : true,
		'||' : true,
		'|' : true,
		'&' : true
	};
	var ILLEGAL_CHARACHER = {
		'window' : true,
		'constructor' : true,
		'__proto__' : true,
		'__defineGetter__' : true,
		'__defineSetter__' : true,
		'__lookupGetter__' : true,
		'__lookupSetter__' : true
	};

	// 面向接口而不是实现编程
	// Lexer把字符串解析成各个子节点
	var Lexer = function(text){
		this.text = text;
	};
	Lexer.prototype = {
		lex : function(text){
			var ch,
				length = text.length;
			this.text = text;
			this.index = 0;
			this.ch;
			this.tokens = [];
			while(this.index < length){
				ch = this.ch = this.text.charAt(this.index);
				// 空白字符
				if(this.isWhitespace(ch)) this.index++;
				// 数字, 小数
				else if(this.isNumber(ch)){
					this.readNumber();
				}
				// 字符串
				else if(this.is('\'"')){
					this.readString(ch);
				}
				// 标识符
				else if(this.isIdent(ch)){
					this.readIdent();
				}
				// 点
				else if(this.is('.')){
					this.tokens.push(['dot', ch]);
					this.index++;
				}
				// 数组 对象 函数调用 三元运算符
				else if(this.is('[],{}:()?;')){
					this.tokens.push(['expression', ch]);
					this.index++;
				}
				// 一元运算符 关系运算符
				else{
					var ch2 = ch + this.peek(),
						ch3 = ch2 + this.peek(2),
						op = OPERATORS[ch],
						op2 = OPERATORS[ch2],
						op3 = OPERATORS[ch3];
					if(op || op2 || op3){
						var token = op3 ? ch3 : (op2 ? ch2 : ch);
						this.tokens.push(['operator', token]);
						this.index += token.length;
					}else{
						throw 'Unexpected next character: ' + ch;
					}
				}
			}
			return this.tokens;
		},
		peek : function(n){
			n = n || 1;
			var index = this.index + n;
			return index < this.text.length ?
				this.text.charAt(index) : false;
		},
		is : function(chs){
			return chs.indexOf(this.ch) !== -1;
		},
		isWhitespace : function(ch){
			return ch === ' ' || ch === '\r' || ch === '\t' || ch === '\n';
		},
		isNumber : function(ch){
			return '0' <= ch && ch <= '9';
		},
		isIdent : function(ch){
			return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_' || ch === '$';
		},
		readString : function(quote){
			this.index++;
			var string = quote,
				length = this.text.length,
				ch,
				hex,
				replacement;
			while(this.index < length){
				ch = this.text.charAt(this.index);
				string += ch;
				if(ch === quote){
					this.index++;
					this.tokens.push(['string', string]);
					return;
				}
				this.index++;
			}
		},
		readIdent : function(){
			var ch = '',
				text = '',
				length = this.text.length;
			while(this.index < length){
				ch = this.text.charAt(this.index);
				if(this.isIdent(ch) || this.isNumber(ch)){
					text += ch;
					this.index++;
				} else break;
			}
			this.tokens.push([LITERALS[text] ? 'literal' : 'property', text]);
		},
		readNumber : function(){
			var number = '',
				length = this.text.length,
				ch = '';
			while(this.index < length){
				ch = this.text.charAt(this.index);
				if(this.isNumber(ch) || ch === '.') number += ch;
				else break;
				this.index++;
			}
			this.tokens.push(['number', number]);
		}
	};

	var Compiler = function(){
		this.lexer = new Lexer();
	};
	Compiler.prototype = {
		compiler : function(text){
			var self = this,
				tokens = this.lexer.lex(text),
				item, type,
				fnString = 'if(!s) s={};var _t=';

			for(var i=0, l=tokens.length; i<l; i++){
				item = tokens[i];
				type = item[0];
				if(type === 'property' && ILLEGAL_CHARACHER[item[1]]){
					this.ensureSafeMemberName(item[1]);
				}

				// 如果当前是属性, 并且前面一个不是.符号, 那么添加
				if(type === 'property' && (i === 0 || tokens[i-1][0] !== 'dot')){
					fnString += this._if(item[1]) + item[1];
				}
				else if(type === 'literal' && item[1] === 'this'){
					fnString += 's';
				}else{
					fnString += item[1];
				}
			}
			fnString += ';return _t;';
			// console.log(fnString);
			tokens = null;
			return new Function('s', 'l', fnString);
		},
		_if : function(text){
			return '(l&&"' + text + '" in l?l:s).'
		},
		ensureSafeMemberName : function(name){
			throw '>compiler - 非法属性: "' + name + '"';
		}
	};

	var Parser = function($filter){
		this.compiler = new Compiler();
	};
	Parser.prototype = {
		parse : function(text){
			return this.compiler.compiler(text);
		}
	};
	var parser = new Parser();

	// TODO
	var directivesManage = {
		'@click' : {
			compile : function(){
				return function(node, model){
					var expr = parser.parse(node.getAttribute('@click'));
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
		':show' : {
			compile : function(){
				return function(node, model){
					model.$watch(node.getAttribute(':show'), function(newValue){
						if(newValue){
							removeClass(node, 'ui-hide');
						}else{
							addClass(node, 'ui-hide');
						}
					});
				};
			}
		},
		// <input type="text" :text="a"> {{a}}
		':text' : {
			compile : function(){
				return function(node, model){
					var type = node.getAttribute('type'),
						prop = node.getAttribute(':text');
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
	var $eval = function(expr){
			return parser.parse(expr);
		},
		interpolate = function(text){
			var index = 0,
				start = 0, end = 0;
			var parts = [],
				expr = '';
			while(index < text.length){
				start = text.indexOf('{{', index);
				// 如果匹配到了{{
				if(start !== -1){
					end = text.indexOf('}}', start + 2);
				}
				// 如果匹配到了{{和}}
				if(start !== -1 && end !== -1){
					// 如果匹配的{{位置不在索引位置
					if(start !== index){
						parts.push(text.substring(index, start));
					}
					expr = text.substring(start + 2, end);
					parts.push($eval(expr));
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
			foreach(nodes, function(node, i){
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
				foreach(linkFns, function (linkFn) {
					var idx = linkFn.idx;
					stableNodeList[idx] = nodes[idx];
				});
				foreach(linkFns, function (linkFn) {
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
				foreach(node.attributes, function(attr){
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
				foreach(preLinkFns, function(pre){
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
				watchFn = $eval(watchFn);
			}

			var watcher = {
				watchFn : watchFn,
				listenerFn : listenerFn || empty_fn,
				valueEq : !!valueEq,
				last : empty_fn
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
								(oldValue === empty_fn ? newValue : oldValue),
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
			return $eval(expr)(this, locals);
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
				dirs = inherit({}, directivesManage),
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
	ready(function(){
		addCSS('.ui-hide{display:none !important;}\n.ui-show{display:block !important;}');
	});

	var _ = function(selector){
		if(typeof selector === "function"){
			ready(selector);
		}
		else if (selector[0] === '<') {
			return parseHTML(selector);
		} else {
			return getDOM(selector);
		}
	};


	extend(_, {
		type : type_of,
		uuid : globalID,
		constant : constant,
		extend : extend,
		clone : clone,
		isEmpty : isEmpty,
		toArray: toArray,
		times: times,
		foreach: foreach,
		map: map,
		every: every,
		some: some,
		filter: filter,
		indexOf: indexOf,
		reduce: reduce,
		trim : trim,
		unique: unique,
		debounce : debounce,
		throttle: throttle,
		bind: bind,
		addClass : addClass,
		removeClass : removeClass,
		addCSS : addCSS,
		getStyle : getStyle,
		pipe : pipe,
		everyChild : everyChild,
		diff_time : diff_time,
		countDown : countDown,
		pattern : pattern,
		parseInt : parseInt,
		parseHTML : parseHTML,
		nextFrame : nextFrame,
		on : addEvent,
		off : removeEvent,
		domAll : getDOMAll,
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
		inherit : inherit,
		/* inherit: function (C, P, prototype) {
			// 函数与函数之间的继承
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
		}, */
		ready: ready,
		adapt: {
			/*
			@param {Number} deviceWidth 设备宽度
			@param {Number} psdWidth psd设计稿宽度
			@discussion rem(640, 640); 640px的psd稿里，100px的图层宽度在网页里就是1rem
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
				/*JavaScript中日期是以0为起始，所以new Date(2015,5,15)实际为2015年6月15日*/
				var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);    //编码
				if(expires instanceof Date) cookieText += "; expires=" + expires.toGMTString();     //设置cookie过期时间
				if(path) cookieText += "; path=" + path;    //域名下的路径
				if(domain) cookieText += "; domain=" + domain;  //域名
				if(secure) cookieText += "; secure";    //标识符，SSL连接才能传输
				document.cookie = cookieText;
			},
			unset : function(name, path, domain, secure){
				this.set(name, "", new Date(0), path, domain, secure);
			}
		},
		storage : {
			getLocal: function (key) {
				var value = localStorage.getItem[key];
				if(typeof value === "string" || typeof value === "undefined") return value;
				else return JSON.parse(value);
			},
			setLocal: function (key, value) {
				localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
			},
			removeLocal: function (key) {
				if (key !== undefined) {
					localStorage.removeItem(key);
				} else {
					localStorage.clear();
				}
			},
			getSession: function (key) {
				var value = sessionStorage.getItem[key];
				if(typeof value === "string" || typeof value === "undefined") return value;
				else return JSON.parse(value);
			},
			setSession: function (key, value) {
				sessionStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
			},
			removeSession: function (key) {
				if (key !== undefined) {
					sessionStorage.removeItem(key);
				} else {
					sessionStorage.clear();
				}
			}
		},
		queueTask : queueTask,
		Animate : Animate,
		http : http,
		Transition : Transition,
		ParseTransition : ParseTransition,
		Popup : Popup,
		Counter : Counter,
		define : define,
		MVC : MVC
	});

	return _;
});
