/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,$timeout,userService,$mdDialog,$http,authentication,authenticationToken){
    $scope.reSend = false;
    $scope.resubmits = 0; //counts the times user asked for resubmission
    $scope.v_code= 0;
    $scope.holding = [];
    $scope.initvars = function (){
        console.log(moment().format());
       // $scope.is2ndPage = false;
        //TODO:name constraint outta be changed from persion to english;date should support unixTimeStamp
        $scope.emailPattern = '([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})';
        $scope.namePattern='[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
       // $scope.namePattern='[a-zA-Z]+';
        $scope.mobilePattern='09[1|2|3][0-9]{8}';
        $scope.smsPattern='[0-9]+';
        $scope.levelPage(1);
        $scope.user = {
            name: '',
            melli_code: 0,
            email: '',
            cDate: '',
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
        };
    };//end of function initVars
    //****************************************************************************************************************************************


    //****************************************************************************************************************************************
    $scope.showAlert = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('خطا!')
                .textContent('رمز عبور و تکرار رمز عبور مشابه نیستند!!!')
                .ariaLabel('AlertDialog')
                .ok('متوجه شدم')
               // .targetEvent(ev)
        );
    };
    //******************************************************************************************************************
    $scope.showSucces = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('تبریک')
                .textContent('ثبت نام با موفقیت انجام شد!')
                .ariaLabel('AlertDialog')
                .ok('مرسی')
        );
    };
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
             $rootScope.pageTitle = "تایید ثبت نام";
            // userService.setUserInfo($rootScope.user);
             console.log($rootScope.user);
             $location.path('/verify');
             break;
     };
};//end of function level page
    //******************************************************************************************************************
    $scope.submit = function(){
        $rootScope.userClone= $scope.user;
        userService.setUserTime($scope.user.cDate);
        console.log($rootScope.userClone);
        if($rootScope.userClone.password!= $rootScope.userClone.passRepeat)
        //console.log("پسوردها مشابه نیستند!!!");
           $scope.showAlert();
        else {
            console.log($rootScope.userClone.cDate);
            var cellNum = {

                mobile_phone: $rootScope.userClone.mobile_phone

            };
            console.log($rootScope.userClone.mobile_phone);
            var mysmsUrl = window.apiHref+"sms/";
            $http({
                url :mysmsUrl ,
                method: "POST" ,
                data : cellNum
            }).then(
                function(response){
                    console.log(response.data.sms_code);
                    $rootScope.obtainedCode = response.data.sms_code;
                },
                function(response){
                    console.log(response); //failure
                }
            );
            $scope.levelPage(2);
        }
    }; //end of function submit
    //******************************************************************************************************************
        $scope.counter = 120;
        $scope.onTimeout=function(){
           // console.log($rootScope.user.cDate / 1000);
            $scope.counter --;
            mytimeout = $timeout($scope.onTimeout,1000);
            if($scope.counter === 0) {
                //if($scope.resubmits == 3)
                $timeout.cancel(mytimeout);
                $scope.reSend= true ;
            }
        };//end of function on time out
        var mytimeout = $timeout($scope.onTimeout,1000);
     //*******************************************************************************************************************
    //********************************************************************************************************************
    $scope.finSignUp = function() {
        if($scope.v_code == $rootScope.obtainedCode) {
            console.log("SuccessFull codeMatch");
            console.log("**"+userService.getUserTime());
            var t = userService.getUserTime();
            console.log(t);
            console.log(moment().unix(t));
            console.log(moment().format());
            var momentDate = (moment(t).format()).split("T");
            console.log(momentDate[0]);
            //console.log($rootScope.userClone.cDate);
            var myurl = window.apiHref + "signup/";
            var usrInfo = {
                name: $rootScope.userClone.name,
                    melli_code: $rootScope.userClone.melli_code,
                    email: $rootScope.userClone.email,
                    date: t,
                    mobile_phone: $rootScope.userClone.mobile_phone,
                    username: $rootScope.userClone.username,
                    password: $rootScope.userClone.password,
                    type:$rootScope.userClone.type,
                    sms_code: String($scope.v_code)
            };
            console.log(usrInfo);
            if ($rootScope.userClone.recommender_user === '') {
                $http({
                        url: myurl,
                        method: "POST",
                        data: usrInfo
                    }
                ).then(function (response) {
                    if (response.status == 201) {
                        console.log("Successful registeration");
                        $scope.showSucces();
                        var registeredUser = {
                            username: $rootScope.userClone.username,
                            password: $rootScope.userClone.password
                        };
                        //Gonna send the users data to signIn api to get the token
                        authentication.validateUser(registeredUser).then(
                            function (response) {
                                console.log(response.data.token); // gotta set the token
                                authenticationToken.setToken(response.data.token);
                                $location.path('/');
                            },
                            function (response) {
                                console.log(response);
                                if (response.status == 400)
                                    console.log("نام کاربری با الگوی غیر معتبر!");
                                else if (response.status == 404)
                                    console.log("نام کاربری یا رمز عبور صحیح نمی باشد.");
                            }//failure
                        );
                        // *****************************************************************
                    }
                }, function (response) {
                    if (response.status == 400) {
                        console.log("نام کاربری غیر معتبر!");
                        console.log(response);
                    }
                    else if (response.status == 409)
                        console.log('کاربر قبلا ثبت نام کرده');
                    else
                        console.log(response);
                });
            }//end if
            else {
                $http({
                        url: myurl,
                        method: "POST",
                        data: {
                            name: $rootScope.userClone.name,
                            melli_code: $rootScope.userClone.melli_code,
                            email: $rootScope.userClone.email,
                            date: t,
                            mobile_phone: $rootScope.userClone.mobile_phone,
                            username: $rootScope.userClone.username,
                            password: $rootScope.userClone.password,
                            type: $rootScope.userClone.type,
                            sms_code: $scope.v_code,
                            recommender_user: $rootScope.userClone.recommender_user
                        }
                    }
                ).then(function (response) {
                        $scope.showSucces();
                        var registeredUser = {
                            username: $rootScope.userClone.username,
                            password: $rootScope.userClone.password
                        };
                        //Gonna send the users data to sinIn api to get the token
                        authentication.validateUser(registeredUser).then(
                            function (res) {
                                console.log(res.data.token); // gotta set the token
                                authenticationToken.setToken(res.data.token);
                                $location.path('/');
                            },
                            function (res) {
                                console.log(res);
                                if (res.status == 400)
                                    console.log("نام کاربری با الگوی غیر معتبر!");
                                else if (res.status == 404)
                                    console.log("نام کاربری یا رمز عبور صحیح نمی باشد.");
                            }//failure
                        );
                        // *****************************************************************

                    },
                    function (res) {
                        console.log(res);
                        // console.log(res.status);
                        if (res.status == 400)
                            console.log("نام کاربری غیر معتبر!");
                        else if (res.status == 404)
                            console.log("نام کاربری یا رمز عبور صحیح نمی باشد.");
                    }//failure
                );
            }//end else
        } // end if related for checking validity of the code submitted
        else
            console.log("the inserted code is not the same obtained from server");
        }//end of function finalize signUp
        //********************************************************************************************************************
        $scope.resendCode = function () {
            var mysmsUrl = window.apiHref + "sms/";
            //here u gotta send a request to server to ask for code again
            $http({
                url: mysmsUrl,
                method: "POST",
                data: {

                    mobile_phone: $rootScope.userClone.mobile_phone
                }
            }).then(
                function (response) {
                    console.log(response);
                    console.log(response.data.sms_code);
                    $rootScope.obtainedCode = response.data.sms_code;
                },
                function (response) {
                    console.log(response); // failure
                }
            );
            $scope.resubmits++;//we add up the counter ;when it reaches to it's limit u gotta cancel the users registration
            console.log($scope.resubmits);
        };
        //******************************************************Persian_DatePicker config*********************************************************
        $("#Bdate").pDatepicker(
            {
                altField: '#BdateALT',
                format: 'YYYY - MM - DD dddd',
                viewMode: "year",
                position: "auto",
                autoClose: true
            });

}//end of registerCtrl
