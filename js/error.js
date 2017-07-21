class PraseError extends Error{
	constructor(message, level="warning", lineNumber=undefined){
		super(message);
		this.name = "PraseError";
		this.level = level;// warning or fatal
		this.lineNumber = lineNumber;
	}
}