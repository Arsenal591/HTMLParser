class DOMTree {
	constructor() {
		var __root = new DOMNode("document");
		var __idMap = new Map();
		var __currentPos = __root;
		this.buildDOMTree = function(token) {
			switch (token.type) {
				case 'str':{
					let newChild = new DOMNode("text");
					newChild.text = token.str;
					newChild.parent = __currentPos;
					__currentPos.appendChild(newChild);
					break;
				}
					//__currentPos.text[__currentPos.children.length] = token.str;
					
				case 'start':
				{
					let newChild = new DOMNode("element");
					if (token.attr['id']) {
						newChild.id = token.attr['id'];
						__idMap.set(newChild.id, newChild);
					}
					if (token.attr['class'])
						newChild.classes = token.attr['class'].split(/\s+/).filter(x => x.length);
					newChild.tagName = token.tagName;
					newChild.attr = token.attr;
					newChild.parent = __currentPos;
					__currentPos.appendChild(newChild);
					if (!token.selfClosing)
						__currentPos = newChild;
					break;
				}
				case 'end':
					if (__currentPos.tagName !== token.tagName) {
						// raise an error
						console.log("fuck", __currentPos.tagName);
					} else {
						__currentPos = __currentPos.parent;
					}
					break;
			}
		}
		this.__getRoot = function(){return __root;}
		this.setId = function(id,node){
			if(id && id.length)
				__idMap.set(id,node);
		}
		this.removeId = function(id){
			__idMap.delete(id);
		}
	}
	get root(){
		return this.__getRoot();
	}
}