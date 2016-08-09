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
		'ui.router',
		'workflows.services.workflow-list',
		'workflows.services.workflow-run',
		'workflows.directives.workflow-run',
	]);

	/***************************************************************************/
	/*WORKFLOW CONTROLLER*******************************************************/
	/***************************************************************************/
	app.controller('WorkflowRunController', [
		'$state',
		'$scope',
		'$http',
		'$stateParams',
		'$timeout',
		'WorkflowList',
		'WorkflowInvocationList',
		function($state, $scope, $http, $stateParams, $timeout, WorkflowList, WorkflowInvocationList){
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
					$http(getHttpRequestConfig("GET","workflow-info", {
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
							//TODO: SHOW ERROR MESSAGE
						}
					);
				}else {
					$state.go('workflows');
				}
			};

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
							if(!edges[edge_id]){
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
			    },
			    settings: {
						edgeColor: 'default',
						defaultEdgeColor: '#d3d3d3',
						mouseEnabled: false,
						sideMargin: 30,
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

				var myStyles = {
					nodes: {
						size: {by: 'size', bins: 7, min: 20,max: 20},
						icon: {by: 'step_type', scheme: 'iconScheme'},
						color: {by: 'step_type', scheme: 'aSetScheme', set:7},
					},
					edges:{
						size: {by: 'size', min: 7,max: 7},
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
				$scope.invocation.current_step++;

				if($scope.invocation.current_step === 3){
					$scope.invocation.state = "ready";
					$scope.invocation.state_text = "Ready for launch!";
					//TODO: available types are
					//  - genomebuild
					//  - hidden
					//  - hidden_data
					//  - baseurl
					//  - file
					//  - ftpfile
					//  - library_data
					//  - color
					//  - data_collection
					//  - drill_down
					//  - data_column
					//  - select --> DONE
					//  - data --> DONE
					//  - boolean --> DONE
					//  - integer and float
					//  - text --> DONE
					//  - repeat --> DONE
					//  - conditional --> DONE
					//Generate the summary
					var html = "";
					var steps = $scope.workflow.steps;
					for(var i in steps){
						html +=
						"<table>"+
						"<thead>"+
						"  <tr><th colspan='2'>" + steps[i].name +"</th></tr>" +
						"  <tr><th>Field name</th><th>Value</th></tr>"+
						"</thead>";
						if(steps[i].type === "data_input"){
							//Look for the name of the selected file
							var fileName = "";
							for(var j in steps[i].files){
								if(steps[i].files[j].id === steps[i].inputs[0].value){
									fileName = steps[i].files[j].name;
									break;
								}
							}
							html +="  <tr><td>" + steps[i].inputs[0].name + "</td><td>" + fileName + "</td></tr>";
						}else if(steps[i].extra !== undefined){ //the step was uncollapsed
							var inputs = steps[i].extra.inputs;
							for(var j in inputs){
								debugger;
								var value = inputs[j].value;
								//TODO: maniputalte value if the stored value is an object
								html +="  <tr><td>" + inputs[j].label + "</td><td>" + value +  "</td></tr>";
							}
							//var params = requestData.parameters[steps[i].id] = {};
						}else{
							html +="  <tr><td colspan='2'>Using default values</td></tr>";
						}
						html+ "</table>";
					}
					$('#workflow-summary').html(html);
				}
			}

			this.executeWorkflowHandler = function(event){
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
					$http(getHttpRequestConfig("POST", "workflow-run", {
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

			if($stateParams.invocation_id !== null){
				$scope.invocation = WorkflowInvocationList.getInvocation($stateParams.invocation_id);
			}else{
				$scope.invocation = WorkflowInvocationList.getNewInvocation();
			}

			this.retrieveWorkflowDetails($stateParams.id);
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
					//If not an input field
					if($scope.step.type !== "data_input"){
						//If the tool is not an input data tool, request the info from server
						//and store the extra info for the tool at the "extra" field
						$http(getHttpRequestConfig("GET", "tools-info", {
							extra: $scope.step.tool_id,
							params: {history_id : Cookies.get("current-history")}})
						).then(
							function successCallback(response){
								$scope.step["extra"] = response.data;
								//UPDATE VIEW
								$scope.loadingComplete = true;
							},
							function errorCallback(response){
								//TODO: SHOW ERROR MESSAGE
							}
						);
					}else{
						//However, if the tool is an input data field, we need to retrieve the
						//available datasets for current history and display as a selector
						//TODO: GET THE FILES ONLY IF NOT LOADED PREVIOUSLY (AUTO REMOVE AFTER N MINUTES)
						$http(getHttpRequestConfig("GET", "datasets-list", {
							//Only needed if there is no a previous login on Galaxy
							extra: Cookies.get("current-history")})
						).then(
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
							}
						);
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
		}
	]);

	/***************************************************************************/
	/*WORKFLOW STEP CONTROLLER *************************************************/
	/***************************************************************************/
	app.controller('WorkflowInvocationListController', function($state, $scope, $http, $interval, WorkflowInvocationList, AUTH_EVENTS){
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
				$http(getHttpRequestConfig("GET", "invocation-state", {
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
							}
						}

						if(runningSteps > 0 || waitingSteps > 0 || queuedSteps > 0){
							invocation.state = "working";
							invocation.state_text = "Running your workflow...";
						}else if(erroneousSteps > 0){
							invocation.state = "error";
							invocation.state_text = "Failed...";
							//TODO: show summary of results
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
			$http(getHttpRequestConfig("GET", "invocation-result", {
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
				}
			);
		};

		this.recoverWorkflowResultStepOutputDetails = function(invocation, step, output){
			$http(getHttpRequestConfig("GET", "dataset-details", {
				extra: [output.id]
			})).then(
				function successCallback(response){
					output.name = response.data.name;
					output.extension = response.data.extension;
					output.url = response.data.download_url;
				},
				function errorCallback(response){
					debugger;
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
	}
);
})();
