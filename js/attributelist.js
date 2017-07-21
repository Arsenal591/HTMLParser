var globalAttributes = ["accesskey",
	"class",
	"contenteditable",
	"contextmenu",
	"dir",
	"draggable",
	"dropzone",
	"hidden",
	"id",
	"itemid",
	"itemprop",
	"itemref",
	"itemscope",
	"itemtype",
	"lang",
	"slot",
	"spellcheck",
	"style",
	"tabindex",
	"title",
	"translate"
];

var validElements = [
	"a",
	"abbr",
	"acronym",
	"address",
	"applet",
	"area",
	"article",
	"aside",
	"audio",
	"b",
	"base",
	"basefont",
	"bdi",
	"bdo",
	"big",
	"blockquote",
	"body",
	"br",
	"button",
	"canvas",
	"caption",
	"center",
	"cite",
	"code",
	"col",
	"colgroup",
	"command",
	"datalist",
	"dd",
	"del",
	"details",
	"dfn",
	"dir",
	"div",
	"dl",
	"dt",
	"em",
	"embed",
	"fieldset",
	"figcaption",
	"figure",
	"font",
	"footer",
	"form",
	"frame",
	"frameset",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hgroup",
	"hr",
	"html",
	"i",
	"iframe",
	"img",
	"input",
	"ins",
	"keygen",
	"label",
	"legend",
	"li",
	"link",
	"map",
	"mark",
	"menu",
	"meta",
	"meter",
	"nav",
	"noframes",
	"noscript",
	"object",
	"ol",
	"optgroup",
	"option",
	"output",
	"p",
	"param",
	"pre",
	"progress",
	"q",
	"rp",
	"rt",
	"ruby",
	"s",
	"samp",
	"script",
	"section",
	"select",
	"small",
	"source",
	"span",
	"strike",
	"strong",
	"style",
	"sub",
	"summary",
	"sup",
	"table",
	"tbody",
	"td",
	"textarea",
	"tfoot",
	"th",
	"thead",
	"time",
	"title",
	"tr",
	"track",
	"tt",
	"u",
	"ul",
	"var",
	"video",
	"wbr"
]

var attributeElementMap = {
	"accept": ["form", "input"],
	"accept-charset": ["form"],
	"accesskey": validElements,
	"action": ["form"],
	"align": ["applet", "caption", "col", "colgroup", "hr", "iframe", "img", "table", "tbody", "td", "tfoot", "th", "thead", "tr"],
	"alt": ["applet", "area", "img", "input"],
	"async": ["script"],
	"autocomplete": ["form", "input"],
	"autofocus": ["button", "input", "keygen", "select", "textarea"],
	"autoplay": ["audio", "video"],
	"autosave": ["input"],
	"bgcolor": ["body", "col", "colgroup", "marquee", "table", "tbody", "tfoot", "td", "th", "tr"],
	"border": ["img", "object", "table"],
	"buffered": ["audio", "video"],
	"challenge": ["keygen"],
	"charset": ["meta", "script"],
	"checked": ["command", "input"],
	"cite": ["blockquote", "del", "ins", "q"],
	"class": validElements,
	"code": ["applet"],
	"codebase": ["applet"],
	"color": ["basefont", "font", "hr"],
	"cols": ["textarea"],
	"colspan": ["td", "th"],
	"content": ["meta"],
	"contenteditable": validElements,
	"contextmenu": validElements,
	"controls": ["audio", "video"],
	"coords": ["area"],
	"crossorigin": ["audio", "img", "link", "script", "video"],
	"data": ["object"],
	"data-*": validElements,
	"datetime": ["del", "ins", "time"],
	"default": ["track"],
	"defer": ["script"],
	"dir": validElements,
	"dirname": ["input", "textarea"],
	"disabled": ["button", "command", "fieldset", "input", "keygen", "optgroup", "option", "select", "textarea"],
	"download": ["a", "area"],
	"draggable": validElements,
	"dropzone": validElements,
	"enctype": ["form"],
	"for": ["label", "output"],
	"form": ["button", "fieldset", "input", "keygen", "label", "meter", "object", "output", "progress", "select", "textarea"],
	"formaction": ["input", "button"],
	"headers": ["td", "th"],
	"height": ["canvas", "embed", "iframe", "img", "input", "object", "video"],
	"hidden": validElements,
	"high": ["meter"],
	"href": ["a", "area", "base", "link"],
	"hreflang": ["a", "area", "link"],
	"http-equiv": ["meta"],
	"icon": ["command"],
	"id": validElements,
	"integrity": ["link", "script"],
	"ismap": ["img"],
	"itemprop": validElements,
	"keytype": ["keygen"],
	"kind": ["track"],
	"label": ["track"],
	"lang": validElements,
	"language": ["script"],
	"list": ["input"],
	"loop": ["audio", "bgsound", "marquee", "video"],
	"low": ["meter"],
	"manifest": ["html"],
	"max": ["input", "meter", "progress"],
	"maxlength": ["input", "textarea"],
	"minlength": ["input", "textarea"],
	"media": ["a", "area", "link", "source", "style"],
	"method": ["form"],
	"min": ["input", "meter"],
	"multiple": ["input", "select"],
	"muted": ["video"],
	"name": ["button", "form", "fieldset", "iframe", "input", "keygen", "object", "output", "select", "textarea", "map", "meta", "param"],
	"novalidate": ["form"],
	"open": ["details"],
	"optimum": ["meter"],
	"pattern": ["input"],
	"ping": ["a", "area"],
	"placeholder": ["input", "textarea"],
	"poster": ["video"],
	"preload": ["audio", "video"],
	"radiogroup": ["command"],
	"readonly": ["input", "textarea"],
	"rel": ["a", "area", "link"],
	"required": ["input", "select", "textarea"],
	"reversed": ["ol"],
	"rows": ["textarea"],
	"rowspan": ["td", "th"],
	"sandbox": ["iframe"],
	"scope": ["th"],
	"scoped": ["style"],
	"seamless": ["iframe"],
	"selected": ["option"],
	"shape": ["a", "area"],
	"size": ["input", "select"],
	"sizes": ["link", "img", "source"],
	"slot": validElements,
	"span": ["col", "colgroup"],
	"spellcheck": validElements,
	"src": ["audio", "embed", "iframe", "img", "input", "script", "source", "track", "video"],
	"srcdoc": ["iframe"],
	"srclang": ["track"],
	"srcset": ["img"],
	"start": ["ol"],
	"step": ["input"],
	"style": validElements,
	"summary": ["table"],
	"tabindex": validElements,
	"target": ["a", "area", "base", "form"],
	"title": validElements,
	"type": ["button", "input", "command", "embed", "object", "script", "source", "style", "menu"],
	"usemap": ["img", "input", "object"],
	"value": ["button", "option", "input", "li", "meter", "progress", "param"],
	"width": ["canvas", "embed", "iframe", "img", "input", "object", "video"],
	"wrap": ["textarea"],
}

var selfClosingElements = [
	"area",
	"base",
	"br",
	"col",
	"command",
	"embed",
	"hr",
	"img",
	"input",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
];

var isValidElement = x=> validElements.indexOf(x) > -1;

var isGlobalAttribute = x => globalAttributes.indexOf(x) > -1;
var isValidAttribute = x => x in attributeElementMap;
var isProperAttribute = (tag, attr) => attributeElementMap[attr].indexOf(tag) > -1;
var isSelfClosingElement = x=>selfClosingElements.indexOf(x) > -1;