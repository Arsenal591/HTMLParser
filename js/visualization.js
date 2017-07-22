var svg = d3.select("#visualize").append("g").attr("transform", "translate(0,20)");
var svgTree = d3.layout.tree().separation(function(a, b) {
	return (a.parent === b.parent ? 1 : 2);
});
var currentCenter;
var data;

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

function toggle(d){
	if(d.children){
		d._children = d.children;
		d.children = null;
	}
	else{
		d.children = d._children;
		d._children = null;
	}
	console.log(data.children[0].children);
}

function moveSubtree(d, dx, dy){
	d.x += dx;
	d.y += dy;
	d3.select('#node'+ d.node.uniqueId)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	if(d.children){
		for(let child of d.children){
			moveSubtree(child, dx, dy);
			let linkId = "#link" + d.node.uniqueId + "-" + child.node.uniqueId;
			d3.select(linkId).attr("d", d3.svg.diagonal());
		}
	}
}

function handleDragEvent(d) {
	var dx = d3.event.dx;
	var dy = d3.event.dy;
	moveSubtree(d, dx, dy);
	if(d.parent){
		let linkId = "#link" + d.parent.node.uniqueId + "-" + d.node.uniqueId;
		d3.select(linkId).attr("d", d3.svg.diagonal());
	}
}

function handleDragEndEvent(d){

	redraw(currentCenter, true);
}

function handleMouseOverEvent(d){
	d3.select(this).style("cursor", "pointer");
}

function handleMouseOutEvent(d){
	d3.select(this).style("cursor", "default");
}



function redraw(center, cached=false) {
	currentCenter = center;
	var width = visualization.clientWidth;
	var height = visualization.clientHeight;
	var maxLevel = Math.floor(height / 50);

	data = cached? data : getTreeNodes(center, maxLevel);

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
			var x = d.parent? d.parent.x : nodes[0].x;
			var y = d.parent? d.parent.y : nodes[0].y;
			return "translate(" + x + "," + y + ")";
		})
		.attr("id", function(d){
			return "node" + d.node.uniqueId;
		})
		.on({
			"mouseover": handleMouseOverEvent,
			"mouseout": handleMouseOutEvent,
			"click": function(d){
				if(d3.event.defaultPrevented)
					return;
				toggle(d);
				redraw(currentCenter, true);
			}
		});

	var dragBehavior = d3.behavior.drag()
		.on("drag", handleDragEvent)
		.on("dragend", handleDragEndEvent);
	enterNodes.call(dragBehavior);

	enterNodes.append("circle")
		.attr("r", 5)
		.style("fill", function(d) {
			if(d.isme)
				return "red";
			return (!d.children && d._children) ? "blue" : "#fff";
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
			if(d.isme)
				return "red";
			return (!d.children && d._children) ? "blue" : "#fff";
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
			var x = d.parent? d.parent.x : nodes[0].x;
			var y = d.parent? d.parent.y : nodes[0].y;
			return "translate(" + x + "," + y + ")";
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
		.attr("d", diagonal)
		.attr("id", function(d) {
			return "link" + d.source.node.uniqueId + "-" + d.target.node.uniqueId
		});

	linkUpdate.transition()
		.duration(5000)
		.attr("d", diagonal);
	linkExit.transition()
		.duration(5000)
		.attr("d", diagonal)
		.remove();
}