'use strict';


angular.module('eventPlanner.eventCreate', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/new-event', {
		templateUrl: 'event-create/eventcreate.html',
		controller: 'EventCreateCtrl',
		requiresLogin: true
  });
}])

/*
	Controller for the Create Event form.
*/
.controller('EventCreateCtrl', ['$scope', '$location', function($scope, $location) {
	$scope.event = {
		startDate: util.zeroDateTime(new Date())
	};
	$scope.today = util.zeroDateTime(new Date());

	$scope.eventTypes = [
		'birthday',
		'meetup',
		'meeting',
		'night out',
		'party',
		'wedding',
		'baptism',
		'graduation',
		'reception',
		'wake',
		'family reunion',
		'reunion',
		'dinner',
		'lunch',
		'breakfast',
		'brunch',
		'conference talk',
		'conference',
		'vacation'
	];

	$scope.event.guests = null;

	$scope.addGuest = function(guestName) {
		if (!$scope.event.guests) {
			$scope.event.guests = [];
		}

		if (guestName)
			$scope.event.guests.push(guestName.toLowerCase());

		return 1;
	}

	$scope.clearGuests = function() {
		$scope.event.guests = null;
	}

	$scope.priorToToday = function(date) {
		return date ? date < $scope.today : false;
	}

	$scope.removeGuest = function(i) {
		$scope.event.guests.splice(i, 1);

		if ($scope.event.guests.length === 0) {
			$scope.clearGuests();
		}
	}

	$scope.updateEndTimeMin = function() {
		var ev = $scope.event;

		if (!ev.startDate || !ev.endDate || !ev.startTime) {
			delete ev.endTimeMin;
			return;
		}

		if (ev.startDate.getTime() == ev.endDate.getTime()) {
			ev.endTimeMin = ev.startTime;
		}
		else {
			delete ev.endTimeMin;
		}
	}

	$scope.updateEndDate = function() {
		if (!($scope.event.endDate) || ($scope.event.endDate < $scope.event.startDate)) {
			$scope.event.endDate = $scope.event.startDate;
			$scope.updateEndTimeMin();
		}

		return 1;
	}

	// Save to backend when form valid and submitted
	$scope.save = function(user) {
    if (user.addEvent($scope.event)) {
    	$location.path('/');
    };

    return 1;
	}

	$scope.cancelEvent = function(evt) {
		evt.stopImmediatePropagation();
		evt.preventDefault();

		return 1;
	}
}])
