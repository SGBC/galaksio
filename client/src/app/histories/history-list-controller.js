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
  var app = angular.module('histories.controllers.history-list', [
    'histories.services.history-list',
    'histories.directives.history-list'
  ]);

  /***************************************************************************/
  /*CONTROLLERS **************************************************************/
  /***************************************************************************/
  app.controller('HistoryListController', [
    '$scope',
    '$http',
    'HistoryList',
    function($scope, $http, HistoryList){
      var me = this;

      //This controller uses the HistoryList, which defines a Singleton instance of
      //a list of histories. Hence, the application will not
      //request the data everytime that the history list panel is displayed (data persistance).
      $scope.histories = HistoryList.getHistories();

      var currentHistoryId = Cookies.get("current-history");

      this.setDisplayedHistory = function(history){
        $scope.displayedHistory = history;

        if(history.content === undefined){
          $http(getHttpRequestConfig("GET", "datasets-list", {extra: history.id})).then(
            function successCallback(response){
              history.content = response.data;
            },
            function errorCallback(response){
              //TODO: SHOW ERROR MESSAGE
            });
          }
        };
        this.setCurrentHistory = function(history){
          $scope.currentHistory = history;
          Cookies.remove("current-history", {path: window.location.pathname});
          //GET THE COOKIE
          Cookies.set("current-history", history.id, {expires : 1, path: window.location.pathname});
        };
        this.retrieveHistoriesData = function(){
          if($scope.histories.length === 0){
            $http(getHttpRequestConfig("GET", "history-list")).then(
              function successCallback(response){
                $scope.histories = HistoryList.setHistories(response.data).getHistories();
                //Set the current history based on the id (cookie)
                $scope.currentHistory = HistoryList.getHistory(currentHistoryId);
                me.setDisplayedHistory($scope.currentHistory);
                //Now get the details for each history
                for(var i in $scope.histories){
                  //GET THE EXTRA INFORMATION FOR EACH HISTORY
                  $http(getHttpRequestConfig("GET", "history-list", {extra: $scope.histories[i].id})).then(
                    function successCallback(response){
                      var history = null;
                      //Find the history object
                      for(var i in $scope.histories){
                        if($scope.histories[i].id === response.data.id){
                          history = $scope.histories[i];
                          break;
                        }
                      }
                      //Update the object content with the new data
                      if(history !== null){
                        for (var attrname in response.data) {
                          history[attrname] = response.data[attrname];
                        }
                      }
                    },
                    function errorCallback(response){
                      //TODO: SHOW ERROR MESSAGE
                    });
                  }

                },
                function errorCallback(response){
                  //TODO: SHOW ERROR MESSAGE
                });
              }else{
                $scope.currentHistory = HistoryList.getHistory(currentHistoryId);
                me.setDisplayedHistory($scope.currentHistory);
              }
            };

            //INITIALIZE THE DATA
            this.retrieveHistoriesData();
          }
        ]
      );
    })();
