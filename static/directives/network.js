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

    // var color = d3.scaleOrdinal(d3.schemeCategory20)

    var color = d3.scale.category20()

    var s;

    scope.$watch('graph',function(newVal){
      // if(newVal[0]) console.log(newVal)
      if(newVal) draw(newVal);
    });

    scope.$watch('layoutMethod',function(newVal){
      if(s!==undefined && newVal) update_layout(newVal)
    });


    sigma.classes.graph.addMethod('neighbors', function(nodeId) {
      var k,
          neighbors = {},
          index = this.allNeighborsIndex[nodeId] || {};

      for (k in index)
        neighbors[k] = this.nodesIndex[k];

      return neighbors;
    });
    

    var L=10;

    function update_layout(layout){
      s.killForceAtlas2()

      if(layout==="forceAtlas2") s.startForceAtlas2(LAYOUT_SETTINGS);
      
      else if(layout==="frucheterman") {
         // Configure the Fruchterman-Reingold algorithm:
        var frListener = sigma.layouts.fruchtermanReingold.configure(s, {
          iterations: 500,
          easing: 'quadraticInOut',
          duration: 800
        });
        // Bind the events:
        // frListener.bind('start stop interpolate', function(e) {
        //   console.log(e.type);
        // });
        // Start the Fruchterman-Reingold algorithm:
        sigma.layouts.fruchtermanReingold.start(s);
      }
      else if (layout==="circular"){
        var N=s.graph.nodes().length;
        s.graph.nodes().forEach(function(n,i) {
          n.x= L * Math.cos(Math.PI * 2 * i / N - Math.PI / 2)
          n.y= L * Math.sin(Math.PI * 2 * i / N - Math.PI / 2)
        });

        sigma.plugins.animate(s);
      }
    }
    function draw(data){
      if (s!==undefined) s.kill()

      var N=data.nodes.length;
      
      data.nodes.sort(function(a,b){
        return a.community-b.community
      })
      var nodeSize=Math.PI * 2 * L/N

      data.nodes.forEach(function(d,i){
        // d.size=Math.random(1);
        d.color=color(d.community)
        d.circular_x=L * Math.cos(Math.PI * 2 * i / N - Math.PI / 2)
        d.circular_y=L * Math.sin(Math.PI * 2 * i / N - Math.PI / 2)
        d.x=Math.random(1)
        d.y=Math.random(1)
      })
      data.edges.forEach(function(e){
        e.type="curvedArrow";
      })
      s = new sigma({ graph: data, 
                      container: 'network', 
                      // renderer: {
                      //   container: document.getElementById('network'),
                      //   type: 'canvas'
                      // },
                      settings: { 
                        // defaultEdgeType:"curve",
                        defaultEdgeColor:"#999",
                        edgeColor:"default",
                        // drawEdges:false,
                        defaultLabelSize:11, 
                        // labelSize: "proportional",
                        // labelSizeRatio: 1,
                        // labelThreshold: 5,
                      } 
                  });

      update_layout(scope.layoutMethod)
      // var filter=new sigma.plugins.filter(s);

      var maxDegree=0
      s.graph.nodes().forEach(function(n) {
        maxDegree=Math.max(maxDegree,s.graph.degree(n.id))
      })

      s.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
        n.size=s.graph.degree(n.id)>maxDegree/2.5 ? s.graph.degree(n.id):maxDegree/2.5;
      });
      s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
      });

      s.bind('clickNode', function(e) {
        var nodeId = e.data.node.id,
            toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;

        s.graph.nodes().forEach(function(n) {
          if (toKeep[n.id])
            n.color = n.originalColor;
          else
            n.color = '#eee';
        });

        s.graph.edges().forEach(function(e) {
          if ((toKeep[e.source] && e.target===nodeId)||(e.source===nodeId && toKeep[e.target]))
            e.color = e.originalColor;
          else
            e.color = '#eee';
        });
        // filter.undo("neighbors")
        //             .neighborsOf(nodeId,"neighbors")
        //             .apply();
        s.refresh();
      });

      s.bind('clickStage', function(e) {
        s.graph.nodes().forEach(function(n) {
          n.color = n.originalColor;
        });

        s.graph.edges().forEach(function(e) {
          e.color = e.originalColor;
        });
        // filter.undo("neighbors")
        s.refresh();
      });

    }
    var LAYOUT_SETTINGS = {
        worker: true,
        barnesHutOptimize: false,
        strongGravityMode: true,
        gravity: 0.05,
        scalingRatio: 10,
        slowDown: 2
    }
  }
}]);
