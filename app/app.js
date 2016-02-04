'use strict';

// Declare app level module which depends on views, and components
angular.module('eventPlanner', [
  'ngRoute',
  'LocalStorageModule',
  'eventPlanner.landing',
  'eventPlanner.eventCreate',
  'eventPlanner.eventDetail',
  'eventPlanner.register',
  'eventPlanner.login',
  'formHelpers.formGroup',
  'formHelpers.inputTypes',
  'dummyServices',
  'helpers.toggle',
  'helpers.misc'
])

.config(['$routeProvider', 'localStorageServiceProvider', 
  function($routeProvider, localStorageServiceProvider) {

  $routeProvider.otherwise({redirectTo: '/'});
  localStorageServiceProvider.setPrefix('eventPlanner');
}])

/*
  Ensure user has access to desired page on route change.
  Redirects to landing page if unauthorized.

  Derived from https://coderwall.com/p/f6brkg/angularjs-access-control-and-authentication
*/
.run(['$rootScope', '$location', 'dummyAuthService', 
  function($rootScope, $location, dummyAuthService) {

  $rootScope.$on("$routeChangeStart", function(event, next, current) {
    if(next.requiresLogin && !dummyAuthService.isLoggedIn()) {
      event.preventDefault();
      $location.path('/');
    }
  });
}])

/* 
Top-level controller for eventPlanner app.
Contains utilty scope methods and 
*/
.controller('EventPlannerCtrl', ['$scope', '$timeout', 'dummyAuthService', 
  function($scope, $timeout, auth) {

  $scope.user = null;

  // Update user appropriately on changes to 'auth'
  $scope.$watch(
    function() {
      return auth.isLoggedIn();
    },
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.user = auth.getCurrentUser();
      }
    }
  );

  $scope.amLoggedIn = function() {
    return auth.isLoggedIn();
  }

  /*
    Set focus on element whose id attribute matches the
    passed value. Passed 'id' may include or exclude the 
    leading '#' character.
  */
  $scope.focusId = function(id) {
    $timeout(function() {
      document.querySelector((id.charAt(0) === '#' ? id : '#' + id)).focus();
    }, 10);

    return 1;
  }

  /*
    Write string representation of passed object 'obj' to the console.
    Expected use is impromptu debugging.

    Always returns 1 so it may easily be chained with && in 
    Angular expressions.
  */
  $scope.log = function(obj) {
    console.log(obj);
    return 1;
  }

  $scope.logout = function() {
    auth.logout();
  };
}]);