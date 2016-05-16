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
 * - workflows.controllers.workflow-list
 *
 */
(function(){
    var app = angular.module('workflows.controllers.workflow-list', [
      'workflows.services.workflow-list',
      'workflows.directives.workflow-card'
    ]);

    /***************************************************************************/
    /*CONTROLLERS **************************************************************/
    /***************************************************************************/
    app.controller('WorkflowListController', [
      '$scope',
      '$http',
      'WorkflowList',
      function($scope, $http, WorkflowList){
        var me = $scope;

        //This controller uses the WorkflowList, which defines a Singleton instance of
        //a list of workflows + list of tags + list of filters. Hence, the application will not
        //request the data everytime that the workflow list panel is displayed (data persistance).
        me.workflows = WorkflowList.getWorkflows();
        me.tags =  WorkflowList.getTags();
        me.filters =  WorkflowList.getFilters();

        if(me.workflows.length === 0){
          $http({
            method: 'GET',
            url: GALAXY_GET_ALL_WORKFLOWS
          }).then(
            function successCallback(response){
              me.workflows = WorkflowList.setWorkflows(response.data).getWorkflows();
              me.tags =  WorkflowList.updateTags().getTags();
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
            me.filters = WorkflowList.setFilters(filters).getFilters();
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
  })();
