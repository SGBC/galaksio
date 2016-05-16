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
  var app = angular.module('workflows.controllers.workflow-run', [
    'workflows.services.workflow-list',
    'workflows.directives.workflow-run',
  ]);

  /***************************************************************************/
  /*CONTROLLERS **************************************************************/
  /***************************************************************************/
  app.controller('WorkflowRunController', [
    '$scope',
    '$http',
    '$stateParams',
    'WorkflowList',
    function($scope, $http, $stateParams, WorkflowList){
      debugger;

      //--------------------------------------------------------------------
      // VARIABLE DEFINITION
      //--------------------------------------------------------------------
      var me = $scope;
      //The corresponding view will be watching to this variavble
      //and update its content after the http response
      me.loadingComplete = false;
      me.workflow = null;

      //--------------------------------------------------------------------
      // DATA INITIALIZATION
      //--------------------------------------------------------------------
      /**
      * This function gets a list of of Workflows from server
      * TODO: SEPARATE IN GROUPS (10 WORKFLOWS ETC.)
      */
      if($stateParams.id !== undefined){
        me.workflow = WorkflowList.getWorkflow($stateParams.id);

        $http({
          method: 'GET',
          url: GALAXY_API_WORKFLOWS + $stateParams.id + "/download"
        }).then(
          function successCallback(response){
            for (var attrname in response.data) {
              me.workflow[attrname] = response.data[attrname];
            }

            //UPDATE VIEW
            me.loadingComplete = true;
          },
          function errorCallback(response){
            //TODO: SHOW ERROR MESSAGE
          });
        }

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------
        this.backButtonHandler = function(){
          history.back();
          me.$apply();
        }
      }]);



      app.controller('WorkflowRunStepController', [
        '$scope',
        '$http',
        '$stateParams',
        'WorkflowList',
        function($scope, $http, $stateParams, WorkflowList){
          debugger;

          //--------------------------------------------------------------------
          // VARIABLE DEFINITION
          //--------------------------------------------------------------------
          var me = $scope;
          //The corresponding view will be watching to this variavble
          //and update its content after the http response
          me.loadingComplete = false;
          me.collapsed = true;
          //me.step = null;

          //--------------------------------------------------------------------
          // EVENT HANDLERS
          //--------------------------------------------------------------------
          
          this.toogleCollapseHandler = function(event){
            //Toggle collapsed (view will automatically change due to ng-hide directive)
            me.collapsed = !me.collapsed;
            //If the remaining data for the step was not loaded yet, send the request
            if(!me.loadingComplete){
              if(me.step.tool_id !== "input-data"){
                //If the tool is not an input data tool, request the info from server
                //and store the extra info for the tool at the "default" field
                $http({
                  method: 'GET',
                  url: GALAXY_API_TOOLS + me.step.tool_id + "/build"
                }).then(
                  function successCallback(response){
                    me.step["default"] = response.data;
                    //UPDATE VIEW
                    me.loadingComplete = true;
                  },
                  function errorCallback(response){
                    //TODO: SHOW ERROR MESSAGE
                  });
                }else{
                  //However, if the tool is an input data field, we need to retrieve the
                  //available datasets for current history and display as a selector
                  //TODO:
                }
              }
            };
          }]);
        })();
