var uniqueIdForVisualization = 0;

class DOMNode {
	constructor() {
		this.uniqueId = uniqueIdForVisualization++;
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
				this.text = arg.text;
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
			let gen = child.descendantGenerator();
			let v = gen.next().value;
			while (v) {
				yield v;
				v = gen.next().value;
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
	getSiblingSum() {
		if(!this.parent)
			return 0;
		return this.parent.children.length - 1;
	}
	isChildOf(node) {
		return node ? this.parent === node : false;
	}
	isDescendantOf(node) {
		if (!node)
			return false;
		var pos = this.parent;
		while (pos) {
			if (pos === node)
				return true;
			pos = pos.parent;
		}
		return false;
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
	setDocument(d) {
		if (d === this.document)
			return;
		var oldDocument = this.document;
		if (oldDocument) {
			if (this.id)
				oldDocument.removeId(this.id);
		}
		this.document = d;
		if (this.id && d)
			d.setId(this.id, this);
		for (let child of this.children)
			child.setDocument(d);
	}
	removeChild(node) {
		var index = this.children.indexOf(node);
		if (index > -1) {
			this.children.splice(index, 1);
			node.setDocument(null);
			node.parent = null;
		}
		else{
			throw new RangeError("Parameter 1 is not a child of this node.")
		}
	}
	appendChild(node) {
		if (node === this || this.isDescendantOf(node)) {
			throw new RangeError("Paramter 1 is above this node, you cannot append it as a child.");
			return;
		}
		if (node.type !== "document") {
			var parent = node.parent;
			if (parent) {
				parent.removeChild(node);
			}
			node.parent = this;
			this.children.push(node);
			node.setDocument(this.document);
		} else {
			for (let child of node.children)
				this.appendChild(child);
		}
	}
	unshiftChild(node) {
		if (node === this || this.isDescendantOf(node)) {
			throw new RangeError("Paramter 1 is above this node, you cannot append it as a child.");
			return;
		}
		if (node.type === "document") {
			for (let child of node.chilren)
				this.unshiftChild(child);
		} else {
			var parent = node.parent;
			if (parent) {
				parent.removeChild(node);
			}
			node.parent = this;
			this.children.unshift(node);
			node.setDocument(this.document);
		}
	}
	insertBefore(newChild, refChild) {
		if (newChild === refChild) {
			throw new RangeError("newChild is the same as refChild");
			return;
		}
		if (newChild === this || this.isDescendantOf(newChild)) {
			throw new RangeError("newChild is above this node, you cannot append it as a child.");
			return;
		}
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
					index = this.children.indexOf(refChild);
					this.children.splice(index, 0, newChild);
					newChild.setDocument(this.document);
				}
				else{
					throw new RangeError("refChild is not a child of this node.");
				}
			}
		}
	}

	insertAfter(newChild, refChild) {
		if (newChild === refChild) {
			throw new RangeError("newChild is the same as refChild.");
			return;
		}
		if (newChild === this || this.isDescendantOf(newChild)) {
			throw new RangeError("newChild is above this node, you cannot append it as a child.");
			return;
		}
		if (newChild.type === "document") {
			let next = refChild.getNextSibling();
			for (let child of newChild.children)
				this.insertBefore(child, next);
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
					index = this.children.indexOf(refChild);
					this.children.splice(index + 1, 0, newChild);
					newChild.setDocument(this.document);
				}
				else{
					throw new RangeError("refChild is not a child of this node.");
				}
			}
		}
	}
	replaceChild(newChild, oldChild) {
		if (newChild === oldChild)
			return;
		if (this === newChild || this.isDescendantOf(newChild)) {
			throw new RangeError("newChild is above this node, you cannot append it as a child.")
			return;
		}
		var index = this.children.indexOf(oldChild);
		if (index > -1) {
			let sibling = this.children[index + 1];
			this.removeChild(oldChild);
			this.insertBefore(newChild, sibling);
		}
		else{
			throw new RangeError("oldChild is not a child of this node.");
		}

	}
	extract() {
		var parent = this.parent;
		if (parent) {
			parent.removeChild(this);
		}
		this.setDocument(null);
		return this;
	}
	decompose() {
		this.extract();
		for (let child of this.children) {
			child.decompose();
		}
	}
	toString() {
		if (this.hasChild()) {
			var res = '';
			for (let child of this.children) {
				res = res + child.toString();
			}
			return res;
		} else {
			return this.text;
		}
	}
	toXML() {
		if(this.type === "text")
			return this.text;
		else if(this.type === "element"){
			let preWrapper = '<' + this.tagName;
			let endWrapper = '</' + this.tagName + '>';
			for(let attrName in this.attr){
				let value = this.attr[attrName];
				let isDoubled = value.indexOf('"') > -1;
				preWrapper += (" " + attrName + "=");
				if(isDoubled)
					preWrapper += ('"' + value + '"');
				else
					preWrapper += ('"' + value + '"');
			}
			if(isSelfClosingElement(this.tagName)){
				preWrapper += '/';
				endWrapper = '';
			}
			preWrapper += '>';

			var result = preWrapper;
			for(let child of this.children){
				result += child.toXML();
			}
			result += endWrapper;
			return result;
		}
	}
	hasAttribute(k) {
		k = k.toLowerCase();
		return Boolean(this.attr[k]);
	}
	getAttribute(k) {
		k = k.toLowerCase();
		return this.attr[k];
	}
	setAttribute(k, v) {
		k = k.toLowerCase();
		this.attr[k] = v;
		if (k === "id") {
			this.id = v;
			if(this.document)
				this.document.setIdMap(v, this);
		} else if (k === "class") {
			this.classes = v.split(/\s+/).filter(x => x.length);
		}
	}
	find_all(_tagName, _attr, _str, limit = undefined, resursive = true) {
		var generator = resursive ? this.descendantGenerator() : this.childGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}
	find_all_ancestors(_tagName, _attr, _str, limit) {
		var generator = this.ancestorGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}
	find_all_descendants(_tagName, _attr, _str, limit) {
		var generator = this.descendantGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}
	find_all_previous_siblings(_tagName, _attr, _str, limit) {
		var generator = this.previousSiblingGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}
	find_all_next_siblings(_tagName, _attr, _str, limit) {
		var generator = this.nextSiblingGenerator();
		return this._find_all(_tagName, _attr, _str, limit, generator);
	}

	_find_all(_tagName, _attr, _str, limit = undefined, generator) {
		var result = new Queryset();
		while (true) {
			let x = generator.next().value;
			if (x) {
				let flag = Queryset.fit(x, _tagName, _attr, _str);
				if (flag) {
					result.add(x);
					if (limit && result.length >= limit)
						break;
				}
			} else
				break;
		}
		return result;
	}
}

class Queryset {
	constructor(set) {
		var _data = new Set(set);
		this.add = function(elem) {
			_data.add(elem);
		}
		this.__getData = function() {
			return _data;
		}
	};
	get data() {
		return this.__getData();
	}
	get size() {
		return this.__getData().size;
	}
	static fitAttr(node, key, value) {
		var nodeValue = node.attr[key];
		if (!nodeValue)
			return false;
		if (typeof value === "string") {
			if (key === "class") {
				if (value.startsWith("*="))
					return node.classes.some(x => x.indexOf(value.substring(2)) > -1);
				else if (value.startsWith("^="))
					return node.classes.some(x => x.startsWith(value.substring(2)));
				else if (value.startsWith("$="))
					return node.classes.some(x => x.endsWith(value.substring(2)));
				else
					return node.classes.some(x => x === value);
			} else {
				if (value.startsWith("*="))
					return nodeValue.indexOf(value.substring(2)) > -1;
				else if (value.startsWith("^="))
					return nodeValue.startsWith(value.substring(2));
				else if (value.startsWith("$="))
					return nodeValue.endsWith(value.substring(2));
				else
					return nodeValue === value;
			}
		} else if (value instanceof RegExp) {
			if (key === "class") {
				return node.classes.some(x => value.test(x));
			} else {
				return value.test(nodeValue);
			}
		}
	}
	static fit(node, _tagName, _attr, _str) {
		if (_tagName) {
			if (typeof _tagName === "string") {
				if (node.tagName !== _tagName)
					return false;
			} else if (_tagName instanceof Array) {
				let flag = _tagName.some(x => x === node.tagName);
				if (!flag)
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
					let flag = value.some(x => Queryset.fitAttr(node, key, x));
					if (!flag)
						return false;
				}
			}
		}
		if (_str) {
			if(typeof _str === "string"){
				if(node.text !== _str)
					return false;
			}
			else if(_str instanceof RegExp){
				if(!_str.test(node.text))
					return false;
			}
		}
		return true;
	}
	filter(_tagName, _attr, _str) {
		var result = new Queryset();
		for(let elem in this.data){
			if(Queryset.fit(elem, _tagName, _attr, _str))
				result.add(elem);
		}
		return result;
	}
	union(otherSet) {
		var thisSet = this.data;
		var thatSet = otherSet.data;
		var unionSet = new Set([...thisSet, ...thatSet]);
		return new Queryset(unionSet);
	}
	intersection(otherSet) {
		var thisSet = this.data;
		var thatSet = otherSet.data;
		var intersectionSet = new Set([...thisSet].filter(x => thatSet.has(x)));
		return new Queryset(intersectionSet);
	}
	difference(otherSet) {
		var thisSet = this.data;
		var thatSet = otherSet.data;
		var differenceSet = new Set([...thisSet].filter(x => !thatSet.has(x)));
		return new Queryset(differenceSet);
	}
}