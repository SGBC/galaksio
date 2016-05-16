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
* - workflow-run-form
*
*/
(function(){
  var app = angular.module('workflows.directives.workflow-run', [
  ]);

  /***************************************************************************/
  /*DIRECTIVES ***************************************************************/
  /***************************************************************************/
  app.directive("workflowRunForm", function($compile) {
    return {
      restrict: 'E',
      template: function(){
        //TODO: MOVE TO A HTML TPL FILE
        var template =  '<div>' +
        '  <h2>Running {{workflow.name}}</h2>' +
        '  <p><b>Author: </b>{{workflow.owner}}</p>' +
        '  <p><b>Description: </b>{{workflow.annotation}}</p>' +
        '  <h3>Steps:</h3>' +
        '  <span ng-hide="loadingComplete"><i class="fa fa-cog fa-spin fa-2x fa-fw margin-bottom"></i> Generating panel...</span>'+
        '  <div ng-if="loadingComplete">'+
        '    <workflow-step ng-repeat="step in workflow.steps"></workflow-step>'+
        '  </div>' +
        '</div>';
        return template;
      }
    };
  });

  app.directive("workflowStep", function($compile) {
    return {
      restrict: 'E',
      template: function(){
        //TODO: MOVE TO A HTML TPL FILE
        var template =  '<div class="panel panel-default stepBox" ng-controller="WorkflowRunStepController as controller">' +
        '  <div class="panel-heading">'+
        '    <b>Step {{step.id}} :</b> {{step.name}} ' +
        '    <a class="collapseStepTool" ng-click="controller.toogleCollapseHandler($event)"><i class="fa fa-plus-square-o" aria-hidden="true"></i></a>' +
        '  </div>' +
        '  <div class="panel-body" ng-hide="collapsed">'+
        '    <span ng-hide="loadingComplete"><i class="fa fa-cog fa-spin fa-2x fa-fw margin-bottom"></i> Loading...</span>'+
        '    <div ng-if="loadingComplete">'+
        '      <step-input ng-repeat="input in step.default.inputs"></step-input>'+
        '    </div>' +
        '  </div>' +
        '</div>';
        return template;
      }
    };
  });

  app.directive("stepInput", function($compile) {
    return {
      restrict: 'E',
      link: function(scope, element){
        debugger
        var template = '<p>hello</p>';

        var linkFn = $compile(template);
        var content = linkFn(scope);
        element.append(content);
      }
    };
  });
})();
