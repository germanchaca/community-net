'use strict';

angular.module('app.directives.histogram', [])
.directive('histogram', [function() {

  // isolate scope
  return {
    restrict: 'E',
    template: '<div id="{{label}}"></div>',
    scope: {
      data: '=',
      label:'='
    },
    link: link
  };

  function link(scope, element) {
    scope.$watch('data',function(newVal){
      if(newVal) {
        draw(newVal);
      }
    });
    var margin = {top: 0, right: 10, bottom: 0, left: 5},
    // width=500,
    height = 100 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        // .domain([30, 110])


    var y = d3.scale.linear()
        .domain([0, 0.5])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format("%"));

    var histogram = d3.layout.histogram()
        .frequency(false)
        .bins(x.ticks(40));
    function draw(data){
      d3.select("#"+scope.label).select("svg").remove()

      var width = document.querySelector('#'+scope.label).offsetWidth - margin.left - margin.right
 
      var svg = d3.select("#"+scope.label).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("class","hist")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain([d3.min(data),d3.max(data)])
       .range([0, width]);
      var bins = histogram(data)

      var bar = svg.selectAll(".bar")
          .data(bins)
          .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(bins[0].dx + bins[0].x) - x(bins[0].x) - 1)
          .attr("height", function(d) { return height - y(d.y); });


      // svg.selectAll(".bar")
      //     .data(bins)
      //     .enter().append("rect")
      //     .attr("class", "bar")
      //     .attr("x", function(d) { return x(d.x) + 1; })
      //     .attr("y", function(d) { return y(d.y); })
      //     .attr("width", x(bins[0].dx + bins[0].x) - x(bins[0].x) - 1)
      //     .attr("height", function(d) { return height - y(d.y); });
    }
  }
}]);
