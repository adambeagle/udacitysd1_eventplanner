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


angular.module('helpers.misc', [])

// Naively capitalizes only first character of input string
//
// Note CSS text-transform: capitalize is preferable, but seems to not 
// work in Chrome on <option> elements
.filter('capitalize', function() {
	return function(input) {
		return input[0].toUpperCase() + input.slice(1);
	};
});
