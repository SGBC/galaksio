/*
* (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
* (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the GNU Lesser General Public License
* (LGPL) version 3 which accompanies this distribution, and is available at
* http://www.gnu.org/licenses/lgpl.html
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
* Lesser General Public License for more details.
*
* Contributors:
*     Rafael Hernandez de Diego <rafahdediego@gmail.com>
*     Tomas Klingström
*     Erik Bongcam-Rudloff
*     and others.
*
* THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
* - UserSessionController
*
*/
(function(){
	var app = angular.module('users.controllers.user-session', [
		'common.dialogs',
		'ui.router',
	]);

	app.controller('UserSessionController', function ($state, $rootScope, $scope, $http, $dialogs, AUTH_EVENTS) {
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------
		this.getCurrentUserDetails = function(){
			$http(getHttpRequestConfig("GET", "user-info", {
				headers: {'Content-Type': 'application/json; charset=utf-8'},
				extra: "current"
			})).then(
				function successCallback(response){
					$scope.userInfo.email = response.data.email;
					$scope.userInfo.username = response.data.username;
					$scope.userInfo.disk_usage = response.data.nice_total_disk_usage;
					Cookies.remove("galaxyusername", {path: window.location.pathname});
					Cookies.set("galaxyusername", $scope.userInfo.username, {expires : 1, path: window.location.pathname});
					Cookies.remove("galaxyuser", {path: window.location.pathname});
					Cookies.set("galaxyuser", $scope.userInfo.email, {expires : 1, path: window.location.pathname});
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while getting user's details at UserSessionController:signInButtonHandler";
					console.error(message);
					console.error(response.data);
				}
			);
		};

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		$scope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
			debugger
			$scope.userInfo.email = Cookies.get("galaxyuser");
		});

		$scope.$on(AUTH_EVENTS.logoutSuccess, function (event, args) {
			delete $scope.userInfo.email;
		});

		this.signFormSubmitHandler = function () {
			if($scope.isLogin){
				this.signInButtonHandler();
			}else{
				this.signUpButtonHandler();
			}
		};

		this.signInButtonHandler = function () {
			if ( $scope.userInfo.email !== '' && $scope.userInfo.password !== '') {
				$http(getHttpRequestConfig("GET","user-sign-in",{
					headers: {"Authorization": "Basic " + btoa($scope.userInfo.email + ":" + $scope.userInfo.password)}}
				)).then(
					function successCallback(response){
						//CLEAN PREVIOUS COOKIES
						Cookies.remove("galaxyuser", {path: window.location.pathname});
						Cookies.remove("galaxysession", {path: window.location.pathname});
						Cookies.remove("current-history", {path: window.location.pathname});

						//SET THE COOKIES
						Cookies.set("galaxyuser", $scope.userInfo.email, {expires : 1, path: window.location.pathname});
						Cookies.set("galaxysession", btoa(response.data.api_key), {expires : 1, path: window.location.pathname});

						$scope.userInfo.email = Cookies.get("galaxyuser");
						delete $scope.userInfo.password
						delete $scope.signForm

						//Notify all the other controllers that user has signed in
						$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

						$state.go('home');
					},
					function errorCallback(response){
						if([404001, 401001].indexOf(response.data.err_code) !== -1){
							$dialogs.showErrorDialog("Invalid user or password.");
							return;
						}

						debugger;
						var message = "Failed during sign-in process.";
						$dialogs.showErrorDialog(message, {
							logMessage : message + " at UserSessionController:signInButtonHandler."
						});
						console.error(response.data);
					}
				);
			};
		};

		this.signUpButtonHandler = function () {
			if ( $scope.userInfo.email !== '' && $scope.userInfo.username !== '' && $scope.userInfo.password !== '' && $scope.userInfo.password == $scope.userInfo.passconfirm ) {
				$http(getHttpRequestConfig("POST","user-sign-up",{
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					urlEncodedRequest: true,
					data: {
						email : $scope.userInfo.email,
						username : $scope.userInfo.username,
						password : $scope.userInfo.password,
						confirm : $scope.userInfo.password,
						create_user_button:"Submit"
					}}
				)).then(
					function successCallback(response){
						response = $(response.data).find(".errormessage").text();

						if(response === undefined || response === "" ){
							$dialogs.showSuccessDialog("Your account has been created!");
							$scope.isLogin=true;
						}else{
							$dialogs.showErrorDialog("Failed when creating new account: " + response);
						}

						delete $scope.userInfo.password
						delete $scope.userInfo.passconfirm
						delete $scope.signForm
					},
					function errorCallback(response){
						debugger;
						var message = "Failed during sign-up process.";
						$dialogs.showErrorDialog(message, {
							logMessage : message + " at UserSessionController:signUpButtonHandler."
						});
						console.error(response.data);
					}
				);
			};
		};

		this.signOutButtonHandler = function () {
			Cookies.remove("galaxyuser", {path: window.location.pathname});
			Cookies.remove("galaxysession", {path: window.location.pathname});
			Cookies.remove("current-history", {path: window.location.pathname});
			Cookies.remove("galaxyusername", {path: window.location.pathname});
			sessionStorage.removeItem("workflow_invocations");
			delete $scope.userInfo.email;
			$state.go('signin');

			//Notify all the other controllers that user has signed in
			$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		$scope.userInfo = {
			email : Cookies.get("galaxyuser")
		};
		this.getCurrentUserDetails();
	}
);
})();
