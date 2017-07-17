var inputElement = document.getElementById("input");
console.log(inputElement)
var handleFiles = function(){
	console.log("gg")
	var fileList = this.files;
	var file = fileList[0];
	var reader = new FileReader();
	reader.onload = function(e){console.log(reader.result);}
	reader.readAsText(file);
}
inputElement.addEventListener("change", handleFiles, false);
