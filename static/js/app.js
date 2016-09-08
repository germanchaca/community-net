'use strict';
/*
 * Declare app level module
*/

angular.module('app', [
  'ngMaterial',
  'ngRoute',
  'ngSanitize',
  'app.services',
  'app.directives',
  // // 'app.filters',
  'app.controller.home',
  ])
.config(function($routeProvider){
  // Route
  $routeProvider.when('/', {
  	templateUrl: 'views/home.html',
    controller: 'home'
  });
  $routeProvider.otherwise({redirectTo: '/'})
})

angular.module('app')
.constant('BASE_API_URL', 'http://localhost:5000')
.config(function($mdThemingProvider) {

    // Configure a dark theme with primary foreground yellow
   $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('amber')
    // .backgroundPalette('grey');
  });
