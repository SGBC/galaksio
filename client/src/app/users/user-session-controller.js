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
    'ui.router',
  ]);

  app.controller('UserSessionController', function ($state, $scope, $http) {
    //--------------------------------------------------------------------
    // CONTROLLER FUNCTIONS
    //--------------------------------------------------------------------

    //--------------------------------------------------------------------
    // EVENT HANDLERS
    //--------------------------------------------------------------------

    this.signInButtonHandler = function () {
      if ( $scope.username !== '' && $scope.password !== '' && $scope.username !== undefined && $scope.password !== undefined) {
        $http(getHttpRequestConfig("GET","user-sign-in",{
          headers: {"Authorization": "Basic " + btoa($scope.username + ":" + $scope.password)}}
        )).then(
          function successCallback(response){
            Cookies.remove("galaxyuser", {path: window.location.pathname});
            Cookies.remove("galaxysession", {path: window.location.pathname});
            //GET THE COOKIE
            Cookies.set("galaxyuser", $scope.username, {expires : 1, path: window.location.pathname});
            Cookies.set("galaxysession", btoa(response.data.api_key), {expires : 1, path: window.location.pathname});

            $scope.username = Cookies.get("galaxyuser");
            $state.go('home');
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
      delete $scope.username;
      $state.go('signin');
    };

    //--------------------------------------------------------------------
    // INITIALIZATION
    //--------------------------------------------------------------------
    $scope.username = Cookies.get("galaxyuser");
  }
);
})();
