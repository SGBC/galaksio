(function(){
  var app = angular.module('common.dialogs', [
    'ui.bootstrap'
  ]);

  app.service('dialogs', [
    '$uibModal',
    '$templateCache',
    function( $uibModal, $templateCache) {
      this.modalInstance = null;
      this.modalData = null;

      this.getModalInstance = function(){
        return this.modalInstance;
      }

      this.getModalData = function(){
        return this.modalData;
      }


      this.showInfoDialog = function(message, config) {
        config = ((config === undefined) ? {} : config);
        config.messageType = "info";
        config.icon = (config.icon || 'info-circle');
        this.showMessage(message, config);
      };

      this.showSuccessDialog = function(message, config) {
        config = ((config === undefined) ? {} : config);
        config.messageType = "success";
        config.icon = (config.icon || 'check-circle');
        this.showMessage(message, config);
      };

      this.showWarningDialog = function(message, config) {
        config = ((config === undefined) ? {} : config);
        config.messageType = "warning";
        config.icon = (config.icon || 'exclamation-triangle');
        this.showMessage(message, config);
      };

      this.showErrorDialog= function(message, config) {
        debugger
        config = (config === undefined) ? {} : config;
        config.messageType = "error";
        config.showButton = (config.showButton == null) ? true : config.showButton;
        config.showReportButton = true;
        config.icon = (config.icon || 'exclamation-circle');
        this.showMessage(message, config);
      };

      this.showMessage= function(message, config){
        config.message  = (message || "");
        var callback = (config.callback || null);

        var modalInstance = $uibModal.open({
          template: $templateCache.get('error.dialog.tpl.html'),
          controller: [
            '$scope',
            '$uibModalInstance',
            function($scope, $uibModalInstance){
              $scope.config = config;

              this.cancel = function(){
                $uibModalInstance.dismiss('cancel');
              }
            }],
            controllerAs: 'controller'
          });

          modalInstance.result.then(
            function () {
              if(callback){callback()};
            },
            function () {
              if(callback){callback()};
            });
          }; //END showMessage


          $templateCache.put('error.dialog.tpl.html',
          '<div class="modal-content">'+
          '  <div class="modal-header"  >'+
          '    <h4 class="modal-title">{{config.title}}</h4>'+
          '  </div>'+
          '  <div class="modal-body" >'+
          '    <p>{{config.message}}</p>'+
          '  </div>'+
          '  <div class="modal-footer">'+
          '    <button type="button" class="btn btn-default" ng-click="controller.ok()">OK</button>'+
          '    <button type="button" class="btn btn-default" ng-click="controller.cancel()">Close</button>'+
          '  </div>'+
          '</div>');

        }]);

      })();
