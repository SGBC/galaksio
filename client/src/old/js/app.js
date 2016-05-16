(function() {

  SERVER_URL = "/";

  GALAXY_SERVER_URL = "/galaxydev/api/";
  GALAXY_API_WORKFLOWS = GALAXY_SERVER_URL + "workflows/";
  GALAXY_API_TOOLS = GALAXY_SERVER_URL + "tools/"
  GALAXY_GET_ALL_WORKFLOWS = GALAXY_API_WORKFLOWS + "?show_published=TRUE";

  var app = angular.module('b3galaxyApp', ['ui.router','angular-toArrayFilter', 'workflow-directives', 'user-directives']);

  app.config(['$stateProvider', '$urlRouterProvider',  function ($stateProvider, $urlRouterProvider) {
    // For any unmatched url, redirect to /login
    $urlRouterProvider.otherwise("/");

    var home = {
        name: 'home',
        url: '/',
        templateUrl: "templates/home.html",
        data: {requireLogin: false}
    },
    workflows = {
        name: 'workflows',
        url: '/workflows',
        templateUrl: "templates/workflow-list.html",
        data: {requireLogin: false}
    },
    workflowDetail = {
        name: 'workflowDetail',
        url: '/workflows/:id',
        templateUrl: "templates/workflow-run-form.html",
        data: {requireLogin: false}
    };
    $stateProvider.state(home);
    $stateProvider.state(workflows);
    $stateProvider.state(workflowDetail);
  }]);

  app.run(function ($rootScope, $state, loginModal) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
      var requireLogin = toState.data.requireLogin;

      if (requireLogin && typeof $rootScope.currentUser === 'undefined') {
        event.preventDefault();

        loginModal()
          .then(function () {
            return $state.go(toState.name, toParams);
          })
          .catch(function () {
            return $state.go('welcome');
          });
      }
    });

  });

  app.controller('MainController', function ($scope, $state) {
    $scope.content = ['workflows'];
    $scope.setPage = function (page) {
        $state.transitionTo(page);
    };
  });

})();
