(function() {

	var app = angular.module('b3galaxyApp', [
		'common.dialogs',
		'ui.router',
		'angular-toArrayFilter',
		'users.directives.user-session',
		'workflows.controllers.workflow-list',
		'workflows.controllers.workflow-run',
		'histories.controllers.history-list',
		'datasets.controllers.dataset-list',
		'admin.controllers.setting-list'
	]);

	app.constant('myAppConfig', {
		VERSION: '0.2',
		GALAKSIO_SERVER : "/"
	});

	//Define the events that are fired in the APP
	app.constant('APP_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized',
		historyChanged: 'history-changed'
	});

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
			},
			admin = {
				name: 'admin',
				url: '/admin',
				templateUrl: "app/admin/admin-page.tpl.html",
				data: {requireLogin: true}
			};
			$stateProvider.state(signin);
			$stateProvider.state(home);
			$stateProvider.state(workflows);
			$stateProvider.state(workflowDetail);
			$stateProvider.state(histories);
			$stateProvider.state(admin);
		}]
	);

	app.controller('MainController', function ($rootScope, $scope, $state, myAppConfig) {
		var me = this;
		$rootScope.myAppConfig = myAppConfig;
		$scope.currentPage = 'home';

		this.pages = [
			{name: 'home', title: 'Home', icon : 'home'},
			{name: 'workflows', title: 'Workflows', icon : 'share-alt'},
			{name: 'histories', title: 'Histories', icon : 'history'}
		];

		$rootScope.getRequestPath = function(service, extra){
			extra = (extra || "");
			switch (service) {
				case "user-sign-in":
				return myAppConfig.GALAKSIO_SERVER + "api/authenticate/baseauth";
				case "user-sign-up":
				return myAppConfig.GALAKSIO_SERVER + "user/create?cntrller=user";
				case "user-info":
				return myAppConfig.GALAKSIO_SERVER + "api/users/" + extra;
				case "workflow-list":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/";
				case "workflow-info":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra + "/download";
				case "workflow-run":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra + "/invocations";
				case "workflow-import":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/" + extra;
				case "workflow-delete":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/" + extra;
				case "invocation-state":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra[0] + "/invocations/" + extra[1];
				case "invocation-result":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra[0] + "/invocations/" + extra[1] + "/steps/" + extra[2];
				case "tools-info":
				return myAppConfig.GALAKSIO_SERVER + "api/tools/" + extra + "/build";
				case "datasets-list":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra + "/contents";
				case "dataset-details":
				return myAppConfig.GALAKSIO_SERVER + "api/datasets/" + extra[0];
				case "history-list":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra;
				case "dataset-upload":
				return myAppConfig.GALAKSIO_SERVER + "api/tools/" + extra;
				case "setting-list":
				return myAppConfig.GALAKSIO_SERVER + "admin/list-settings";
				case "setting-update":
				return myAppConfig.GALAKSIO_SERVER + "admin/update-settings";
				default:
				return "";
			}
		};

		$rootScope.getHttpRequestConfig = function(method, service, options){
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
				url: this.getRequestPath(service, options.extra),
				params: options.params,
				data: options.data
			};
			if(options.transformRequest !== undefined){
				requestData.transformRequest = options.transformRequest;
			}

			return requestData;
		};

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
			$scope.currentPage = page;
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
