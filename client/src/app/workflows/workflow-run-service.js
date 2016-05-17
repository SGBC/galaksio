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
    var app = angular.module('workflows.services.workflow-run', []);

    app.factory("FileList", function() {
      var files = [];
      var filters = [];

      return {
        getFiles: function() {
          return files;
        },
        setFiles: function(_files) {
          files = _files;
          return this;
        },
        getFile: function(file_id) {
          for(var i in files){
            if(files[i].id === file_id){
              return files[i];
            }
          }
          return null;
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
