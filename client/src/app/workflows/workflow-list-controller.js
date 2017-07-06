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
* - WorkflowListController
*
*/
(function(){
	var app = angular.module('workflows.controllers.workflow-list', [
		'ang-dialogs',
		'angular.backtop',
		'workflows.services.workflow-list',
		'workflows.directives.workflow-card'
	]);

	//TODO: MOVE TO DIRECTIVES
	app.directive('ngEnter', function () {
		return function (scope, element, attrs) {
			element.bind("keydown keypress", function (event) {
				if(event.which === 13) {
					scope.$apply(function (){
						scope.$eval(attrs.ngEnter);
					});
					event.preventDefault();
				}
			});
		};
	});

	/***************************************************************************/
	/*CONTROLLERS **************************************************************/
	/***************************************************************************/
	app.controller('WorkflowListController', function($rootScope, $scope, $http, $dialogs, WorkflowList){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		this.retrieveWorkflowsData = function(group, force){
			$scope.isLoading = true;

			if(WorkflowList.getOld() > 1 || force){ //Max age for data 5min.
				$http($rootScope.getHttpRequestConfig("GET", "workflow-list", {
					params:  {"show_published" : (group !== 'my_workflows')}})
				).then(
					function successCallback(response){
						$scope.isLoading = false;

						if(group === 'my_workflows'){
							WorkflowList.updateWorkflows(response.data);
						}else{
							WorkflowList.setWorkflows(response.data);
						}
						$scope.tags =  WorkflowList.updateTags().getTags();
						$scope.filteredWorkflows = WorkflowList.getWorkflows().length;

						//Display the workflows in batches
						if(window.innerWidth > 1500){
							$scope.visibleWorkflows = 14;
						}else if(window.innerWidth > 1200){
							$scope.visibleWorkflows = 10;
						}else{
							$scope.visibleWorkflows = 6;
						}

						$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);

						$scope.workflows = WorkflowList.getWorkflows();
					},
					function errorCallback(response){
						$scope.isLoading = false;

						debugger;
						var message = "Failed while retrieving the workflows list.";
						$dialogs.showErrorDialog(message, {
							logMessage : message + " at WorkflowListController:retrieveWorkflowsData."
						});
						console.error(response.data);
					}
				);
			}else{
				$scope.workflows = WorkflowList.getWorkflows();
				$scope.tags =  WorkflowList.getTags();
				$scope.filteredWorkflows = $scope.workflows.length;
				$scope.isLoading = false;
			}
		};

		this.retrieveWorkflowDetails = function(workflow){
			var username = $scope.username || Cookies.get("galaxyusername");
			$http($rootScope.getHttpRequestConfig(
				"GET",
				"workflow-info",
				{extra: workflow.id}
			)).then(
				function successCallback(response){
					for (var attrname in response.data) {
						workflow[attrname] = response.data[attrname];
					}
					workflow.steps = Object.values(workflow.steps);

					if(workflow.name.search(/^imported: /) !== -1){
					    workflow.name = workflow.name.replace(/imported: /g, "");
						workflow.imported = true;
					}

					if(workflow.owner !== username){
						workflow.valid = false;
						workflow.imported = false;
						workflow.importable = true;
					}else{
						workflow.owned = true;
					}
				},
				function errorCallback(response){
					if(response.data.err_code === 403002){

					}else{
						workflow.annotation = "Unable to get the description: " + response.data.err_msg;
						workflow.valid = false;
					}
					return;
				}
			);
		};

		/**
		* This function defines the behaviour for the "filterWorkflows" function.
		* Given a item (workflow) and a set of filters, the function evaluates if
		* the current item contains the set of filters within the different attributes
		* of the model.
		*
		* @returns {Boolean} true if the model passes all the filters.
		*/
		$scope.filterWorkflows = function() {
			$scope.filteredWorkflows = 0;
			$scope.username = $scope.username || Cookies.get("galaxyusername");
			return function( item ) {
				if($scope.show === "my_workflows" && item.owner !== $scope.username){
					return false;
				}

				var filterAux, item_tags;
				for(var i in $scope.filters){
					filterAux = $scope.filters[i].toLowerCase();
					item_tags = item.tags.join("");
					if(!((item.name.toLowerCase().indexOf(filterAux)) !== -1 ||(item_tags.toLowerCase().indexOf(filterAux)) !== -1)){
						return false;
					}
				}
				$scope.filteredWorkflows++;
				return true;
			};
		};

		$scope.getTagColor = function(_tag){
			var tag = WorkflowList.getTag(_tag);
			if(tag !== null){
				return tag.color;
			}
			return "";
		}

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.importWorkflowHandler = function(workflow) {
			var me = this;

			$dialogs.showConfirmationDialog('Add the workflow ' + workflow.name + ' to your collection?', {
				title: "Please confirm this action.",
				callback : function(result){
					if(result === 'ok'){
						$http($rootScope.getHttpRequestConfig("POST", "workflow-import", {
							headers: {'Content-Type': 'application/json; charset=utf-8'},
							data: {"shared_workflow_id" : workflow.id}
						})).then(
							function successCallback(response){
								$dialogs.showSuccessDialog("The workflow has being successfully imported.");
								// Deep copy
								var newWorkflow = jQuery.extend(true, {}, workflow);
								for (var attrname in response.data) {
									newWorkflow[attrname] = response.data[attrname];
								}
								WorkflowList.addWorkflow(newWorkflow);
								me.retrieveWorkflowsData("my_workflows", true);
							},
							function errorCallback(response){
								debugger;
								var message = "Failed while importing the workflow.";
								$dialogs.showErrorDialog(message, {
									logMessage : message + " at WorkflowListController:importWorkflowHandler."
								});
								console.error(response.data);
								debugger
							}
						);
					}
				}
			});
		}

		this.deleteWorkflowHandler = function(workflow) {
			var me = this;
			$dialogs.showConfirmationDialog('Delete the workflow ' + workflow.name + ' from your collection?\nThis action cannot be undone.', {
				title: "Please confirm this action.",
				callback : function(result){
					if(result === 'ok'){
						$http($rootScope.getHttpRequestConfig("DELETE", "workflow-delete", {
							headers: {'Content-Type': 'application/json; charset=utf-8'},
							extra: workflow.id
						})).then(
							function successCallback(response){
								$dialogs.showSuccessDialog("The workflow was successfully deleted.");
								$scope.workflows = WorkflowList.deleteWorkflow(workflow).getWorkflows();
								$scope.tags =  WorkflowList.updateTags().getTags();
								// $scope.filteredWorkflows = $scope.workflows.length;
								me.retrieveWorkflowsData("my_workflows", true);
							},
							function errorCallback(response){
								debugger;
								var message = "Failed while deleting the workflow.";
								$dialogs.showErrorDialog(message, {
									logMessage : message + " at WorkflowListController:deleteWorkflowHandler."
								});
								console.error(response.data);
								debugger
							}
						);
					}
				}
			});
		}

		this.showWorkflowChooserChangeHandler = function() {
			this.retrieveWorkflowsData($scope.show);
		}
		/**
		* This function applies the filters when the user clicks on "Search"
		*/
		this.applySearchHandler = function() {
			var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
			$scope.filters = WorkflowList.setFilters(filters).getFilters();
		};

		this.filterByTag = function(tag){
			if(tag !== "All"){
				var filters = arrayUnique($scope.filters.concat(tag));
				$scope.filters = WorkflowList.setFilters(filters).getFilters();
			}
		}

		/**
		* This function remove a given filter when the user clicks at the "x" button
		*/
		this.removeFilterHandler = function(filter){
			$scope.filters = WorkflowList.removeFilter(filter).getFilters();
		};

		this.showMoreWorkflowsHandler = function(){
			if(window.innerWidth > 1500){
				$scope.visibleWorkflows += 10;
			}else if(window.innerWidth > 1200){
				$scope.visibleWorkflows += 6;
			}else{
				$scope.visibleWorkflows += 4;
			}
			$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);
		}



		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;

		//This controller uses the WorkflowList, which defines a Singleton instance of
		//a list of workflows + list of tags + list of filters. Hence, the application will not
		//request the data everytime that the workflow list panel is displayed (data persistance).
		$scope.workflows = WorkflowList.getWorkflows();
		$scope.tags =  WorkflowList.getTags();
		$scope.filters =  WorkflowList.getFilters();
		$scope.filteredWorkflows = $scope.workflows.length;

		//Display the workflows in batches
		if(window.innerWidth > 1500){
			$scope.visibleWorkflows = 14;
		}else if(window.innerWidth > 1200){
			$scope.visibleWorkflows = 10;
		}else{
			$scope.visibleWorkflows = 6;
		}

		$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);


		if($scope.workflows.length === 0){
			this.retrieveWorkflowsData("my_workflows");
		}
	});

	app.controller('WorkflowDetailController', function($rootScope, $scope, $http, $stateParams, $dialogs, WorkflowList){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

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
						// mouseEnabled: false,
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

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.cancelButtonHandler = function(){
			history.back();
		};

		this.importWorkflowHandler = function(event){
		};

		this.layoutDiagramHandler = function(){
			this.updateWorkflowDiagram($scope.diagram, true);
		}

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;
		//The corresponding view will be watching to this variable
		//and update its content after the http response
		$scope.loadingComplete = false;
		$scope.workflow = WorkflowList.getWorkflow($stateParams.id);
		$scope.viewMode = $stateParams.mode;
		$scope.diagram = me.generateWorkflowDiagram($scope.workflow.steps);
		me.updateWorkflowDiagram($scope.diagram, true);
		//UPDATE VIEW
		$scope.loadingComplete = true;

	});
})();
