angular.module('eventPlanner.register', [])

/*
  Controller for the register form.
*/
.controller('RegisterCtrl', 
  ['$scope', 'dummyBackendService', 'dummyAuthService', 
  function($scope, dummyBackendService, dummyAuthService) {

    $scope.userInfo = {}

  /*
    Register new user and log in as the user.
    Return true on success, false otherwise.
  */
  $scope.register = function() {
    var newUser,
        username = $scope.userInfo.username,
        password = $scope.userInfo.password;

    if (!username || !password) return false;

    newUser = (function() {
      var events = {};

      return {
        username: username,
        password: password,
        nextEventId: 0,
        numEvents: 0,
        events: events,
      };
    })();

    dummyBackendService.createUser(username, newUser);
    dummyAuthService.login(username, password);

    return true;
  }
}]);
