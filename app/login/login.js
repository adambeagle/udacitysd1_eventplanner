angular.module('eventPlanner.login', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login/login.html',
    controller: 'LoginCtrl',
    requiresLogin: false
  });
}])

.controller('LoginCtrl', ['$scope', '$location', 'dummyAuthService', 
  function($scope, $location, dummyAuthService) {

  $scope.loginFailed = false;

  $scope.login = function() {
    $scope.loginFailed = false;

    if(dummyAuthService.login($scope.email, $scope.password)) {
      $location.path('/');
      return true;
    }

    $scope.loginFailed = true;
    return false;
  };
}])