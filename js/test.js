var root = tree.root;
var a = root.children[0].children[1].children[0].children[0];
var b = a.getNextSibling().getNextSibling();
var c = b.children[1]; 

a.removeChild(a.children[2]);