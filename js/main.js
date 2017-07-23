var uploadFileArea = document.getElementById("input");
var htmlShow = document.getElementById("htmlshow");
var errorShow = document.getElementById("errorshow");
var codeArea = document.getElementById("codeedit");
var runCodeButton = document.getElementById("runcode");
var visualization = document.getElementById("visualize");

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
					let endIndex = isTag ? i + 1: i;
					let text = htmlReader.result.substring(startIndex, endIndex);
					
					if(isTag){
						appendColoredText(htmlShow, "<", "normaltext");
						let isEndTag = (text[1] === '/');
						let isSelfClosingTag = (text[text.length - 2] === '/');

						if(isEndTag)
							appendColoredText(htmlShow, "/", "normaltext");

						let attrStart = isEndTag ? 2 : 1;
						let attrEnd = isSelfClosingTag ? text.length - 2 : text.length - 1;
						let subText = text.substring(attrStart, attrEnd);

						let lastSpaceStart = 0;
						let tagNameAppeared = false;
						let re = /([^\s\=]+)(?:(\s*=\s*)(\S+))?/g;

						let matchedText = re.exec(subText);
						while(matchedText){
							let spaces = subText.substring(lastSpaceStart, matchedText.index);
							appendColoredText(htmlShow, spaces, "normaltext");
							if(!tagNameAppeared){
								appendColoredText(htmlShow, matchedText[0], "tagtext");//red
								tagNameAppeared = true;
							}
							else{
								if(matchedText[1])
									appendColoredText(htmlShow, matchedText[1], "attrtext");//green
								if(matchedText[2])
									appendColoredText(htmlShow, matchedText[2], "normaltext");
								if(matchedText[3])
									appendColoredText(htmlShow, matchedText[3], "valuetext");//yellow
							}
							lastSpaceStart = matchedText.index + matchedText[0].length;
							matchedText = re.exec(subText);							
						}
						let spaces = subText.substring(lastSpaceStart);
						let finalChars = isSelfClosingTag ? spaces + "/>" : spaces + ">";
						appendColoredText(htmlShow, finalChars, "normaltext");
					}
					else{
						appendColoredText(htmlShow, text, "normaltext");
					}
					startIndex = endIndex;
				}
				else if (ch === '\n') {
					lineNumber++;
					let text = htmlReader.result.substring(startIndex, i);

					appendColoredText(htmlShow, text, "normaltext");
					htmlShow.appendChild(document.createElement("br"));
					appendColoredText(htmlShow, String(lineNumber) + " ", "linenumbertext");

					startIndex = i + 1;
				}
			}
		}
	}

	htmlReader.addEventListener("load", tokenize);
	htmlReader.readAsText(file);
}
uploadFileArea.addEventListener("click", function() {
	uploadFileArea.value = '';
}, false);
uploadFileArea.addEventListener("change", handleUploadFile, false);



//TODO: add time stamp; add line number
function addErrorMessage(e) {

	var errorName = e.name;
	var msg = e.message;
	var msgTypeNode = document.createElement("font");
	var msgTypeTextNode = document.createTextNode(errorName + ": ")
	msgTypeNode.appendChild(msgTypeTextNode);
	msgTypeNode.style.color = "yellow";
	var msgTextNode = document.createTextNode(msg);

	var msgSpan = document.createElement("span");

	msgSpan.appendChild(msgTypeNode);
	msgSpan.appendChild(msgTextNode);
	msgSpan.appendChild(document.createElement("br"));

	console.log(e.lineNumber);

	errorShow.appendChild(msgSpan);
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
		console.log(result);
	} catch (e) {
		addErrorMessage(e);
	} finally {
		codeArea.value = '';
	}
}
runCodeButton.addEventListener("click", runCode);