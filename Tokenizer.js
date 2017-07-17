class Token
{
	//type: str, start, end
	constructor(type){
		this.type = type;
		this.errorMessages = [];
		if(type === "str"){
			this.str = '';
			this.appendChar = function(ch){
				this.str = this.str.concat(ch);
			}
		}
		else{
			this.tagName = '';
			this.selfClosing = false;
			this.attr = {};
			this.currentAttr = '';
			this.currentValue = '';
			this.appendTagName = function(ch){
				ch = ch.toLowerCase();
				this.tagName = this.tagName.concat(ch);
			}
			this.appendAttr = function(ch){
				ch = ch.toLowerCase();
				this.currentAttr = this.currentAttr.concat(ch);
			}
			this.appendValue = function(ch){
				ch = ch.toLowerCase();
				this.currentValue = this.currentValue.concat(ch);
			}
			this.insertAttr = function(){
				if(this.attr[this.currentAttr] !== undefined){
					this.errorMessages.push("duplicate attributes: " + this.currentAttr);
				}
				this.attr[this.currentAttr] = this.currentValue;
				this.currentAttr = '';
				this.currentValue = '';
			}
		}
	}
};

const DATA = 0, TAG_OPEN = 1, END_TAG_OPEN = 2, TAG_NAME = 3, BEFORE_ATTR_NAME = 4;
const ATTR_NAME = 5, AFTER_ATTR_NAME = 6, BEFORE_ATTR_VALUE = 7, ATTR_VALUE_DOUBLE = 8;
const ATTR_VALUE_SINGLE = 9, ATTR_VALUE_UNQUOTED = 10, AFTER_ATTR_VALUE_QUOTED =  11;
const SELF_CLOSING_START_TAG = 12;

var isLetter = x=>/^[a-zA-Z]$/.test(x);
var isDigit = x=>/^[0-9]$/.test(x);
var isSpace = x=>/^[\s]$/.test(x);

function emit(token){
	if(token !== null && (token.type !== 'str' || /^\s*$/.test(token.str) === false))
		console.log(token);
}

class TokenizeMachine{
	constructor(){
		this.state = DATA;
		this.currentToken = null;
	}
	transfer(ch){
		switch (this.state) {
			case DATA:
				if(ch === '<'){
					emit(this.currentToken);
					this.currentToken = null;
					this.state = TAG_OPEN;
				}
				else{
					if(this.currentToken === null)
						this.currentToken = new Token("str");
					this.currentToken.appendChar(ch);
				}
				break;
			case TAG_OPEN:
				if(ch === '/')
					this.state = END_TAG_OPEN;
				else if(isLetter(ch)){
					this.currentToken = new Token("start");
					this.currentToken.appendTagName(ch);
					this.state = TAG_NAME;
				}
				else{
					//raise an error
				}
				break;
			case END_TAG_OPEN:
				if(isLetter(ch)){
					this.currentToken = new Token("end");
					this.currentToken.appendTagName(ch);
					this.state = TAG_NAME;
				}
				else{
					//raise an error;
				}
				break;
			case TAG_NAME:
				if(isSpace(ch)){
					this.state = BEFORE_ATTR_NAME;
				}
				else if(ch === '/'){
					this.state = SELF_CLOSING_START_TAG;
				}
				else if(ch === '>'){
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else if(isLetter){
					this.currentToken.appendTagName(ch)
				}
				else{
					//raise an error
				}
				break;
			case BEFORE_ATTR_NAME:
				if(isSpace(ch)){
					//do nothing
				}
				else if(ch === '/'){
					this.state = SELF_CLOSING_START_TAG;
				}
				else if(ch === '>'){
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else if(isLetter(ch)){
					this.currentToken.appendAttr(ch);
					this.state = ATTR_NAME;
				}
				break;
			case ATTR_NAME:
				if(isSpace(ch)){
					this.currentToken.insertAttr();
					this.state = AFTER_ATTR_NAME;
				}
				else if(ch === '/'){
					this.currentToken.insertAttr();
					this.state = SELF_CLOSING_START_TAG;
				}
				else if(ch === '='){
					this.state = BEFORE_ATTR_VALUE;
				}
				else if(ch ==='>'){
					this.currentToken.insertAttr();
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else if(ch === "'" || ch === '"' || ch === '<'){
					//raise an error
				}
				else{
					this.currentToken.appendAttr(ch);
				}
				break;
			case AFTER_ATTR_NAME:
				if(isSpace(ch)){
					//do nothing
				}
				else if(ch === '/'){
					this.currentToken.insertAttr();
					this.state = SELF_CLOSING_START_TAG;
				}
				else if(ch === '='){
					this.state = BEFORE_ATTR_VALUE;
				}
				else if(ch === '>'){
					this.currentToken.insertAttr();
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else if(isLetter){
					this.currentToken.appendAttr(ch);
					this.state = ATTR_NAME;
				}
				else{
					//raise an error
				}
				break;
			case BEFORE_ATTR_VALUE:
				if(isSpace(ch)){
					// do nothing
				}
				else if(ch === '"'){
					this.state = ATTR_VALUE_DOUBLE;
				}
				else if(ch === "'"){
					this.state = ATTR_VALUE_SINGLE;
				}
				else if(ch ==='>' || ch === '=' || ch === '<'){
					//raise an error
				}
				else{
					this.currentToken.appendValue(ch);
					this.state = ATTR_VALUE_UNQUOTED;
				}
				break;
			case ATTR_VALUE_DOUBLE:
				if(ch === '"'){
					this.currentToken.insertAttr();
					this.state = AFTER_ATTR_VALUE_QUOTED;
				}
				else{
					this.currentToken.appendValue(ch);
				}
				break;
			case ATTR_VALUE_SINGLE:
				if(ch === "'"){
					this.currentToken.insertAttr();
					this.state = AFTER_ATTR_VALUE_QUOTED;
				}
				else{
					this.currentToken.appendValue(ch);
				}
				break;
			case ATTR_VALUE_UNQUOTED:
				if(isSpace(ch)){
					this.currentToken.insertAttr();
					this.state = BEFORE_ATTR_NAME;
				}
				else if(ch === '>'){
					this.currentToken.insertAttr();
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else if(ch === '"' || ch === "'" || ch === '<' || ch === '='){
					//raise an error
				}
				else{
					this.currentToken.appendValue(ch);
				}
				break;
			case AFTER_ATTR_VALUE_QUOTED:
				if(isSpace(ch)){
					this.state = BEFORE_ATTR_NAME;
				}
				else if(ch === '/'){
					this.state = SELF_CLOSING_START_TAG;
				}
				else if(ch === '>'){
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else{
					//raise an error
				}
				break;
			case SELF_CLOSING_START_TAG:
				if(ch === '>'){
					this.currentToken.selfClosing = true;
					emit(this.currentToken);
					this.currentToken = null;
					this.state = DATA;
				}
				else{
					//raise an error
				}
				break;
			default:
				// statements_def
				break;
		}
	}
}