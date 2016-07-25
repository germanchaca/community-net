
angular.module('app.directives.network', [])
.directive('network', function() {

  // isolate scope
  return {
    scope: { 
      'links': '=',
      'nodes': '=',
      'cluster': '=',
    },
    restrict: 'E',
    template: '<div id="network"></div>',
    link: link
  };

  function link(scope, element) {
    scope.$watchCollection('[links,nodes,cluster]',function(newVal){
      // if(newVal[0]) console.log(newVal)
      if(newVal[0]) draw(newVal);
    });

    var margin = {top: 20, right: 20, bottom: 20, left: 20 },
            width = 960-margin.left-margin.right,
            height=600
    var svg = d3.select("#network").append("svg")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width",width + margin.left + margin.right)
                .append("g")
                .attr("class","canvas")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    function draw(data){
      d3.select(".canvas").selectAll("*").remove();

      var graph_links=data[0],
          graph_nodes=data[1],
          cluster=data[2]

      var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph_links)
      .enter().append("line")
        // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(graph_nodes)
          .enter().append("circle")
          .attr("r", 5)
          .attr("fill", function(d) { return color(d.community); })
          .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      node.append("title")
          .text(function(d) { return d.id; });

      simulation
          .nodes(graph_nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(graph_links);

      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
      }
    }//end draw function
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
});