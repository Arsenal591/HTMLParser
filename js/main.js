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
						   color='black', 
						   family='Consolas', 
						   size){

	var node = document.createElement("font");
	node.innerText = text;

	node.style.color = color;
	node.style.fontFamily = family;
	node.style.fontSize = size;

	parent.appendChild(node);
}

function handleUploadFile() {
	var file = uploadFileArea.files[0];
	var htmlReader = new FileReader();

	function tokenize() {
		tree = new DOMTree();
		var machine = new TokenizeMachine();
		var lineNumber = 1;
		for (let ch of htmlReader.result) {
			if (ch === '\n')
				lineNumber++;
			try {
				machine.transfer(ch);
			} catch (errors) {
				if (!(errors instanceof Array))
					errors = [errors];
				for (let err of errors) {
					err.lineNumber = lineNumber;
					addErrorMessage(err);
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
		displayFile();
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

function clearErrorMessage() {
	while (errorShow.firstChild) {
		errorShow.removeChild(errorShow.firstChild);
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