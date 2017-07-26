var uploadFileArea = document.getElementById("input");
var htmlShow = document.getElementById("htmlshow");
var errorShow = document.getElementById("errorshow");
var codeArea = document.getElementById("codeedit");
var runCodeButton = document.getElementById("runcode");
var clearCodeButton = document.getElementById("clearcode");
var visualization = document.getElementById("visualize");
var detailShow = document.getElementById("detailshow");

//global varible: DOM Tree of the current *.html file.
var tree;

//The color of text is specified by its className.
function appendColoredText(parent, text, className) {

	text = text.replace(/[\n\r]/, "");
	var node = document.createElement("font");
	node.innerText = text;

	node.className += (" " + className);
	parent.appendChild(node);
}

function initializeHtmlShowArea(){
	removeAllChildren(htmlShow);
	appendColoredText(htmlShow, "1 ", "linenumbertext");
}

initializeHtmlShowArea();

function handleUploadFile() {
	initializeHtmlShowArea();
	var file = uploadFileArea.files[0];
	var htmlReader = new FileReader();

	//Tokenize the input *.html file, its result can be used for building a DOM tree, 
	//                                               and supporting syntax highlighting 
	function tokenize() {
		tree = new DOMTree();
		var machine = new TokenizeMachine();
		var lineNumber = 1;
		var startIndex = 0;//上一个token发出时的字符index，用于定位当前应当显示的字符串。

		for (let i = 0; i < htmlReader.result.length; i++) {
			let ch = htmlReader.result[i];

			try {
				machine.transfer(ch);
			} catch (errors) { // if there is any error, show it(them) in the box.
				if (!(errors instanceof Array))
					errors = [errors];
				for (let err of errors) {
					err.lineNumber = lineNumber;
					addErrorMessage(err);
				}
			} finally { // display current string, using RegExp to determine each part's color.
				if (machine.emitted) {
					let isTag = (htmlReader.result[startIndex] === '<' && htmlReader.result[i] === '>');
					let endIndex = isTag ? i + 1 : i;
					let text = htmlReader.result.substring(startIndex, endIndex);

					if (isTag) {
						appendColoredText(htmlShow, "<", "normaltext");
						let isEndTag = (text[1] === '/');
						let isSelfClosingTag = (text[text.length - 2] === '/');

						if (isEndTag)
							appendColoredText(htmlShow, "/", "normaltext");

						// locate the sub-string that represents name and attributes of the tag. 
						let attrStart = isEndTag ? 2 : 1;
						let attrEnd = isSelfClosingTag ? text.length - 2 : text.length - 1;
						let subText = text.substring(attrStart, attrEnd);

						let lastSpaceStart = 0;
						let tagNameAppeared = false;
						let re = /([^\s\=]+)(?:(\s*=\s*)((?:\".*?\")|(?:\'.*?\')|(?:[^\'\"\s]+)))?/g;

						let matchedText = re.exec(subText);
						while (matchedText) {
							// correctly display the spaces.
							let spaces = subText.substring(lastSpaceStart, matchedText.index);
							appendColoredText(htmlShow, spaces, "normaltext");

							if (!tagNameAppeared) {
								appendColoredText(htmlShow, matchedText[0], "tagtext"); //red
								tagNameAppeared = true;
							} else {
								if (matchedText[1]) // attribute name part
									appendColoredText(htmlShow, matchedText[1], "attrtext"); //green
								if (matchedText[2]) // equal sign part(may be inexistent)
									appendColoredText(htmlShow, matchedText[2], "normaltext");
								if (matchedText[3])// attribute value part(may be inexistent)
									appendColoredText(htmlShow, matchedText[3], "valuetext"); //yellow
							}
							lastSpaceStart = matchedText.index + matchedText[0].length;
							matchedText = re.exec(subText);
						}
						let spaces = subText.substring(lastSpaceStart);
						let finalChars = isSelfClosingTag ? spaces + "/>" : spaces + ">";
						appendColoredText(htmlShow, finalChars, "normaltext");
					} else {
						appendColoredText(htmlShow, text, "normaltext");
					}
					startIndex = endIndex;
				} else if (ch === '\n') {
					lineNumber++;
					let text = htmlReader.result.substring(startIndex, i);

					htmlShow.appendChild(document.createElement("br"));
					appendColoredText(htmlShow, String(lineNumber) + " ", "linenumbertext");

					appendColoredText(htmlShow, text, "normaltext");

					startIndex = i + 1;
				}
			}
		}

		redraw(tree.root);
	}

	htmlReader.addEventListener("load", tokenize);
	htmlReader.readAsText(file);
}
uploadFileArea.addEventListener("click", function() {
	uploadFileArea.value = '';
}, false);
uploadFileArea.addEventListener("change", handleUploadFile, false); 
 

function addErrorMessage(e) {
	var errorName = e.name;
	var msg = e.message;
	var isWarning = (e.level === "warning");
	var timeString = new Date().toLocaleTimeString();

	appendColoredText(errorShow, timeString + "    ", "timestamptext");

	var errorStyle = isWarning ? "warningtext" : "fataltext";
	appendColoredText(errorShow, errorName + ": ", errorStyle);

	appendColoredText(errorShow, msg, "normaltext");

	if (e.lineNumber)
		appendColoredText(errorShow, "    at line " + e.lineNumber, "normaltext");

	errorShow.appendChild(document.createElement("br"));
}

function removeAllChildren(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function runCode() {
	var src = codeArea.value;
	if(/^\s*$/.test(src))
		return;
	try {
		var result = eval(src);
		if (result instanceof DOMNode) {
			redraw(result);
		}
		else{
			redraw();
			addOutputMessage(result);
		}
	} catch (e) {
		addErrorMessage(e);
	} finally {
		codeArea.value = '';
	}
}
runCodeButton.addEventListener("click", runCode);

function clearCode() {
	codeArea.value = '';
}
clearCodeButton.addEventListener("click", clearCode);

//show details of a DOMNode
function addDetailMessage(node) {
	removeAllChildren(detailShow);

	appendColoredText(detailShow, "Type : " + node.type, "normaltext");
	detailShow.appendChild(document.createElement("br"));

	if (node.type === "text") {
		appendColoredText(detailShow, "Text : " + node.text, "normaltext");
		detailShow.appendChild(document.createElement("br"));
	} else {
		appendColoredText(detailShow, 
						"Tag name : " + (node.tagName.length ? node.tagName : "None")
						, "normaltext");
		detailShow.appendChild(document.createElement("br"));

		appendColoredText(detailShow, "Id : " + (node.id || "None"), "normaltext");
		detailShow.appendChild(document.createElement("br"));

		appendColoredText(detailShow, "Class : ", "normaltext");
		var classString = "None";
		if (node.classes.length > 0)
			classString = node.classes.join(", ");
		appendColoredText(detailShow, classString, "normaltext");
		detailShow.appendChild(document.createElement("br"));

		appendColoredText(detailShow, "Attributes : ", "normaltext");
		if(Object.getOwnPropertyNames(node.attr).length > 0){
			detailShow.appendChild(document.createElement("br"));
			for(let attrName in node.attr){
				let value = node.attr[attrName];
				appendColoredText(detailShow, "----" + attrName + " : " + value, "normaltext");
				detailShow.appendChild(document.createElement("br"));
			}
		}
		else{
			appendColoredText(detailShow, "None", "normaltext");
		}
	}
}

function describeAsString(obj){
	var result = typeof(obj);
	if(obj === null)
		return "null";
	if(obj === undefined)
		return "undefined";
	return "(" + (typeof obj) + ")" + (obj.toString());
}

function describeObject(obj){
	if(typeof obj !== "object")
		return [describeAsString(obj)];
	else{
		var result = ["object: " + obj.constructor.name];
		for(let attr in obj){
			let value = obj[attr];
			result.push('----' + attr + " : " + describeAsString(value));
		}
		console.log(result);
		return result;
	}
}

//display information about an object
function addOutputMessage(obj){
	var result = describeObject(obj);
	var timeString = new Date().toLocaleTimeString();
	appendColoredText(detailShow, timeString + "  ", "timestamptext");
	
	for(let line of result){
		appendColoredText(detailShow, line, "normaltext");
		detailShow.appendChild(document.createElement("br"));
	}
}

window.addEventListener("resize", function() {
	redraw(currentCenter, true);
}, false)