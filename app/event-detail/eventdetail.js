angular.module('eventPlanner.eventDetail', [])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/event/:eventId', {
    templateUrl: 'event-detail/eventdetail.html',
    controller: 'EventDetailCtrl',
    requiresLogin: true
  });
}])

.controller('EventDetailCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
  $scope.event = $scope.user.events[$routeParams.eventId];
}]);