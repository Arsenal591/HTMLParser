var inputElement = document.getElementById("input");
var htmlShow = document.getElementById("htmlshow");
var errorShow = document.getElementById("errorshow");
var codeArea = document.getElementById("codeedit");
var runCodeButton = document.getElementById("runcode");
var visualization = document.getElementById("visualize");
var tree;

htmlShow.setAttribute("readonly", true);
var handleFiles = function() {
	var fileList = this.files;
	var file = fileList[0];
	var reader = new FileReader();
	reader.onload = function(e) {
		tree = new DOMTree();
		var machine = new TokenizeMachine();
		for (let ch of reader.result) {
			machine.transfer(ch);
		}
	}
	reader.readAsText(file);
}
inputElement.addEventListener("change", handleFiles, false);


function addErrorMessage(e){
	var msg = document.createElement("p");
	var textNode = document.createTextNode("error");
	msg.appendChild(textNode);
	msg.style.backgroundColor = "yellow";
	errorShow.appendChild(msg);
}


function runCode(){
	var src = codeArea.value;
	try{
		var result = eval(src);
		console.log(result);
	}
	catch(e){
		addErrorMessage(e);
	}
	finally{
		codeArea.value = '';
	}
}
runCodeButton.addEventListener("click", runCode);