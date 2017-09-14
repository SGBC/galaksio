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
		var invocations = {};

		return {
			getInvocations: function() {
				return Object.values(invocations);
			},
			setInvocations: function(_invocations) {
				invocations = _invocations;
				return this;
			},
			saveInvocations: function() {
				sessionStorage.workflow_invocations = JSON.stringify(invocations);
				return this;
			},
			loadInvocations: function() {
				try {
					invocations = JSON.parse(sessionStorage.workflow_invocations);
				} catch (e) {
					console.error("Unable to load the stored invocations.");
					invocations = {};
				}
				return this;
			},
			clearInvocations: function() {
				invocations = {};
				return this;
			},
			addInvocation: function(_invocation) {
				delete _invocation.checking;
				invocations[_invocation.id] = _invocation;
				return this;
			},
			removeInvocation: function(_invocation) {
				delete invocations[_invocation.id];
				return this;
			},
			updateInvocation: function(_invocation) {
				delete invocations[_invocation.id].checking;
				delete _invocation.checking;
				for(var attr in _invocation){
					invocations[_invocation.id][attr] = _invocation[attr];
				}
				return this;
			},
			getInvocation: function(invocation_id) {
				return invocations[invocation_id];
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
