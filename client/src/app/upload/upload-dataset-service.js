// /*
// * (C) Copyright 2016 SLU Global Bioinformatics Centre, SLU
// * (http://sgbc.slu.se) and the B3Africa Project (http://www.b3africa.org/).
// *
// * All rights reserved. This program and the accompanying materials
// * are made available under the terms of the GNU Lesser General Public License
// * (LGPL) version 3 which accompanies this distribution, and is available at
// * http://www.gnu.org/licenses/lgpl.html
// *
// * This library is distributed in the hope that it will be useful,
// * but WITHOUT ANY WARRANTY; without even the implied warranty of
// * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// * Lesser General Public License for more details.
// *
// * Contributors:
// *     Rafael Hernandez de Diego <rafahdediego@gmail.com>
// *     Tomas Klingström
// *     Erik Bongcam-Rudloff
// *     and others.
// *
// * THIS FILE CONTAINS THE FOLLOWING MODULE DECLARATION
// * - upload.services.upload-dataset
// *
// */
// (function(){
// 	var app = angular.module('upload.services.upload-dataset', []);
//
// 	app.service('fileUpload', ['$http', function ($http) {
// 		this.uploadFileToUrl = function(file, uploadUrl){
// 			var fd = new FormData();
// 			fd.append('files_0|file_data', file);
// 			fd.append('tool_id', 'upload1');
// 			$http.post(uploadUrl, fd, {
// 				transformRequest: angular.identity,
// 				headers: {'Content-Type': undefined}
// 			})
// 			.success(function(){
// 			})
// 			.error(function(){
// 			});
// 		}
// 	}]);
// })();
