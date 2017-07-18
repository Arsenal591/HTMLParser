class DOMNode {
	constructor() {
		if (arguments.length == 1) {
			let arg = arguments[0];
			if (typeof arg === "string") {
				this.type = arg;
				this.id = undefined;
				this.classes = [];
				this.tagName = '';
				this.children = [];
				this.text = '';
				this.attr = {};
				this.parent = null;
				this.document = null;
			} else if (arg instanceof DOMNode) {
				this.type = arg.type;
				this.id = arg.id;
				this.classes = arg.classes;
				this.tagName = arg.tagName;
				this.children = arg.children;
				this.text = arg.children;
				this.attr = arg.attr;
				this.parent = arg.parent;
				this.document = arg.document;
			}
		}
	}

	// a lot of generators
	* ancestorGenerator() {
		var pos = this.parent;
		while (pos) {
			yield pos;
			pos = pos.parent;
		}
	} * childGenerator() {
		for (let child of this.children)
			yield child;
	} * descendantGenerator() {
		for (let child of this.children) {
			yield child;
			let gen = this.f.call(child);
			let v = gen.next().value;
			while (v) {
				yield v;
				v = gen.next().value();
			}
		}
	} * nextSiblingGenerator() {
		var x = this.getNextSibling();
		while (x) {
			yield x;
			x = x.getNextSibling();
		}
	} * nextElementSiblingGenerator() {
		var x = this.getNextElementSibling();
		while (x) {
			yield x;
			x = x.getNextElementSibling();
		}
	} * previousSiblingGenerator() {
		var x = this.getPreviousSibling();
		while (x) {
			yield x;
			x = x.getPreviousSibling();
		}
	} * previousElementSiblingGenerator() {
		var x = this.getPreviousElementSibling();
		while (x) {
			yield x;
			x = x.getPreviousElementSibling();
		}
	}
	hasChild() {
		return this.children.length > 0;
	}
	getFirstChild() {
		if (this.children.length > 0)
			return this.children[0];
	}
	getLastChild() {
		if (this.children.length > 0)
			return this.children[this.children.length - 1];
	}
	getIndex() {
		var parent = this.parent;
		if (parent) {
			return parent.children.indexOf(this);
		} else {
			return -1;
		}
	}
	getNextSibling() {
		var index = this.getIndex();
		if (index > -1) {
			return this.parent.children[index + 1];
		} else {
			return undefined;
		}
	}
	getPreviousSibling() {
		var index = this.getIndex();
		if (index > -1) {
			return this.parent.children[index - 1];
		} else {
			return undefined;
		}
	}
	getNextElementSibling() {
		var index = this.getIndex();
		if (index > -1) {
			let parent = this.parent;
			let children = parent.children;
			let right = children.length;
			for (let i = index + 1; i < right; i++) {
				if (children[i].type === "element")
					return children[i];
			}
			return undefined;
		} else {
			return undefined;
		}
	}
	getPreviousElementSibling() {
		var index = this.getIndex();
		if (index > -1) {
			let parent = this.parent;
			let children = parent.children;
			let left = -1;
			for (let i = index - 1; i > left; i--) {
				if (children[i].type === "element")
					return children[i];
			}
			return undefined;
		} else {
			return undefined;
		}
	}
	isChildOf(node) {
		return this.parent === node;
	}
	isDescendantOf(node) {
		var pos = this.parent;
		while (pos) {
			if (pos === node)
				return true;
			pos = pos.parent;
		}
	}
	isParentOf(node) {
		return node ? node.parent === this : false;
	}
	isAncestorOf(node) {
		return node ? node.isDescendantOf(this) : false;
	}
	isSilbingOf(node) {
		return this.parent === node.parent;
	}
	removeChild(node) {
		var index = this.children.indexOf(node);
		if (index > -1) {
			this.children.splice(index, 1);
			if (node.docuemnt)
				node.document.removeId(node.id);
		}
		node.parent = null;
	}
	appendChild(node) {
		if (node.type !== "document") {
			var parent = node.parent;
			if (parent) {
				parent.removeChild(node);
			}
			node.parent = this;
			node.document = this.document;
			if (node.document)
				node.document.setId(node.id, node);
			this.children.push(node);
		} else {
			for (let child of node.children)
				this.appendChild(child);
		}
	}
	unshiftChild(node) {
		if (node.type === "document") {

		} else {
			var parent = node.parent;
			if (parent) {
				parent.removeChild(node);
			}
			node.parent = this;
			node.document = this.document;
			if (node.document)
				node.document.setId(node.id, node);
			this.children.unshift(node);
		}
	}
	insertBefore(newChild, refChild) {
		if (newChild.type === "document") {
			for (let child of newChild.children)
				this.insertBefore(child, refChild);
		} else {
			if (refChild === null || refChild === undefined) {
				this.appendChild(newChild);
			} else {
				var index = this.children.indexOf(refChild);
				if (index > -1) {
					var parent = newChild.parent;
					if (parent) {
						parent.removeChild(newChild);
					}
					newChild.parent = this;
					newChild.document = this.document;
					if (newChild.document)
						newChild.document.setId(newChild.id, newChild);
					this.children.splice(index, 0, newChild);
				}
			}
		}
	}

	insertAfter(newChild, refChild) {
		if (newChild.type === "document") {
			for (let child of newChild.children)
				this.insertAfter(child, refChild);
		} else {
			if (refChild === null || refChild === undefined) {
				this.unshiftChild(newChild);
			} else {
				var index = this.children.indexOf(refChild);
				if (index > -1) {
					var parent = newChild.parent;
					if (parent) {
						parent.removeChild(newChild);
					}
					newChild.parent = this;
					newChild.document = this.document;
					if (newChild.document)
						newChild.document.setId(newChild.id, newChild);
					this.children.splice(index + 1, 0, newChild);
				}
			}
		}

	}
	replaceChild(newChild, oldChild) {
		var index = this.children.indexOf(oldChild);
		if (index > -1) {
			let sibling = this.children[index + 1];
			this.removeChild(oldChild);
			this.insertBefore(newChild, sibling);
		}

	}
	hasAttribute(k) {
		return Boolean(this.attr[k]);
	}
	getAttribute(k) {
		k = k.toLowerCase();
		return this.attr[k];
	}
	setAttribute(k, v) {
		k = k.toLowerCase();
		this.attr[k] = v;
		if (k === "id" && this.document) {
			this.document.__setIdMap(k, v);
		}
	}
	find_all(_tagName, _attr, _str, limit = undefined, resursive = true) {
		var generator = resursive ? this.descendantGenerator() : this.childGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}

	_find_all(_tagName, _attr, _str, limit = undefined, generator) {
		var result = new Queryset();
		while (true) {
			let x = generator.next().value;
			if (x) {
				let flag = Queryset.fit(x, _tagName, _attr, _str);
				if (flag) {
					result.push(x);
					if (limit && result.length >= limit)
						break;
				}
			} else
				break;
		}

	}
}

class Queryset {
	constructor() {
		var _data = [];
		this.push = function(elem) {
			_data.push(elem);
		}
		this.__getData = function() {
			return _data;
		}
	};
	get data() {
		return this.__getData();
	}
	get length() {
		return this.__getData().length;
	}
	static fitAttr(node, key, value) {
		var nodeValue = node.attr[key];
		if (!nodeValue)
			return false;
		if (typeof value === "string") {
			if (value.startsWith("*="))
				return nodeValue.indexOf(value.substring(2)) > -1;
			else if (value.startsWith("^="))
				return nodeValue.startsWith(value.substring(2));
			else if (value.startsWith("$="))
				return nodeValue.endsWith(value.substring(2));
			else
				return nodeValue === value;
		} else if (value instanceof RegExp) {
			return value.test(nodeValue);
		}
	}
	static fit(node, _tagName, _attr, _str) {
		if (_tagName) {
			if (typeof _tagName === "string") {
				if (node.tagName !== _tagName)
					return false;
			} else if (_tagName instanceof Array) {
				for (let name of _tagName)
					if (node.tagName !== name)
						return false;
			}
		}
		if (_attr) {
			for (let key in _attr) {
				let value = _attr[key];
				if (typeof value === "string" || value instanceof RegExp) {
					if (!Queryset.fitAttr(node, key, value))
						return false;
				} else if (value instanceof Array) {
					for (let v of value) {
						if (!Queryset.fitAttr(node, key, v))
							return false;
					}
				}
			}
		}
		if (_str) {
			//TODO:
		}
		return true;
	}
	filter(_tagName, _attr, _str) {

	}
}