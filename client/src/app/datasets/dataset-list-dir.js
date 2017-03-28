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
* - datasets.services.dataset-upload
*
*/
(function(){
	var app = angular.module('datasets.dataset-list', []);

	app.directive("datasetListPanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/datasets/dataset-list.tpl.html'
		};
	});

	app.directive("datasetCollectionListPanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/datasets/dataset-collection-list.tpl.html'
		};
	});

	app.directive("datasetCollectionCreatePanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/datasets/dataset-collection-create-panel.tpl.html'
		};
	});

	app.directive("datasetListInput", function() {
		return {
			restrict: 'E',
			replace: true,
			controller: 'DatasetListController',
			template:
			'<select class="form-control" name="input_{{step.id}}" style=" max-width: 350px; display: inline-block; margin-left: 10px; "' +
			'        ng-model="step.inputs[0].value" ng-init="step.inputs[0].value = null"' +
			'        ng-options="dataset.id as dataset.name for dataset in filtered = (displayedHistory.content | filter:filterDatasets) "' +
			'        required>'+
			'  <option disabled value=""> -- Choose a file </option>' +
			'</select>'
		};
	});

	app.directive("datasetCollectionListInput", function() {
		return {
			restrict: 'E',
			replace: true,
			controller: 'DatasetListController',
			template:
			'<select class="form-control" name="input_{{step.id}}" style=" max-width: 350px; display: inline-block; margin-left: 10px; "' +
			'        ng-model="step.inputs[0].value" ng-init="step.inputs[0].value = null"' +
			'        ng-options="dataset.id as dataset.name for dataset in filtered = (displayedHistory.content | filter:filterDatasets) "' +
			'        required>'+
			'  <option disabled value=""> -- Choose a file </option>' +
			'</select>'
		};
	});

	app.directive("datasetUploadPanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/datasets/dataset-upload.tpl.html'
		};
	});

	app.directive('fileModel', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			link: function($scope, element, attrs) {
				element.bind('change', function(){
					$scope.$apply(function(){
						element[0].files[0].state="pending"
						$scope.files.push(element[0].files[0]);
					});
				});
			}
		};
	}]);

	app.directive("datasetIrodsPullPanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/datasets/dataset-irods-pull.tpl.html'
		};
	});
})();
