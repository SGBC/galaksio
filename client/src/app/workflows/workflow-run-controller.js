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
* - WorkflowRunController
* - WorkflowRunStepController
* - WorkflowInvocationListController
*
*/
(function(){
	var app = angular.module('workflows.controllers.workflow-run', [
		'common.dialogs',
		'ui.bootstrap',
		'ui.router',
		'workflows.services.workflow-list',
		'workflows.services.workflow-run',
		'workflows.directives.workflow-run',
	]);

	/***************************************************************************/
	/*WORKFLOW CONTROLLER*******************************************************/
	/***************************************************************************/
	app.controller('WorkflowRunController', function($state, $rootScope, $scope, $http, $stateParams, $timeout, $dialogs, WorkflowList, WorkflowInvocationList, HistoryList){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		/**
		* This function gets the details for a given Workflow
		* @param workflow_id the id for the Workflow to be retieved
		*/
		this.retrieveWorkflowDetails  = function(workflow_id){
			$scope.workflow = WorkflowList.getWorkflow(workflow_id);
			if($scope.workflow !== null){
				$http($rootScope.getHttpRequestConfig("GET","workflow-info", {
					extra: workflow_id})
				).then(
					function successCallback(response){
						for (var attrname in response.data) {
							$scope.workflow[attrname] = response.data[attrname];
						}
						$scope.workflow.steps = Object.values($scope.workflow.steps);

						$scope.diagram = me.generateWorkflowDiagram($scope.workflow.steps);
						me.updateWorkflowDiagram();
						//UPDATE VIEW
						$scope.loadingComplete = true;
					},
					function errorCallback(response){
						debugger;
						var message = "Failed while retrieving the workflow's details.";
						$dialogs.showErrorDialog(message, {
							logMessage : message + " at WorkflowRunController:retrieveWorkflowDetails."
						});
						console.error(response.data);
					}
				);
			}else {
				$state.go('workflows');
			}
		};

		/**
		* This function creates a network from a given list of steps of a workflow.
		*
		* @param workflow_steps a list of workflow steps
		* @return a network representation of the workflow (Object) with a list
		*         of nodes and a list of edges.
		*/
		this.generateWorkflowDiagram = function(workflow_steps){
			var step=null, edge_id="", edges={}, diagram = {"nodes":[], "edges": []};

			if(workflow_steps === undefined){
				workflow_steps = $scope.workflow.steps;
			}

			try {
				for(var i in workflow_steps){
					step = workflow_steps[i];

					diagram.nodes.push({
						id: step.id,
						label: (step.id+1) + ". " + (step.name || step.label),
						x: step.position.left,
						y: step.position.top,
						step_type: step.type,
					});

					for(var j in step.input_connections){
						edge_id = step.id + "" + step.input_connections[j].id;
						if(!edges[edge_id] && step.input_connections[j].id !== undefined && step.id !== undefined){
							edges[edge_id]=true;
							diagram.edges.push({
								id: edge_id,
								source: step.input_connections[j].id,
								target: step.id,
								type: 'arrow'
							});
						}
					}
				}
			} catch (e) {
				debugger;
			}

			return diagram;
		};

		this.updateWorkflowDiagram = function(diagram){
			if(diagram === undefined){
				diagram = $scope.diagram;
			}

			if($scope.sigma !== undefined){
				debugger
			}

			$scope.sigma = new sigma({
				graph: diagram,
				renderer: {
					container: document.getElementById('sigmaContainer'),
					type: 'canvas'
				},
				settings: {
					edgeColor: 'default',
					defaultEdgeColor: '#d3d3d3',
					// mouseEnabled: false,
					sideMargin: 100,
					labelAlignment: "bottom"
				}
			});

			// Create a custom color palette:
			var myPalette = {
				iconScheme: {
					'data_input': {
						font: 'FontAwesome',
						scale: 1.0,
						color: '#fff',
						content: "\uf15c"
					}
				},
				aSetScheme: {
					7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"]
				}
			};

			var nodeSize = 20;
			var edgeSize = 7;
			if(diagram.nodes.length > 15){
				nodeSize = 9;
				edgeSize = 3;
			}else if(diagram.nodes.length > 10){
				nodeSize = 15;
				edgeSize = 4;
			}

			var myStyles = {
				nodes: {
					size: {by: 'size', bins: 7, min: nodeSize,max: nodeSize},
					icon: {by: 'step_type', scheme: 'iconScheme'},
					color: {by: 'step_type', scheme: 'aSetScheme', set:7},
				},
				edges:{
					size: {by: 'size', min: edgeSize, max: edgeSize},
				}
			};

			// Instanciate the design:
			design = sigma.plugins.design($scope.sigma, {
				styles: myStyles,
				palette: myPalette
			});

			design.apply();
		};

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.cancelButtonHandler = function(){
			history.back();
		};

		this.backButtonHandler = function(){
			$scope.invocation.current_step--;
		};

		this.nextStepButtonHandler = function(){
			if($scope.invocation.valid === true){
				$scope.invocation.current_step++;
			}
		}

		this.executeWorkflowHandler = function(event){
			if($scope.invocation.valid === false){
				return;
			}

			$scope.invocation.current_step++;
			$scope.invocation.state = "sending";
			$scope.invocation.state_text = "Sending to Galaxy...";
			$scope.invocation.workflow_title = $scope.workflow.name;
			$scope.invocation.workflow_id = $scope.workflow.id;

			//TODO: notify change
			WorkflowInvocationList.addInvocation($scope.invocation).saveInvocations();

			//SET THE REQUEST DATA (history id, parameters,...)
			var requestData = {
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
			//SHOW STATE MESSAGE FEW SECONDS BEFORE SEND THE REQUEST
			$timeout( function(){
				$http($rootScope.getHttpRequestConfig("POST", "workflow-run", {
					extra: $scope.workflow.id,
					headers: {'Content-Type': 'application/json; charset=utf-8'},
					data: requestData
				})).then(
					function successCallback(response){
						//SUCCESSFULLY SENT TO SERVER

						//Update the values for the invocation
						delete response.data.state
						delete response.data.workflow_id
						for (var attrname in response.data) {
							$scope.invocation[attrname] = response.data[attrname];
						}

						WorkflowInvocationList.saveInvocations();
					},
					function errorCallback(response){
						$scope.invocation.state = "error";
						$scope.invocation.state_text = "Failed.";
					}
				);
			},
			2000);
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;
		//The corresponding view will be watching to this variable
		//and update its content after the http response
		$scope.loadingComplete = false;
		$scope.workflow = null;
		$scope.filterInputSteps = function (item) {
			return item.type === 'data_input' || (item.type === 'tool' && (item.tool_id === 'upload_workflows' || item.tool_id === 'irods_pull'));
		};
		$scope.filterNotInputSteps = function (item) {
			return !$scope.filterInputSteps(item);
		};
		$scope.adjustValueString = function (input) {
			var input_value = input.value;

			if(input.type === "data"){
				return "Output dataset from Step " + (this.step.input_connections[input.name].id + 1);
			}else if(input.type === "repeat"){
				var inputValue = "";
				try{
					inputValue = JSON.parse(this.step.tool_state)[input.name].replace(/(^\"|\"$)/g,"");
					inputValue = JSON.parse(inputValue);
				}catch(err) {
				}

				var value = "";
				var _key; //queries_0|input2, queries_1|input2, ...
				for(var i in inputValue){ //array of objects
					for(var j in inputValue[i]){
						//{"input2" : Object, "__index__": 0}
						_key = input.name + "_" + inputValue[i]["__index__"] + "|" + j;
						if(this.step.input_connections[_key] !== undefined){
							value += 'Output dataset from step ' + (this.step.input_connections[_key].id + 1)
						}
					}
				}
				return value;
			}else{
				if(input_value instanceof Object){
					debugger
				}else{
					return "" + input_value;
				}
			}
		};
		$scope.findFileName = function (file_id) {
			if($scope.displayedHistory === undefined){
				$scope.displayedHistory = HistoryList.getHistory(Cookies.get("current-history"));
			}
			var files = $scope.displayedHistory.content;
			for(var i in files){
				if(files[i].id === file_id){
					return files[i].name;
				}
			}
			return "Unknown input file";
		};

		if($stateParams.invocation_id !== null){
			$scope.invocation = WorkflowInvocationList.getInvocation($stateParams.invocation_id);
		}else{
			$scope.invocation = WorkflowInvocationList.getNewInvocation();
		}

		this.retrieveWorkflowDetails($stateParams.id);
	});

	/***************************************************************************/
	/*WORKFLOW STEP CONTROLLER *************************************************/
	/***************************************************************************/
	app.controller('WorkflowRunStepController', function($rootScope, $scope, $http, $uibModal, $stateParams, $dialogs, WorkflowList, HistoryList, HISTORY_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		/**
		* This function opens a new dialog for selecting or uploading new datasets
		*
		* @chainable
		* @return {Object} the controller.
		*/
		this.showDatasetSelectorDialog = function(stepInstance, isUpload){
			$scope.active=(isUpload?1:0);
			var modalInstance = $uibModal.open({
				templateUrl: 'app/datasets/dataset-selector-dialog.tpl.html',
				scope: $scope,
				size: "lg"
			});
			modalInstance.result.then(function (selectedItem) {
				try {
					stepInstance.inputs[0].value = selectedItem[0].id
				} catch (e) {
					//pass
				}
			});
			return this;
		}

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		$scope.$on(HISTORY_EVENTS.historyChanged, function (event, args) {
			$scope.displayedHistory = HistoryList.getHistory(Cookies.get("current-history"));
		});
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
				//If not an input field
				if($scope.step.type !== "data_input"){
					//If the tool is not an input data tool, request the info from server
					//and store the extra info for the tool at the "extra" field
					$http($rootScope.getHttpRequestConfig("GET", "tools-info", {
						extra: $scope.step.tool_id,
						params: {history_id : Cookies.get("current-history")}})
					).then(
						function successCallback(response){
							$scope.step["extra"] = response.data;
							//UPDATE VIEW
							$scope.loadingComplete = true;
						},
						function errorCallback(response){
							debugger;
							var message = "Failed while retrieving the details for the tool.";
							$dialogs.showErrorDialog(message, {
								logMessage : message + " at WorkflowRunController:toogleCollapseHandler."
							});
							console.error(response.data);
						}
					);
				}else{
					//However, if the tool is an input data field, we need to retrieve the
					//available datasets for current history and display as a selector
					// The current-history should exist because we shown the list of all histories
					// in the previous step
					$scope.displayedHistory = HistoryList.getHistory(Cookies.get("current-history"));
					//UPDATE VIEW
					$scope.loadingComplete = true;
				}
			}
		};
		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		//The corresponding view will be watching to this variable
		//and update its content after the http response
		$scope.loadingComplete = false;
		$scope.collapsed = true;
	});

	/***************************************************************************/
	/*WORKFLOW INVOCATION LIST CONTROLLER *************************************************/
	/***************************************************************************/
	app.controller('WorkflowInvocationListController', function($state, $rootScope, $scope, $http, $interval, $dialogs, WorkflowInvocationList, AUTH_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------
		this.checkInvocationsState = function(){
			// debugger
			var invocations = WorkflowInvocationList.getInvocations();
			var running = 0, erroneous = 0, done = 0;
			for(var i in invocations){
				if(invocations[i].state == "working"){
					running++;
				}else if(invocations[i].state == "sending"){
					running++;
				}else if(invocations[i].state == "success"){
					done++;
				}else if(invocations[i].state == "error"){
					erroneous++;
				}else if(invocations[i].state == "failed"){
					erroneous++;
				}else{
					debugger;
				}
			}

			$scope.invocations = WorkflowInvocationList.getInvocations();
			$scope.running = running;
			$scope.done = done;
			$scope.erroneous = erroneous;

			if($scope.checkInterval === true){
				for(var i in invocations){
					me.checkInvocationState(invocations[i]);
				}
				WorkflowInvocationList.saveInvocations();
			}
		};

		this.checkInvocationState = function(invocation){
			if(invocation.state != "error" && (invocation.state !== "success" || invocation.hasOutput !== true)){
				$http($rootScope.getHttpRequestConfig("GET", "invocation-state", {
					extra: [invocation.workflow_id, invocation.id]
				})).then(
					function successCallback(response){
						var erroneousSteps = 0;
						var waitingSteps = 0;
						var runningSteps = 0;
						var doneSteps = 0;
						var queuedSteps = 0;

						delete response.data.state
						delete response.data.workflow_id
						for (var attrname in response.data) {
							invocation[attrname] = response.data[attrname];
						}
						//Valid Galaxy job states include:
						//TODO: ‘new’, ‘upload’, ‘waiting’, ‘queued’, ‘running’, ‘ok’, ‘error’, ‘paused’, ‘deleted’, ‘deleted_new’
						for(var i in invocation.steps){
							if(invocation.steps[i].state === null || invocation.steps[i].state === "ok" ){
								doneSteps++;
							}else if(invocation.steps[i].state === 'queued'){
								queuedSteps++;
							}else if(invocation.steps[i].state === 'new'){
								waitingSteps++;
							}else if(invocation.steps[i].state === 'running'){
								runningSteps++;
							}else if(invocation.steps[i].state === 'error'){
								erroneousSteps++;
							}else{
								debugger;
								erroneousSteps++;
							}
						}

						if(runningSteps > 0 || waitingSteps > 0 || queuedSteps > 0){
							invocation.state = "working";
							invocation.state_text = "Running your workflow...";
						}else if(erroneousSteps > 0){
							//TODO: show summary of results
							invocation.state = "error";
							invocation.state_text = "Failed...";
						}else if(invocation.state !== "sending"){
							invocation.state_text = "Done!!";
							invocation.state = "success";
							//Generate the summary of results
							me.recoverWorkflowResults(invocation);
						}
					},
					function errorCallback(response){
						invocation.state = "error";
						invocation.state_text = "Failed.";
					}
				);
			}
		};

		this.recoverWorkflowInvocation = function(invocation){
			$state.go('workflowDetail', {
				'id' : invocation.workflow_id,
				'invocation_id': invocation.id
			});
		};

		this.recoverWorkflowResults = function(invocation){
			for(var i in invocation.steps){
				if(invocation.steps[i].job_id !== null){
					me.recoverWorkflowResultStepDetails(invocation, invocation.steps[i]);
				}
			}
		};

		this.recoverWorkflowResultStepDetails = function(invocation, step){
			$http($rootScope.getHttpRequestConfig("GET", "invocation-result", {
				extra: [invocation.workflow_id, invocation.id, step.id]
			})).then(
				function successCallback(response){
					step.outputs = response.data.outputs;
					invocation.hasOutput = true;

					for(var j in step.outputs){
						me.recoverWorkflowResultStepOutputDetails(invocation, step, step.outputs[j])
					}
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while retrieving the details for the step.";
					$dialogs.showErrorDialog(message, {
						logMessage : message + " at WorkflowRunController:recoverWorkflowResultStepDetails."
					});
					console.error(response.data);
				}
			);
		};

		this.recoverWorkflowResultStepOutputDetails = function(invocation, step, output){
			$http($rootScope.getHttpRequestConfig("GET", "dataset-details", {
				extra: [output.id]
			})).then(
				function successCallback(response){
					output.name = response.data.name;
					output.extension = response.data.extension;
					output.url = response.data.download_url;
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while retrieving the details for the workflow results.";
					$dialogs.showErrorDialog(message, {
						logMessage : message + " at WorkflowRunController:recoverWorkflowResultStepOutputDetails."
					});
					console.error(response.data);
				}
			);
		};

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		$scope.$on(AUTH_EVENTS.loginSuccess, function (event, args) {
			WorkflowInvocationList.recoverInvocations();
		});

		$scope.$on('$destroy', function () {
			console.log("Removing interval");
			$interval.cancel(me.checkInvocationInterval);
		});



		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;

		//The corresponding view will be watching to this variable
		//and update its content after the http response

		$scope.invocations = WorkflowInvocationList.recoverInvocations().getInvocations();
		$scope.running = 0;
		$scope.done = 0;
		$scope.erroneous = 0;
		$scope.checkInterval = false;
		this.checkInvocationInterval = null;

		me.checkInvocationsState();
		//Start the interval that checks the state of the invocation
		me.checkInvocationInterval = $interval(me.checkInvocationsState, 5000);
	});
})();
