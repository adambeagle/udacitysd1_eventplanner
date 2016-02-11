angular.module('formHelpers.inputTypes', [])

/*  
  Overrides Angular's default handling of "date" type inputs.
  The default behavior is problematic in browsers that do not support
  the "date" type (e.g. Firefox); in these browsers the input only
  validates one format -- 'YYYY-MM-DD'.

  This directive allows for a variety of formats, including:
    YYYY-MM-DD
    MM/DD/YYYY
    MM/DD       (year defaults to current)
    Jan 1, 2016 (comma optional, month may be fully written out)
    1 Jan, 2016 (ditto above)
    Jan 1       (year defaults to current)
    1 Jan       (ditto above)

  In any format with a separator character (e.g. the dashes in YYYY-MM-DD)
  that character may be a dash, period, back/forward slash, or space.

  Note years must always be 4-digits.

  Note also that all this validation is a fallback -- browsers (e.g. Chrome)
  which implement type="date" inputs with a widget always produce valid dates.
*/
.directive('date', function() {
  var patterns = [
    {
      // E.g. YYYY-MM-DD
      re: /^\s*([12]\d{3})[-/\\\s\.]+([01]?\d)[-/\\\s\.]+([0-3]?\d)\s*$/,
      order: {year: 0, month: 1, day: 2}
    },
    {
      // E.g. MM/DD/YYYY or MM/DD
      re: /^\s*([01]?\d)[-/\\\s\.]+([0-3]?\d)(?:[-/\\\s\.]+([12]\d{3}))?\s*$/,
      order: {month: 0, day: 1, year: 2}
    },
    // E.g. Jan 1, 2016 or Jan 1
    {
      re: /^\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.a-z]*)\s+([0-3]?\d)(?:st|nd|rd|th)?(?:,?\s+([12]\d{3}))?\s*$/i,
      order: {month: 0, day: 1, year: 2}
    },
    // E.g. 1 Jan 2016 or 1 Jan
    {
      re: /^\s*([0-3]?\d)(?:st|nd|rd|th)?\s+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[.a-z]*)(?:,?\s+([12]\d{3}))?\s*$/i,
      order: {day: 0, month: 1, year: 2}
    }
  ];

  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep',
                'oct', 'nov', 'dec'];

  // Normalize month to integer 0-11.
  // Can work with string representations of numbers, or
  // strings beginning with the values in 'months' above.
  //
  // Assumes numeric months are in range 1-12.
  //
  // Return null if month not valid (not parseable, 
  // or not in appropriate range).

  var normalizeMonth = function(month) {
    month = month.toString().toLowerCase();

    // If length < 3, month must be digits (given the RegExps above)
    if (month.length < 3) {
      month = parseInt(month) - 1;
      return (month >= 0 && month <= 11) ? month : null;
    }
    else {
      month = months.indexOf(month.slice(0, 3));
      return (month >= 0) ? month : null;
    }
  }

  return {
    restrict: 'AC',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {

      // Parser validates based on 'patterns' above, sets
      // modelValue as Date object if valid.
      ctrl.$parsers = [function(value) {
        var day, month, year, reResult, reI, date;

        // Empty value is valid
        if (!value) return null;

        // Match value to regexp from 'patterns'
        for (var i = 0, len = patterns.length; i < len; i++) {
          reResult = patterns[i].re.exec(value);

          if (reResult) { 
            reI = i;
            break;
          }
        }

        // Return undefined (invalid) if no match
        if (!reResult) return;

        // Day and month must be present and in appropriate ranges
        // Else return undefined (invalid)
        day = parseInt(reResult[patterns[reI].order.day + 1]);
        if (day < 1 || day > 31) return;

        month = parseInt(normalizeMonth(
          reResult[patterns[reI].order.month + 1]));
        if (month === null) return;

        // Year optional; defaults to current year if not provided
        year = parseInt(reResult[patterns[reI].order.year + 1]);
        if (!year) year = new Date().getFullYear();

        // Prepare Date object to pass to model
        date = new Date(year, month, day);

        if (date == 'Invalid Date') return;

        return date;
      }];
    }
  };
})

/* 
  Add validator to input field (assumed to be type="password")
  that validates when the length of the input value is a
  minimum length (set as an argument to the directive).

  Requires ng-model to be set on the input.

  The argument set on the directive is evaluated as an angular
  expression, and must resolve to an integer.

  Example usage: 
    <input type="password" ng-model="someModel" password-min-length="8">
*/
.directive('passwordMinLength', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      var minLen = scope.$eval(attrs['passwordMinLength']);

      ctrl.$validators.password = function(modelValue, viewValue) {
        if (!modelValue) return true;

        return modelValue.length >= minLen;
      };
    }
  };
})

/*
  Hooks Google Places autocomplete into the element this directive is
  attached to (assumed to be <input type="text">).

  Input must have ng-model attribute.

  Usage:
    <input type="text" ng-model="someModel" places-autocomplete>
*/
.directive('placesAutocomplete', function() {
  return {
    restrict: 'AC',
    require: 'ngModel',
    link: function(scope, elm, attrs, modelCtrl) {
      var rawInput, autocomplete;

      rawInput = document.querySelector('#' + elm[0].id);
      autocomplete = new google.maps.places.Autocomplete(rawInput);

      // Update view/model values on place_changed event
      // Derived from http://stackoverflow.com/a/24637112
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();

        modelCtrl.$setViewValue(place.formatted_address);
        //scope.$apply();
      });
    }
  };
})

/*
  Overrides Angular's default handling of "time" type inputs.
  The default behavior is problematic in browsers that do not support
  the "time" type (e.g. Firefox); in these browsers the input only
  validates one format -- 'HH:MM' (a 24-hour clock).

  This directive's validators allow for the following formats:
    HH:MM (24-hour)
    HH:MM AM|PM (12-hour)
    HH AM|PM (12-hour)
    noon
    midnight|midnite

  Reasonable variations of the above formats are also acceptable,
  ie. non-padded hours, no space before AM|PM, etc. For example, '1pm' is accepted.

  Hour values over 12 with an AM|PM marker are not valid.

  Value saved to model is Date(0, 0, 0, hour, minute) -- note this value is in local time.
*/
.directive('time', function() {
  var timeRegexp = /^(?:([012]?\d)(?:\:([0-5]\d))?\s*(A\.?M\.?|P\.?M\.?)?$)|noon$|midnight$|midnite$/i;
  
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers = [util.strip, function(value) {
        var result, hour, minute, ampm;

        if (!value) {
          return null;
        }

        result = timeRegexp.exec(value);

        if (!result) {
          return;
        }

        result[0] = result[0].toLowerCase();

        if (result[0] == 'noon') {
          hour = 12;
          minute = 0;
        }
        else if (result[0][0] === 'm') {
          hour = 0;
          minute = 0;
        }
        else {
          hour = parseInt(result[1]);
          minute = result[2] ? parseInt(result[2]) : 0;
          ampm = result[3];
        }

        if (ampm && (hour < 1 || hour > 12)) {
          return;
        }
        else if (!ampm && (hour > 23)) {
          return;
        }

        if (ampm) {
          ampm = ampm.replace(/\./g, '').toLowerCase();

          if (ampm == 'pm' && hour < 12) {
            hour = hour + 12;
          }
          else if (ampm == 'am' && hour == 12) {
            hour = 0;
          }
        }

        return new Date(0, 0, 0, hour, minute);
      }];
    }
  };
})

/*
Overrides default angular validation of "tel" input type
(which is essentially non-existent or at least undocumented).

Validates only NANP (North America-style) numbers.
Numbers may include alphabetic characters (to allow 
for things like 1-800-SOMENUM).

Resulting value in model is always string of only digits
(e.g. view value of '(123) 456-7899' parsed to '1234567899')
*/
.directive('telNanp', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {

      ctrl.$parsers = [

        // Validates only North America-style (NANP) phone numbers
        // Acceptable formats include:
        // #######
        // ###-####
        // ###.###.####
        // (###) ###-####
        // 1-###-###-####
        // +1 (###) ###-####
        //
        // The last seven 'numbers' may be alphanumeric
        function(value) {
          // TODO This is no good for international visitors.
          var phoneRegExp = /^(?:(?:\+?1[- .]?)?(?:\(?\d{3}\)?[- .]?))?[a-z0-9]{3}[- .]?[a-z0-9]{4}$/i;

          if (ctrl.$isEmpty(value)) return '';

          if (!phoneRegExp.test(value)) {
            ctrl.$setValidity('tel', false);
            return;
          }

          return value;
        },

        // Strip everything but alphanumeric characters from valid value
        // Ex: '(123) NUM-BERS' -> '123NUMBERS'
        function(value) {
          return value.replace(/[^a-z0-9]/ig, '');
        }
      ];

      // Override Angular's default tel validator
      // Does nothing; validation is accomplished in $parsers
      ctrl.$validators.tel = function() {
        return true;
      }
    },
  }
})

/*
  Test an <input> value against an array and set a warning 
  ($warnings.duplicate on the ngModel controller object) if it
  matches one already in the array (case-insensitive).

  Usage: <input warn-duplicate="anArray"> where anArray is an angular 
  expression resolving to an array available in the current scope.
*/
.directive('warnDuplicate', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      
      ctrl.$warnings = {};
      ctrl.$warnings.duplicate = false;

      ctrl.$validators.duplicate = function(modelValue, viewValue) {
        var checkAgainst = scope.$eval(attrs.warnDuplicate);
        ctrl.$warnings.duplicate = false;

        if (!modelValue || !checkAgainst) return true;

        viewValue = viewValue.toLowerCase();

        for (var i = 0, len = checkAgainst.length; i < len; i++) {
          if (viewValue === checkAgainst[i]) {
            ctrl.$warnings.duplicate = true;
            return true;
          }
        }

        return true;
      }
    }
  };
})

/*
  Normalizes format of a NANP (North American-style) phone number.

  Expects as input a string of only digits of length 7 (no area code), 
  10 (includes area code), or 11 (includes country and area codes).

  Usage:
    {{ phoneNumber | phone-nanp }}

  Examples:
    '1234567'     -> '123-4567'
    '1234567899'  -> '(123) 456-7899'
    '11234567899' -> '1-123-456-7899'
*/
.filter('phoneNanp', function() {
  return function(val) {
    var formatted = '';

    if (!val) return null;

    switch (val.length) {
      case 7:
        formatted = val.slice(0, 3) + '-' + val.slice(3);
        break;
      case 10:
        formatted = '(' + val.slice(0, 3) + ') ' + val.slice(3, 6) + '-' + val.slice(6);
        break;
      case 11:
        formatted = val[0] + '-' + val.slice(1, 4) + '-' + val.slice(4, 7) + '-' + val.slice(7);
        break;
    }

    return formatted.toUpperCase();
  }
});




//angular.module('formHelpers.traversal', [])

// Prevents form submission when pressing enter while focus is on 
// element (assumed to be an input).
//
// Derived from http://stackoverflow.com/a/18087179 and http://stackoverflow.com/a/18001377

// TODO not in working order
/*.directive('nextOnEnter', function($parse) {
  return {
    require: '^form',
    link: function(scope, elm, attrs, form) {
      elm.bind('keydown', function(evt) {
        var nextId;
        var code = evt.keyCode || evt.which;

        if (code === 13) {
          evt.preventDefault();

          nextId = $parse(attrs.next)({form: form});
          document.querySelector('#' + nextId).focus();
        }
      });
    }
  }
})*/