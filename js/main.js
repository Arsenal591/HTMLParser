var uploadFileArea = document.getElementById("input");
var htmlShow = document.getElementById("htmlshow");
var errorShow = document.getElementById("errorshow");
var codeArea = document.getElementById("codeedit");
var runCodeButton = document.getElementById("runcode");
var visualization = document.getElementById("visualize");
var tree;

htmlShow.setAttribute("readonly", true);

function handleUploadFile() {
	var file = uploadFileArea.files[0];
	uploadFileArea.value = '';
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
		} catch (e) {
			let showError = e;
			e.lineNumber = lineNumber;
			addErrorMessage(e);
		}
	}
}

	function displayFile() {
		var results = htmlReader.result.split("\n");
		var newResult = "";
		var lineNumber = 0;
		for (let x of results){
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
uploadFileArea.addEventListener("change", handleUploadFile, false);


function addErrorMessage(e) {
	var errorName = e.name;
	var msg = e.message;
	var msgTypeNode = document.createElement("em");
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