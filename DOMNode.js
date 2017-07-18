class DOMNode {
	constructor(type) {
		this.type = type;
		this.id = undefined;
		this.classes = [];
		this.tagName = '';
		this.children = [];
		this.text = '';
		this.attr = {};
		this.parent = null;
	}
	hasChild(){
		return this.children.length > 0;
	}
	getFirstChild(){
		if(this.children.length > 0)
			return this.children[0];
	}
	getLastChild(){
		if(this.children.length > 0)
			return this.children[this.children.length - 1];
	}
	removeChild(node){
		var index = this.children.indexOf(node);
		if(index > -1){
			this.children.splice(index, 1);
			this.text.splice(index, 2, this.text[index].concat(this.text[index+1]));
		}
		node.parent = null;
	}
	appendChild(node){
		var parent = node.parent;
		if(parent){
			parent.removeChild(node);
		}
		node.parent = this;
		this.children.push(node);
	}
}