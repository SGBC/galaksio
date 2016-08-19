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
		'common.dialogs',
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
	app.controller('WorkflowListController', [
		'$scope',
		'$http',
		'$dialogs',
		'WorkflowList',
		function($scope, $http, $dialogs, WorkflowList){
			//--------------------------------------------------------------------
			// CONTROLLER FUNCTIONS
			//--------------------------------------------------------------------

			this.retrieveWorkflowsData = function(){
				$scope.isLoading = true;
				$http(getHttpRequestConfig("GET", "workflow-list", {
					params:  {"show_published" : ($scope.show === 'all_workflows')}})
				).then(
					function successCallback(response){
						$scope.isLoading = false;

						$scope.workflows = WorkflowList.setWorkflows(response.data).getWorkflows();
						$scope.tags =  WorkflowList.updateTags().getTags();
						$scope.filteredWorkflows = $scope.workflows.length;

						//Display the workflows in batches
						if(window.innerWidth > 1500){
							$scope.visibleWorkflows = 9;
						}else if(window.innerWidth > 1200){
							$scope.visibleWorkflows = 6;
						}else{
							$scope.visibleWorkflows = 4;
						}

						$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);
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
			};

			this.retrieveWorkflowDetails = function(workflow){
				$http(getHttpRequestConfig(
					"GET",
					"workflow-info",
					{extra: workflow.id}
				)).then(
					function successCallback(response){
						for (var attrname in response.data) {
							workflow[attrname] = response.data[attrname];
						}
						workflow.steps = Object.values(workflow.steps);
					},
					function errorCallback(response){
						if(response.data.err_code === 403002){
							workflow.annotation = "This workflow is not owned by or shared with you.";
							workflow.valid = false;
							workflow.importable = true;
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
				return function( item ) {
					var filterAux, item_tags;
					for(var i in $scope.filters){
						filterAux = $scope.filters[i].toLowerCase();
						item_tags = item.tags.join("");
						if(!(
							(item.name.toLowerCase().indexOf(filterAux)) !== -1 ||
							(item_tags.toLowerCase().indexOf(filterAux)) !== -1
						)){
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
				debugger
				$dialogs.showConfirmationDialog('Add the workflow ' + workflow.name + ' to your collection?', {
					title: "Please confirm this action.",
					callback : function(result){
						if(result === 'ok'){
							debugger
							$http(getHttpRequestConfig("POST", "workflow-import", {
								headers: {'Content-Type': 'application/json; charset=utf-8'},
								data: {"shared_workflow_id" : workflow.id}
							})).then(
								function successCallback(response){
									//TODO: FINISH THIS CODE
									debugger
								},
								function errorCallback(response){
									//TODO: FINISH THIS CODE
									debugger
								}
							);
						}
					}
				});

				this.retrieveWorkflowsData();
			}

			this.showWorkflowChooserChangeHandler = function() {
				this.retrieveWorkflowsData();
			}
			/**
			* This function applies the filters when the user clicks on "Search"
			*/
			this.applySearchHandler = function() {
				var filters = arrayUnique($scope.filters.concat($scope.searchFor.split(" ")));
				$scope.filters = WorkflowList.setFilters(filters).getFilters();
			};

			/**
			* This function remove a given filter when the user clicks at the "x" button
			*/
			this.removeFilterHandler = function(filter){
				$scope.filters = WorkflowList.removeFilter(filter).getFilters();
			};

			this.showMoreWorkflowsHandler = function(){
				if(window.innerWidth > 1500){
					$scope.visibleWorkflows += 6;
				}else if(window.innerWidth > 1200){
					$scope.visibleWorkflows += 4;
				}else{
					$scope.visibleWorkflows += 2;
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
				$scope.visibleWorkflows = 9;
			}else if(window.innerWidth > 1200){
				$scope.visibleWorkflows = 6;
			}else{
				$scope.visibleWorkflows = 4;
			}

			$scope.visibleWorkflows = Math.min($scope.filteredWorkflows, $scope.visibleWorkflows);


			if($scope.workflows.length === 0){
				this.retrieveWorkflowsData();
			}
		}]);
	})();
