(function() {

  GALAXY_SERVER_URL= "/galaxy/";
  getRequestPath = function(service, extra){
    extra = (extra || "");
    switch (service) {
      case "user-sign-in":
      return GALAXY_SERVER_URL + "api/authenticate/baseauth";
      case "workflow-list":
      return GALAXY_SERVER_URL + "api/workflows/";
      case "workflow-info":
      return GALAXY_SERVER_URL + "api/workflows/"+ extra + "/download";
      case "workflow-run":
      return GALAXY_SERVER_URL + "api/workflows/"+ extra + "/invocations";
      case "invocation-state":
      return GALAXY_SERVER_URL + "api/workflows/"+ extra[0] + "/invocations/" + extra[1];      
      case "tools-info":
      return GALAXY_SERVER_URL + "api/tools/" + extra + "/build";
      case "datasets-list":
      return GALAXY_SERVER_URL + "api/histories/" + extra + "/contents";
      case "history-list":
      return GALAXY_SERVER_URL + "api/histories/" + extra;
      default:
      return "";
    }
  };

  getHttpRequestConfig = function(method, service, options){
    options = (options || {});
    options.params = (options.params || {});
    if(Cookies.get("galaxysession")){
      options.params = angular.merge(options.params, {"key" : window.atob(Cookies.get("galaxysession"))});
    }
    return {
      method: method,
      url: getRequestPath(service, options.extra),
      params: options.params,
      headers: options.headers,
      data: options.data
    };
  }

  var app = angular.module('b3galaxyApp', [
    'common.dialogs',
    'ui.router',
    'angular-toArrayFilter',
    'users.directives.user-session',
    'workflows.controllers.workflow-list',
    'workflows.controllers.workflow-run',
    'histories.controllers.history-list'
  ]);

  //DEFINE THE ENTRIES FOR THE WEB APP
  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      // For any unmatched url, redirect to /login
      $urlRouterProvider.otherwise("/");

      var signin = {
        name: 'signin',
        url: '/signin',
        templateUrl: "app/users/user-sign-in.tpl.html",
        data: {requireLogin: false}
      },
      home = {
        name: 'home',
        url: '/',
        templateUrl: "app/home/home.tpl.html",
        data: {requireLogin: true}
      },
      workflows = {
        name: 'workflows',
        url: '/workflows',
        templateUrl: "app/workflows/workflow-list.tpl.html",
        data: {requireLogin: true}
      },
      workflowDetail = {
        name: 'workflowDetail',
        url: '/workflows/:id',
        templateUrl: "app/workflows/workflow-run.tpl.html",
        data: {requireLogin: true}
      },
      histories = {
        name: 'histories',
        url: '/histories',
        templateUrl: "app/histories/history-list.tpl.html",
        data: {requireLogin: true}
      };
      $stateProvider.state(signin);
      $stateProvider.state(home);
      $stateProvider.state(workflows);
      $stateProvider.state(workflowDetail);
      $stateProvider.state(histories);
    }]);

    app.controller('MainController', function ($rootScope, $scope, $state) {
      var me = this;

      this.pages = [
        {name: 'home', title: 'Home', icon : 'home'},
        {name: 'workflows', title: 'Workflows', icon : 'share-alt'},
        {name: 'histories', title: 'Histories', icon : 'history'},
      ];

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requireLogin = toState.data.requireLogin;

        var galaxyuser = Cookies.get("galaxyuser");
        var galaxysession = Cookies.get("galaxysession");

        //Check if the user is logged in, redirect to signin panel
        if (requireLogin && (galaxyuser === undefined || galaxysession === undefined)) {
          event.preventDefault();
          Cookies.remove("galaxysession");
          $state.go('signin');
        }
      });

      this.setPage = function (page) {
        $state.transitionTo(page);
      };

      this.getPageTitle  = function(page){
        return
      };

      this.setCurrentPageTitle = function(page){
        $scope.currentPageTitle = page;
      };

      this.toogleMenuCollapseHandler = function(){
        $("#wrapper").toggleClass("toggled")
      }
    });
  })();
