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
		var workflows = [];
		var tags = [];
		var filters = [];
		var tagColors = ['yellow', 'green', 'red', 'blue', 'purple', 'pink', 'yellow2', 'green2', 'red2', 'blue2', 'purple2', 'pink2']
		var old = new Date(0);
		//http://stackoverflow.com/questions/18247130/how-to-store-the-data-to-local-storage
		return {
			getWorkflows: function() {
				return workflows;
			},
			setWorkflows: function(_workflows) {
				workflows = _workflows;
				old = new Date();
				return this;
			},
			updateWorkflows: function(newWorkflows) {
				var found, nElems = workflows.length;
				for(var i in newWorkflows){
					found= false;
					if(newWorkflows[i].name.indexOf('imported: ') !== -1){
						newWorkflows[i].name = newWorkflows[i].name.replace('imported: ','');
						newWorkflows[i].imported = true;
					}

					for(var j=0; j < nElems; j++){
						if(newWorkflows[i].id === workflows[j].id){
							found= true;
							workflows[j] = newWorkflows[i];
							break;
						}
					}
					if(!found){
						workflows.push(newWorkflows[i]);
					}
				}
				return this;
			},
			getWorkflow: function(workflow_id) {
				for(var i in workflows){
					if(workflows[i].id === workflow_id){
						return workflows[i];
					}
				}
				return null;
			},
			addWorkflow: function(workflow) {
				workflows.push(workflow);
				return this;
			},
			deleteWorkflow: function(workflow_id) {
				for(var i in workflows){
					if(workflows[i].id === workflow_id){
						workflows.splice(i,1);
						return workflows;
					}
				}
				return null;
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

				for(var i in workflows){
					_tags = workflows[i].tags;
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

				tags.push({name: "All", times: workflows.length})

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
			getOld: function(){
				return (new Date() - old)/120000;
			}
		};
	}]);
})();
