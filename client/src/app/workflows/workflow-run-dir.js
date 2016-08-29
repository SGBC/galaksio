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
* - workflowInvocationToolbar
* - workflowRunForm
* - workflowStep
* - stepDataInput
* - stepInput
* - workflowSummary
*
*/
(function(){
	var app = angular.module('workflows.directives.workflow-run', [
		'common.dialogs'
	]);

	/***************************************************************************/
	/*DIRECTIVES ***************************************************************/
	/***************************************************************************/

	app.directive("workflowInvocationToolbar", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/workflows/workflow-invocation-toolbar.tpl.html'
		};
	});

	app.directive("workflowRunForm", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/workflows/workflow-run.tpl.html'
		};
	});

	app.directive("workflowStep", ['$timeout', '$dialogs', function($timeout, $dialogs) {
		return {
			restrict: 'E',
			//templateUrl: 'app/workflows/workflow-run-step.tpl.html' NOT USED BECAUSE OF ANGULAR BUG
			template:
			'<div class="panel panel-default stepBox" ng-controller="WorkflowRunStepController as controller">' +
			'  <div class="panel-heading">'+
			'    <a class="collapseStepTool" ng-click="controller.toogleCollapseHandler($event)"><i class="fa fa-plus-square-o" aria-hidden="true"></i></a>' +
			'    <b>Step {{step.id + 1}} :</b> {{step.name}} ' +
			'  </div>' +
			'  <div class="panel-body" ng-hide="collapsed">'+
			'    <span ng-hide="loadingComplete"><i class="fa fa-cog fa-spin fa-2x fa-fw margin-bottom"></i> Loading...</span>'+
			'    <div ng-if="loadingComplete && step.type == \'data_input\'">'+
			'      <step-data-input></step-data-input>'+
			'    </div>' +
			'    <div ng-if="loadingComplete && step.type != \'data_input\'">'+
			'      <step-input ng-repeat="input in step.extra.inputs"></step-input>'+
			'    </div>' +
			'  </div>' +
			'</div>',
			link: function(scope, elm, attrs) {
				$timeout(function () {
					//DOM has finished rendering
					if(scope.step.type === "data_input"){
						angular.element($(elm).find(".collapseStepTool")).triggerHandler('click');
					}
				});
			},
		};
	}]);

	app.directive("stepDataInput", function($compile) {
		return {
			restrict: 'E',
			replace: true,
			link: function(scope, element){
				var model = scope.step;

				model.label = JSON.parse(model.tool_state).name;

				var template =
				'<label>{{step.label}}</label>' +
				'<dataset-list-input></dataset-list-input>' +
				'<a type="button" class="btn btn-primary btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step);">' +
				'	<i class="fa fa-search"></i> Browse file' +
				'</a>'+
				'<a type="button" class="btn btn-default btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step, true);">' +
				'	<i class="fa fa-upload"></i> Upload file' +
				'</a>';

				//Form Validation and fields added with $compile
				//Based on http://stackoverflow.com/questions/19882506/form-validation-and-fields-added-with-compile
				$compile($(template).appendTo(element))(scope);
			}
		};
	});

	app.directive("stepInput", ['$compile', '$dialogs', function($compile, $dialogs) {
		return {
			restrict: 'E',
			link: function(scope, element){
				var model = scope.input;
				var template = "";
				var inputValue = "";
				try{
					inputValue = JSON.parse(scope.step.tool_state)[model.name].replace(/(^\"|\"$)/g,"");
				}catch(err) {
					console.error("Unable to parse 'step.tool_state' at stepInput directive.");
				}

				//TODO: available types are
				//  + genomebuild
				//  + hidden
				//  - hidden_data
				//  - baseurl
				//  - file
				//  - ftpfile
				//  - library_data
				//  - color
				//  - data_collection
				//  - drill_down
				//  - data_column
				//  - integer and float
				//  + select --> DONE
				//  + data --> DONE
				//  + boolean --> DONE
				//  + text --> DONE
				//  + repeat --> DONE
				//  + conditional --> DONE
				try{
					if(model.type === "text"){
						model.value = inputValue;
						template+=
						'<label>{{input.label || input.title}}</label>' +
						'<input type="text" name="{{input.name}}" ' +
						'       ng-model="input.value"' +
						'       required >';
					}else if(model.type === "select"){
						model.value = inputValue;
						template =
						'<label>{{input.label || input.title}}</label>' +
						'<select class="form-control" name="{{input.name}}"' +
						'        ng-model="input.value"' +
						'        ng-options="option[1] as option[0] for option in input.options"' +
						'        required>'+
						"</select>";
					}else if(model.type === "boolean"){
						model.value = (inputValue === "true");
						template+=
						'<input type="checkbox" name="{{input.name}}" ng-model="input.value">' +
						'<label>{{input.label || input.title}}</label>';
					}else if(model.type === "data"){
						if(inputValue.indexOf("RuntimeValue") > -1 || inputValue.indexOf("null") > -1 ){
							template+=
							'<label>{{input.label || input.title}}</label>' +
							'<i name="{{input.name}}">Output dataset from <b>step {{step.input_connections[input.name].id + 1}}</b></i>';
						}else{
							throw 'Unknown value for data type "' + inputValue + '" : ' + JSON.stringify(model);
						}
					}else if(model.type === "repeat"){
						inputValue = JSON.parse(inputValue);
						template = "<label>" + model.title + (inputValue.length > 1?"s":"") + "</label>";

						var _key; //queries_0|input2, queries_1|input2, ...
						for(var i in inputValue){ //array of objects
							for(var j in inputValue[i]){
								//{"input2" : Object, "__index__": 0}
								_key = model.name + "_" + inputValue[i]["__index__"] + "|" + j;
								if(scope.step.input_connections[_key] !== undefined){
									template+=
									'<div class="inputRepeatItem">'+
									'  <label>{{input.title}}' + (i+1) + "</label>" +
									'  <i name="{{input.name}}" >Output dataset from step ' + (scope.step.input_connections[_key].id + 1) + '</i>' +
									'</div>'
									;
								}
							}
						}
					}else if(model.type === "conditional"){
						model.value = inputValue;
						template= '<label>{{input.test_param.label || input.title}}</label>';
						template+=
						'<div ng-repeat="option in input.test_param.options">' +
						'	<input type="radio" name="{{input.test_param.name}}" ng-model="input.value" value="{{option[1]}}"> {{option[0]}}' +
						'</div>';
						template+=
						'<div style="margin-left: 20px;" ng-repeat="option in input.cases" ng-if="input.value === option.value">' +
						'	<step-input ng-repeat="input in option.inputs"></step-input>'+
						'</div>';
					}else if(model.type === "hidden"){
						model.value = inputValue;
						template+=
						'<input type="hidden" name="{{input.name}}" ng-model="input.value" >';
					}else if(model.type === "upload_dataset"){
						template+=
						'<input type="file" name="{{input.name}}">';
					}else if(model.type === "genomebuild"){
						model.value = inputValue;
						template =
						'<label>{{input.label || input.title}}</label>' +
						'<select class="form-control" name="{{input.name}}"' +
						'        ng-model="input.value"' +
						'        ng-options="option[1] as option[0] for option in input.options"' +
						'        required>'+
						"</select>";
					}else{
						throw 'Unknown input type ' + model.type + ' : ' + JSON.stringify(model);
					}
				}catch(err) {
					debugger;
					template = '<b color="red">Unknown input</b>';
					$dialogs.showErrorDialog("Error while creating the form: "  + err.split(":")[0],{
						title        : "Error while creating the form",
						reportButton : true,
						logMessage   : err,
						callback     : function(reason){
							// Show error message
							debugger;
							// Collapse the tool
							scope.loadingComplete = false;
							scope.collapsed = true;
							// Remove extra information from step
							delete scope.step.extra;
						}
					});
				}

				$compile($(template).appendTo(element))(scope);
			}
		};
	}]);

	app.directive("workflowSummary", ['$timeout', '$dialogs', function($timeout, $dialogs) {
		return {
			restrict: 'E',
			//templateUrl: 'app/workflows/workflow-run-step.tpl.html' NOT USED BECAUSE OF ANGULAR BUG
			template:
			'<table class="workflow-summary-step" ng-repeat="step in workflow.steps">' +
			'  <thead>'+
			'    <tr><th colspan="2">Step {{$index + 1}}. {{step.name}}</th></tr>' +
			'    <tr><th>Field name</th><th>Value</th></tr>' +
			'  </thead>'+
			'  <tbody>'+
			'    <tr ng-if="step.type === \'data_input\'"><td>{{step.inputs[0].name}}</td><td>{{findFileName(step.inputs[0].value)}}</td></tr>' +
			'    <tr ng-if="step.type !== \'data_input\' && step.extra === undefined"><td colspan="2">Using default values</td></tr>' +
			'    <tr ng-if="step.extra !== undefined" ng-repeat="input in step.extra.inputs">' +
			'       <td>{{input.label || input.title}}</td>' +
			'       <td>{{adjustValueString(input)}}</td>' +
			'    </tr>' +
			'  </tbody>'+
			'</table>'
		};
	}]);
})();
