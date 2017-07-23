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
	text,
	color = 'black',
	family = 'Consolas',
	size = '16px') {

	var node = document.createElement("font");
	node.innerText = text;

	node.style.color = color;
	node.style.fontFamily = family;
	node.style.fontSize = size;

	parent.appendChild(node);
}

removeAllChildren(htmlShow);
appendColoredText(htmlShow, "1 ", "grey");

function handleUploadFile() {
	removeAllChildren(htmlShow);
	appendColoredText(htmlShow, "1 ", "grey");
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
						appendColoredText(htmlShow, "<", "white");
						let isEndTag = (text[1] === '/');
						let isSelfClosingTag = (text[text.length - 2] === '/');

						if(isEndTag)
							appendColoredText(htmlShow, "/", "white");

						let attrStart = isEndTag ? 2 : 1;
						let attrEnd = isSelfClosingTag ? text.length - 2 : text.length - 1;
						let subText = text.substring(attrStart, attrEnd);

						let lastSpaceStart = 0;
						let tagNameAppeared = false;
						let re = /([^\s\=]+)(?:(\s*=\s*)(\S+))?/g;

						let matchedText = re.exec(subText);
						while(matchedText){
							let spaces = subText.substring(lastSpaceStart, matchedText.index);
							appendColoredText(htmlShow, spaces, "white");
							if(!tagNameAppeared){
								appendColoredText(htmlShow, matchedText[0], "#FE2470");//red
								tagNameAppeared = true;
							}
							else{
								if(matchedText[1])
									appendColoredText(htmlShow, matchedText[1], "#B2D44A");//green
								if(matchedText[2])
									appendColoredText(htmlShow, matchedText[2], "white");
								if(matchedText[3])
									appendColoredText(htmlShow, matchedText[3], "#EBD67D");//yellow
							}
							lastSpaceStart = matchedText.index + matchedText[0].length;
							matchedText = re.exec(subText);							
						}
						let spaces = subText.substring(lastSpaceStart);
						let finalChars = isSelfClosingTag ? spaces + "/>" : spaces + ">";
						appendColoredText(htmlShow, finalChars, "white");
					}
					else{
						appendColoredText(htmlShow, text, "white");
					}
					startIndex = endIndex;
				}
				else if (ch === '\n') {
					lineNumber++;
					let text = htmlReader.result.substring(startIndex, i);

					appendColoredText(htmlShow, text, "white");
					htmlShow.appendChild(document.createElement("br"));
					appendColoredText(htmlShow, String(lineNumber) + " ", "grey");

					startIndex = i + 1;
				}
			}
		}
	}

	//TODO: syntax highlight
	function displayFile() {
		var results = htmlReader.result.split("\n");
		var newResult = "";
		var lineNumber = 0;
		for (let x of results) {
			lineNumber++;
			newResult = newResult + lineNumber + "  " + x + "\n";
		}
		htmlShow.value = newResult;
	}

	htmlReader.addEventListener("load", function() {
		//displayFile();
		tokenize();
	});
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