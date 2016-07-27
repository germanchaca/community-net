angular.module('app.directives.network', [])
.directive('network', function() {

  // isolate scope
  return {
    scope: { 
      'graph': '=',
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

    var margin = {top: 230, right: 20, bottom: 20, left: 300 },
            width = 960-margin.left-margin.right,
            height=600

    var svg = d3.select("#network").append("svg")
                .attr("height", height + margin.top + margin.bottom)
                .attr("width",width + margin.left + margin.right)
                .append("g")
                .attr("class","canvas")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // var color = d3.scaleOrdinal(d3.schemeCategory20);
    var color =d3.scale.category20()

    function valueFormat(x){ return (d3.format(",")(x/1000))+"k";}


    function draw(graph){
      d3.select(".canvas").selectAll("*").remove();
      var chi = viz.ch().data(graph.edges).padding(.05)
        .source(d=>d.source)
        .target(d=>d.target)
        // .sort(sort)
        .value(d=>d.flow)
        .fill(function(d){ return color(d.source);});
      
      chi.defs(svg, 1); 

      // var che = viz.ch().data(data).padding(.05)
      //               .sort(sort)
      //               .valueFormat(valueFormat)
      //               .fill(function(d){ return colors[d];});
            
      // var svg = d3.select("svg");
      // chi.defs(svg, 1); // create defs for curved labels
      // che.defs(svg, 2); // create defs for curved labels

      // svg.append("g").attr("transform", "translate(230,300)").call(che);
      // svg.append("g").attr("transform", "translate(700,300)").call(chi);
      svg.call(chi)
    
      // adjust height of frame in bl.ocks.org
      // d3.select(self.frameElement).style("height", "600px");

    }//end draw function
  }
});