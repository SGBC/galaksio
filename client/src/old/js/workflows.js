//# sourceURL=workflows.js
/*
 * (C) Copyright 2016 The Genomics of Gene Expression Lab, CIPF
 * (http://bioinfo.cipf.es/aconesawp) and others.
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
 *     Rafael Hernandez de Diego
 *     rhernandez@cipf.es
 *     Ana Conesa Cegarra
 *     aconesa@cipf.es
 *
 * THIS FILE CONTAINS THE FOLLOWING COMPONENT DECLARATION
 * - Application
 *
 */
(function(){
    var app = angular.module('workflow-directives', []);

    /***************************************************************************/
    /*DIRECTIVES ***************************************************************/
    /***************************************************************************/
    app.directive("workflowCard", function() {
      return {
        restrict: 'E',
        templateUrl: "templates/workflow-card.html",
        link: function(){
        }
      };
    });

    app.directive("workflowDetails", function() {
      return {
        restrict: 'E',
        template : function(tElem, tAttrs){
          var html =  '<div>' +
                      '  <h2>Running {{workflow.name}}</h2>' +
                      '  <p><b>Author: </b>{{workflow.owner}}</p>' +
                      '  <p><b>Description: </b>{{workflow.annotation}}</p>' +
                      '  <h3>Steps:</h3>' +
                      '  <div id="workflowStepContainer"><i class="fa fa-cog fa-spin fa-2x fa-fw margin-bottom"></i></div>' +
                      '</div>';
          return html;
        }
      };
    });

    /***************************************************************************/
    /*SERVICES *****************************************************************/
    /***************************************************************************/
    app.factory("WorkflowListService", function() {
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


    /***************************************************************************/
    /*CONTROLLERS **************************************************************/
    /***************************************************************************/
    app.controller('WorkflowListController', [ '$scope', '$http', 'WorkflowListService', function($scope, $http, WorkflowListService){
      var me = $scope;

      //This controller uses the WorkflowListService, which defines a Singleton instance of
      //a list of workflows + list of tags + list of filters. Hence, the application will not
      //request the data everytime that the workflow list panel is displayed (data persistance).
      me.workflows = WorkflowListService.getWorkflows();
      me.tags =  WorkflowListService.getTags();
      me.filters =  WorkflowListService.getFilters();

      if(me.workflows.length === 0){
        $http({
          method: 'GET',
          url: GALAXY_GET_ALL_WORKFLOWS
        }).then(
          function successCallback(response){
            me.workflows = WorkflowListService.setWorkflows(response.data).getWorkflows();
            me.tags =  WorkflowListService.updateTags().getTags();
          },
          function errorCallback(response){
            //TODO: SHOW ERROR MESSAGE
          });
      }

      /**
      * This function gets the list of filters from the "Search for" field and
      * updates the filters list. Angular will automatically update the list of
      * workflows base on the new list of filtes.
      *
      * @returns {String} error message in case of invalid form.
      */
      me.applySearch = function() {
          var filters = arrayUnique(me.filters.concat($scope.searchFor.split(" ")));
          me.filters = WorkflowListService.setFilters(filters).getFilters();
      };
      /**
      * This function defines the behaviour for the "filterWorkflows" function.
      * Given a item (workflow) and a set of filters, the function evaluates if
      * the current item contains the set of filters within the different attributes
      * of the model.
      *
      * @returns {Boolean} true if the model passes all the filters.
      */
      me.filterWorkflows = function() {
        return function( item ) {
          var filterAux, item_tags;
          for(var i in me.filters){
            filterAux = me.filters[i].toLowerCase();
            item_tags = item.tags.join("");
            if(!(
              (item.name.toLowerCase().indexOf(filterAux)) !== -1 ||
              (item_tags.toLowerCase().indexOf(filterAux)) !== -1
            )){
              return false;
            }
          }
          return true;
        };
      };
    }]);

    app.controller('WorkflowController', ['$scope', '$http', '$stateParams', 'WorkflowListService', function($scope, $http, $stateParams, WorkflowListService){
      debugger;

      var me = $scope;

      me.workflow = null;

      /**
       * This function gets a list of of Workflows from server
       * TODO: SEPARATE IN GROUPS (10 WORKFLOWS ETC.)
       */
       if($stateParams.id !== undefined){
         me.workflow = WorkflowListService.getWorkflow($stateParams.id);

         $http({
           method: 'GET',
           url: GALAXY_API_WORKFLOWS + $stateParams.id + "/download"
         }).then(
           function successCallback(response){
             for (var attrname in response.data) {
               me.workflow[attrname] = response.data[attrname];
             }
           },
           function errorCallback(response){
             //TODO: SHOW ERROR MESSAGE
           });
       }
    }]);
  })();
