angular.module('eventPlanner.profile', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/profile', {
    templateUrl: 'profile/profile.html',
    controller: 'ProfileCtrl',
    requiresLogin: true
  });
}])

.controller('ProfileCtrl', ['$scope', 'dummyBackendService', function($scope, dummyBackendService) {
  // Pre-populate information based on current user
  $scope.updatedUser = {
    username: $scope.user.username,
    fullName: $scope.user.fullName,
    employer: $scope.user.employer,
    jobTitle: $scope.user.jobTitle,
    birthday: $scope.user.birthday
  };

  $scope.submitEvent = 'formsubmit';

  $scope.broadcastSubmit = function() {
    $scope.$broadcast($scope.submitEvent);
    console.log('broadcast');
    return 1;
  };

  // Save updated user information to backend
  // Caller must verify fields are valid (with e.g. form.$valid)
  $scope.save = function() {
    var user = $scope.user,
        updUser = $scope.updatedUser;

    user.username = updUser.username;
    user.fullName = updUser.fullName;
    user.employer = updUser.employer;
    user.jobTitle = updUser.jobTitle;
    user.birthday = updUser.birthday;

    dummyBackendService.updateUser(user.username, user);
    return 1;
  }
}]);