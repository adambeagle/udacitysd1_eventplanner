angular.module('formHelpers.formGroup', [])

/*
  Empty controllers used for consistency to ensure a form group gets
  its own child scope.

  The addInput directive places the 'input' property in this 
  controller's scope.
*/
.controller('FormGroupCtrl', ['$scope', function($scope) {
}])

.controller('DirectivesCtrl', ['$scope', function($scope) {
}])

/*
  Adds the ngModel controller object from a child <input>
  element to the scope variable 'input.'

  This aids in writing reusable directives which can rely on
  the "input" name to access a form-group's input, rather
  than the "form.inputNameAttribute" pattern.

  Required by the other directives in this module.
*/
.directive('addInput', function() {
  return  {
    require: ['^form'],
    controller: 'DirectivesCtrl',
    link: function(scope, elm, attrs, form) {
      var inputName = elm.find('input')[0].name;

      scope.input = form[0][inputName];
      scope.$parent.input = scope.input;
    }
  };
})

/*
  Adds Bootstrap validation styling to a form-group based on the $valid (etc.)
  attributes of a child input element.

  Requires addInput and FormGroupCtrl on the same element (or the 
  ngModel controller being in scope as 'input').

  ng-class must be "getValid()" to add the appropriate Bootstrap style.
  To add (or overwrite) additional proprerties to ng-class, use the 
  "extra-class" attribute on the element containing this directive.
    Example:
      <ANY ... extra-class="{'has-warning': someExpression}" bootstrap-valid>

  Usage:
    <form name="someForm">
      <ANY ng-controller="FormGroupCtrl" ng-class="getValid()" add-input bootstrap-valid>
        <input name="someInput" ng-model="foo">
      </ANY>
    </form>
*/
.directive('bootstrapValid', ['$parse', function($parse) {
  return {
    require: ['^form', 'addInput'],
    link: function(scope, elm, attrs, ctrls) {
      
      scope.getValid = function() {
        var inp,
          ngClass,
          extras,
          form;

        form = ctrls[0];
        inp = scope.input;

        ngClass = {
          'has-success': (inp.$touched || inp.$dirty) && inp.$valid && !inp.$isEmpty(inp.$viewValue),
          'has-error': ((inp.$touched || form.$submitted || inp.$dirty) && inp.$invalid),
          'form-group': true
        };

        if (attrs.extraClass) {
          extras = $parse(attrs.extraClass)(scope);

          for (var prop in extras) {
            ngClass[prop] = extras[prop];
          }
        }
        
        return ngClass;
      }
    }
  }
}])

/*
  Inserts an error message notifying that a field is required upon the 
  input being $invalid AND $touched or its form $submitted.

  Requires addInput and FormGroupCtrl on the same element (or the 
  ngModel controller being in scope as 'input').

  Usage:
    <form name="someForm">
      <ANY ng-controller="FormGroupCtrl" add-input>
        <input name="someInput" required>
        <required-error-message></required-error-message>
      </ANY>
    </form name="someForm">
*/
.directive('requiredErrorMessage', function() {
  return {
    restrict: 'E',
    require: ['^form', 'addInput'],
    template: '<p class="help-block" ng-show="(input.$touched || input.$dirty || form.$submitted) && input.$error.required">This field is required</p>',
  };
});
