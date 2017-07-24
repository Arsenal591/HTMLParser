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
htmlShow.setAttribute("readonly", true);

function appendColoredText(parent,
	text, className) {

	var node = document.createElement("font");
	node.innerText = text;

	node.className = className;
	parent.appendChild(node);
}

removeAllChildren(htmlShow);
appendColoredText(htmlShow, "1 ", "linenumbertext");

function handleUploadFile() {
	removeAllChildren(htmlShow);
	appendColoredText(htmlShow, "1 ", "linenumbertext");
	var file = uploadFileArea.files[0];
	var htmlReader = new FileReader();

	function tokenize() {
		tree = new DOMTree();
		var machine = new TokenizeMachine();
		var lineNumber = 1;
		var startIndex = 0;

		for (let i = 0; i < htmlReader.result.length; i++) {
			let ch = htmlReader.result[i];

			try {
				machine.transfer(ch);
			} catch (errors) {
				if (!(errors instanceof Array))
					errors = [errors];
				for (let err of errors) {
					err.lineNumber = lineNumber;
					addErrorMessage(err);
				}
			} finally {
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

						let attrStart = isEndTag ? 2 : 1;
						let attrEnd = isSelfClosingTag ? text.length - 2 : text.length - 1;
						let subText = text.substring(attrStart, attrEnd);

						let lastSpaceStart = 0;
						let tagNameAppeared = false;
						let re = /([^\s\=]+)(?:(\s*=\s*)(\S+))?/g;

						let matchedText = re.exec(subText);
						while (matchedText) {
							let spaces = subText.substring(lastSpaceStart, matchedText.index);
							appendColoredText(htmlShow, spaces, "normaltext");
							if (!tagNameAppeared) {
								appendColoredText(htmlShow, matchedText[0], "tagtext"); //red
								tagNameAppeared = true;
							} else {
								if (matchedText[1])
									appendColoredText(htmlShow, matchedText[1], "attrtext"); //green
								if (matchedText[2])
									appendColoredText(htmlShow, matchedText[2], "normaltext");
								if (matchedText[3])
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

					appendColoredText(htmlShow, text, "normaltext");
					htmlShow.appendChild(document.createElement("br"));
					appendColoredText(htmlShow, String(lineNumber) + " ", "linenumbertext");

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
	try {
		var result = eval(src);
		if (result instanceof DOMNode) {
			redraw(result);
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

function addDetailMessage(node) {
	removeAllChildren(detailShow);

	appendColoredText(detailShow, "Type : " + node.type, "normaltext");
	detailShow.appendChild(document.createElement("br"));

	if (node.type === "text") {
		appendColoredText(detailShow, "Text : " + node.text, "normaltext");
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



window.addEventListener("resize", function() {
	redraw(currentCenter, true);
}, false)