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
		'ang-dialogs',
		'ui.bootstrap',
		'ui.router',
		'ngSanitize',
		'workflows.services.workflow-list',
		'workflows.services.workflow-run',
		'workflows.directives.workflow-run',
	]);

	/***************************************************************************/
	/*WORKFLOW CONTROLLER*******************************************************/
	/***************************************************************************/
	app.controller('WorkflowRunController', function($state, $rootScope, $scope, $http, $window, $stateParams, $timeout, $dialogs, WorkflowList, WorkflowInvocationList, HistoryList, APP_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		/**
		* This function gets the details for a given Workflow
		* @param workflow_id the id for the Workflow to be retieved
		*/
		this.retrieveWorkflowDetails  = function(workflow_id, invocation_id){
			$scope.workflow = WorkflowList.getWorkflow(workflow_id);
			if(!$scope.workflow && !invocation_id){
				$state.go('workflows');
				return;
			}else if(!$scope.workflow){
				$scope.workflow = {};
			}

			$scope.loadingComplete = false;
			$http($rootScope.getHttpRequestConfig("GET","workflow-download", {
				extra: workflow_id})
			).then(
				function successCallback(response){
					for (var attrname in response.data) {
						$scope.workflow[attrname] = response.data[attrname];
					}
					$scope.workflow.steps = Object.values($scope.workflow.steps);
					if($scope.workflow.name.search(/^imported: /) !== -1){
						$scope.workflow.name = $scope.workflow.name.replace(/imported: /g, "");
						$scope.workflow.imported = true;
					}

					if($scope.invocation && $scope.invocation.current_step === 6){
						$scope.params = me.flattenStepParameters(); //Generate the complete list of params for the request.
					}else{
						$scope.diagram = me.generateWorkflowDiagram($scope.workflow.steps);
						me.updateWorkflowDiagram();
					}

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
					$scope.loadingComplete = true;
				}
			);

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

		this.updateWorkflowDiagram = function(diagram, doLayout){
			if(diagram === undefined){
				diagram = $scope.diagram;
			}

			if($scope.sigma === undefined){

				$scope.sigma = new sigma({
					graph: diagram,
					renderer: {
						container: document.getElementById('sigmaContainer'),
						type: 'canvas'
					},
					settings: {
						edgeColor: 'default',
						defaultEdgeColor: '#d3d3d3',
						mouseWheelEnabled: false,
						sideMargin: 100,
						labelAlignment: "bottom"
					}
				});
			}

			// Create a custom color palette:
			var myPalette = {
				iconScheme: {
					'data_input': {
						font: 'FontAwesome',
						scale: 1.0,
						color: '#fff',
						content: "\uf15c"
					},'data_collection_input': {
						font: 'FontAwesome',
						scale: 1.0,
						color: '#fff',
						content: "\uf0c5"
					}
				},
				aSetScheme: {
					7: ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"]
				}
			};

			var nodeSize = 15;
			var edgeSize = 5;
			if(diagram.nodes.length > 15){
				nodeSize = 9;
				edgeSize = 3;
			}else if(diagram.nodes.length > 10){
				nodeSize = 15;
				edgeSize = 4;
			}

			var myStyles = {
				nodes: {
					size: {by: 'size', bins: 7, min: nodeSize, max: nodeSize},
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

			if(doLayout === true){
				// Configure the DAG layout:
				sigma.layouts.dagre.configure($scope.sigma, {
					directed: true, // take edge direction into account
					rankdir: 'LR', // Direction for rank nodes. Can be TB, BT, LR, or RL,
					easing: 'quadraticInOut', // animation transition function
					duration: 800, // animation duration
				});

				// Start the DAG layout:
				sigma.layouts.dagre.start($scope.sigma);
			}
		};

		this.getDownloadLink = function(dataset_url){
			if(dataset_url === undefined){
				debugger
				return "";
			}
			var fullpath = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
			dataset_url.replace(fullpath,"");
			dataset_url = $scope.GALAXY_SERVER_URL + dataset_url;
			return dataset_url;
		};

		this.getInvocationStateImage = function(state){
			state = state || "waiting";

			var extension=".png";
			if(state === "working"){
				extension=".gif";
			}
			return "css/invocation_" + state + extension;
		};

		/**
		* This function validates a given form and returns the list
		* of invalid fields, if any,
		**/
		this.getErroneousFields = function(aform, erroneousFields){
			erroneousFields = erroneousFields || {elements: [], labels: []};
			if(aform && aform.$error && aform.$error.required){
				var errors = aform.$error.required;
				for(var i in errors){
					var _error, element;
					try {
						element = $("[name=" + errors[i].$name + "] ").siblings("label")[0];
						_error = element.textContent + " (" + errors[i].$name + ")";
					} catch (e) {
						element= $(".ng-invalid[name=" + errors[i].$name + "] ")[0];
						_error = "Input name: " + errors[i].$name;
					}
					//Avoid repeating the fields
					if(erroneousFields.labels.indexOf(_error) > -1){
						var n = 2;
						var __error = _error + "[" + n + "]"
						while(erroneousFields.labels.indexOf(__error) > -1){
							n++;
							__error = _error + "[" + n + "]"
						}
						_error = __error;
					}
					erroneousFields.elements.push(element);
					erroneousFields.labels.push(_error);
				}
			}
			return erroneousFields;
		};

		this.checkNextStepButtonState = function(){
			//False = enabled, True = disabled button
			return $scope.loadingComplete === false
			|| ($scope.invocation.current_step === 3 && $scope.workflowRunForm.step1form.$invalid)
			|| ($scope.invocation.current_step === 4 && $scope.workflowRunForm.step2form.$invalid);
		};

		$scope.filterInputSteps = function (item) {
			return item.type === 'data_input' || item.type === "data_collection_input" || (item.type === 'tool' && (item.tool_id === 'upload_workflows' || item.tool_id === 'irods_pull'));
		};

		$scope.filterNotInputSteps = function (item) {
			return !$scope.filterInputSteps(item);
		};

		/**
		* This function adjust the textual representation for the value of a given
		* input. This function is mainly used for showing the workflow overview prior to
		* workflow execution.
		**/
		$scope.adjustValueString = function (type, input_value) {
			if(type === "data"){
				return "Output dataset from Step " + (input_value + 1);
			}else if(type === "repeat"){
				debugger
				//TODO
			}else{
				if(input_value instanceof Array){
					return "" + input_value;
				}else if(input_value instanceof Object){
					debugger
				}else{
					return "" + input_value;
				}
			}
		};

		$scope.adjustTitleString = function (input) {
			return input.label || input.title || input.test_param.label;
		};

		this.flattenStepParameters = function(invocation_steps){
			var step_params = [];
			var step, type, params;
			for(var i in $scope.workflow.steps){
				step = $scope.workflow.steps[i];
				if(step.type === "data_input" || step.type === "data_collection_input"){
					step_params.push({
						id : step.id,
						name : step.name,
						type : step.type,
						inputs : step.inputs
					});
				}else{
					var params=[];
					if(step.extra && step.extra.inputs){ //the step was uncollapsed
						params = this.flattenParameters(step.extra.inputs, step, params);
					}
					step_params.push({
						id : step.id,
						name : step.name,
						params : params
					});
				}
			}
			return step_params;
		};

		this.flattenParameters = function(inputs, step, params, prefix){
			prefix = (prefix || "");
			for(var i in inputs){
				var type = inputs[i].type;
				if(type === "data"){
					try{
						params.push({
							name : prefix + inputs[i].name,
							label : $scope.adjustTitleString(inputs[i]),
							value : step.input_connections[prefix + inputs[i].name].id,
							type : type
						});
					}catch(e){

					}
				}else if(type === "repeat"){
					debugger
					// var inputValue = "";
					// try{
					// 	inputValue = JSON.parse(this.step.tool_state)[input.name].replace(/(^\"|\"$)/g,"");
					// 	inputValue = JSON.parse(inputValue);
					// }catch(err) {
					// }
					//
					// var value = "";
					// var _key; //queries_0|input2, queries_1|input2, ...
					// for(var i in inputValue){ //array of objects
					// 	for(var j in inputValue[i]){
					// 		//{"input2" : Object, "__index__": 0}
					// 		_key = input.name + "_" + inputValue[i]["__index__"] + "|" + j;
					// 		if(this.step.input_connections[_key] !== undefined){
					// 			value += 'Output dataset from step ' + (this.step.input_connections[_key].id + 1)
					// 		}
					// 	}
					// }
				} else if(type === "conditional"){
					//Add the value for the selector e.g. "advanced_options|advanced_options_selector":"on"
					var _prefix = prefix + inputs[i].name + "|";
					params.push({
						name : _prefix + inputs[i].test_param.name,
						label : $scope.adjustTitleString(inputs[i]),
						value : inputs[i].value,
						type : type
					});
					//Add all the subvalues for the selected option
					for(var j in inputs[i].cases){
						if(inputs[i].cases[j].value === inputs[i].value){
							this.flattenParameters(inputs[i].cases[j].inputs, step, params, _prefix);
							break;
						}
					}
				}else if(type === "section"){
					var _prefix = prefix + inputs[i].name + "|";
					//Add all the subvalues for the section
					for(var j in inputs[i].inputs){
						this.flattenParameters(inputs[i].inputs[j].inputs, step, params, _prefix);
					}
				}else{
					params.push({
						name : prefix + inputs[i].name,
						label : $scope.adjustTitleString(inputs[i]),
						value : inputs[i].value,
						type : type
					});
				}
			}
			return params;
		};

		$scope.findFileName = function (file_id) {
			if(file_id === undefined){
				return "";
			}
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

		$scope.adaptOptionsData = function(options){
			if( options instanceof Array){
				var newOptions = [];
				for(var i in options){
					newOptions.push({"value" : options[i][1], "label" : options[i][0]});
				}
				return newOptions;
			}
			return options;
		};

		this.getInvocationStepStatus = function(step){
			var invocation_steps = $scope.invocation.steps;
			for(var i in invocation_steps){
				if(invocation_steps[i].order_index === step.id){
					var state = invocation_steps[i].state;
					if(step.type === "data_input" || step.type === "data_collection_input"){
						state="ok";
					}

					if(state === "ok"){
						return "<i class='fa fa-check text-success'></i> Done";
					} else if(state === "error"){
						return "<i class='fa fa-times text-danger'></i> Failed";
					} else if(state === "new"){
						return "<i class='fa fa-clock-o text-muted'></i> New";
					} else if(state === "queued"){
						return "<i class='fa fa-clock-o text-danger'></i> Queued";
					} else if(state === "running"){
						return "<i class='fa fa-play text-info'></i> Running";
					} else if(state === "paused"){
						return "<i class='fa fa-pause text-muted'></i> Paused";
					} else if(state !== null){
						return "<i class='fa fa-question text-muted'></i> " + state[0].toUpperCase() + state.substr(1);
					}
				}
			}
			return "-";
		};

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		$scope.$on(APP_EVENTS.invocationStateChanged, function (event, args) {
			debugger
			if($scope.invocation && $scope.invocation.id === args.invocation_id){
				if(args.new_state === "error" || args.new_state === "success"){
					$rootScope.$broadcast(APP_EVENTS.invocationResultsRequired, args);
				}
			}
		});

		this.cancelButtonHandler = function(){
			history.back();
		};

		this.backButtonHandler = function(){
			$scope.invocation.current_step--;
		};

		this.nextStepButtonHandler = function(){
			var form;
			if($scope.invocation.current_step===3){
				form=$scope.workflowRunForm.step1form;
			}else if($scope.invocation.current_step===4){
				form=$scope.workflowRunForm.step2form;
				$scope.params = this.flattenStepParameters(); //Generate the complete list of params for the request
			}

			var erroneousFields = this.getErroneousFields(form);

			if(erroneousFields.labels.length > 0){
				$scope.invocation.valid = false;
				$scope.erroneousFields = erroneousFields.labels;

				try {
					$('html, body').animate({
						scrollTop: $(erroneousFields.elements[0]).offset().top  - 60
					}, 1000);
				} catch (e) {
				}
				return;
			}

			$scope.invocation.valid = true;
			$scope.invocation.current_step++;
			return;
		};

		this.executeWorkflowHandler = function(event){
			if($scope.invocation.valid === false){
				return;
			}

			$scope.invocation.current_step++;
			$scope.invocation.id = randomIDgenerator(10);
			$scope.invocation.is_temporal = true;
			$scope.invocation.state = "sending";
			$scope.invocation.state_text = "Sending to Galaxy...";
			$scope.invocation.workflow_title = $scope.workflow.name;
			$scope.invocation.workflow_id = $scope.workflow.id;

			//SET THE REQUEST DATA (history id, parameters,...)
			var requestData = {
				batch: true,
				history: "hist_id=" + Cookies.get("current-history"),
				new_history_name : null,
				parameters: {},
				parameters_normalized : true,
				replacement_params : {}
			};

			for(var i in $scope.params){
				var params = requestData.parameters[$scope.params[i].id] = {};
				if($scope.params[i].type === "data_input"){
					params["input"] = {
						batch: false,
						values : [{src : "hda", id : $scope.params[i].inputs[0].value}]
					}
				} else if($scope.params[i].type === "data_collection_input"){
					params["input"] = {
						batch: false,
						values : [{src : "hdca", id : $scope.params[i].inputs[0].value}]
					}
				}else if($scope.params[i].params && Object.values($scope.params[i].params).length > 0){ //the step was uncollapsed
					var inputs = $scope.params[i].params;
					var pattern = /input[0-9]*$/;
					for(var j in inputs){
						if(!pattern.test(inputs[j].name)){
							params[inputs[j].name] = inputs[j].value;
						}
					}
				}
			}
			WorkflowInvocationList.addInvocation($scope.invocation);
			$rootScope.$broadcast(APP_EVENTS.updatedInvocations);

			//SHOW STATE MESSAGE FEW SECONDS BEFORE SEND THE REQUEST
			$timeout( function(){
				$http($rootScope.getHttpRequestConfig("POST", "workflow-run", {
					extra: $scope.workflow.id,
					headers: {'Content-Type': 'application/json; charset=utf-8'},
					data: requestData
				})).then(
					function successCallback(response){
						//SUCCESSFULLY SENT TO SERVER
						// Remove temporal entry
						console.log("Prev invocation id was " + $scope.invocation.id);
						WorkflowInvocationList.removeInvocation($scope.invocation);
						delete $scope.invocation.is_temporal;
						//Update the values for the invocation
						delete response.data[0].state
						delete response.data[0].workflow_id
						for (var attrname in response.data[0]) {
							$scope.invocation[attrname] = response.data[0][attrname];
						}
						console.log("New invocation id is " + $scope.invocation.id);
						$rootScope.last_invocation=$scope.invocation.id;
						//Add new entry
						WorkflowInvocationList.addInvocation($scope.invocation).saveInvocations();
					},
					function errorCallback(response){
						$scope.invocation.state = "error";
						$scope.invocation.state_text = "Failed.";
					}
				);
			},
			2000);
		};

		this.layoutDiagramHandler = function(){
			this.updateWorkflowDiagram($scope.diagram, true);
		};

		this.zoomDiagramHandler = function(zoom){
			zoom = (($scope.sigma.camera.ratio * 100) + (10 * zoom))/100;
			$scope.sigma.camera.goTo({"ratio": zoom});
			return;
		};

		this.downloadInvocationReportHandler = function(format){
			// if(!format){
			// 	format="pdf";
			// }
			//
			// $http($rootScope.getHttpRequestConfig("POST","workflow-report", {
			// 	data: {
			// 		'format' : format,
			// 		'workflow' : $scope.workflow,
			// 		'invocation' : $scope.invocation
			// 	}
			// })).then(
			// 	function successCallback(response){
			// 		var file_path = response.data.path;
			// 		$window.open(file_path, "Report");
			// 	},
			// 	function errorCallback(response){
			// 		debugger;
			// 		var message = "Failed while retrieving the workflow's report.";
			// 		$dialogs.showErrorDialog(message, {
			// 			logMessage : message + " at WorkflowRunController:downloadInvocationReport."
			// 		});
			// 		console.error(response.data);
			// 		$scope.loadingComplete = true;
			// 	}
			// );
			$http($rootScope.getHttpRequestConfig("PUT","history-export", {
				extra : Cookies.get("current-history")
			})).then(
				function successCallback(response){
					var download_url = response.data.download_url + "?key=" + window.atob(Cookies.get("galaksiosession"));
					$window.open(download_url, "Download");
				},
				function errorCallback(response){
					debugger;
					var message = "Failed while retrieving the workflow's report.";
					$dialogs.showErrorDialog(message, {
						logMessage : message + " at WorkflowRunController:downloadInvocationReport."
					});
					console.error(response.data);
					$scope.loadingComplete = true;
				}
			);
		};

		this.showInvocationDetailsButtonHandler = function(){
			debugger
			$scope;
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;
		//The corresponding view will be watching to this variable
		//and update its content after the http response
		$scope.loadingComplete = false;
		$scope.workflow = null;
		$scope.viewMode = $stateParams.mode;

		if($stateParams.invocation_id !== null){
			$scope.invocation = WorkflowInvocationList.getInvocation($stateParams.invocation_id);
		}else{
			$scope.invocation = WorkflowInvocationList.getNewInvocation();
		}

		this.retrieveWorkflowDetails($stateParams.id, $stateParams.invocation_id);
	});

	/***************************************************************************/
	/*WORKFLOW STEP CONTROLLER *************************************************/
	/***************************************************************************/
	app.controller('WorkflowRunStepController', function($rootScope, $scope, $http, $sanitize, $uibModal, $stateParams, $dialogs, WorkflowList, HistoryList, APP_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		/**
		* This function opens a new dialog for selecting or uploading new datasets
		*
		* @chainable
		* @return {Object} the controller.
		*/
		this.showDatasetSelectorDialog = function(stepInstance, isUpload, hiddenTabs, dataType, dataSubtype){
			$scope.dataType=(dataType?dataType:'file');
			$scope.dataSubtype=dataSubtype;
			if($scope.dataType === 'file'){
				$scope.active_tab=(isUpload?2:0);
			}else {
				$scope.active_tab=(isUpload?3:1);
			}
			$scope.hiddenTabs=(hiddenTabs?hiddenTabs:[]);

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
		$scope.$on(APP_EVENTS.historyChanged, function (event, args) {
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
			$scope.collapsed = !$scope.collapsed;
			//If the remaining data for the step was not loaded yet, send the request
			if(!$scope.loadingComplete){
				//If not an input field
				if($scope.step.type !== "data_input" && $scope.step.type !== "data_collection_input"){
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

		$scope.showStepHelp = function(){
			if($scope.helpHtml === undefined){
				$scope.helpHtml = $sanitize($scope.step.extra.help + '<a style="color: #e61669;" class="clickable" ng-click="isCollapsed=!isCollapsed;"> Hide help</a>');
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
	app.controller('WorkflowInvocationListController', function($state, $rootScope, $scope, $http, $interval, $dialogs, WorkflowInvocationList, APP_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------
		/**
		* This function retrieves the complete list of invocations for all the workflows
		* for current user. First the function retrieves the list of workflows and then
		* for each workflow retrieves the invocations.
		**/
		this.getInvocationsHandler = function(){
			if(Cookies.get("galaksiosession") === undefined){
				return;
			}

			console.log("Updating complete list of invocations...");
			$rootScope.$broadcast(APP_EVENTS.updatingInvocations);

			$scope.isLoading = true;
			$http($rootScope.getHttpRequestConfig("GET", "workflow-list")).then(
				function successCallback(response){
					var workflows = response.data;
					me.recoverInvocationsRec(0, workflows);
				},
				function errorCallback(response){
					$scope.isLoading = false;
					debugger;
					var message = "Failed while retrieving the workflows list.";
					$dialogs.showErrorDialog(message, {
						logMessage : message + " at WorkflowInvocationListController:getInvocationsHandler."
					});
					console.error(response.data);
				}
			);
		};

		/**
		* This function retrieves all the invocations for a given workflow.
		* The function is called recursively for all the workflows in a list
		* of workflows.
		**/
		this.recoverInvocationsRec = function(nCall, workflows, _invocations, errors){
			_invocations = _invocations || {};

			if(nCall === workflows.length){
				for(var i in _invocations){
					var _invocation = WorkflowInvocationList.getInvocation(i);
					if(!_invocation){
						WorkflowInvocationList.addInvocation(_invocations[i]);
					}else if(_invocation.state != "error" && _invocation.state !== "success"){
						delete _invocations[i].state
						WorkflowInvocationList.updateInvocation(_invocations[i]);
					}
				}
				WorkflowInvocationList.saveInvocations();
				$scope.isLoading = false;

				if(errors !== undefined && Cookies.get("galaksiosession") !== undefined){
					WorkflowInvocationList.setHasErrors(true);
					// $dialogs.showErrorDialog(message, {
					// 	logMessage : message + " at WorkflowInvocationListController:getInvocationsHandler."
					// });
					console.error(errors);
				}

				console.log("Updating complete list of invocations...DONE");
				$rootScope.$broadcast(APP_EVENTS.updatedInvocations);
				return;
			}

			$http($rootScope.getHttpRequestConfig("GET", "workflow-run",{
				extra: workflows[nCall].id
			})).then(
				function successCallback(response){
					for(var k in response.data){
						response.data[k].workflow_title = workflows[nCall].name;
						response.data[k].workflow_id = workflows[nCall].id;
						_invocations[response.data[k].id] = response.data[k];
					}
					me.recoverInvocationsRec(nCall+1, workflows, _invocations);
				},
				function errorCallback(response){
					$scope.isLoading = false;

					if(Cookies.get("galaksiosession") === undefined){
						return;
					}

					errors = errors || [];
					errors.push(response.data);
					me.recoverInvocationsRec(nCall+1, workflows, _invocations, errors);
				}
			);
		};

		/**
		* This funciton checks the state for all the invocations.
		* Additionally, it calls to a secondary function which will
		* periodically check the status for all the steps in a invocation,
		* only if the state is not "done" or "failed".
		**/
		this.checkAllInvocationsState = function(){
			if(Cookies.get("galaksiosession") === undefined){
				return;
			}

			console.log("Checking state of invocations...");
			var invocations = WorkflowInvocationList.getInvocations();
			var running = 0, erroneous = 0, done = 0, waiting=0; unknown = 0;
			for(var i in invocations){
				if(invocations[i].state == "working"){
					running++;
				}else if(invocations[i].state == "sending"){
					running++;
				}else if(invocations[i].state == "success"){
					done++;
				}else if(invocations[i].state == "error"){
					erroneous++;
				}else if(invocations[i].state == "waiting"){
					waiting++;
				}else if(invocations[i].state == "failed"){
					erroneous++;
				}
			}

			$scope.invocations = WorkflowInvocationList.getInvocations();
			$scope.running = running;
			$scope.done = done;
			$scope.erroneous = erroneous;
			$scope.waiting = waiting;

			if($scope.checkInterval === true){
				for(var i in invocations){
					me.checkInvocationState(invocations[i]);
				}
			}
		};

		this.checkInvocationState = function(invocation){
			if(invocation.id && invocation.state != "error" && invocation.state !== "success" && !(invocation.is_temporal)  && !(invocation.checking)){
				console.log("Checking state of invocation " + invocation.id + "...");
				invocation.checking=true;
				$http($rootScope.getHttpRequestConfig("GET", "invocation-state", {
					extra: [invocation.workflow_id, invocation.id]
				})).then(
					function successCallback(response){
						delete invocation.checking;

						var unknownStateSteps = 0;
						var erroneousSteps = 0;
						var waitingSteps = 0;
						var runningSteps = 0;
						var doneSteps = 0;
						var queuedSteps = 0;
						var pausedSteps = 0;

						delete response.data.state
						delete response.data.workflow_id
						for (var attrname in response.data) {
							invocation[attrname] = response.data[attrname];
						}

						var totalSteps = (invocation.steps?invocation.steps.length:0);

						//Valid Galaxy job states include:
						//'new’, ‘waiting’, ‘queued’, ‘running’, ‘ok’, ‘error’, ‘paused’, ‘deleted’, ‘deleted_new’
						for(var i in invocation.steps){
							if(invocation.steps[i].state === "ok"){
								doneSteps++;
							} else if(invocation.steps[i].state === null){
								totalSteps--;
							}else if(invocation.steps[i].state === 'queued'){
								queuedSteps++;
							}else if(invocation.steps[i].state === 'new' || invocation.steps[i].state === 'waiting'){
								waitingSteps++;
							}else if(invocation.steps[i].state === 'running'){
								runningSteps++;
							}else if(invocation.steps[i].state === 'error'){
								erroneousSteps++;
							}else if(invocation.steps[i].state === 'paused'){
								pausedSteps++;
							}else{
								// ‘upload’, ‘deleted’, ‘deleted_new’
								unknownStateSteps++;
							}
						}

						if(invocation.steps === undefined || invocation.steps.length === 0 || totalSteps===0){
							return;
						}
						var prev_state=invocation.state;
						if(runningSteps > 0){
							invocation.state = "working";
							invocation.state_text = "Running your workflow...";
						}else if(waitingSteps > 0 || queuedSteps > 0){
							invocation.state = "waiting";
							invocation.state_text = "Waiting in queue...";
						}else if(erroneousSteps > 0){
							invocation.state = "error";
							invocation.state_text = "Error";
						}else if(invocation.steps && totalSteps === doneSteps){
							invocation.state = "success";
							invocation.state_text = "Finished";
						}else {
							invocation.state = "waiting";
							invocation.state_text = "Waiting for Galaxy...";
						}
						if(prev_state !== invocation.state){
							$rootScope.$broadcast(APP_EVENTS.invocationStateChanged, {invocation_id:invocation.id, prev_state:prev_state, new_state:invocation.state});
						}
					},
					function errorCallback(response){
						delete invocation.checking;
						invocation.state = "error";
						invocation.state_text = "Failed.";
					}
				);
			}
		};

		this.recoverWorkflowResults = function(invocation){
			debugger
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
			debugger

			$http($rootScope.getHttpRequestConfig("GET", "dataset-details", {
				extra: [invocation.history_id, output.id]
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

		$scope.adaptInvocationDate = function(date){
			return !date?"-":date.substring(0,10) + " " + date.substring(11,16);
		};

		$scope.filterInvocations = function(item){
			return (item.workflow_title.indexOf(($scope.filterInvocationByName||"") ) > -1)&&(!$scope.displayedInvocationTypes || $scope.displayedInvocationTypes.indexOf(item.state) !== -1 || (item.state !== "success" && item.state !== "error" && $scope.displayedInvocationTypes.indexOf("other") !== -1));
		};

		$scope.changeDisplayedInvocationTypes = function(type){
			$scope.displayedInvocationTypes= $scope.displayedInvocationTypes || ['success','error','other'];
			var pos = $scope.displayedInvocationTypes.indexOf(type);
			if(pos > -1){
				$scope.displayedInvocationTypes.splice(pos,1);
			}else{
				$scope.displayedInvocationTypes.push(type);
			}
		};

		$scope.checkInvocationErrors = function(){
			return WorkflowInvocationList.hasErrors();
		};
		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		$scope.$on(APP_EVENTS.logoutSuccess, function (event, args) {
			WorkflowInvocationList.clearInvocations();
		});

		$scope.$on(APP_EVENTS.updateInvocations, function (event, args) {
			if($scope.checkInterval){
				me.getInvocationsHandler();
			}
		});

		$scope.$on(APP_EVENTS.updatedInvocations, function (event, args) {
			$scope.invocations = WorkflowInvocationList.getInvocations();
			$scope.isLoading=false;
		});

		$scope.$on(APP_EVENTS.updatingInvocations, function (event, args) {
			$scope.isLoading=true;
		});

		$scope.$on(APP_EVENTS.invocationResultsRequired, function (event, args) {
			me.recoverWorkflowResults(WorkflowInvocationList.getInvocation(args.invocation_id));
		});

		$scope.$on('$destroy', function () {
			if(me.checkInvocationInterval){
				console.log("Removing interval checkInvocationInterval");
				$interval.cancel(me.checkInvocationInterval);
			}
			if(me.checkAllInvocationsStateInterval){
				console.log("Removing interval checkAllInvocationsStateInterval");
				$interval.cancel(me.checkAllInvocationsStateInterval);
			}
		});

		this.recoverWorkflowInvocationHandler = function(invocation){
			//Ensure that step is 6
			invocation.current_step=6;
			//Recover the results for the invocation
			if(invocation.state === "error" || invocation.state === "success"){
				me.recoverWorkflowResults(invocation);
			}
			$state.go('workflowRun', {
				'id' : invocation.workflow_id,
				'invocation_id': invocation.id
			});
		};

		this.removeWorkflowInvocationHandler = function(invocation){
			var pos = $scope.invocations.indexOf(invocation);
			if(pos !== -1){
				$scope.invocations.splice(pos,1);
				WorkflowInvocationList.saveInvocations();
			}
		};

		this.updateInvocationsButtonHandler = function(){
			$rootScope.$broadcast(APP_EVENTS.updateInvocations);
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;

		//The corresponding view will be watching to this variable
		//and update its content after the http response

		$scope.invocations = WorkflowInvocationList.loadInvocations().getInvocations();
		$scope.running = 0;
		$scope.done = 0;
		$scope.erroneous = 0;
		$scope.checkInterval = ($scope.checkInterval === true);

		if($scope.checkInterval){
			//Start the interval that checks the state of the invocation (only in the toolbar)
			me.getInvocationsHandler();
			me.checkInvocationInterval = $interval(me.getInvocationsHandler, 30000);
		}else{
			//Force other controller (toolbar) to update the invocations
			$rootScope.$broadcast(APP_EVENTS.updateInvocations);
		}

		me.checkAllInvocationsStateInterval = $interval(me.checkAllInvocationsState, 5000);
	});
})();
