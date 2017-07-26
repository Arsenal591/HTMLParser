class DOMTree {
	constructor() {
		var __root = new DOMNode("document");
		__root.setDocument(this);
		var __idMap = new Map();
		var __currentPos = __root;
		this.buildDOMTree = function(token) {
			switch (token.type) {
				case 'str':
				{
					let newChild = new DOMNode("text");
					newChild.text = token.str;
					__currentPos.appendChild(newChild);
					break;
				}					
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
					__currentPos.appendChild(newChild);

					let errors = [];

					for(let errMsg of token.errorMessages){
						errors.push(new PraseError(errMsg, "warning"));
					}
					if(!isValidElement(token.tagName)){
						errors.push(new PraseError("This tag name may have not been standardlized: " 
													+ token.tagName
													, "warning"));
					}
					else{
						for(let attrName in token.attr){
							if(!isValidAttribute(attrName)){
								errors.push(new PraseError("This attribute name may have not \
															been standerdlized: " 
															+ attrName
															, "warning"));
							}
							else if(!isProperAttribute(token.tagName, attrName)){
								errors.push(new PraseError("The attribute '" 
															+ attrName 
															+ "'' may not be proper for tag '" 
															+ token.tagName 
															+ "'."
															, "warning"));
							}
						}
					}
					if(isSelfClosingElement(token.tagName)){
						if(!token.selfClosing){
							errors.push(new PraseError("You may forget to self-close the \
														self-closing tag: " 
														+ token.tagName
														, "warning"));
						}
					}
					else{
						if(token.selfClosing){
							errors.push(new PraseError("You have mistakenly self-closed the \
														un-self-closing tag: " 
														+ token.tagName
														, "fatal"));
						}
						__currentPos = newChild;
					}
					if(errors.length > 0){
						throw errors;
					}
					break;
				}
				case 'end':
				{
					let errors = [];
					if(isSelfClosingElement(token.tagName)){
						errors.push(new PraseError("You have mistakenly closing a self-closed tag: " 
													+ token.tagName
													, "fatal"));
					}
					else{
						if(__currentPos.tagName === token.tagName){
							__currentPos = __currentPos.parent;
						}
						else{
							let pos = __currentPos;
							while(pos && pos.tagName !== token.tagName)
								pos = pos.parent;
							if(pos)
								__currentPos = pos;
							errors.push(new PraseError("No match for end tag: " + token.tagName
														,"fatal"));
						}
					}
					if(errors.length > 0){
						throw errors;
					}
					break;
				}
			}
		}
		this.__getRoot = function(){return __root;}
		this.setId  = function(id,node){
			if(id && id.length)
				__idMap.set(id,node);
		}
		this.removeId = function(id){
			__idMap.delete(id);
		}
		this.getNodeById = function(id){
			return __idMap.get(id);
		}
	}
	get root(){
		return this.__getRoot();
	}
	find_all(_tagName, _attr, _str, limit = undefined, resursive = true){
		return this.root.find_all(_tagName, _attr, _str, limit, resursive);
	}
}