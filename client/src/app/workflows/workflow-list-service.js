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
* - workflows.services.workflow-list
*
*/
(function(){
	var app = angular.module('workflows.services.workflow-list', []);

	app.factory("WorkflowList", ['$rootScope', function($rootScope) {
		var workflows = {};
		var tags = [];
		var selectedTags = [];
		var filters = [];
		var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
		var old = new Date(0);
		//http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
		return {
			getWorkflows: function() {
				return Object.values(workflows);
			},
			setWorkflows: function(_workflows) {
			    workflows = {};
			    var workflow;
				for(var i in _workflows){
				    workflow = _workflows[i];
					if(workflow.name.search(/^imported: /) !== -1){
					    workflow.name = workflow.name.replace(/imported: /g, "");
						workflow.imported = true;
					}

					workflows[workflow.id] = workflow;
				}

				old = new Date();
				return this;
			},
			updateWorkflows: function(_workflows) {
			    var workflow;
				for(var i in _workflows){
				    workflow = _workflows[i];
					if(workflow.name.search(/^imported: /) !== -1){
					    workflow.name = workflow.name.replace(/imported: /g, "");
						workflow.imported = true;
					}
					workflows[workflow.id] = workflow;
				}

				return this;
			},
			getWorkflow: function(workflow_id) {
                return workflows[workflow_id];
			},
			addWorkflow: function(workflow) {
				workflows[workflow.id] = workflow;
				return this;
			},
			deleteWorkflow: function(workflow) {
				delete workflows[workflow.id];
				return this;
			},
			getTags: function() {
				return tags;
			},
			getTag: function(_tag) {
				for(var i in tags){
					if(tags[i].name === _tag){
						return tags[i];
					}
				}
				return null;
			},
			setTags: function(_tags) {
				tags = _tags;
				return this;
			},
			updateTags: function() {
				var tagsAux = {}, _tags;
				var _workflows = this.getWorkflows();
				for(var i in _workflows){
					_tags = _workflows[i].tags;
					for(var j in _tags){
						tagsAux[_tags[j]] = {
							name: _tags[j],
							times: ((tagsAux[_tags[j]] === undefined)?1:tagsAux[_tags[j]].times + 1)
						}
					}
				}
				tags = Object.keys(tagsAux).map(function(k) { return tagsAux[k] });

				for(var i in tags){
					tags[i].color =  tagColors[i%tagColors.length]
				}

				tags.push({name: "All", times: _workflows.length})

				return this;
			},
			selectTag: function(tag){
				selectedTags.push(tag);
				return this;
			},
			deselectTag: function(tag){
				var pos = selectedTags.indexOf(tag);
				if(pos !== -1){
					selectedTags.splice(pos,1);
				}
				return this;
			},
			getSelectedTags: function(){
				return selectedTags;
			},
			removeAllSelectedTags(){
				selectedTags = [];
				return this;
			},
			getFilters: function() {
				return filters;
			},
			setFilters: function(_filters) {
				filters = _filters;
				return this;
			},
			removeFilter: function(_filter){
				var pos = filters.indexOf(_filter);
				if(pos !== -1){
					filters.splice(pos,1);
				}
				return this;
			},
			removeAllFilters: function(){
				filters = [];
				return this;
			},
			getOld: function(){
				return (new Date() - old)/120000;
			}
		};
	}]);
})();
