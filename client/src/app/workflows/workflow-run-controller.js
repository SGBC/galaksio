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
  /*WORKFLOW CONTROLLER*******************************************************/
  /***************************************************************************/
  app.controller('WorkflowRunController', [
    '$scope',
    '$http',
    '$stateParams',
    'WorkflowList',
    function($scope, $http, $stateParams, WorkflowList){
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
        }
      }
    ]);

    /***************************************************************************/
    /*WORKFLOW STEP CONTROLLER *************************************************/
    /***************************************************************************/
    app.controller('WorkflowRunStepController', [
      '$scope',
      '$http',
      '$stateParams',
      'WorkflowList',
      function($scope, $http, $stateParams, WorkflowList){
        //--------------------------------------------------------------------
        // VARIABLE DEFINITION
        //--------------------------------------------------------------------
        var me = $scope;
        //The corresponding view will be watching to this variavble
        //and update its content after the http response
        me.loadingComplete = false;
        me.collapsed = true;
        // me.step = null;

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------

        /**
        * toogleCollapseHandler - this function handles the event fired when the
        * user press the button for hide or show the body of a step panel.
        * If it's the first time that the panel is shown, then we need to create
        * the body of the panel, which includes a HTTP request to Galaxy API in
        * order to retrieve the extra information for the step.
        *
        * @param  {type} event the click event
        * @return {type}       description
        */
        this.toogleCollapseHandler = function(event){
          //Toggle collapsed (view will automatically change due to ng-hide directive)
          //TODO: CHANGE THE ICON TO +/-
          me.collapsed = !me.collapsed;
          //If the remaining data for the step was not loaded yet, send the request
          if(!me.loadingComplete){
            if(me.step.type !== "data_input"){
              //If the tool is not an input data tool, request the info from server
              //and store the extra info for the tool at the "extra" field
              $http({
                method: 'GET',
                url: GALAXY_API_TOOLS + me.step.tool_id + "/build"
              }).then(
                function successCallback(response){
                  me.step["extra"] = response.data;
                  //UPDATE VIEW
                  me.loadingComplete = true;
                },
                function errorCallback(response){
                  //TODO: SHOW ERROR MESSAGE
                });
              }else{
                //However, if the tool is an input data field, we need to retrieve the
                //available datasets for current history and display as a selector
                //TODO: GET THE CURRENT history IDENTIFIER
                //TODO: GET THE FILES ONLY IF NOT LOADED PREVIOUSLY (AUTO REMOVE AFTER N MINUTES)
                $http({
                  method: 'GET',
                  url: GALAXY_API_HISTORIES + "7b668ee810f6cf46/contents"
                }).then(
                  function successCallback(response){
                    var files = [];

                    for(var i in response.data){
                      if(response.data[i].history_content_type === "dataset"){
                        files.push(response.data[i]);
                      }
                    }

                    me.step.files = files;
                    //UPDATE VIEW
                    me.loadingComplete = true;
                  },
                  function errorCallback(response){
                    //TODO: SHOW ERROR MESSAGE
                  });
                }
              }
            };
          }
        ]);

        this.executeWorkflowHandler = function(a){
          debugger;
        }
      })();
