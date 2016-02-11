// Wraps utility functions useful throughout project
var util = (function() {
	/*
  	Return Date object 'date' with time set to exactly midnight local time.
	*/
	function zeroDateTime(date) {
		date.setHours(0, 0, 0, 0);

		return date;
	}

	/*
		Strip all leading and trailing whitespace from string 'str'
	*/
	function strip(str) {
		var result = /^\s*(\S(?:.*\S)?)\s*$/.exec(str);

		return !result ? '': result[1];
	}

	return {
		strip: strip,
		zeroDateTime: zeroDateTime
	}
})();



angular.module('helpers.toggle', [])

/*
	Attaching this controller to an element makes it toggleable
  via the toggle() function or setting the 'on' attribute.
*/
.controller('ToggleCtrl', ['$scope', function($scope) {
	$scope.on = false;

	// Always return 1 (so function may easily be chained with && in view)
	$scope.toggle = function() {
		$scope.on = !$scope.on;

		return 1;
	}
}])

/*

*/
.directive('toggleLink', ['$timeout', function($timeout) {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		link: function(scope, elm, attrs) {
			var toggle = function() {
				scope.toggle();
				$timeout(function() {
					scope.focusId(attrs.focusTo);
  			}, 10);
			}

			elm.on('mouseup', function(event) {
				if (event.which === 1) 
					toggle();
			})

			elm.on('keydown', function(event) {
				if (event.which === 32 || event.keyCode === 32 || event.key === 'Spacebar')
					toggle();

				if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter')
					toggle();
			});
		},
		template: '<a tabindex="0" role="button" ng-transclude></a>'
	};
}])

/* 
	Turns the scope's ToggleCtrl off when the event whose
	name is attached to the directive is caught.

	Note the event name is evaluated as an angular expression;
	to use a string literal, wrap the name in single quotes.

 	USAGE:
  	<ANY ng-controller="ToggleCtrl" off-on-event="someExpression">...</ANY>
 */
.directive('offOnEvent', function() {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs) {
			var eventName = scope.$eval(attrs.offOnEvent);

			scope.$on(eventName, function(event) {
				if (scope.on) scope.toggle();
			});
		}
	};
});


angular.module('helpers.misc', [])

// Evaluate the angular expression attached to the directive
// when an element (presumed to be an <a> but it's not necessary)
// is interacted with like a button, i.e. when left-clicked
// or when spacebar is pressed while element is in focus.
//
//
// Usage:
//   <ANY on-press="someExpression"></ANY>
.directive('onPress', function() {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs) {
			var action = function() {
				scope.$eval(attrs.onPress);
			};
			
			elm.on('keydown', function(event) {
				if (event.which === 32 || event.keyCode === 32 || event.key === 'Spacebar') {
					action()

				if (event.which === 13 || event.keyCode === 13 || event.key === 'Enter')
					action();
				}	
			});

			elm.on('mouseup', function(event) {
				if (event.button === 0)
					action();
			});
		}
	};
})

// Naively capitalizes only first character of input string
//
// Note CSS text-transform: capitalize is preferable, but seems to not 
// work in Chrome on <option> elements
.filter('capitalize', function() {
	return function(input) {
		return input[0].toUpperCase() + input.slice(1);
	};
})

// If input value is undefined, null, or empty string return a message
// indicating value is not set. Argument to filter is message;
// If not passed, a default message is used.
//
// Usage:
//   <ANY>{{ someVar | emptyMessage[:'Custom Message'] }}</ANY>
.filter('emptyMessage', function() {
	return function(input, msg) {
		msg = msg ? msg : '(Not set)';

		return ((typeof input === 'undefined') || input === null || input === '') ? msg : input;
	};
});
