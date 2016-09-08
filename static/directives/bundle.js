'use strict';

angular.module('app.directives.network', [])
.directive('network', [function() {

  // isolate scope
  return {
    restrict: 'E',
    template: '<div id="network"></div>',
    scope: {
      graph: '=',
      layoutMethod: '='
    },
    link: link
  };

  function link(scope, element) {

    scope.$watch('graph',function(newVal){
      if(newVal) {
        var flare_data=flare(newVal)
        draw(flare_data);
        // draw(newVal)
      }
    });
    var color = d3.scale.category20()
    var node,link;

    function flare(graph_data){
      var flare=[]
      var data=JSON.parse(JSON.stringify(graph_data))
      data.nodes.forEach(function(n){
        data.edges.forEach(function(e){
          if(n.id===e.source) e.source=n
          if(n.id===e.target) e.target=n
        })
      })

      data.nodes.forEach(function(n){
        flare.push({
              name:n.community+";"+n.id,
              type:n.community,
              imports:[]
        })
      })
      flare.forEach(function(d){
        data.edges.forEach(function(e){
          if(e.source.id===d.name.split(";")[1]){
              d.imports.push(e.target.community+";"+e.target.id)
            }
        })
      })
      return flare;
    }

    var diameter = 600,
    radius = diameter / 2,
    innerRadius = radius - 120;

    var cluster = d3.layout.cluster()
        .size([360, innerRadius])
        .sort(null)
        .value(function(d) { return d.size; });

    var bundle = d3.layout.bundle();

    var line = d3.svg.line.radial()
        .interpolate("bundle")
        .tension(.85)
        .radius(function(d) { return d.y; })
        .angle(function(d) { return d.x / 180 * Math.PI; });
    
    function draw(data){
      svg = d3.select("#network").select("svg").remove()

      var svg = d3.select("#network").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform", "translate(" + radius + "," + radius + ")");


      var nodes = cluster.nodes(packageHierarchy(data)),
          links = packageImports(nodes);
      // var nodes=data.nodes,
      //     links=data.edges

      link=svg.selectAll(".link")
          .data(bundle(links))
          .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("class", "link")
          // .style("stroke","lightgrey")
          // .style("stroke",function(d){return color(d[0].type)})
          // .style("fill","none")
          .attr("d", line);

      node=svg.selectAll(".node")
            .data(nodes.filter(function(n) { return !n.children; }))
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      node.append("circle")
          .attr("r",5)
          // .style("fill","none")  
          .style("fill",function(d){return color(d.type)})
      node.append("text")
            .attr("dy", ".31em")
            .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
            .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
            .text(function(d) {
              // console.log(d)
             return d.name.split(";")[1]; })
            .attr("dx", function(d) { 
                var width = d3.select(this).node().getBBox().width/2 + 5;
                return d.x < 180 ? width: -width; })
            .on("mouseover", mouseovered)
            .on("mouseout", mouseouted);
    }

    // Lazily construct the package hierarchy from class names.
    function packageHierarchy(classes) {
      var map = {};

      function find(name, data) {
        var node = map[name], i;
        if (!node) {
          node = map[name] = data || {name: name, children: []};
          if (name.length) {
            node.parent = find(name.substring(0, i = name.lastIndexOf(";")));
            node.parent.children.push(node);
            node.key = name.substring(i + 1);
          }
        }
        return node;
      }

      classes.forEach(function(d) {
        find(d.name, d);
      });

      return map[""];
    }

    // Return a list of imports for the given array of nodes.
    function packageImports(nodes) {
      var map = {},
          imports = [];

      // Compute a map from name to node.
      nodes.forEach(function(d) {
        map[d.name] = d;
      });

      // For each import, construct a link from the source to target node.
      nodes.forEach(function(d) {
        if (d.imports) d.imports.forEach(function(i) {
          imports.push({source: map[d.name], target: map[i]});
        });
      });

      return imports;
    }
    function mouseovered(d) {
      node
          .each(function(n) { n.target = n.source = false; });

      link
          .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
          .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
          .filter(function(l) { return l.target === d || l.source === d; })
          .each(function() { this.parentNode.appendChild(this); });

      node
          .classed("node--target", function(n) { return n.target; })
          .classed("node--source", function(n) { return n.source; });
    }

    function mouseouted(d) {
      link
          .classed("link--target", false)
          .classed("link--source", false);

      node
          .classed("node--target", false)
          .classed("node--source", false);

      // $("#text").html("");
    }

  }
}]);
