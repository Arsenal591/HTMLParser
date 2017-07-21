var svg = d3.select("#visualize").append("g").attr("transform", "translate(0,20)");
var svgTree = d3.layout.tree().separation(function(a, b) {
	return (a.parent === b.parent ? 1 : 2);
});

function getTreeNodesRecursively(root, level, current, ori) {
	if (current === level) {
		return {
			"children": null,
			"isme": root === ori,
			"node": root,
		}
	} else {
		var result = {
			"children": [],
			"isme": root === ori,
			"node": root
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
	//var root = center;
	var root = hasParent ? center.parent : center;
	var res = getTreeNodesRecursively(root, level, 0, center);
	return res;
}


function redraw(center) {
	var width = visualization.clientWidth;
	var height = visualization.clientHeight;
	var maxLevel = Math.floor(height / 50);
	console.log(height, maxLevel);

	var data = getTreeNodes(center, maxLevel);

	svgTree.size([width, height]);
	var diagonal = d3.svg.diagonal();

	var nodes = svgTree.nodes(data);
	var links = svgTree.links(nodes);
	nodes.forEach(function(d) {
		d.y = d.depth * 50;
	})

	var nodeUpdate = svg.selectAll(".node").data(nodes, function(d) {
		return d.node.uniqueId;
	});
	var nodeEnter = nodeUpdate.enter();
	var nodeExit = nodeUpdate.exit();

	var enterNodes = nodeEnter.append("g")
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + nodes[0].x + "," + nodes[0].y + ")";
		})
	enterNodes.append("circle")
		.attr("r", 5)
		.style("fill", function(d) {
			return d.node.isme ? "blue" : "#fff";
		});
	enterNodes.append("text")
		.attr("text-anchor", function(d) {
			return d.children ? "end" : "start"
		})
		.text(function(d) {
			return d.node.type === "element" ? d.node.tagName : d.node.type;
		});

	var updateNodes = nodeUpdate.transition()
		.duration(5000)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	updateNodes
		.select("circle")
		.attr("r", 5)
		.style("fill", function(d) {
			return d.node.isme ? "blue" : "#fff";
		});
	updateNodes
		.select("text")
		.attr("text-anchor", function(d) {
			return d.children ? "end" : "start"
		})
		.text(function(d) {
			return d.node.type === "element" ? d.node.tagName : d.node.type;
		});

	var exitNodes = nodeExit.transition()
		.duration(5000)
		.attr("transform", function(d) {
			return "translate(" + nodes[0].x + "," + nodes[0].y + ")";
		})
		.remove();

	var linkUpdate = svg.selectAll(".link")
		.data(links, function(d) {
			return d.target.node.uniqueId;
		});
	var linkEnter = linkUpdate.enter();
	var linkExit = linkUpdate.exit();

	linkEnter.append("path")
		.attr("class", "link")
		.attr("d", d3.svg.diagonal().projection(function(d) {
			return [nodes[0].x, nodes[0].y]
		}));
	linkUpdate.transition()
		.duration(5000)
		.attr("d", diagonal);
	linkExit.transition()
		.duration(5000)
		.attr("d", d3.svg.diagonal().projection(function(d) {
			return [nodes[0].x, nodes[0].y];
		}))
		.remove();
}