/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,$timeout,userService,$mdDialog,$http){
    $scope.reSend = false;
    $scope.resubmits = 0; //counts the times user asked for resubmission
    $scope.v_code= 0;
    $scope.initvars = function (){
       // $scope.is2ndPage = false;
        $scope.emailPattern = '([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})';
        $scope.namePattern='[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
        $scope.mobilePattern='09[1|2|3][0-9]{8}';
        $scope.levelPage(1);
        $rootScope.user = {
            name: '',
            melli_code: 0,
            email: '',
            cDate: '1-1-1300',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat:'',
            address: '',
            description: '',
            isRecommended: false,
            recommender_user: '',
            type: -1,
            code: '',
            credit: 0,
            bonus: 0
        }
    }//end ofo function initVars
    //****************************************************************************************************************************************
        $("#Bdate").pDatepicker(
            {
                altField: '#BdateALT',
                altFormat: 'YYYY - MM - DD',
                format:'YYYY - MM - DD dddd',
                viewMode : "year",
                persianDigit: true,
                position: "auto",
                autoClose: true
            });

    //****************************************************************************************************************************************
    $scope.showAlert = function(ev) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('رمز عبور و تکرار رمز عبور مشابه نیستند!!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
                .targetEvent(ev)
        );
    };
    //******************************************************************************************************************
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
             userService.setUserInfo($rootScope.user);
             console.log($rootScope.user);
             $location.path('/verify');
             break;
     }
}//end of function level page
    //******************************************************************************************************************
    $scope.submit = function($event){
       // $scope.ev = ;
        if($rootScope.user.password!= $rootScope.user.passRepeat)
        //console.log("پسوردها مشابه نیستند!!!");
           $scope.showAlert($event)
        else {
            console.log($rootScope.user.date);
            var cellNum = {

                mobile_phone: $rootScope.user.mobile_phone
            };
            $http({
                url :"http://localhost:3000/api/sms" ,
                method: "POST" ,
                data : cellNum
            }).then(
                function(response){
                    //console.log(response.data.sms_code);
                    $rootScope.obtainedCode = response.data.sms_code;
                },
                function(response){
                    console.log("failure"+response);
                }
            );
            $scope.levelPage(2);
        }
    }
    //******************************************************************************************************************

        $scope.counter = 120;
        $scope.onTimeout=function(){
            $scope.counter --;
            mytimeout = $timeout($scope.onTimeout,1000);
            if($scope.counter == 0) {
                //if($scope.resubmits == 3)
                $timeout.cancel(mytimeout);
                $scope.reSend= true ;
            }
        }//end of function on time out
        var mytimeout = $timeout($scope.onTimeout,1000);

    //********************************************************************************************************************
    $scope.finSignUp = function(){
        if($scope.v_code == $rootScope.obtainedCode){
            console.log("SuccessFull signUp");
            //where the hell this token thing gets activated???
            if($rootScope.user.recommender_user === '')
                $http({
                        url: "http://localhost:3000/api/signup",
                        method: "POST",
                        data: {
                            name:$rootScope.user.name,
                            melli_code: $rootScope.user.melli_code,
                            email: $rootScope.user.email,
                            date: $rootScope.user.date,
                            mobile_phone: $rootScope.user.mobile_phone,
                            username: $rootScope.user.username,
                            password: $rootScope.user.password,
                            type: $rootScope.user.type,
                            sms_code:$scope.v_code ,
                        }
                    }
                ).then(function(response){
                    $location.path('/');
                },function(response){
                    console.log(response);
                });
            else
               $http({
                    url: "http://localhost:3000/api/signup",
                    method: "POST",
                    data: {
                        name:$rootScope.user.name,
                        melli_code: $rootScope.user.melli_code,
                        email: $rootScope.user.email,
                        date: $rootScope.user.date,
                        mobile_phone: $rootScope.user.mobile_phone,
                        username: $rootScope.user.username,
                        password: $rootScope.user.password,
                        type: $rootScope.user.type,
                        sms_code:$scope.v_code ,
                        recommender_user: $rootScope.user.recommender_user
                    }
                }
            ).then(function(response){
                $location.path('/');
            },function(response){
                console.log(response);
            });

        }
        else{
            console.log("Wrong verification code!!!");
        }
    }//end of function finalize signUp
    //********************************************************************************************************************
    $scope.resendCode=function(){
        //here u gotta send a request to server to ask for code again
        $http({
            url :"http://localhost:3000/api/sms" ,
            method: "POST" ,
            data : {

                mobile_phone: $rootScope.user.mobile_phone
            }
        }).then(
            function(response){
                console.log(response);
                console.log(response.data.sms_code);
                $rootScope.obtainedCode = response.data.sms_code;
            },
            function(response){
                console.log(response); // failure
            }
        );
        $scope.resubmits++;//we add up the counter ;when it reaches to it's limit u gotta cancel the users registration
        console.log($scope.resubmits);
    }
    //******************************************************Persian_DatePicker config*********************************************************

}//end of registerCtrl