'use strict';
/*
 * Home controller
*/
angular.module('app.controller.home', [])
.controller('home', [ '$scope', '$location', '$http','methodService',
function ($scope, $location, $http,methodService) {
	$scope.methods=[
	    // {
	    //   name:"Hierachical Clustering",
	    //   id:"hierachical"
	    // },
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
  	$scope.methodSelected=$scope.methods[1].id;

    $scope.layoutSelected=$scope.layouts[0].id;

  	$scope.years=d3.range(1787,2015)
  	$scope.yearSelected=1920

  	$scope.clusters=d3.range(2,20)
  	$scope.clusterSelected=2

    $scope.$watchCollection("[methodSelected,yearSelected,clusterSelected]",function(newVal){
  		methodService.getClustering({
        	method: newVal[0],
        	year:newVal[1],
        	cluster:newVal[2]
      })
      .then(function (data){
      	$scope.graph=data;
  	  })
    })
    // $scope.changeLayout = function(layout){
    //   $scope.layoutS=layout;

    // }

}])