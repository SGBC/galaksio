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
* - users.controllers.user-session
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

    //--------------------------------------------------------------------
    // EVENT HANDLERS
    //--------------------------------------------------------------------
    $scope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
      debugger
      $scope.email = Cookies.get("galaxyuser");
    });

    this.signInButtonHandler = function () {
      if ( $scope.email !== '' && $scope.password !== '' && $scope.email !== undefined && $scope.password !== undefined) {
        $http(getHttpRequestConfig("GET","user-sign-in",{
          headers: {"Authorization": "Basic " + btoa($scope.email + ":" + $scope.password)}}
        )).then(
          function successCallback(response){
            Cookies.remove("galaxyuser", {path: window.location.pathname});
            Cookies.remove("galaxysession", {path: window.location.pathname});
            Cookies.remove("current-history", {path: window.location.pathname});
            //GET THE COOKIE
            Cookies.set("galaxyuser", $scope.email, {expires : 1, path: window.location.pathname});
            Cookies.set("galaxysession", btoa(response.data.api_key), {expires : 1, path: window.location.pathname});

            $scope.email = Cookies.get("galaxyuser");

            //Notify all the other controllers that user has signed in
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

            $state.go('home');
          },
          function errorCallback(response){
            //TODO: SHOW ERROR MESSAGE
          }
        );
      };
    };

    this.signUpButtonHandler = function () {
      //TODO: CHECK PASS EQUIVALENCE ON THE FLY
      //TODO: Use a password of at least 6 characters
      //TODO: Public name must contain only lower-case letters, numbers and '-'
      if ( $scope.email !== '' && $scope.username !== '' && $scope.password !== '' && $scope.email !== undefined && $scope.username !== undefined && $scope.password !== undefined && $scope.password == $scope.passconfirm ) {
        $http(getHttpRequestConfig("POST","user-sign-up",{
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          urlEncodedRequest: true,
          data: {
            email : $scope.email,
            username : $scope.username,
            password : $scope.password,
            confirm : $scope.password,
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
          },
          function errorCallback(response){
            //TODO: SHOW ERROR MESSAGE
          }
        );
      };
    };

    this.signOutButtonHandler = function () {
      Cookies.remove("galaxyuser", {path: window.location.pathname});
      Cookies.remove("galaxysession", {path: window.location.pathname});
      Cookies.remove("current-history", {path: window.location.pathname});
      sessionStorage.removeItem("workflow_invocations");
      delete $scope.email;
      $state.go('signin');
    };

    //--------------------------------------------------------------------
    // INITIALIZATION
    //--------------------------------------------------------------------
    $scope.email = Cookies.get("galaxyuser");
  }
);
})();
