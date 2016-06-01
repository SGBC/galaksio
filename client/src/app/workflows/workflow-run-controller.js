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
    '$timeout',
    '$interval',
    'WorkflowList',
    function($scope, $http, $stateParams, $timeout, $interval, WorkflowList){
      //--------------------------------------------------------------------
      // VARIABLE DEFINITION
      //--------------------------------------------------------------------
      var me = this;
      //The corresponding view will be watching to this variavble
      //and update its content after the http response
      $scope.loadingComplete = false;
      $scope.workflow = null;

      me.checkWorkflowStatusInterval = null;

      //--------------------------------------------------------------------
      // DATA INITIALIZATION
      //--------------------------------------------------------------------
      /**
      * This function gets a list of of Workflows from server
      * TODO: SEPARATE IN GROUPS (10 WORKFLOWS ETC.)
      */
      if($stateParams.id !== undefined){
        $scope.workflow = WorkflowList.getWorkflow($stateParams.id);

        $http(getHttpRequestConfig("GET","workflow-info", {extra: $stateParams.id})).then(
          function successCallback(response){
            for (var attrname in response.data) {
              $scope.workflow[attrname] = response.data[attrname];
            }
            $scope.workflow.steps = Object.values($scope.workflow.steps);

            //UPDATE VIEW
            $scope.loadingComplete = true;
          },
          function errorCallback(response){
            //TODO: SHOW ERROR MESSAGE
          });
        }

        //--------------------------------------------------------------------
        // EVENT HANDLERS
        //--------------------------------------------------------------------

        $scope.$on('$destroy', function () {
          console.log("Removing interval");
          $interval.cancel(me.checkWorkflowStatusInterval);
        });

        this.backButtonHandler = function(){
          history.back();
        };

        this.nextStepButtonHandler = function(){
          $scope.currentStep++;

          if($scope.currentStep === 3){
            $scope.workflow.status = "ready";
            $scope.workflow.status_text = "Ready for launch!";

            //Generate the summary
            var html = "";
            var steps = $scope.workflow.steps;
            for(var i in steps){
              debugger;
              if(steps[i].type === "data_input"){
                html +=
                ' <b>' + steps[i].name + (steps[i].id+1) + ':</b>' +
                '<ul>'+
                ' <li>' + steps[i].name + '</li>'+
                ' <li>' + steps[i].inputs[0].name + '<li>'+
                '</ul>'
              }else if(steps[i].extra !== undefined){ //the step was uncollapsed
                var params = requestData.parameters[steps[i].id] = {};
                var inputs = steps[i].extra.inputs
                for(var j in inputs){
                  debugger;
                }
              }
            }
            $('#workflow-summary').html(html);
          }
        }

        this.executeWorkflowHandler = function(event){
          $scope.currentStep++;
          $scope.workflow.status = "sending";
          $scope.workflow.status_text = "Sending to Galaxy...";

          var requestData = {
            "workflow_id": $scope.workflow.id,
            "history": "hist_id=" + Cookies.get("current-history"),
            "ds_map": {},
            "parameters": {}
          };

          var steps = $scope.workflow.steps;
          for(var i in steps){
            if(steps[i].type === "data_input"){
              requestData.ds_map[steps[i].id] = {"src" : "hda", "id" : steps[i].inputs[0].value};
            }else if(steps[i].extra !== undefined){ //the step was uncollapsed
              var params = requestData.parameters[steps[i].id] = {};
              var inputs = steps[i].extra.inputs
              for(var j in inputs){
                params[inputs[j].name] = inputs[j].value;
              }
            }
          }

          $timeout( function(){
            $http(getHttpRequestConfig("POST", "workflow-run", {
              extra: $scope.workflow.id,
              headers: {'Content-Type': 'application/json; charset=utf-8'},
              data: requestData
            })).then(
              function successCallback(response){
                $scope.workflow.status = "success";
                $scope.workflow.status_text = "Success!";

                $timeout( function(){
                  $scope.workflow.status = "working";
                  $scope.workflow.status_text = "Working...";

                  me.checkWorkflowStatusInterval = $interval( function(){
                    //TODO: CHECK WORKFLOW STATUS WHILE THIS VIEW IS SHOWN
                    debugger;
                  }, 1000);
                },
                2000);
              },
              function errorCallback(response){
                $scope.workflow.status = "error";
                $scope.workflow.status_text = "Failed.";
              }
            );
          },
          2000);
        };
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
        var $scope = $scope;
        //The corresponding view will be watching to this variavble
        //and update its content after the http response
        $scope.loadingComplete = false;
        $scope.collapsed = true;
        // $scope.step = null;

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
          $scope.collapsed = !$scope.collapsed;
          //If the remaining data for the step was not loaded yet, send the request
          if(!$scope.loadingComplete){
            if($scope.step.type !== "data_input"){
              //If the tool is not an input data tool, request the info from server
              //and store the extra info for the tool at the "extra" field
              $http(getHttpRequestConfig("GET", "tools-info", {extra: $scope.step.tool_id})).then(
                function successCallback(response){
                  $scope.step["extra"] = response.data;
                  //UPDATE VIEW
                  $scope.loadingComplete = true;
                },
                function errorCallback(response){
                  //TODO: SHOW ERROR MESSAGE
                });
              }else{
                //However, if the tool is an input data field, we need to retrieve the
                //available datasets for current history and display as a selector
                //TODO: GET THE CURRENT history IDENTIFIER
                //TODO: GET THE FILES ONLY IF NOT LOADED PREVIOUSLY (AUTO REMOVE AFTER N MINUTES)
                $http(getHttpRequestConfig("GET", "datasets-list", {extra: Cookies.get("current-history")})).then(
                  function successCallback(response){
                    var files = [];

                    for(var i in response.data){
                      if(response.data[i].history_content_type === "dataset" && !response.data[i].deleted){
                        files.push(response.data[i]);
                      }
                    }

                    $scope.step.files = files;
                    //UPDATE VIEW
                    $scope.loadingComplete = true;
                  },
                  function errorCallback(response){
                    //TODO: SHOW ERROR MESSAGE
                  });
                }
              }
            };
          }
        ]);
      })();
