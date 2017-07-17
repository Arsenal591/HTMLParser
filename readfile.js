var inputElement = document.getElementById("input");
var machine = new TokenizeMachine();
var handleFiles = function(){
	var fileList = this.files;
	var file = fileList[0];
	var reader = new FileReader();
	reader.onload = function(e){
		for(let ch of reader.result){
			machine.transfer(ch);
		}
	}
	reader.readAsText(file);
}
inputElement.addEventListener("change", handleFiles, false);
