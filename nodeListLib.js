(function() {
	'use strict';
	function flatten(arr) {
		var nodes = [];
		for(var i = 0, l = arr.length; i < l; i++) {
			var n = arr[i];
			if(n instanceof Node) {
				nodes.push(n);
			} else if(n instanceof NodeList || n instanceof HTMLCollection || n instanceof Array) {
				for(var i2 = 0, l2 = n.length; i2 < l2; i2++) nodes.push(n[i2]);
			} else {
				return arr;
			}
		}
		nodes.__proto__ = NL;
		return nodes;
	}

	function newArrayMethodError(methodName) {
		return TypeError('The ' + methodName + ' Array Method Does Not Yet Exist In This Browser, NodeList.js Will Automatically Add It When It Does');
	}

	var NL = {
		keys:              Array.prototype.keys,
		entries:           Array.prototype.entries,
		indexOf:           Array.prototype.indexOf,
		lastIndexOf:       Array.prototype.lastIndexOf,
		every:             Array.prototype.every,
		some:              Array.prototype.some,
		reduce:            Array.prototype.reduce,
		reduceRight:       Array.prototype.reduceRight,
		pop:               Array.prototype.pop,
		shift:             Array.prototype.shift,
		sort:              Array.prototype.sort,
		reverse:           Array.prototype.reverse,
		values:            Array.prototype.values || newArrayMethodError('values'),
		find:              Array.prototype.find || newArrayMethodError('find'),
		findIndex:         Array.prototype.findIndex || newArrayMethodError('findIndex'),
		copyWithin:        Array.prototype.copyWithin || newArrayMethodError('copyWithin'),
		includes:          Array.prototype.includes || function includes(element) {
			return this.indexOf(element) > -1;
		},

		forEach: function() {
			Array.prototype.forEach.apply(this, arguments);
			return this;
		},

		push: function() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			return Array.prototype.push.apply(this, arguments);
		},

		unshift: function() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			return Array.prototype.unshift.apply(this, arguments);
		},

		splice: function() {
			for(var i = 2, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			return Array.prototype.splice.apply(this, arguments);
		},

		slice: function slice(begin, end) {
			var nodes = Array.prototype.slice.call(this, begin, end);
			nodes.__proto__ = NL;
			return nodes;
		},

		filter: function filter(cb) {
			var nodes = Array.prototype.filter.call(this, cb);
			nodes.__proto__ = NL;
			return nodes;
		},

		map: function map(cb) {
			var nodes = Array.prototype.map.call(this, cb),

			areAllNodes = nodes.every(function(el) {
				return el instanceof Node;
			});

			if(areAllNodes) {
				nodes.__proto__ = NL;
				return nodes;
			}
			return nodes;
		},

		concat: function concat() {
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(arg instanceof Node) {
					if(this.indexOf(arg) === -1) this.push(arg);
				} else if(arg instanceof NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg.__proto__ === NL) {
					for(var i2 = 0, l2 = arg.length; i2 < l2; i2++) {
						var el = arg[i2];
						if(el instanceof Node) {
							if(this.indexOf(el) === -1) this.push(arg);
						} else if(el instanceof NodeList) {
							for(var i3 = 0, l3 = el.length; i3 < l3; i3++) {
								if(this.indexOf(arg) === -1) this.push(el[i3]);
							}
						} else {
							throw Error(el.constructor.name + ': ' + el + ' is not a Node');
						}
					}
				} else {
					throw Error('Only Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection)');
				}
			}
			return this;
		},

		querySelectorAll: function querySelectorAll(selector) {
			var newNodes = [];
			for(var i = 0, l = this.length; i < l; i++) {
				var nodes = [], queriedNodes = this[i].querySelectorAll(selector);
				for(var i2 = 0, l2 = queriedNodes.length; i2 < l2; i2++) nodes.push(queriedNodes[i2]);
				newNodes.push(nodes);
			}
			return flatten(newNodes);
		},

		get: function get(prop) {
			var arr = [];
			for(var i = 0, l = this.length; i < l; i++) arr.push(this[i][prop]);
			return flatten(arr);
		},

		set: function set(prop, value, checkExistence) {
			if(checkExistence) {
				for(var i = 0, l = this.length; i < l; i++) {
					var element = this[i];
					if(element[prop] !== undefined) element[prop] = value;
				}
			} else {
				for(var i = 0, l = this.length; i < l; i++) this[i][prop] = value;
			}
			return this;
		}
	}

	if(window.Symbol && window.Symbol.iterator) NL[Symbol.iterator] = Array.prototype[Symbol.iterator];

	function setterGetter(prop) {
		try {
			if(HTMLElement.prototype[prop].constructor === Function) {
				NL[prop] = NL[prop] || function() {
					var arr = [], nodes = [];
					for(var i = 0, l = this.length; i < l; i++) {
						var element = this[i], funcCall = element[prop].apply(element, arguments);
						if(funcCall instanceof Node) {
							if(nodes.indexOf(funcCall) === -1) nodes.push(funcCall);
						} else if(funcCall !== undefined) {
							arr.push(funcCall);
						}
					}
					if(nodes.length) {
						nodes.__proto__ = NL;
						return nodes;
					} else if(arr.length) {
						return arr;
					}
					return this;
				}
			}
		} catch(e) {
			Object.defineProperty(NL, prop, {
				get: function() {
					var arr = [];
					for(var i = 0, l = this.length; i < l; i++) arr.push(this[i][prop]);
					return flatten(arr);
				},
				set: function(newVal) {
					for(var i = 0, l = this.length; i < l; i++) this[i][prop] = newVal;
				}
			});
		}
	}

	for(var prop in HTMLElement.prototype) setterGetter(prop);

	var getters = [document.querySelectorAll, document.getElementsByName, document.getElementsByClassName, document.getElementsByTagName];

	getters.forEach(function(getter) {
		var oldGetter = getter.bind(document);
		document[getter.name] = function(selector) {
			var nodes = oldGetter(selector), newNodes = [];
			for(var i = 0, l = nodes.length; i < l; i++) newNodes.push(nodes[i]);
			newNodes.__proto__ = NL;
			return newNodes;
		}
		document[getter.name].NL = NL;
	});
})();
