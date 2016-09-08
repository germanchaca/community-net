'use strict';
/*
 * Home controller
*/
angular.module('app.controller.home', [])
.controller('home', [ '$scope', '$location', '$http','methodService',
function ($scope, $location, $http,methodService) {

	$scope.methods=[
	    {
	      name:"Hierachical Clustering",
	      id:"hierachical"
	    },
	    {
	      name:"Spectral Clustering",
	      id:"spectral"
	    },
      {
        name:"Louvain",
        id:"louvain"
      }
  	]
    $scope.layouts=[
      {
        name:"Frucheterman-Reingold",
        id:"frucheterman"
      },
      {
        name:"ForceAtlas2",
        id:"forceAtlas2"
      },
      {
        name:"Circular",
        id:"circular"
      }
    ]
    $scope.ranks=[
      {
        name:"Degree",
        id:"degree"
      },
      {
        name:"Betweeness",
        id:"betweeness"
      },
      {
        name:"Closeness",
        id:"closeness"
      },
      {
        name:"PageRank",
        id:"rank"
      }
    ]
  	$scope.methodSelected=$scope.methods[2].id;

    $scope.layoutSelected=$scope.layouts[0].id;
    $scope.rankSelected=$scope.ranks[1].id;

  	$scope.years=d3.range(1792,2015)
  	$scope.yearSelected=1840

  	$scope.clusters=d3.range(2,20)
  	$scope.clusterSelected=2

    $scope.$watchCollection("[methodSelected,yearSelected,clusterSelected]",function(newVal){
  		methodService.getClustering({
        	method: newVal[0],
        	year:newVal[1],
        	cluster:newVal[2]
      })
      .then(function (data){
        var s = new sigma({ graph: data})
        $scope.maxDegree=0;
        // $scope.centrality=data.centrality;
        $scope.partitionMap=data.worldmap;

        $scope.ranks[0]["data"]=data.centrality.degree;
        $scope.ranks[1]["data"]=data.centrality.betweeness;
        $scope.ranks[2]["data"]=data.centrality.closeness;
        $scope.ranks[3]["data"]=data.centrality.rank;

        s.graph.nodes().forEach(function(n) {
          $scope.maxDegree=Math.max($scope.maxDegree,s.graph.degree(n.id))
        })
        $scope.degreeStep=Math.floor($scope.maxDegree/10);
      	$scope.graph=data;
        $scope.node_num=data.nodes.length;
        $scope.edge_num=data.edges.length;
        $scope.partition=d3.set(data.nodes.map(function(d){return d.community})).values().length
  	  })
    })

    $scope.active="md-primary";
    $scope.toggle=function(){
      $scope.active =$scope.active==="md-accent" ? "md-primary":"md-accent";
    }

    $scope.write_gexf = function(){
      var myGexf = gexf.create();
      $scope.graph.nodes.forEach(function(d){
        myGexf.addNode(d);
      })

      $scope.graph.edges.forEach(function(e){
        myGexf.addEdge(e);
      })
      // As a document
      var doc = myGexf.document;

      // As a string
      var string = myGexf.serialize();
    }

}])