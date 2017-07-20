var svg = d3.select("#visualize").append("g").attr("transform", "translate(0,0)");
var svgTree = d3.layout.tree().separation(function(a, b) {
	return (a.parent === b.parent ? 1 : 2);
});

function getTreeNodesRecursively(root, level, current, ori) {
	if (current === level) {
		return {
			"tagName": root.tagName,
			"type": root.type,
			"id": root.id,
			"classes": root.classes,
			"text": root.text,
			"attr": root.attr,
			"children": null,
			"isme": root === ori,
		}
	} else {
		var result = {
			"tagName": root.tagName,
			"type": root.type,
			"id": root.id,
			"classes": root.classes,
			"text": root.text,
			"attr": root.attr,
			"children": [],
			"isme": root === ori,
		}
		for (let child of root.children) {
			var x = getTreeNodesRecursively(child, level, current + 1, ori);
			result.children.push(x);
		}
		if (root.children.length == 0) {
			result.children = null;
		}
		return result;
	}
}

function getTreeNodes(center, level) {
	var hasParent = Boolean(center.parent);
	var root = hasParent ? center.parent : center;
	var res = getTreeNodesRecursively(root, level, 0, center);
	return res;
}


function redraw(center) {
	var width = visualization.clientWidth;
	var height = visualization.clientHeight;
	var maxLevel = Math.floor(height / 50) + 1;

	var data = getTreeNodes(center, maxLevel);

	svgTree.size([width, height]);
	var diagonal = d3.svg.diagonal();

	var nodes = svgTree.nodes(data);
	var links = svgTree.links(nodes);
	nodes.forEach(function(d) {
		d.y = d.depth * 50;
	})

	var nodeUpdate = svg.selectAll(".node").data(nodes);
	var nodeEnter = nodeUpdate.enter();
	var nodeExit = nodeUpdate.exit();

	var enterNodes = nodeEnter.append("g").attr("class", "node").attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	})
	enterNodes.append("circle").attr("r", 5).style("fill", function(d) {
		return d.isme ? "blue" : "#fff";
	});
	enterNodes.append("text").attr("text-anchor", function(d) {
		return d.children ? "end" : "start"
	}).text(function(d) {
		return d.type === "element" ? d.tagName : d.type;
	});

	var updateNodes = nodeUpdate.transition().duration(500).attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	});
	updateNodes.select("circle").attr("r", 5).style("fill", function(d) {
		return d.isme ? "blue" : "#fff";
	});

	var exitNodes = nodeExit.transition().duration(500).attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	}).remove();
}