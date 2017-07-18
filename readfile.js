var inputElement = document.getElementById("input");
var tree;
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