// loginModal.js
(function(){
    var app = angular.module('user-directives', [
      'ui.bootstrap'
    ]);

    app.service('loginModal', function ($uibModal, $rootScope) {

      function assignCurrentUser (user) {
        $rootScope.currentUser = userF;
        return user;
      }

      return function() {
        var instance = $uibModal.open({
          templateUrl: 'templates/user-login.html',
          controller: 'UserController',
          controllerAs: 'controller'
        })

        return instance.result.then(assignCurrentUser);
      };

    });

    app.controller('UserController', function ($scope) {
      this.cancel = $scope.$dismiss;

      this.login = function (username, password) {
        if ( username === 'admin' && password === '1234') {
            authentication.isAuthenticated = true;
            $scope.template = $scope.templates[1];
            $scope.user = username;
        } else {
            $scope.loginError = "Invalid username/password combination";
        };
      };
    });
  })();
