/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,$timeout,userService){
    $scope.initvars = function (){
         $scope.reSend = false;
        $scope.resubmits = 0; //counts the times user asked for resubmission
       // $scope.is2ndPage = false;
        $scope.emailPattern = '^([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})$';
        $scope.namePattern='^[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]+\s[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]+$';
        $scope.levelPage(1);
        $rootScope.user = {
            name: '',
            melli_code: 0,
            email: '',
            date: '',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat:'',
            address: '',
            description: '',
            isRecommended: false,
            recommender: 0,
            type: '',
            code: '',
            credit: 0,
            bonus: 0
        }
    }//end ofo function initVars
    //****************************************************************************************************************************************
    //****************************************************************************************************************************************
    //******************************************************************************************************************
    $scope.cb = function(){
        if($scope.is2ndPage){
            $scope.user = userService.getUserInfo();
            console.log("we R here");
        }

    }//end of function cb
    //******************************************************************************************************************
$scope.levelPage = function(level){
     switch (level){
         case 0:
             $location.path('/');
             break;
         case 1:
             $rootScope.pageTitle = "ثبت نام";
             break;
         case 2:
             $rootScope.pageTitle = "تایید ثبت نام"
             if($rootScope.user.password!= $rootScope.user.passRepeat)
                 console.log("پسوردها مشابه نیستند!!!");
             userService.setUserInfo($rootScope.user);
             /*$scope.is2ndPage = true;
             cb(); */
             console.log($rootScope.user);
             $location.path('/verify');
             break;
     }
}//end of function level page
    //******************************************************************************************************************
    $scope.submit = function(){
        $scope.levelPage(2);
    }
    //******************************************************************************************************************
    $scope.counter = 30;
    $scope.onTimeout=function(){
        $scope.counter --;
        mytimeout = $timeout($scope.onTimeout,1000);
        if($scope.counter == 0) {
            $timeout.cancel(mytimeout);
            $scope.reSend= true ;
        }
    }//end of function on time out
    var mytimeout = $timeout($scope.onTimeout,1000);
    //********************************************************************************************************************
    $scope.resendCode=function(){
        //here u gotta send a request to server to ask for code again
        $sope.resubmits++;//we addup the counter ;when it reaches to it's limit u gotta cancel the users registration
    }
    //******************************************************Persian_DatePicker config*********************************************************
    $(document).ready(function () {
        $("#Bdate").pDatepicker(
            {
                format:"YYYY - MM - DD dddd",
                viewMode : "year",
                persianDigit: true,
                altField: '#dateALT',
                altFormat: 'unix',
                position: "auto",
                autoClose: true
    });
    });
}//end of registerCtrl