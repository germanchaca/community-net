
angular.module('app.directives.network', [])
.directive('network', function() {

  // isolate scope
  return {
    scope: { 
      graph: '=',
      layoutMethod: '='
    },
    restrict: 'E',
    template: '<div id="network"></div>',
    link: link
  };

  function link(scope, element) {
    scope.$watch('graph',function(newVal){
      // if(newVal[0]) console.log(newVal)
      if(newVal) draw(newVal);
    });

    scope.$watch('layoutMethod',function(newVal){
      if(newVal) update_layout(newVal)
    });

    var margin = {top: 20, right: 20, bottom: 20, left: 20 },
            width = 960-margin.left-margin.right,
            height=600,
            offset=100
    var x_center = width / 2,
        y_center = height / 2,
        radius = (height - 2 * offset) / 2;

    var n_elements;

    function index_to_rad(index) {
      return 2 * Math.PI * index / n_elements;
    }

    var x_scale = d3.scaleLinear()  
        .domain([0,1])
        .range([x_center, x_center + radius]);

    var y_scale = d3.scaleLinear()
        .domain([0,1])
        .range([y_center, y_center + radius]);

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
    
    function update_layout(layout){
      if(layout==="circular"){
        simulation.stop();
        var circles = svg.selectAll('circle')["_groups"][0];

        svg.selectAll('circle').data().forEach(function(d,i){
          d.x_resume = circles[i].cx.animVal.value;
          d.y_resume = circles[i].cy.animVal.value
        });
        
        svg.selectAll('line')
          .transition().duration(1000)
            .attr('x1', function(d){
              return x_scale(Math.sin(index_to_rad(d.source.index))); })
            .attr('x2', function(d){ return x_scale(Math.sin(index_to_rad(d.target.index))); })
            .attr('y1', function(d){ return y_scale(Math.cos(index_to_rad(d.source.index))); })
            .attr('y2', function(d){ return y_scale(Math.cos(index_to_rad(d.target.index))); });
        
        svg.selectAll('circle')
          .transition().duration(1000)
            .attr('cx', function(d,i){ return x_scale(Math.sin(index_to_rad(i))); })
            .attr('cy', function(d,i){ return y_scale(Math.cos(index_to_rad(i))); });
      }
      else { 
        svg.selectAll('line')
          .transition().duration(1000)
            .attr('x1', function(d){ return d.source.x_resume; })
            .attr('y1', function(d){ return d.source.y_resume; })
            .attr('x2', function(d){ return d.target.x_resume; })
            .attr('y2', function(d){ return d.target.y_resume; });

        svg.selectAll('circle')
          .transition().duration(1000)
            .attr('cx', function(d){ return d.x_resume; })
            .attr('cy', function(d){ return d.y_resume; });

        setTimeout(function(){
          simulation.restart();
        },1000);
      }
    }
    function draw(graph){
      d3.select(".canvas").selectAll("*").remove();
      n_elements = graph.nodes.length;
      var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.edges)
      .enter().append("line")
        // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

      var node = svg.append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(graph.nodes)
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
          .nodes(graph.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(graph.edges);

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