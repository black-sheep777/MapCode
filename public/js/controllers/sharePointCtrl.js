/**
 * Created by blackSheep on 27-May-17.
 */
function sharePointCtrl ($scope,pointService,$mdDialog,msgService,$mdToast){
    $scope.initCompose = function (){
        var point = pointService.getSharedPoint();
        $scope.msg = {
            receiver :"",
            point:  point.code ,
            message : ""
        };
    };//end of initCompose
    /* ########################################################################################################################## */
    $scope.cancel=function () {
        $mdDialog.cancel();
    };
    /* ######################################################################################################################### */
    var last = {
        bottom: true,
        top: false,
        left: true,
        right: false
    };

    $scope.toastPosition = angular.extend({},last);

    $scope.getToastPosition = function() {
        sanitizePosition();

        return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
    };

    function sanitizePosition() {
        var current = $scope.toastPosition;

        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;

        last = angular.extend({},current);
    }
    function showSimpleToast (){
        var pinTo = $scope.getToastPosition();
        $mdToast.show(
            $mdToast.simple()
                .textContent('پیغام ارسال شد.')
                .position(pinTo )
                .hideDelay(5000)
        );
    };
    /* ######################################################################################################################### */
    $scope.submit = function (){
        msgService.sendMsg($scope.msg)
            .then(
                function(sentResult){
                    console.log(sentResult);
                    showSimpleToast();
                    $scope.cancel();
                },function(sentResult){
                    console.log(sentResult);
                }
            );
    };
    /*  ####################################################################################################################### */
};//end of sharePointCtrl