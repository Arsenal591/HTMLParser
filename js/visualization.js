var svg = d3.select("#visualize").append("g")
			.attr("transform", "translate(0,20)");
var svgTree = d3.layout.tree();

var animationTime = 500;
var currentCenter;
var data; // cache the data for future use.
var nodes; // cache the nodes for future use.

//record the offset since last drag-start event.
var dragdx = 0,
	dragdy = 0;

// from DOM-Nodes to data needed by visualization.
function getTreeNodesRecursively(root, maxDepth, currentDepth, ori) {
	if (currentDepth === maxDepth) {
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
			var x = getTreeNodesRecursively(child, maxDepth, currentDepth + 1, ori);
			result.children.push(x);
		}
		if (root.children.length == 0) {
			result.children = null;
		}
		return result;
	}
}

// center: the DOM-Node you want to focus on
// maxDepth: how deep the tree is.
function getTreeNodes(center, maxDepth) {
	var hasParent = Boolean(center.parent);
	var root = hasParent ? center.parent : center;
	var res = getTreeNodesRecursively(root, maxDepth, 0, center);
	return res;
}

// fold or unfold the subtree that rooted d. 
function toggle(d) {
	if (d.children) {
		d._children = d.children;
		d.children = null;
	} else {
		d.children = d._children;
		d._children = null;
	}
}

//translate all nodes and edges of a subtree.
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

// paint all nodes that similar to d with the same color. 
function markNodesOfSameType(d, color) {
	if (d.node.type === "text") {
		for (let node of nodes) {
			if (node.node.type === "text")
				node.fillStyle = color;
			else
				node.fillStyle = undefined;
		}
	} else {
		for (let node of nodes) {
			if (node.node.tagName === d.node.tagName)
				node.fillStyle = color;
			else
				node.fillStyle = undefined;
		}
	}
}

// drag: move subtree.
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

// drag-end: subtree to its original position.
function handleDragEndEvent(d) {
	if (dragdx ** 2 + dragdy ** 2 >= 100) {
		if (d !== nodes[0])
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
	//removeAllChildren(detailShow);
	d3.select(this).style("cursor", "default");
}

function handleClickEvent(d) {
	if (d3.event.defaultPrevented)
		return;
	toggle(d);
	redraw(currentCenter, true, d);
}

// scripts to design a context-menu
contextMenu = function(menu) {
	d3.selectAll('.d3-context-menu').data([1]).enter()
		.append('div').attr('class', 'd3-context-menu');

	d3.select('body').on('click.d3-context-menu', function() {
		d3.select('.d3-context-menu').style('display','none');
	});

	return function(data, index) {
		var temp = this;

		d3.selectAll('.d3-context-menu').html('');
		var list = d3.selectAll('.d3-context-menu').append('ul');
		list.selectAll('li').data(menu).enter()
			.append('li')
			.html(function(d) {
				if(typeof d.title === "string")
					return d.title;
				else if(typeof d.title === "function")
					return d.title(data);
			})
			.on('click', function(d) {
				d.action(temp, data, index);
				d3.select('.d3-context-menu').style('display', 'none');
			});

		d3.select('.d3-context-menu')
			.style('left', (d3.event.pageX - 4)+"px")
			.style('top', (d3.event.pageY - 4)+"px")
			.style('display', 'block');

		d3.event.preventDefault();
		d3.event.stopPropagation();
	};
};

// context-menu to be shown when right-clicked.
var menu = [{
	title: 'Remove the node.',
	action: function(elem, d, i) {
		d.node.extract();
		redraw(currentCenter);
	},
}, 
{
	title: 'Visualize the node.',
	action: function(elem, d, i) {
		redraw(d.node);
	},

},
{
	title: function(d){
		if(!d.fillStyle)
			return 'Mark nodes of the same type.';
		else
			return 'Unmark nodes of the same type.';
	},
	action: function(elem, d, i) {
		var color = d.fillStyle? "#fff": "orange";
		markNodesOfSameType(d, color);
		redraw(currentCenter, true);
	}
}]

// center: the DOM-Node you want to focus on.
// cached: true --- means data is not modified, 
//                  just the structure of the svg-tree is changed.
//                  (Eg. A subtree is collapsed.)
//         false --- means data is totally changed
// source: where entering nodes will come from & exiting nodes go.
function redraw(center=currentCenter, cached = false, source) {
	if (!center)
		return;
	currentCenter = center;

	// 标记source的原位置，
	// 这样新节点就会从source的原位置出生，而不是调整后的位置出生
	var oldSource;
	if (source)
		oldSource = {
			x: source.x,
			y: source.y
		};
	else if (nodes && nodes[0])
		oldSource = {
			x: nodes[0].x,
			y: nodes[0].y
		};

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

	source = source || nodes[0];
	oldSource = oldSource || nodes[0];

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
		.attr("r", 8)
		.style("fill", function(d) {
			if (d.isme)
				return "red";
			if (d.fillStyle)
				return d.fillStyle;
			return (!d.children && d._children) ? "steelblue" : "#fff";
		});
	enterNodes.append("text")
		.text(function(d) {
			return d.node.type === "element" ? d.node.tagName : d.node.type;
		})
		.attr("transform", function(d) {
			return "translate(5,0)";
		});

	var updateNodes = nodeUpdate.transition()
		.duration(animationTime)
		.attr("transform", function(d) {
			return "translate(" + d.x + "," + d.y + ")";
		});
	updateNodes
		.select("circle")
		.style("fill", function(d) {
			if (d.isme)
				return "red";
			if (d.fillStyle)
				return d.fillStyle;
			return (!d.children && d._children) ? " steelblue" : "#fff";
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