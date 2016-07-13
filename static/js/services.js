'use strict';

/* Services */

angular.module('app.services', [])

/* get method */
.factory('methodService',  ['$http', '$q', 'BASE_API_URL', function($http, $q, BASE_API_URL) {
   return {

    getClustering : function(params) {
      var deferred = $q.defer();
      var serviceUrl = '/clustering'
      $http({
        method: 'GET',
        url : BASE_API_URL + serviceUrl,
        params : params,
        cache: true
      }).success(function(data){
       deferred.resolve(data);
      }).error(function(){
       deferred.reject("Error 500 : An error occured while fetching data");
      });
      return deferred.promise;
    }
  }
}])