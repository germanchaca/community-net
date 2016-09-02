'use strict';

angular.module('app.directives.metanode', [])
.directive('metanode', [function() {

  // isolate scope
  return {
    restrict: 'E',
    template: '<div id="metanode"></div>',
    scope: {
      graph: '='
    },
    link: link
  };

  function link(scope, element) {
    scope.$watch('graph',function(newVal){
      d3.select("svg.modularity").remove()
      if(newVal) draw(newVal);
    });

    // var width = 960,     // svg width
    //     height = 600,     // svg height
    // var vis = d3.select("#metanode").append("svg")
    //                 .attr("height", height)
    //                 .attr("width",width)

      function draw(data){
        var nodeHash = {};
        var edgeHash = {};
        var nodes = [];
        var edges = [];
        var modu_hash={}
        data.nodes.forEach(function(d){
          modu_hash[d.id]=d.community;
        })
        data.edges.forEach(function (edge) {
        if (!nodeHash[edge.source]) {
          nodeHash[edge.source] = {id: edge.source, label: edge.source, module:modu_hash[edge.target]};
          nodes.push(nodeHash[edge.source]);
        }
        if (!nodeHash[edge.target]) {
          nodeHash[edge.target] = {id: edge.target, label: edge.target,module:modu_hash[edge.target]};
          nodes.push(nodeHash[edge.target]);
        }
        // if (edge.weight >= 5) {
          edges.push({id: nodeHash[edge.source].id + "-" + nodeHash[edge.target].id, source: nodeHash[edge.source], target: nodeHash[edge.target], weight: edge.flow});
        // }
      });
        createForceNetwork(nodes,edges)
      }


function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function modularityCensus(nodes, edges) {
  edges.forEach(function (edge) {
    if (edge.source.module !== edge.target.module) {
      edge.border = true;
    }
    else {
      edge.border = false;
    }
  });
  nodes.forEach(function (node) {
    var theseEdges = edges.filter(function(d) {return d.source === node || d.target === node});

    var theseSourceModules = theseEdges.map(function (d) {return d.source.module}).filter(onlyUnique);
    var theseTargetModules = theseEdges.map(function (d) {return d.target.module}).filter(onlyUnique);

    if (theseSourceModules.length > 1 || theseTargetModules.length > 1) {
      node.border = true;
    }
    else {
      node.border = false;
    }
  });
  nodes.sort(function(a,b){
          return a.module-b.module
  })
  var modules = nodes.map(function(d){return d.module})
  .filter(onlyUnique)
  .map(function (d) {return {id: d, members: []}});

  var moduleEdges = [];
  // var singletons = {id: "singletons", members: []};

  var moduleNodeHash = {};

  modules.forEach(function (module) {
    module.members = nodes.filter(function (d) {return d.module === module.id});
    moduleNodeHash[module.id] = module;
    // if (module.members.length === 1) {
    //   singletons.members.push(module.members[0]);
    // }
  });
  // modules.push(singletons);

  var moduleEdgeHash = {};
  edges.forEach(function (edge) {
      
    if (!moduleEdgeHash[moduleNodeHash[edge.source.module].id + "-" + moduleNodeHash[edge.target.module].id]) {
      var moduleEdge = {source: moduleNodeHash[edge.source.module], target: moduleNodeHash[edge.target.module], weight: 1};
      moduleEdgeHash[moduleNodeHash[edge.source.module].id + "-" + moduleNodeHash[edge.target.module].id] = moduleEdge;
      moduleEdges.push(moduleEdge);
    }
    else {
      moduleEdgeHash[moduleNodeHash[edge.source.module].id + "-" + moduleNodeHash[edge.target.module].id].weight += 1;
    }
  })

  // console.log(modules,moduleEdges)
  return {nodes: modules, edges: moduleEdges}

}

    function createForceNetwork(nodes, edges) {
    edges.forEach(function(e){
      e.weight=Math.random(10);
    })
    //create a network from an edgelist

    var colors = d3.scale.category20();

    var node_data = nodes.map(function (d) {return d.id});
    var edge_data = edges.map(function (d) {return {source: d.source.id, target: d.target.id, weight: 1}; });

    // var community = jLouvain().nodes(node_data).edges(edge_data);
    // var result  = community();

    // nodes.forEach(function (node) {
    //   node.module = result[node.id]
    // });

     var modularityGraph = modularityCensus(nodes, edges);
     var mSVG = d3.select("#metanode").append("svg")
                    .attr("class", "modularity")
                    .attr("height", 150)
                    .attr("width", 150)
                    .style("border","1px solid gray")
                    .style("background", "white");

      mSVG.selectAll("line")
          .data(modularityGraph.edges)
          .enter()
          .append("line")
          .attr("class", "modularity")
          .style("stroke-width", 0.5)
          // .style("stroke-width", function (d) {return d.weight * 2})
          .style("stroke", "black");

      mSVG.selectAll("circle")
          .data(modularityGraph.nodes.filter(function(d) {return d.members.length > 1}))
          .enter()
          .append("circle")
          .attr("class", "modularity")
          .attr("r", function (d) {return d.members.length/2})
          // .attr("r",5)
          .style("stroke", "black")
          .style("stroke-width", "1px")
          .style("fill", function (d) {return colors(d.id)})
          .on("mouseover", moduleOver)
          .on("mouseout", moduleOut);

      var force = d3.layout.force().nodes(nodes).links(edges)
      .size([300,300])
      .charge(-300)
      .gravity(0.5)
      .on("tick", updateNetwork);

      var edgeEnter = d3.select("svg.main").selectAll("g.edge")
      .data(edges, function (d) {return d.id})
      .enter()
      .append("g")
      .attr("class", "edge");

      edgeEnter
      .append("line")
      .style("stroke-width", function (d) {return d.border ? "3px" : "1px"})
      .style("stroke", "black")
      .style("pointer-events", "none");

      var nodeEnter = d3.select("svg.main").selectAll("g.node")
      .data(nodes, function (d) {return d.id})
      .enter()
      .append("g")
      .attr("class", "node")
      .call(force.drag());

      nodeEnter.append("circle")
      .attr("r", 8)
      .style("fill", function (d) {return colors(d.module)})
      .style("stroke", "black")
      .style("stroke-width", function (d) {return d.border ? "3px" : "1px"})

      nodeEnter.append("text")
      .style("text-anchor", "middle")
      .attr("y", 3)
      .style("stroke-width", "1px")
      .style("stroke-opacity", 0.75)
      .style("stroke", "white")
      .style("font-size", "8px")
      .text(function (d) {return d.id})
      .style("pointer-events", "none")

      nodeEnter.append("text")
      .style("text-anchor", "middle")
      .attr("y", 3)
      .style("font-size", "8px")
      .text(function (d) {return d.id})
      .style("pointer-events", "none")

      force.start();

      function moduleOver(d) {
        console.log("MODULE", d);
        d3.select(this)
        .style("stroke-width", "4px")
        d3.select("svg.main").selectAll("circle")
        .style("stroke-width", function (p) {return p.module == d.id ? "4px" : "1px"})
      }

      function moduleOut(d) {
        d3.select(this)
        .style("stroke-width", "1px")
        d3.select("svg.main").selectAll("circle")
        .style("stroke-width", "1px")
      }

      function updateNetwork() {
        d3.select("svg.main").selectAll("line")
        .attr("x1", function (d) {return d.source.x})
        .attr("y1", function (d) {return d.source.y})
        .attr("x2", function (d) {return d.target.x})
        .attr("y2", function (d) {return d.target.y});

        d3.select("svg.main").selectAll("g.node")
          .attr("transform", function (d) {return "translate(" + d.x + "," + d.y + ")"});

        d3.select("svg.modularity").selectAll("circle")
        .each(function (d) {
          var theseNodes = d.members;
          var avgX = d3.mean(theseNodes, function (p) {return p.x});
          var avgY = d3.mean(theseNodes, function (p) {return p.y});
          d.x = avgX/2 
          d.y = avgY/2
        })
        .attr("transform", function (d) {return "translate(" + d.x + "," + d.y + ")"});

        d3.select("svg.modularity").selectAll("line")
        .attr("x1", function (d) {return d.source.x})
        .attr("y1", function (d) {return d.source.y})
        .attr("x2", function (d) {return d.target.x})
        .attr("y2", function (d) {return d.target.y});


      }

      function updateModularityNetwork() {

      }
    }

  }

}]);
  
