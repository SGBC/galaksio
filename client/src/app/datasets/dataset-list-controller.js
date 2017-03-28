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
		'datasets.dataset-list',
		'ang-drag-drop'
	]);

	app.controller('DatasetListController', function($rootScope, $scope, $http, $dialogs, APP_EVENTS) {
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
			this.removeAllowed = false;

			if(nItem === undefined){
				nItem = 0;
			}

			if($scope.files === undefined){
				this.removeAllowed = true;
				return;
			}

			if(nItem === $scope.files.length){
				//Notify all the other controllers that history-list has changed
				this.removeAllowed = true;
				$rootScope.$broadcast(APP_EVENTS.historyChanged);
				return;
			}

			var file = $scope.files[nItem];

			if(file.state !== "pending"){
				this.removeAllowed = true;
				me.uploadDatasetHandler(nItem+1);
				return;
			}

			var formData = new FormData();
			formData.append('key', window.atob(Cookies.get("galaksiosession")));
			formData.append('inputs', '{"dbkey":"?","file_type":"auto","files_0|type":"upload_dataset","files_0|space_to_tab":null,"files_0|to_posix_lines":"Yes","files_0|NAME":"' + file.name + '"}');
			formData.append('files_0|file_data', file);
			formData.append('tool_id', 'upload1');
			formData.append('history_id', Cookies.get("current-history"));

			file.state = "uploading";

			$http.post(
				$rootScope.getRequestPath("dataset-upload"), formData, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				}
			).then(
				function successCallback(response){
					file.state = "done";
					me.uploadDatasetHandler(nItem+1);
				},
				function errorCallback(response){
					file.state = "error";
					me.uploadDatasetHandler(nItem+1);
					debugger;
					console.error("Error while uploading a new file at DatasetListController:uploadDatasetHandler.");
					console.error(response);
				}
			);
		};

		this.getDatasetCollectionDetailsHandler = function(dataset){
			$scope.isLoading = true;
			this.setSelectedDatasetHandler(dataset);

			$http($rootScope.getHttpRequestConfig("GET", "dataset-collection-details", {
				extra: [$scope.currentHistory.id, dataset.id]})
			).then(
				function successCallback(response){
					$scope.isLoading = false;
					dataset.elements = response.data.elements;
				},
				function errorCallback(response){
					$scope.isLoading = false;

					debugger;
					var message = "Failed while retrieving the dataset collection details.";
					$dialogs.showErrorDialog(message, {
						logMessage : message + " at DatasetListController:getDatasetCollectionDetailsHandler."
					});
					console.error(response.data);
				}
			);
		};

		this.deleteToUploadDatasetHandler = function(selectedItem){
			$('#uploadDatasetSelector').val("");
			for(var i in $scope.files){
				if($scope.files[i] === selectedItem){
					$scope.files.splice(i,1);
					return;
				}
			}
		};

		this.setSelectedDatasetHandler = function(selectedItem){
			if(!$scope.selectedDataset){
				$scope.selectedDataset = [];
			}
			if(selectedItem.type === "collection" ){
				$scope.selectedDataset[0] = selectedItem;
			}else{
				$scope.selectedDataset[0] = selectedItem.dataset;
			}
		};

		this.datasetSelectorAcceptButtonHandler = function(){
			delete $scope.active_tab;
			$scope.$close($scope.selectedDataset);
		};
		this.datasetSelectorCancelButtonHandler = function(){
			delete $scope.active_tab;
			$scope.$dismiss('cancel');
		};

		this.getDownloadLink = function(dataset_url){
			var fullpath = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
			dataset_url.replace(fullpath,"");
			dataset_url = $scope.GALAXY_SERVER_URL + dataset_url;
			return dataset_url + '/display';
		};

		$scope.getCollectionType = function(collection){
			if(collection.collection_type === "list"){
				return "List of datasets";
			} else if(collection.collection_type === "paired"){
				return "Pair of datasets";
			} else if(collection.collection_type === "list:paired"){
				return "List of paired datasets";
			} else {
				return "Unknown collection type."
			}
		};

		$scope.filterDatasets = function (item) {
			return (item.deleted === false || $scope.showDeleted) && ($scope.dataType === item.type) && ($scope.dataType !== "collection" || $scope.dataSubtype === undefined || $scope.dataSubtype === item.collection_type);
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;

		$scope.dataType=($scope.dataType?$scope.dataType:'file');

		$scope.maxTableHeight = window.innerHeight/2;

	});

	app.controller('DatasetCollectionController', function($rootScope, $scope, $http, $dialogs, APP_EVENTS) {
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------
		$scope.filterSelectedDatasets = function(item){
			return ($scope.selectedDatasets.indexOf(item) === -1);
		}

		this.setPairComponent= function(pair, component, dataset){
			pair[component] = dataset;
		}
		this.removePairComponent= function(pair, component){
			delete pair[component];
		}

		this.removePair= function(pair){
			var pos = $scope.pairs.indexOf(pair);
			if(pos !== -1){
				$scope.pairs.splice(pos, 1);
			}
		}

		$scope.filterDatasets = function (item) {
			return (item.deleted === false) && (item.type !== "collection");
		};
		//--------------------------------------------------------------------
		// EVENT HANDLERS
		//--------------------------------------------------------------------
		this.addSelectedDatasetHandler = function(dataset){
			$scope.selectedDatasets.push(dataset);
			$scope.selectedDatasets = arrayUnique($scope.selectedDatasets);
		};

		this.removeSelectedDatasetHandler = function(dataset){
			var pos = $scope.selectedDatasets.indexOf(dataset);
			if(pos !== -1){
				$scope.selectedDatasets.splice(pos, 1);
			}
		};

		this.addNewPairToCollectionHandler = function(){
			$scope.pairs = ($scope.pairs?$scope.pairs:[]);
			$scope.pairs.push({name:""});
		};


		this.validateCollectionContent = function(){
			if(!$scope.collection_name || $scope.collection_name === ""){
				return "Collection name cannot be null.";
			}
			if($scope.collection_type === "list" && $scope.selectedDatasets.length === 0){
				return "Collection is empty! List of datasets must contain at least one dataset.";
			}else if($scope.collection_type === "paired" || $scope.collection_type === "list:paired"){
				if(!$scope.pairs || $scope.pairs.length === 0){
					return "Collection is empty! Create new pairs and try again.";
				}
				var pairNames = {};
				for(var i in $scope.pairs){
					if(!$scope.pairs[i].name || $scope.pairs[i].name === ""){
						return "Please set the name for all the pairs and try again.";
					}
					if(pairNames[$scope.pairs[i].name]){
						return "Duplicated name for pair " + $scope.pairs[i].name + ". Please use a different name for this pair.";
					}
					pairNames[$scope.pairs[i].name] = true;

					if(!$scope.pairs[i].forward || !$scope.pairs[i].reverse){
						return "Incomplete information for pairs. Please set the forward and the reverse component for all the pairs.";
					}
				}
			}
			return true;
		};

		this.sendDatasetCollectionCreationRequest = function(i, datalist, error){
			if(i === datalist.length){
				if(error !== undefined){

				}else{
					$dialogs.showSuccessDialog("All collections were succesfully created.");
				}
				$rootScope.$broadcast(APP_EVENTS.historyChanged);
				delete $scope.collection_type;
				delete $scope.collection_name;
				$scope.pairs  = [];
				$scope.selectedDatasets = [];
				$scope.step = 0;
				return;
			}
			var name = $scope.collection_name;
			if($scope.collection_type === 'paired'){
					name = datalist[i][0].name;
			}
			$http($rootScope.getHttpRequestConfig("POST", "dataset-collection-create", {
				data: {
					collection_type : $scope.collection_type,
					instance_type : 'history',
					history_id : $scope.currentHistory.id,
					name : name,
					element_identifiers : datalist[i]
				}
			})).then(
				function successCallback(response){
					me.sendDatasetCollectionCreationRequest(i+1, datalist, error);
				},
				function errorCallback(response){
					error = (error||[]);
					error.push(response.data);
					me.sendDatasetCollectionCreationRequest(i+1, datalist, error);
				}
			);
		}

		this.createNewCollectionHandler = function(){
			var errors = this.validateCollectionContent();
			if(errors !== true){
				$dialogs.showErrorDialog("Some errors were detected. Please check the form and try again. Error: " + errors, {title: "Invalid form."});
				return;
			}

			var element_identifiers = this.generateElementIdentifiersParam();
			this.sendDatasetCollectionCreationRequest(0, element_identifiers);
		};

		this.generateElementIdentifiersParam = function(){
			var data = [];
			if($scope.collection_type === "list"){
				data.push($scope.selectedDatasets);
			}else if($scope.collection_type === "paired"){
				for(var i in $scope.pairs){
					data.push([{
						name: $scope.pairs[i].name,
						src: "new_collection",
						collection_type : "",
						element_identifiers : [
							{"name": "forward", "src": $scope.pairs[i].forward.src, "id" : $scope.pairs[i].forward.id},
							{"name": "reverse", "src": $scope.pairs[i].reverse.src, "id" : $scope.pairs[i].reverse.id}
						]
					}]);
				}
			}else if($scope.collection_type === "list:paired"){
				for(var i in $scope.pairs){
					data.push({
						name: $scope.pairs[i].name,
						src: "new_collection",
						collection_type : "paired",
						element_identifiers : [
							{"name": "forward", "src": $scope.pairs[i].forward.src, "id" : $scope.pairs[i].forward.id},
							{"name": "reverse", "src": $scope.pairs[i].reverse.src, "id" : $scope.pairs[i].reverse.id}
						]
					});
				}
				data = [data];
			}
			return data;
		};


		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;
		$scope.selectedDatasets = ($scope.selectedDatasets?$scope.selectedDatasets:[]);
	});

})();
