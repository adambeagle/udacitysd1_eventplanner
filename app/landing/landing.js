'use strict';

angular.module('eventPlanner.landing', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
	templateUrl: 'landing/landing.html',
	controller: 'LandingCtrl'
  });
}])

.controller('LandingCtrl', [function() {

}]);
