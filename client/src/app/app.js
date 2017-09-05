(function() {

	var app = angular.module('b3galaxyApp', [
		'ang-dialogs',
		'ui.router',
		'ngScrollSpy',
		'angular-toArrayFilter',
		'users.directives.user-session',
		'workflows.controllers.workflow-list',
		'workflows.controllers.workflow-run',
		'histories.controllers.history-list',
		'datasets.controllers.dataset-list',
		'admin.controllers.setting-list'
	]);

	app.constant('myAppConfig', {
		VERSION: '0.2.3',
		GALAKSIO_SERVER : "/"  + getPathname()
	});

	//Define the events that are fired in the APP
	app.constant('APP_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		logoutRequired: 'auth-logout-required',
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
			//$urlRouterProvider.otherwise("/");
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
			workflowRun = {
				name: 'workflowRun',
				url: '/workflow-run/',
				params : {
					id : null,
					invocation_id : null
				},
				templateUrl: "app/workflows/workflow-run.tpl.html",
				data: {requireLogin: true}
			},
			workflowDetail = {
				name: 'workflowDetail',
				url: '/workflow-detail/',
				params : {
					id : null,
					mode : null
				},
				templateUrl: "app/workflows/workflow-detail.tpl.html",
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
				data: {requireLogin: false}
			};
			$stateProvider.state(signin);
			$stateProvider.state(home);
			$stateProvider.state(workflows);
			$stateProvider.state(workflowRun);
			$stateProvider.state(workflowDetail);
			$stateProvider.state(histories);
			$stateProvider.state(admin);
		}]
	);


	/******************************************************************************
	*       _____ ____  _   _ _______ _____   ____  _      _      ______ _____   _____
	*      / ____/ __ \| \ | |__   __|  __ \ / __ \| |    | |    |  ____|  __ \ / ____|
	*     | |   | |  | |  \| |  | |  | |__) | |  | | |    | |    | |__  | |__) | (___
	*     | |   | |  | | . ` |  | |  |  _  /| |  | | |    | |    |  __| |  _  / \___ \
	*     | |___| |__| | |\  |  | |  | | \ \| |__| | |____| |____| |____| | \ \ ____) |
	*      \_____\____/|_| \_|  |_|  |_|  \_\\____/|______|______|______|_|  \_\_____/
	*
	******************************************************************************/
	app.controller('MainController', function ($rootScope, $scope, $state, $http, myAppConfig, APP_EVENTS) {
		/******************************************************************************
		*       ___ ___  _  _ _____ ___  ___  _    _    ___ ___
		*      / __/ _ \| \| |_   _| _ \/ _ \| |  | |  | __| _ \
		*     | (_| (_) | .` | | | |   / (_) | |__| |__| _||   /
		*      \___\___/|_|\_| |_|_|_|_\\___/|____|____|___|_|_\
		*        | __| | | | \| |/ __|_   _|_ _/ _ \| \| / __|
		*        | _|| |_| | .` | (__  | |  | | (_) | .` \__ \
		*        |_|  \___/|_|\_|\___| |_| |___\___/|_|\_|___/
		*
		******************************************************************************/

		$rootScope.getRequestPath = function(service, extra){
			extra = (extra || "");
			switch (service) {
				case "user-sign-in":
				return myAppConfig.GALAKSIO_SERVER + "api/authenticate/baseauth";
				case "user-sign-up":
				return myAppConfig.GALAKSIO_SERVER + "api/signup/";
				case "user-info":
				return myAppConfig.GALAKSIO_SERVER + "api/users/" + extra;
				case "workflow-list":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/";
				case "workflow-info":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra;
				case "workflow-download":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra + "/download";
				case "workflow-run":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra + "/invocations";
				case "workflow-import":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/" + extra;
				case "workflow-delete":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/" + extra;
				case "workflow-report":
				return myAppConfig.GALAKSIO_SERVER + "other/workflows/report/";
				case "invocation-state":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra[0] + "/invocations/" + extra[1];
				case "invocation-result":
				return myAppConfig.GALAKSIO_SERVER + "api/workflows/"+ extra[0] + "/invocations/" + extra[1] + "/steps/" + extra[2];
				case "tools-info":
				return myAppConfig.GALAKSIO_SERVER + "api/tools/" + extra + "/build";
				case "datasets-list":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra + "/contents";
				// case "dataset-details":
				// return myAppConfig.GALAKSIO_SERVER + "api/datasets/" + extra[0];
				case "dataset-details":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra[0] + "/contents/" + extra[1];
				case "dataset-collection-create":
				return myAppConfig.GALAKSIO_SERVER + "api/dataset_collections/" + extra;
				case "dataset-collection-details":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra[0] + "/contents/dataset_collections/" + extra[1];
				case "history-list":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra;
				case "history-create":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra;
				case "history-export":
				return myAppConfig.GALAKSIO_SERVER + "api/histories/" + extra + "/exports/";
				case "dataset-upload":
				return myAppConfig.GALAKSIO_SERVER + "api/upload/";
				case "setting-list":
				return myAppConfig.GALAKSIO_SERVER + "admin/list-settings";
				case "setting-update":
				return myAppConfig.GALAKSIO_SERVER + "admin/update-settings";
				case "check-is-admin":
				return myAppConfig.GALAKSIO_SERVER + "admin/is-admin";
				case "get-local-galaxy-url":
				return myAppConfig.GALAKSIO_SERVER + "admin/local-galaxy-url";
				case "send-error-report":
				return myAppConfig.GALAKSIO_SERVER + "admin/send-error-report";
				default:
				return "";
			}
		};

		$rootScope.getHttpRequestConfig = function(method, service, options){
			options = (options || {});
			options.params = (options.params || {});
			if(Cookies.get("galaksiosession")){
				options.params = angular.merge(options.params, {"key" : window.atob(Cookies.get("galaksiosession"))});
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
				url: $rootScope.getRequestPath(service, options.extra),
				params: options.params,
				data: options.data,
				withCredentials : (options.withCredentials === true)
			};
			if(options.transformRequest !== undefined){
				requestData.transformRequest = options.transformRequest;
			}

			return requestData;
		};

		$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
			var requireLogin = toState.data.requireLogin;
			var galaxyuser = Cookies.get("galaxyuser");
			var galaksiosession = Cookies.get("galaksiosession");

			//Check if the user is logged in, redirect to signin panel
			if (requireLogin && (galaxyuser === undefined || galaksiosession === undefined)) {
				event.preventDefault();
				Cookies.remove("galaksiosession");
				$state.go('signin');
			}
		});

		this.showInstallForm = function(){
			this.setPage("admin")
		};

		this.showHomePanel = function(){
			this.setPage("home")
		};

		this.setPage = function (page) {
			$state.transitionTo(page);
			$scope.currentPage = page;
		};

		this.getPageTitle  = function(page){
			debugger
			return
		};

		this.setCurrentPageTitle = function(page){
			$scope.currentPageTitle = page;
		};

		this.getLocalGalaxyURL = function(){
			$http($rootScope.getHttpRequestConfig("GET", "get-local-galaxy-url", {
				headers: {'Content-Type': 'application/json; charset=utf-8'}
			})).then(
				function successCallback(response){
					$rootScope.GALAXY_SERVER_URL = response.data.GALAXY_SERVER_URL;
					$rootScope.MAX_CONTENT_LENGTH = response.data.MAX_CONTENT_LENGTH;
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while getting the local Galaxy URL at MainController:getLocalGalaxyURL";
					console.error(message);
					console.error(response.data);
				}
			);
		};

		$rootScope.sendReportMessage = function(data){
			debugger
			$http($rootScope.getHttpRequestConfig("POST", "send-error-report", {
				headers: {'Content-Type': 'application/json; charset=utf-8'},
				data : data
			})).then(
				function successCallback(response){
					alert("An error report has been generated. Your feedback help us improve Galaksio. Thanks!")
				},
				function errorCallback(response){
					var message = "Failed while sending the report, but don't worry! You can contact us by email ebiokit@gmail.com.";
					alert(message);
					console.error(message);
					console.error(response.data);
				}
			);
		};

		/******************************************************************************
		*            _____   _____ _  _ _____
		*           | __\ \ / / __| \| |_   _|
		*           | _| \ V /| _|| .` | | |
		*      _  _ |___| \_/_|___|_|\_| |_| ___  ___
		*     | || | /_\ | \| |   \| |  | __| _ \/ __|
		*     | __ |/ _ \| .` | |) | |__| _||   /\__ \
		*     |_||_/_/ \_\_|\_|___/|____|___|_|_\|___/
		*
		******************************************************************************/
		$scope.$on(APP_EVENTS.loginSuccess, function (event, args) {
			$http($rootScope.getHttpRequestConfig("GET", "check-is-admin", {
				headers: {'Content-Type': 'application/json; charset=utf-8'},
			})).then(
				function successCallback(response){
					if(response.data.success){
						me.pages.push({name: 'admin', title: 'Settings', icon : 'sliders'});
					}
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while checking if user is admin at MainController:loginSuccess event";
					console.error(message);
					console.error(response.data);
				}
			);
		});

		this.toogleMenuCollapseHandler = function(){
			$("#wrapper").toggleClass("toggled")
		}

		/******************************************************************************
		*      ___ _  _ ___ _____ ___   _   _    ___ ____  _ _____ ___ ___  _  _
		*     |_ _| \| |_ _|_   _|_ _| /_\ | |  |_ _|_  / /_\_   _|_ _/ _ \| \| |
		*      | || .` || |  | |  | | / _ \| |__ | | / / / _ \| |  | | (_) | .` |
		*     |___|_|\_|___| |_| |___/_/ \_\____|___/___/_/ \_\_| |___\___/|_|\_|
		*
		******************************************************************************/
		var me = this;
		$rootScope.myAppConfig = myAppConfig;

		$scope.currentPage = 'home';

		this.pages = [
			{name: 'home', title: 'Home', icon : 'home'},
			{name: 'workflows', title: 'Workflows', icon : 'share-alt'},
			{name: 'histories', title: 'Histories', icon : 'history'}
		];

		this.getLocalGalaxyURL();
	});
})();
