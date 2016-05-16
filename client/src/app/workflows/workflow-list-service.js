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

    app.factory("WorkflowList", function() {
      var workflows = [];
      var tags = [];
      var filters = [];

      return {
        /**
        * This function gets a list of of Workflows from server
        * TODO: SEPARATE IN GROUPS (10 WORKFLOWS ETC.)
        */
        getWorkflows: function() {
          return workflows;
        },
        setWorkflows: function(_workflows) {
          workflows = _workflows;
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
        getTags: function() {
          return tags;
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
          tags.push({name: "All", times: workflows.length})

          return this;
        },
        getFilters: function() {
            return filters;
        },
        setFilters: function(_filters) {
          filters = _filters;
          return this;
        }
      };
    });
  })();
