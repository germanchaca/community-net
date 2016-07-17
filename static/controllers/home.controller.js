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
	    }
  	]
  	$scope.methodSelected=$scope.methods[0].id;
  	
  	$scope.$watch("methodSelected",function(newVal){
		methodService.getClustering({
      	method: newVal,
      })
      .then(function (data){
      	console.log(data)
	  	$scope.links=data.links;
	  	$scope.nodes=data.nodes
	  	$scope.cluster=data.clustering;
	  })
  	})

}])