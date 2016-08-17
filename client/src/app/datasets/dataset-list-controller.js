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
* - DatasetListController
* -
*
*/
(function(){
	var app = angular.module('datasets.controllers.dataset-list', [
		'ui.bootstrap',
		'common.dialogs',
		'datasets.dataset-list'
	]);

	app.controller('DatasetListController', function($rootScope, $scope, $http, $dialogs, HISTORY_EVENTS) {
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------

		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.selectNewDatasetHandler = function(){
			$('#uploadDatasetSelector').click();
		};

		this.uploadDatasetHandler = function(nItem){
			if(nItem === undefined){
				nItem = 0;
			}

			if($scope.files === undefined){
				return;
			}

			if(nItem === $scope.files.length){
				//Notify all the other controllers that history-list has changed
				$rootScope.$broadcast(HISTORY_EVENTS.historyChanged);
				return;
			}

			var file = $scope.files[nItem];

			if(file.state !== "pending"){
				me.uploadDatasetHandler(nItem+1);
				return;
			}

			var formData = new FormData();
			formData.append('files_0|file_data', file);
			formData.append('tool_id', 'upload1');
			formData.append('history_id', Cookies.get("current-history"));

			file.state = "uploading";

			$http.post(
				getRequestPath("dataset-upload"), formData, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				}).then(
					function successCallback(response){
						file.state = "done";
						me.uploadDatasetHandler(nItem+1);
					},
					function errorCallback(response){
						debugger;
						file.state = "error";
						me.uploadDatasetHandler(nItem+1);
					}
				);
			};

			this.setSelectedDatasetHandler = function(selectedItem){
				if(!$scope.selectedDataset){
					$scope.selectedDataset = [];
				}
				$scope.selectedDataset[0] = selectedItem.dataset;
			};

			this.datasetSelectorAcceptButtonHandler = function(){
				$scope.$close($scope.selectedDataset);
			};
			this.datasetSelectorCancelButtonHandler = function(){
				$scope.$dismiss('cancel');
			};

			//--------------------------------------------------------------------
			// INITIALIZATION
			//--------------------------------------------------------------------
			var me = this;

			$scope.filterDatasets = function (item) {
				return (item.deleted === false || $scope.showDeleted);
			};

		});
	})();
