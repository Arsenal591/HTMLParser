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
			}
			else if(arg instanceof DOMNode){
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
			if(node.docuemnt)
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
			if(node.document)
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
			if(node.document)
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
					if(newChild.document)
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
					if(newChild.document)
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
	hasAttribute(k){
		return Boolean(this.attr[k]);
	}
	getAttribute(k) {
		k = k.toLowerCase();
		return this.attr[k];
	}
	setAttribute(k, v) {
		k = k.toLowerCase();
		this.attr[k] = v;
		if(k === "id" && this.document){
			this.document.__setIdMap(k, v);
		}
	}
}