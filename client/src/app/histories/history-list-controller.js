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
* - histories.controllers.history-list (HistoryListController)
*
*/
(function(){
	var app = angular.module('histories.controllers.history-list', [
		'ui.bootstrap',
		'ui.router',
		'histories.services.history-list',
		'histories.directives.history-list'
	]);

	/***************************************************************************/
	/*CONTROLLERS **************************************************************/
	/***************************************************************************/
	app.controller('HistoryListController', function($state, $scope, $http, $uibModal, HistoryList, AUTH_EVENTS){
		//--------------------------------------------------------------------
		// CONTROLLER FUNCTIONS
		//--------------------------------------------------------------------
		/**
		* This function changes the displayed history for the current view
		* and retrieves its datasets.
		*
		* @chainable
		* @param  {Object} history contains the history data
		* @return {Object} the controller.
		*/
		this.setDisplayedHistory = function(history){
			$scope.displayedHistory = history;
			if(history.content === undefined){
				//GET THE EXTRA INFORMATION FOR THE HISTORY (datasets)
				$http(getHttpRequestConfig("GET", "datasets-list", {extra: history.id})).then(
					function successCallback(response){
						$scope.displayedHistory.content = response.data;
					},
					function errorCallback(response){
						//TODO: SHOW ERROR MESSAGE
					}
				);
			}
			return this;
		};

		/**
		* This function sets the current history in the $scope and saves the history
		* ID as a Cookie
		*
		* @chainable
		* @param  {Object} history contains the history data
		* @return {Object} the controller.
		*/
		this.setCurrentHistory = function(history){
			$scope.currentHistory = history;
			Cookies.remove("current-history", {path: window.location.pathname});
			//GET THE COOKIE
			Cookies.set("current-history", history.id, {expires : 1, path: window.location.pathname});
			return this;
		};

		/**
		* This function opens a new dialog for uploading new datasets
		*
		* @chainable
		* @return {Object} the controller.
		*/
		this.showUploadDatasetsDialog = function(){
			$scope.active= 1;
			$scope.hiddenTabs=[0];

			var modalInstance = $uibModal.open({
				templateUrl: 'app/datasets/dataset-selector-dialog.tpl.html',
				scope: $scope,
				size: "lg"
			});
			modalInstance.result.then(function () {
				me.retrieveAllHistoriesList(true, false, me.retrieveCurrentHistoryData);
			}, function () {
				me.retrieveAllHistoriesList(true, false, me.retrieveCurrentHistoryData);
			});
			return this;
		};

		/**
		* This function retrieve the information for all the histories associated to
		* current user. First gets the list of all histories and then it gets the
		* details for each history in the list.
		*
		* @chainable
		* @param  {Boolean} force if true, the data will be always retrived
		* @param  {Boolean} lite if true, the function won't retrive the details for the histories
		* @param  {Function} callback, a callback function that will be executed after retrieving the data
		* @return {Object} the controller.
		*/
		this.retrieveAllHistoriesList = function(force, lite, callback){
			if($scope.histories.length === 0 || force===true){
				$http(getHttpRequestConfig("GET", "history-list")).then(
					function successCallback(response){
						$scope.histories = HistoryList.setHistories(response.data).getHistories();
						if(lite !== true){ //always enter by default
							//Now get the details for each history
							for(var i in $scope.histories){
								//GET THE EXTRA INFORMATION FOR EACH HISTORY
								me.retrieveHistoryData($scope.histories[i].id, callback);
							}
						}else{
							if(callback !== undefined){
								callback();
							}
						}
					},
					function errorCallback(response){
						//TODO: SHOW ERROR MESSAGE
					}
				);
			}else{
				if(callback !== undefined){
					callback();
				}
			}
			return this;
		};


		/**
		* This function retrieves the information for the current history
		*
		* @chainable
		* @return {Object} the controller.
		*/
		this.retrieveCurrentHistoryData = function(){
			if($scope.histories.length === 0){
				this.retrieveAllHistoriesList(true, true, me.retrieveCurrentHistoryData)
				return this;
			}

			if(Cookies.get("current-history") === undefined){
				//Get the most recently used history
				$http(getHttpRequestConfig("GET", "history-list", {extra: 'most_recently_used'})).then(
					function successCallback(response){
						me.setCurrentHistory(HistoryList.getHistory(response.data.id));
						me.retrieveHistoryData(response.data.id, function(){
							me.setDisplayedHistory($scope.currentHistory);
						});
					},
					function errorCallback(response){
						//TODO: SHOW ERROR MESSAGE
					}
				);
			}else {
				//Set the current history based on the id (cookie)
				$scope.currentHistory = HistoryList.getHistory(Cookies.get("current-history"));
				me.setDisplayedHistory($scope.currentHistory);
			}
			return this;
		};

		/**
		* This function retrieves the information for tha given history ID
		*
		* @chainable
		* @param  {String} history_id the identifier for the history
		* @param  {Function} callback, a callback function that will be executed after retrieving the data
		* @return {Object} the controller.
		*/
		this.retrieveHistoryData = function(history_id, callback){
			$http(getHttpRequestConfig("GET", "history-list", {extra: history_id})).then(
				function successCallback(response){
					var history = HistoryList.getHistory(history_id);
					//Update the object content with the new data
					if(history !== null){
						for (var attrname in response.data) {
							history[attrname] = response.data[attrname];
						}
					}
					if(callback !== undefined){
						callback();
					}
				},
				function errorCallback(response){
					//TODO: SHOW ERROR MESSAGE
				}
			);
			return this;
		};

		//--------------------------------------------------------------------
		// INITIALIZATION
		//--------------------------------------------------------------------
		var me = this;
		//This controller uses the HistoryList, which defines a Singleton instance of
		//a list of histories. Hence, the application will not
		//request the data everytime that the history list panel is displayed (data persistance).
		$scope.histories = HistoryList.getHistories();


		if($state.current.name === "histories" || $state.current.name === "workflowDetail"){
			this.retrieveAllHistoriesList(true, false, this.retrieveCurrentHistoryData);
		}else if($state.current.name === "home"){
			this.retrieveCurrentHistoryData();
		}

	});//end controller
})();//end wrapper
