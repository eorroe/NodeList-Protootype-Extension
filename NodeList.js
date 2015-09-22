(function(undefined) {
	var setProtoOf = Object.setPrototypeOf;
	function setProto(nodes, owner) {
		if(setProtoOf) {
			nodes.owner = owner;
			return setProtoOf(nodes, NL);
		} else {
			return new NodeList([nodes, owner]);
		}
	}

	function flatten(arr, owner) {
		var elms = [];
		for(var i = 0, l = arr.length; i < l; i++) {
			var el = arr[i];
			if(el instanceof Node || el === null || el === undefined) {
				elms.push(el);
			} else if(el instanceof window.NodeList || el instanceof HTMLCollection || el instanceof Array) {
				elms = NL.concat.call(elms, flatten(el));
			} else {
				arr.get = NL.get, arr.set = NL.set, arr.call = NL.call, arr.owner = owner;
				return arr;
			}
		}
		return new NodeList([elms, owner]);
	}

	function NodeList(args) {
		if(typeof args[0] === 'string') {
			var nodes = (args[1] || document).querySelectorAll(args[0]);
			for(var i = 0, l = this.length = nodes.length; i < l; i++) this[i] = nodes[i];
		} else if(args[0] instanceof Array || args[0] instanceof NodeList) {
			for(var i = 0, l = this.length = args[0].length; i < l; i++) this[i] = args[0][i];
			if(args[1]) this.owner = args[1];
		} else if(args[0] instanceof Node) {
			for(var i = 0, l = this.length = args.length; i < l; i++) this[i] = args[i];
		}
		return this;
	}

	var NL = NodeList.prototype = {
		includes: Array.prototype.includes || function includes(element, index) {
			return this.indexOf(element, index) > -1;
		},

		forEach: function forEach() {
			Array.prototype.forEach.apply(this, arguments);
			return this;
		},

		push: function push() {
			var push = Array.prototype.push.bind(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(!(arg instanceof Node)) throw Error('Passed arguments must be a Node');
				if(this.indexOf(arg) === -1) push(arg);
			}
			return this;
		},

		pop: function pop(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], pop = Array.prototype.pop.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(pop());
			return setProto(nodes, this);
		},

		unshift: function unshift() {
			var unshift = Array.prototype.unshift.bind(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(!(arg instanceof Node)) throw Error('Passed arguments must be a Node');
				if(this.indexOf(arg) === -1) unshift(arg);
			}
			return this;
		},

		shift: function shift(amount) {
			if(typeof amount !== "number") amount = 1;
			var nodes = [], shift = Array.prototype.shift.bind(this);
			for(var i = 0; i < amount; i++) nodes.push(shift());
			return setProto(nodes, this);
		},

		splice: function splice() {
			for(var i = 2, l = arguments.length; i < l; i++) {
				if(!(arguments[i] instanceof Node)) throw Error('Passed arguments must be a Node');
			}
			var nodes = Array.prototype.splice.apply(this, arguments);
			return setProto(nodes, this);
		},

		slice: function slice() {
			var nodes = Array.prototype.slice.apply(this, arguments);
			return setProto(nodes, this);
		},

		filter: function filter() {
			var nodes = Array.prototype.filter.apply(this, arguments);
			return setProto(nodes, this);
		},

		map: function map(cb, context) {
			var mapped = Array.prototype.map.apply(this, arguments);
			return flatten(mapped, this);
		},

		concat: function concat() {
			var nodes = flatten(this);
			for(var i = 0, l = arguments.length; i < l; i++) {
				var arg = arguments[i];
				if(arg instanceof Node) {
					if(nodes.indexOf(arg) === -1) nodes.push(arg);
				} else if(arg instanceof window.NodeList || arg instanceof HTMLCollection || arg instanceof Array || arg instanceof NodeList) {
					nodes = nodes.concat.apply(nodes, arg);
				} else {
					throw Error('Concat only takes a Node, NodeList, HTMLCollection, or Array of (Node, NodeList, HTMLCollection, Array)');
				}
			}
			nodes.owner = this;
			return nodes;
		},

		get: function get(prop) {
			var arr = [];
			for(var i = 0, l = this.length; i < l; i++) {
				var el = this[i];
				if(el === null || el === undefined) {
					arr.push(el); continue;
				}
				var item = el[prop];
				if(item instanceof Node && arr.indexOf(item) !== -1) continue;
				arr.push(item);
			}
			return flatten(arr, this);
		},

		set: function set(prop, value) {
			if(prop.constructor === Object) {
				for(var i = 0, l = this.length; i < l; i++) {
					var el = this[i];
					if(el) {
						for(var key in prop) {
							if(el[key] !== undefined) el[key] = prop[key];
						}
					}
				}
			} else {
				for(var i = 0, l = this.length; i < l; i++) {
					var el = this[i];
					if(el && el[prop] !== undefined) el[prop] = value;
				}
			}
			return this;
		},

		call: function call() {
			var arr = [], nodes = [], method = Array.prototype.shift.call(arguments), arrLen = 0, nodesLen = 0;
			for(var i = 0, l = this.length; i < l; i++) {
				var el = this[i];
				if(el === null || el === undefined) {
					arr.push(el), nodes.push(el);
				} else if(el[method] instanceof Function) {
					var funcCall = el[method].apply(el, arguments);
					if(funcCall instanceof Node && nodes.indexOf(funcCall) === -1) {
						nodesLen = nodes.push(funcCall);
					} else if(funcCall !== undefined) {
						arrLen = arr.push(funcCall);
					}
				}
			}
			if(nodesLen) {
				return setProto(nodes, this);
			} else if(arrLen) {
				return flatten(arr, this);
			}
			return this;
		},

		item: function(index) {
			var nodes = [this[index]];
			return setProto(nodes, this);
		},

		get asArray() {
			return Array.prototype.slice.call(this);
		}
	}

	var arrProps = ['join', 'copyWithin', 'fill'];
	Object.getOwnPropertyNames(Array.prototype).forEach(function(key) {
		if(arrProps.indexOf(key) === -1 && NL[key] === undefined) NL[key] = Array.prototype[key];
	});

	if(window.Symbol && window.Symbol.iterator) NL[Symbol.iterator] = NL.values = Array.prototype[Symbol.iterator];

	function setterGetter(prop) {
		if(div[prop] instanceof Function) {
			NL[prop] = function() {
				var arr = [], nodes = [], arrLen = 0, nodesLen = 0;
				for(var i = 0, l = this.length; i < l; i++) {
					var el = this[i];
					if(el === null || el === undefined) {
						arr.push(el), nodes.push(el);
					} else if(el[prop] instanceof Function) {
						var funcCall = el[prop].apply(el, arguments);
						if(funcCall instanceof Node && nodes.indexOf(funcCall) === -1) {
							nodesLen = nodes.push(funcCall);
						} else if(funcCall !== undefined) {
							arrLen = arr.push(funcCall);
						}
					}
				}
				if(nodesLen) {
					return setProto(nodes, this);
				} else if(arrLen) {
					return flatten(arr, this);
				}
				return this;
			}
		} else {
			Object.defineProperty(NL, prop, {
				get: function() {
					var arr = [];
					for(var i = 0, l = this.length; i < l; i++) {
						var el = this[i];
						if(el === null || el === undefined) {
							arr.push(el);
							continue;
						}
						var item = el[prop];
						if(item instanceof Node && arr.indexOf(item) !== -1) continue;
						arr.push(item);
					}
					return flatten(arr, this);
				},
				set: function(newVal) {
					for(var i = 0, l = this.length; i < l; i++) {
						var el = this[i];
						if(el && el[prop] !== undefined) el[prop] = newVal;
					}
				}
			});
		}
	}

	var div = document.createElement('div');
	for(var prop in div) setterGetter(prop);
	arrProps = div = prop = null;

	window.$$ = function NodeListJS() {
		return new NodeList(arguments);
	}
	window.$$.NL = NL;
})(undefined);