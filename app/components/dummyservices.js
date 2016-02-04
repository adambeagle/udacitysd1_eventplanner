/*
  This module contains mocked/dummy services for authorization,
  authentication, and a backend. They are NOT SECURE OR PRODUCTION
  READY in any way, and used only because the specs for this project 
  did not require a "real" backend but required user registration/login.
*/
angular.module('dummyServices', [])

/*
  Mocked authorization service that provides basic support
  for login and logout of a user.

  Derived from http://stackoverflow.com/a/14206567
*/
.factory('dummyAuthService', ['userBuilderService', function(userBuilderService) {
  var currentUser = null;

  return {
    /*
      Returns true if login successful, false otherwise.
    */
    login: function(username, password) {
      var loginAttempt = userBuilderService.getUser(username, password);

      if (loginAttempt) {
        currentUser = loginAttempt;
        return true;
      }

      return false;
    },

    logout: function() { 
      currentUser = null;
    },

    isLoggedIn: function() {
      return Boolean(currentUser);
    },

    getCurrentUser: function() { 
      return currentUser; 
    }
  };
}])

/*
  Dummy backend providing basic support for registering users and 
  retrieving their information.

  Uses localstorage (via angular-local-storage) for persistence.
*/
.factory('dummyBackendService', ['localStorageService', function(localStorageService) {
  function keyAvailable(key) {
    var lsKeys = localStorageService.keys();

      for (var i = 0, len = lsKeys.length; i < len; i++) {
        if (key === lsKeys[i]) {
          return false;
        }
      }

      return true;
  }

  function save(key, val) {
      localStorageService.set(key, JSON.stringify(val));
    }

  return {
    /*
      Returns null if user from 'key' not found, false if password
      was incorrect, and user object otherwise. 
    */
    getUser: function(key, password) {
      var user = localStorageService.get(key);

      if (user) {
        user = JSON.parse(user);
      }
      else {
        return null;
      }

      if (password === user.password)
        return user;

      return false;
    },

    createUser: function(key, user) {
      if (keyAvailable(key)) {
        save(key, user);
        return true;
      }

      return false;
    },

    usernameAvailable: keyAvailable,
    updateUser: save,
  };
}])

/*
  Grabs user object from backend and attaches functions to it.

  The following functions are added to the user object:
    * getNextEventId
    * addEvent
    * removeEvent
*/
.factory('userBuilderService', ['dummyBackendService', function(dummyBackendService) {
  return {
    /*
      Returns null if user from 'key' not found, false if password
      was incorrect, and user object otherwise. 
    */
    getUser: function(username, password) {
      var loginResult = dummyBackendService.getUser(username, password);

      // If loginResult is defined (and not false), it is a user object
      if (loginResult) {
        loginResult.getNextEventId = function() {
          return this.nextEventId++;
        }

        loginResult.addEvent = function(event) {
          event.id = this.getNextEventId();
          this.events[event.id] = event;
          this.numEvents++;
          dummyBackendService.updateUser(this.username, this)
          return true;
        }

        loginResult.removeEvent = function(id) {
          delete this.events[id];
          this.numEvents = Math.max(this.numEvents - 1, 0);
          dummyBackendService.updateUser(this.username, this);

          return true;
        }
      }

      return loginResult;
    }
  }
}])

/*
  Adds validator to element that validates whether its 
  value is available as a username (i.e. whether or not it 
  already exists as a key in dummyBackendService).

  Requires ng-model to be set on element with this directive.

  Example Usage:
    <input type="text" ng-model="someModel" username-available>

  (Directive was placed in this module because it relies 
  on dummyBackendService)
*/
.directive('usernameAvailable', ['dummyBackendService', function(dummyBackendService) {
  return {
    restrict: 'AC',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.usernameTaken = function(modelValue, viewValue) {
        if (!modelValue) return true;

        return dummyBackendService.usernameAvailable(modelValue);
      };
    }
  }
}]);