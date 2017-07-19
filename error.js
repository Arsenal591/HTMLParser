class PraseError extends Error{
	constructor(level, message, rowNumber){
		this.level = level;
		this.message = message;
		this.lineNumber = lineNumber;
	}
}