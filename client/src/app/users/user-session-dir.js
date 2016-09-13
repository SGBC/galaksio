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
* - workflow-list
*
*/
(function(){
  var app = angular.module('users.directives.user-session', [
    'ui.bootstrap',
    'users.controllers.user-session'
  ]);

  app.service('loginModal', function ($uibModal, $rootScope) {
    function assignCurrentUser (user) {
      $rootScope.currentUser = userF;
      return user;
    }

    return function() {
      var instance = $uibModal.open({
        templateUrl: 'app/users/user-sign-in.tpl.html'
      })

      return instance.result.then(assignCurrentUser);
    };
  });

  app.directive("sessionToolbar", function() {
    return {
      restrict: 'E',
      replace:true,
      template:
      '      <div class="sessionToolbar" ng-controller="UserSessionController as controller">' +
      '        <div class="dropdown" ng-show="userInfo.email !== undefined">' +
      '          <button class="btn btn-default dropdown-toggle" id="dropdownMenu1" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
      '            <i class="fa fa-user" aria-hidden="true"></i> {{userInfo.email}}' +
      '            <span class="caret"></span>' +
      '          </button>' +
      '          <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">' +
      '            <li class="dropdown-header">Signed in as <b>{{userInfo.email}}</b></li>' +
      '            <li><a ng-click="controller.signOutButtonHandler()">Sign out</a></li>' +
      // '            <li role="separator" class="divider"></li>' +
      // '            <li><a href="' + GALAXY_SERVER_URL + '" target="_blank">Go to Galaxy site</a></li>' +
      '          </ul>' +
      '        </div>' +
      '      </div>'
    };
  });

	app.directive('ngPwcheck', [function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstPassword = '#' + attrs.ngPwcheck;
				elem.on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val()===$(firstPassword).val();
            ctrl.$setValidity('pwmatch', v);
          });
        });
				$(firstPassword).on('keyup', function () {
					scope.$apply(function () {
						var v = elem.val()===$(firstPassword).val();
						ctrl.$setValidity('pwmatch', v);
					});
				});
      }
    }
  }]);

  app.directive("userSessionInfoPanel", function() {
    return {
      restrict: 'E',
      replace:true,
      template:
      ' <div class="panel panel-container" ng-controller="UserSessionController as controller">' +
      '   <h4>Your account</h4>' +
      '   <p><b>Signed in as </b> <i>{{userInfo.email}}</i></p>' +
      '   <p><b>Disk usage: </b>{{userInfo.disk_usage || "Loading..."}}</p>' +
      '   <a class="btn btn-danger btn-sm" style=" display: block; margin: auto; width: 130px; " ng-click="controller.signOutButtonHandler()">' +
      '     <i class="fa fa-sign-out fa-fw" ></i> Close session' +
      '   </a>' +
      ' </div>'
    };
  });

})();
