'use strict';

angular.module('app.directives.worldmap', [])
.directive('worldmap', [function() {

  // isolate scope
  return {
    restrict: 'E',
    template: '<div id="world"></div>',
    scope: {
      data: '='
    },
    link: link
  };

  function link(scope, element){
    scope.$watch('data',function(newVal){
      if(newVal) {
        draw(newVal);
      }
    });
    var margin = {top: 10, right: 0, bottom: 0, left: 0},
    // width = document.querySelector('#world').offsetWidth - margin.left - margin.right,
    width=400,
    height = 150 - margin.top - margin.bottom;
    // var color = d3.scale.category20();

    var color=['#2079b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a']
    var projection = d3.geo.mercator();

    var path = d3.geo.path()
       .projection(projection);

    function draw(data){
      var partition_map={}
      data.forEach(function(d){
          partition_map[d.iso3c]=d.partition
      })
      // var community=d3.set(partition.map(function(d){return d.partition;})).values()

      d3.select("#world").select("svg").remove()

      var svg = d3.select("#world").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class","map")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")scale(0.5)");

      // zoom and pan
      var zoom = d3.behavior.zoom()
          .on("zoom",function() {
              svg.attr("transform","translate("+ 
                  d3.event.translate.join(",")+")scale("+d3.event.scale+")");
              svg.selectAll("path")  
                  .attr("d", path.projection(projection)); 
        });

      d3.select("#world").select("svg").call(zoom)

      d3.json("../worldmap.json",function(world){
      
        // d3.select("#map").append("g")
        //     .attr("id","mapCountries")
        //     .attr("transform","translate(0,50)");

        d3.select(".map").selectAll(".pathCountry")
                .data(world.features)
                .enter().append("path")
                .attr("class", "pathCountry")
                .attr("d", path)
                .style("fill", function(d,i){
                  if(partition_map[d.id]!==undefined){
                    return color[partition_map[d.id]];                  
                    // return color[partition_map[d.id]];
                  } 
                 })
                .append("svg:title")
                .text(function(d) {return d.id});

      })
    }
  }

  }]);