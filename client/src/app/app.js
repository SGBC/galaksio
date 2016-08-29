(function() {

	GALAXY_SERVER    = "/";
	GALAXY_SERVER_URL= GALAXY_SERVER +  "";
	getRequestPath = function(service, extra){
		extra = (extra || "");
		switch (service) {
			case "user-sign-in":
			return GALAXY_SERVER_URL + "api/authenticate/baseauth";
			case "user-sign-up":
			return GALAXY_SERVER_URL + "user/create?cntrller=user";
			case "user-info":
			return GALAXY_SERVER_URL + "api/users/" + extra;
			case "workflow-list":
			return GALAXY_SERVER_URL + "api/workflows/";
			case "workflow-info":
			return GALAXY_SERVER_URL + "api/workflows/"+ extra + "/download";
			case "workflow-run":
			return GALAXY_SERVER_URL + "api/workflows/"+ extra + "/invocations";
			case "workflow-import":
			return GALAXY_SERVER_URL + "api/workflows/" + extra;
			case "invocation-state":
			return GALAXY_SERVER_URL + "api/workflows/"+ extra[0] + "/invocations/" + extra[1];
			case "invocation-result":
			return GALAXY_SERVER_URL + "api/workflows/"+ extra[0] + "/invocations/" + extra[1] + "/steps/" + extra[2];
			case "tools-info":
			return GALAXY_SERVER_URL + "api/tools/" + extra + "/build";
			case "datasets-list":
			return GALAXY_SERVER_URL + "api/histories/" + extra + "/contents";
			case "dataset-details":
			return GALAXY_SERVER_URL + "api/datasets/" + extra[0];
			case "history-list":
			return GALAXY_SERVER_URL + "api/histories/" + extra;
			case "dataset-upload":
			return GALAXY_SERVER_URL + "api/tools/" + extra;
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
		if(options.urlEncodedRequest === true){
			//CONVERT TO URL ENCODE DATA
			options.transformRequest =  function(obj) {
				var str = [];
				for(var p in obj)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
				return str.join("&");
			};
		}
		var requestData = {
			method: method,
			headers: options.headers,
			url: getRequestPath(service, options.extra),
			params: options.params,
			data: options.data
		};
		if(options.transformRequest !== undefined){
			requestData.transformRequest = options.transformRequest;
		}

		return requestData;
	}

	var app = angular.module('b3galaxyApp', [
		'common.dialogs',
		'ui.router',
		'angular-toArrayFilter',
		'users.directives.user-session',
		'workflows.controllers.workflow-list',
		'workflows.controllers.workflow-run',
		'histories.controllers.history-list',
		'datasets.controllers.dataset-list'
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
				url: '/workflow-detail/',
				params : {
					id : null,
					invocation_id : null
				},
				templateUrl: "app/workflows/workflow-run.tpl.html",
				data: {requireLogin: true}
			},
			histories = {
				name: 'histories',
				url: '/histories',
				templateUrl: "app/histories/history-page.tpl.html",
				data: {requireLogin: true}
			};
			$stateProvider.state(signin);
			$stateProvider.state(home);
			$stateProvider.state(workflows);
			$stateProvider.state(workflowDetail);
			$stateProvider.state(histories);
		}]);

		//Define the events that are fired when an user login, log out etc.
		app.constant('AUTH_EVENTS', {
			loginSuccess: 'auth-login-success',
			loginFailed: 'auth-login-failed',
			logoutSuccess: 'auth-logout-success',
			sessionTimeout: 'auth-session-timeout',
			notAuthenticated: 'auth-not-authenticated',
			notAuthorized: 'auth-not-authorized'
		});
		app.constant('HISTORY_EVENTS', {
			historyChanged: 'history-changed'
		});

		app.controller('MainController', function ($rootScope, $scope, $state) {
			var me = this;

			this.pages = [
				{name: 'home', title: 'Home', icon : 'home'},
				{name: 'workflows', title: 'Workflows', icon : 'share-alt'},
				{name: 'histories', title: 'Histories', icon : 'history'}
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
