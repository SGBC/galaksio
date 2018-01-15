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
		'ang-dialogs'
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

	app.directive("workflowInvocationPanel", function() {
		return {
			restrict: 'E',
			templateUrl: 'app/workflows/workflow-invocation-panel.tpl.html'
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
			'    <a class="clickable collapseStepTool" ng-click="controller.toggleCollapseHandler($event)"><i class="fa" ng-class="(collapsed !== false)?\'fa-plus-square-o\':\'fa-minus-square-o\'" aria-hidden="true"></i></a>' +
			'    <b>Step {{step.id + 1}} :</b> {{step.name}} {{step.description}}' +
			'    <i style="color: #e61669;">Expand for details</i>' +
			'  </div>' +
			'  <div class="panel-body" ng-hide="collapsed">'+
			'    <span ng-hide="loadingComplete"><i class="fa fa-spinner fa-pulse fa-fw margin-bottom"></i> Loading tool info...</span>'+
			'    <div ng-if="loadingComplete && step.type == \'data_input\'">'+
			'      <step-data-input></step-data-input>'+
			'    </div>' +
			'    <div ng-if="loadingComplete && step.type == \'data_collection_input\'">'+
			'      <step-data-collection-input></step-data-collection-input>'+
			'    </div>' +
			'    <div ng-if="loadingComplete && step.type != \'data_input\'  && step.type != \'data_collection_input\'">'+
			'      <div class="text-info " style="border: 1px solid #337ab7; padding: 10px 20px; border-radius: 5px;">' +
			'        <h5>{{step.name}} {{step.extra.description}} <a style="color: #e61669;" class="clickable" ng-click="isCollapsed=!isCollapsed; showStepHelp();" ng-init="isCollapsed=true;"> {{(isCollapsed)?"Show":"Hide"}} help</a></h5>' +
			'        <div uib-collapse="isCollapsed" ng-bind-html="helpHtml"></div>' +
			'      </div>' +
			'      <step-input ng-repeat="input in step.extra.inputs"></step-input>'+
			'    </div>' +
			'  </div>' +
			'</div>',
			link: function($scope, elm, attrs) {
				$timeout(function () {
					//DOM has finished rendering
					if($scope.step.type === "data_input" || $scope.step.type === "data_collection_input"){
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
			link: function($scope, element){
				var model = $scope.step;

				if(!model.tool_state){
					return;
				}

				if(model.label == null || model.label === ""){
					model.label = "Input dataset for step " + (model.id + 1);
				}

				var template =
				'<label style="display:block;">{{step.label}}</label>' +
				'<dataset-list-input></dataset-list-input>' +
				'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>' +
				'<a type="button" class="btn btn-primary btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step, false, [1,3]);">' +
				'	<i class="fa fa-search"></i> Browse file' +
				'</a>'+
				'<a type="button" class="btn btn-default btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step, true, [1,3]);">' +
				'	<i class="fa fa-upload"></i> Upload file' +
				'</a>';

				//Form Validation and fields added with $compile
				//Based on http://stackoverflow.com/questions/19882506/form-validation-and-fields-added-with-compile
				$compile($(template).appendTo(element))($scope);
			}
		};
	});


	app.directive("stepDataCollectionInput", function($compile) {
		return {
			restrict: 'E',
			replace: true,
			link: function($scope, element){
				var model = $scope.step;
				var tool_state = JSON.parse(model.tool_state);
				var sublabel = "";

				$scope.dataType = "collection";
				$scope.dataSubtype = tool_state.collection_type;

				if($scope.dataSubtype === "list"){
					sublabel += "List of datasets";
				} else if($scope.dataSubtype === "paired"){
					sublabel += "Pair of datasets";
				}else  if($scope.dataSubtype === "list:paired"){
					sublabel += "List of paired datasets";
				}

				if(model.label === undefined){
					model.label = sublabel;
					sublabel="";
				}

				var template =
				'<label>{{step.label}}<span class="collection-label-subtype">' + sublabel + '</span></label>' +
				'<dataset-collection-list-input></dataset-collection-list-input>' +
				'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>' +
				'<a type="button" class="btn btn-primary btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step, false, [0,2,4], \'' + $scope.dataType + '\', \'' + $scope.dataSubtype + '\');">' +
				'	<i class="fa fa-search"></i> Browse collections' +
				'</a>'+
				'<a type="button" class="btn btn-default btn-sm" style="margin-left: 10px;margin-bottom: 4px;" ng-click="controller.showDatasetSelectorDialog(step, true, [0,2,4], \'' + $scope.dataType + '\', \'' + $scope.dataSubtype + '\');">' +
				'	<i class="fa fa-upload"></i> Create new collection' +
				'</a>';

				//Form Validation and fields added with $compile
				//Based on http://stackoverflow.com/questions/19882506/form-validation-and-fields-added-with-compile
				$compile($(template).appendTo(element))($scope);
			}
		};
	});

	app.directive("multipleSelectInput", function($compile) {
		return {
			restrict: 'E',
			replace: true,
			link: function($scope, element){
				try {
					$scope.input.value = JSON.parse($scope.input.value);
				} catch (e) {
					$scope.input.value = [];
				}
				var model = $scope.input;

				$scope.input._value = "" + $scope.input.value;

				if(!$scope.changeMultipleSelection){
					$scope.changeMultipleSelection = function(c){
						var pos = $scope.input.value.indexOf(c);
						if(pos > -1){
							$scope.input.value.splice(pos, 1);
						}else{
							$scope.input.value.push(c);
						}
						$scope.input._value = "" + $scope.input.value;
					}
				}


				var template;
				if(model.multiple){
					template =
					'<div>' +
					'	<p ng-repeat="option in input.options" ng-click="changeMultipleSelection(option[1])">' +
					'		<i class="fa" ng-class="(input.value.indexOf(option[1]) > -1)?\'fa-check-square-o text-success\':\'fa-square-o\'"></i> {{option[0]}}' +
					'	</p>' +
					'<input style="display:none;" type="text" ng-model="input._value" name="{{input.name}}" ng-required="!(input.optional)" >' +
					'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>' +
					'</div>';
				}else{
					console.log(model);
					/*
					 * Oskar -
					 * Might wan't to clean this up a bit. What it does is check the chosen Step Value and sets input.value to the array in input.options which contains the Step Value
					 * This is done so that the Select shows the correct default value.
					 */
					var nInputValue = false;
					var tool_state = JSON.parse($scope.step.tool_state);
					if(tool_state[model.name]){
						if (typeof tool_state[model.name] === 'string' || tool_state[model.name] instanceof String){
							nInputValue = tool_state[model.name].replace(/(^\"|\"$)/g,"");
							nInputValue = nInputValue === "" ? false : nInputValue;
							for (option in model.options){
								if (nInputValue == model.options[option][1]){
									$scope.input.value = model.options[option];
								};
							}
						}
					}
					console.log("input.value",$scope.input.value);
					template =
					'<select class="form-control" name="{{input.name}}"' +
					'        ng-model="input.value"' +
					'        ng-required="!(input.optional===true)"'+
					'        ng-options="option[0] for option in input.options track by option[1]">'+
					"</select>"+
					'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
				}

				$compile($(template).appendTo(element))($scope);
			}
		};
	});

	app.directive("stepInput", ['$compile', '$dialogs', function($compile, $dialogs) {
		return {
			restrict: 'E',
			link: function($scope, element){
				var model = $scope.input;
				var template = "";
				var inputValue = "";
				var emptyInputValue = false;

				try{
					var tool_state = JSON.parse($scope.step.tool_state);
					if(tool_state[model.name]){
						if (typeof tool_state[model.name] === 'string' || tool_state[model.name] instanceof String){
							inputValue = tool_state[model.name].replace(/(^\"|\"$)/g,"");
							emptyInputValue = inputValue === "" ? true : false;
						}else{
							inputValue = tool_state[model.name];
						}
					}else if($scope.parent_tool_state !== undefined && $scope.parent_tool_state[model.name] !== undefined){
						if (typeof $scope.parent_tool_state[model.name] === 'string' || $scope.parent_tool_state[model.name] instanceof String){
							inputValue = $scope.parent_tool_state[model.name].replace(/(^\"|\"$)/g,"");
						}else{
							inputValue = $scope.parent_tool_state[model.name];
						}
					}else{
						var errorMessage = "No values for '" + model.name + "' in 'step.tool_state' at stepInput directive.";
						if(model.value !== undefined && model.value !== null ){
							errorMessage += " Using default value: " + model.value;
							inputValue = model.value;
						} else if(model.default !== undefined && model.default !== null ){
							errorMessage += " Using default value: " + model.default;
							inputValue = model.default;
						} else if(model.default_value !== undefined && model.default_value !== null){
							errorMessage += " Using default value: " + model.default_value;
							inputValue = model.default_value;
						} else if (model.type == "conditional" && model.test_param.value !== undefined && model.test_param.value !== null){
							errorMessage += " Using default value: " + model.default_value;
							inputValue = model.test_param.value;
						} else {
							errorMessage += " No default value was found.";
						}
						console.error(errorMessage);
					}
				}catch(err) {
					console.error("Unable to parse 'step.tool_state' at stepInput directive.");
				}

				//TODO: available types are
				//  + genomebuild
				//  + hidden
				//  + hidden_data
				//  + section
				//  - baseurl
				//  - file
				//  - ftpfile
				//  - library_data
				//  - color
				//  - data_collection
				//  - drill_down
				//  + data_column
				//  + integer and float
				//  + select
				//  + data
				//  + boolean
				//  + text
				//  + repeat
				//  + conditional
				try{
					console.log("Model name: " + model.name);
					console.log("inputValue: " + inputValue);
<<<<<<< HEAD
					console.log("emptyInputValue: " + emptyInputValue);
=======
>>>>>>> release/v0.3.1
					console.log(["model",model]);
					console.log(["step",$scope.step]);
					//TEXT, NUMBER... INPUTS
					if(model.type === "text"){
						template+=
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<input type="text" name="{{input.name}}" ' +
						'       ng-model="input.value"' +
						'       ng-required="' + emptyInputValue + '? false : !(input.optional)" >' +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
					}else if(model.type === "integer"){
						model.value = Number.parseInt(inputValue);
						var extra_help = ((model.min !== null)?' Min. value=' + model.min:'') + ((model.max !== null)?' Max. value=' + model.max :'');
						template+=
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}' + extra_help + '"></i>':'' + extra_help) +
						'<input type="number" name="{{input.name}}" ' +
						((model.max !== null)?'max="' + model.max + '"':'') +
						((model.min !== null)?'min="' + model.min + '"':'') +
						'       ng-model="input.value"' +
						'       ng-required="!(input.optional===true)" >' +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
						//SELECTORS INPUTS
					}else if(model.type === "float" ){
						model.value = Number.parseFloat(inputValue);
						var extra_help = ((model.min !== null)?' Min. value=' + model.min:'') + ((model.max !== null)?' Max. value=' + model.max :'');
						template+=
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<input type="number" name="{{input.name}}" ' +
						((model.max !== null)?'max="' + model.max + '"':'') +
						((model.min !== null)?'min="' + model.min + '"':'') +
						'       ng-model="input.value"' +
						'       ng-required="!(input.optional===true)" >' +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
						//SELECTORS INPUTS
					}else if(model.type === "select"){
						model.value = ((inputValue !== "" && !(inputValue instanceof Object))? inputValue: model.default_value);
						template =
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<multiple-select-input></multiple-select-input>';
					}else if(model.type === "data_column"){
						model.value = (inputValue !== ""? inputValue: model.default_value);
						template =
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<select class="form-control galaxy_data_column" name="{{input.name}}"' +
						((model.multiple)?'        multiple':'') +
						'        ng-model="input.value"' +
						//'        ng-options="option.value as option.label for option in adaptOptionsData(input.options) track by option.value"' +
						'        ng-required="!(input.optional===true)" >'+
						'   <option ng-repeat="option in input.options" value="{{option[1]}}" ng-selected="option[1]=== input.value">{{option[0]}}</option>' +
						"</select>" +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
					}else if(model.type === "genomebuild"){
						model.value = (inputValue !== ""? inputValue: model.default_value);
						template =
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<select class="form-control galaxy_genomebuild" name="{{input.name}}"' +
						((model.multiple)?'        multiple':'') +
						'        ng-model="input.value"' +
						//'        ng-options="option.value as option.label for option in adaptOptionsData(input.options) track by option.value"' +
						'        ng-required="!(input.optional===true)" >' +
						'   <option ng-repeat="option in input.options" value="{{option[1]}}" ng-selected="option[1]=== input.value">{{option[0]}}</option>' +
						"</select>" +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>';
						//CHECKBOX AND RADIOBUTTONS
					}else if(model.type === "conditional"){
						// Hide Conditional
						/*
						try {
							if (typeof inputValue === 'string' || inputValue instanceof String){
								inputValue = JSON.parse(inputValue);
							}
							model.value = model.cases[inputValue["__current_case__"]].value;
						} catch (e) {
							model.value = inputValue;
						}

						//TODO: REMOVE THE NAME PROPERTY? VALUES ARE BEING REMOVED WHEN EXPANDING TOOLS
						template=
						'<label>{{input.test_param.label || input.title}}</label>' +
						((model.help || model.test_param.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help || input.test_param.help}}"></i>':'') +
						'<select class="form-control galaxy_conditional"' +
						'        ng-model="input.value"' +
						'        ng-required="!(input.optional===true)" >'+
						'   <option ng-repeat="option in input.test_param.options" value="{{option[1]}}" ng-selected="option[1]=== input.value">{{option[0]}}</option>' +
						"</select>" +
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>' +
						'<div style="display:none;">' +
						'	<input type="radio" ng-repeat="option in input.test_param.options" name="{{input.test_param.name}}' + randomIDgenerator(5) + '"' +
						'        ng-model="input.value" value="{{option[1]}}"'+
						'        ng-required="!(input.optional===true)" >'  +
						'</div>';
						//Generate child nodes
						$scope.parent_tool_state = inputValue;
						template+=
						'<div class="form-subsection" ng-repeat="option in input.cases" ng-if="input.value === option.value">' +
						'	<step-input ng-repeat="input in option.inputs"></step-input>'+
						'</div>';
						*/
					}else if(model.type === "boolean"){
						model.value = (inputValue === "true");
						template+=
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<div class="btn-group yes-no-input">'+
						'   <label class="btn btn-sm" ng-class="input.value?\'btn-success\':\'btn-default\'" ng-model="input.value" uib-btn-radio="true">Yes</label>'+
						'   <label class="btn btn-sm" ng-class="input.value?\'btn-default\':\'btn-danger\'"  ng-model="input.value" uib-btn-radio="false">No</label>'+
						'</div>'+
						'<i class="fa fa-exclamation-circle text-danger invalid-value-icon" uib-tooltip="Invalid value"></i>' +
						'<input type="checkbox" style="display:none;" name="{{input.name}}" ng-model="input.value">';
						//DISPLAY
					}else if(model.type === "data"){
						if(inputValue === null || inputValue=== undefined ){
							throw 'Unknown value for data type "' + inputValue + '" : ' + JSON.stringify(model);
						}else if(inputValue.value !== undefined ){
							debugger
						}else if(inputValue instanceof String && (inputValue.indexOf("RuntimeValue") > -1 || inputValue.indexOf("null") > -1 || inputValue === "" )){
							template+=
							'<label>{{input.label || input.title}}</label>' +
							'<i name="{{input.name}}">'+
							'   Output dataset from <b>step {{step.input_connections[input.name].id + 1}}</b> '+
							((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
							'</i>';
						}else if(inputValue === "" && $scope.step.input_connections["library|" + model.name ] !== undefined){
							template+=
							'<label>{{input.label || input.title}}</label>' +
							'<i name="{{input.name}}">Output dataset from <b>step {{step.input_connections[\'library|\'+ input.name].id + 1}}</b></i>' +
							((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'');
						}
					}else if(model.type === "data_collection"){
						debugger;
						// model.value = inputValue;
						// template =
						// '<label>{{input.label || input.title}}</label>' +
						// '<select class="form-control" name="{{input.name}}"' +
						// '        ng-model="input.value"' +
						// '        ng-options="option[1] as option[0] for option in input.options.hda"' +
						// '        ng-required="!(input.optional===true)" >'+
						// "</select>" +
						// ((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'');
					}else if(model.type === "repeat"){
						inputValue = JSON.parse(inputValue);
						template = "<label>" + model.title + (inputValue.length > 1?"s":"") + "</label>" +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'');

						var _key; //queries_0|input2, queries_1|input2, ...
						for(var i in inputValue){ //array of objects
							for(var j in inputValue[i]){
								//{"input2" : Object, "__index__": 0}
								_key = model.name + "_" + inputValue[i]["__index__"] + "|" + j;
								if($scope.step.input_connections[_key] !== undefined){
									template+=
									'<div class="inputRepeatItem">'+
									'  <label>{{input.title}}' + (i+1) + "</label>" +
									'  <i name="{{input.name}}" >Output dataset from step ' + ($scope.step.input_connections[_key].id + 1) + '</i>' +
									'</div>';
								}
							}
						}
					}else if(model.type === "section"){
						template+=
						'<label>{{input.label || input.title}}</label>' +
						((model.help)?'<i class="fa fa-question-circle-o" uib-tooltip="{{input.help}}"></i>':'') +
						'<div class="form-subsection">' +
						'	<step-input ng-repeat="input in input.inputs"></step-input>'+
						'</div>';
					}else if(model.type === "hidden" || model.type === "hidden_data"){
						model.value = inputValue;
						template+=
						'<input type="hidden" name="{{input.name}}" ng-model="input.value" >';
					}else if(model.type === "upload_dataset"){
						template+=
						'<input type="file" name="{{input.name}}">';
					}else{
						throw 'Unknown input type ' + model.type + ' : ' + JSON.stringify(model);
					}
				}catch(err) {
					debugger;

					if (err instanceof Object && err.message !== undefined){
						err = err.message;
					}

					template = '<b color="red">Unknown input</b>';
					$dialogs.showErrorDialog("Error while creating the form: "  + err.split(":")[0],{
						title        : "Error while creating the form: unknown field type.",
						logMessage   : err,
						callback     : function(reason){
							// Collapse the tool
							$scope.loadingComplete = false;
							//$scope.collapsed = true;
							// Remove extra information from step
							//delete $scope.step.extra;
						},
						reportButton : true,
						reportButtonHandler : function(){
							$scope.sendReportMessage({
								error: err.split(":")[0],
								input : model,
								tool : $scope.step
							});
						}
					});
				}

				$compile($(template).appendTo(element))($scope);
			}
		};
	}]);

	app.directive("workflowSummary", ['$timeout', '$dialogs', function($timeout, $dialogs) {
		return {
			restrict: 'E',
			//templateUrl: 'app/workflows/workflow-run-step.tpl.html' NOT USED BECAUSE OF ANGULAR BUG
			template:
			'<table class="workflow-summary-step" ng-repeat="step in params">' +
			'  <thead>'+
			'    <tr><th colspan="2">Step {{$index + 1}}. {{step.name}}</th></tr>' +
			'    <tr><th>Field name</th><th>Value</th></tr>' +
			'  </thead>'+
			'  <tbody>'+
			'    <tr ng-if="step.type === \'data_input\'"><td>Dataset</td><td>{{findFileName(step.inputs[0].value)}}</td></tr>' +
			'    <tr ng-if="step.type === \'data_collection_input\'"><td>Dataset collection</td><td>{{findFileName(step.inputs[0].value)}}</td></tr>' +
			'    <tr ng-if="step.params && step.params.length === 0">' +
			'       <td colspan="2">Using default values</td>' +
			'    </tr>' +
			'    <tr ng-if="step.params && step.params.length > 0" ng-repeat="input in step.params" data="{{input.name}}">' +
			'       <td>{{input.label}}</td>' +
			'       <td>{{adjustValueString(input.type, input.value)}}</td>' +
			'    </tr>' +
			'  </tbody>'+
			'</table>'
		};
	}]);
})();
