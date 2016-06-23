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
* - workflows.services.workflow-run
*
*/
(function(){
  var app = angular.module('workflows.services.workflow-run', []);

  app.factory("WorkflowInvocationList", function() {
    var invocations = [];

    return {
      getInvocations: function() {
        return invocations;
      },
      setInvocations: function(_invocations) {
        invocations = _invocations;
        return this;
      },
      saveInvocations: function() {
        sessionStorage.workflow_invocations = JSON.stringify(invocations);
        return this;
      },
      recoverInvocations: function() {
        try {
          invocations = JSON.parse(sessionStorage.workflow_invocations);
        } catch (e) {
          invocations = [];
        }

        return this;
      },
      addInvocation: function(_invocation) {
        debugger
        invocations.push(_invocation);
        return this;
      },
      updateInvocation: function(_invocation) {
        for(var i in invocations){
          if(invocations[i].id === _invocation.id){
            invocations[i] = _invocation;
            break;
          }
        }
        return this;
      },
      getInvocation: function(invocation_id) {
        for(var i in invocations){
          if(invocations[i].id === invocation_id){
            return invocations[i];
          }
        }
        return null;
      },
      getNewInvocation: function() {
        return {
          id: '',
          workflow_id: '',
          workflow_title: '',
          current_step : 1
        };
      },
    };
  });
})();
