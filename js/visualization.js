var svg = d3.select("#visualize").append("g").attr("transform", "translate(0,20)");
var svgTree = d3.layout.tree().separation(function(a, b) {
	return (a.parent === b.parent ? 1 : 2);
});
var animationTime = 500;
var currentCenter;
var data;
var nodes;

var dragdx = 0, dragdy = 0;

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
	var root = hasParent ? center.parent : center;
	var res = getTreeNodesRecursively(root, level, 0, center);
	return res;
}

function toggle(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
}

function moveSubtree(d, dx, dy) {
	d.x += dx;
	d.y += dy;
	d3.select('#node' + d.node.uniqueId)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	if (d.children) {
		for (let child of d.children) {
			moveSubtree(child, dx, dy);
			let linkId = "#link" + d.node.uniqueId + "-" + child.node.uniqueId;
			d3.select(linkId).attr("d", d3.svg.diagonal());
		}
	}
}

function handleDragEvent(d) {
	var dx = d3.event.dx;
	var dy = d3.event.dy;
	dragdx += dx;
	dragdy += dy;
	moveSubtree(d, dx, dy);
	if (d.parent) {
		let linkId = "#link" + d.parent.node.uniqueId + "-" + d.node.uniqueId;
		d3.select(linkId).attr("d", d3.svg.diagonal());
	}
}

function handleDragEndEvent(d) {
	if(dragdx**2 + dragdy**2 >= 100){
		if(d !== nodes[0])
			redraw(currentCenter, true);
	}
	dragdx = 0;
	dragdy = 0;
}

function handleMouseOverEvent(d) {
	addDetailMessage(d.node);
	d3.select(this).style("cursor", "pointer");
}

function handleMouseOutEvent(d) {
	removeAllChildren(detailShow);
	d3.select(this).style("cursor", "default");
}

function handleClickEvent(d) {
	if (d3.event.defaultPrevented)
		return;
	toggle(d);
	redraw(currentCenter, true, d);
}

contextMenu = function (menu, openCallback) {
	d3.selectAll('.d3-context-menu').data([1])
		.enter()
		.append('div')
		.attr('class', 'd3-context-menu');

	d3.select('body').on('click.d3-context-menu', function() {
		d3.select('.d3-context-menu').style('display', 'none');
	});

	return function(data, index) {
		var elm = this;

		d3.selectAll('.d3-context-menu').html('');
		var list = d3.selectAll('.d3-context-menu').append('ul');
		list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function(d) {
				return (typeof d.title === 'string') ? d.title : d.title(data);
			})
			.on('click', function(d, i) {
				d.action(elm, data, index);
				d3.select('.d3-context-menu').style('display', 'none');
			});

		if (openCallback) {
			if (openCallback(data, index) === false) {
				return;
			}
		}

		d3.select('.d3-context-menu')
			.style('left', (d3.event.pageX - 2) + 'px')
			.style('top', (d3.event.pageY - 2) + 'px')
			.style('display', 'block');

		d3.event.preventDefault();
		d3.event.stopPropagation();
	};
};

var menu = [
	{
		title: 'Remove the node.',
		action: function(elem, d, i){
			d.node.extract();
			redraw(currentCenter);
		},
	},
	{
		title: 'Visualize the node.',
		action: function(elem, d, i){
			redraw(d.node);
		},

	}
]

function redraw(center, cached = false, source) {
	if(!center)
		return;
	currentCenter = center;
	var oldSource;
	if(source)
		oldSource = {x: source.x, y:source.y};
	else if(nodes && nodes[0])
		oldSource = {x: nodes[0].x, y:nodes[0].y};

	var width = visualization.clientWidth;
	var height = visualization.clientHeight;
	var maxLevel = Math.floor(height / 50) - 1;

	data = cached ? data : getTreeNodes(center, maxLevel);

	svgTree.size([width, height]);
	var diagonal = d3.svg.diagonal();

	nodes = svgTree.nodes(data);
	var links = svgTree.links(nodes);
	nodes.forEach(function(d) {
		d.y = d.depth * 50;
	})

	if (!source){
		source = nodes[0];
	}
	if(!oldSource){
		oldSource = nodes[0];
	}

	var nodeUpdate = svg.selectAll(".node").data(nodes, function(d) {
		return d.node.uniqueId;
	});
	var nodeEnter = nodeUpdate.enter();
	var nodeExit = nodeUpdate.exit();

	var enterNodes = nodeEnter.append("g")
		.attr("class", "node")
		.attr("transform", function(d) {
			return "translate(" + oldSource.x + "," + oldSource.y + ")";
		})
		.attr("id", function(d) {
			return "node" + d.node.uniqueId;
		})
		.on({
			"mouseover": handleMouseOverEvent,
			"mouseout": handleMouseOutEvent,
			"click": handleClickEvent,
			"contextmenu": contextMenu(menu),
		});

	var dragBehavior = d3.behavior.drag()
		.on("drag", handleDragEvent)
		.on("dragend", handleDragEndEvent);
	enterNodes.call(dragBehavior);

	enterNodes.append("circle")
		.attr("r", 5)
		.style("fill", function(d) {
			if (d.isme)
				return "red";
			return (!d.children && d._children) ? "blue" : "#fff";
		});
	enterNodes.append("text")
		.text(function(d) {
			return d.node.type === "element" ? d.node.tagName : d.node.type;
		})
		.attr("transform", function(d){
			return "translate(" + 5 + "," + 0 + ")";
		});

	var updateNodes = nodeUpdate.transition()
		.duration(animationTime)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	updateNodes
		.select("circle")
		.attr("r", 8)
		.style("fill", function(d) {
			if (d.isme)
				return "red";
			return (!d.children && d._children) ? "blue" : "#fff";
		});

	var exitNodes = nodeExit.transition()
		.duration(animationTime)
		.attr("transform", function(d) {
			return "translate(" + source.x + "," + source.y + ")";
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
		.attr("d", d3.svg.diagonal()
			.projection(function(d) {
				return [oldSource.x, oldSource.y];
			}))
		.attr("id", function(d) {
			return "link" + d.source.node.uniqueId + "-" + d.target.node.uniqueId;
		});

	linkUpdate.transition()
		.duration(animationTime)
		.attr("d", diagonal);
	linkExit.transition()
		.duration(animationTime)
		.attr("d", d3.svg.diagonal()
			.projection(function(d) {
				return [source.x, source.y];
			}))
		.remove();
}

//function redraw