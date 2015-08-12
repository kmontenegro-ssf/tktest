angular.module('starter.controllers', [ ])

.controller('LoginCtrl', [ '$scope', '$state', 'UserService', '$ionicHistory', '$window',
    function($scope, $state, UserService, $ionicHistory, $window) {

    $scope.user = {};

    $scope.loginSubmitForm = function(form)
    {
        if(form.$valid)
        {   UserService.login($scope.user)
            .then(function(response) {
                if (response.status === 200) {
                    $window.localStorage["userID"] = response.data.userId;
                    $window.localStorage['token'] = response.data.id;
                    alert("it got past window.localstorage");
                    //Should return a token
                    console.log(response);
                    $ionicHistory.nextViewOptions({
                      historyRoot: true,
                      disableBack: true
                    });

                   $state.go('lobby');
                    alert("I got past $state.go");
                } else {
                    // invalid response
                    alert(response.status+ " Yes Something went wrong, try again.");
                }
            }, function(response) {
                // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                if(response.status === 401)
                {
                    alert("Incorrect username or password");
                }else if(response.data === null) {
                //If the data is null, it means there is no internet connection. 
                    alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                }else {
                    alert(response.data+ " Yes Something went wrong, try again.");
                }
            });
        }
    };
}])
.controller('RegisterCtrl',['$scope', '$state', 'UserService', '$ionicHistory','$window', 
    function($scope, $state, UserService, $ionicHistory, $window){
        $scope.reg={};
        $scope.repeatPassword= {};
        alert("it got here");
            //Required to get the access token
   
   
    function loginAfterRegister()
    {
        UserService.login($scope.reg)
        .then(function(response) {
            if (response.status === 200) {
                //Should return a token
                $window.localStorage["userID"] = response.data.userId;
                $window.localStorage['token'] = response.data.id;
                $ionicHistory.nextViewOptions({
                   historyRoot: true,
                   disableBack: true
                });
                $state.go('lobby');
            } else {
                // invalid response
                $state.go('landing');
            }
        }, function(response) {
            // something went wrong
            console.log(response);
            $state.go('landing');
        });
    }
    
    
        $scope.registerSubmitForm=function(form)
        {
            alert(JSON.stringify($scope.reg)+"it got in the function");
            if(form.$valid){
                 UserService.create($scope.reg)
            .then(function(response) {
                if (response.status === 200) {
                   loginAfterRegister();
                } else {
                    // invalid response
                    console.log(response);
                    alert(response.status+ " Yes Something went wrong, try again.");
                }
            }, function(response) {
                // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                if(response.status === 422)
                {
                    alert("Email is already registered to an Account");
                }else if(response.data === null) {
//If the data is null, it means there is no internet connection. 
                    alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                }else {
                    alert(response.data+ " Yes Something went wrong, try again. hi");
                }

            });
            }
            else{ alert("invalid");}
        }
    }])
    
.controller('LobbyCtrl',['$scope', '$state', '$ionicHistory', 'UserService', '$window', 
'ServerQuestionService', 'TKQuestionsService',
function($scope, $state, $ionicHistory, UserService, $window,
ServerQuestionService, TKQuestionsService) {
    $scope.logout = function()
    {
         UserService.logout($window.localStorage.token)
         .then(function(response) {
            //The successful code for logout is 204
            if(response.status === 204)
            {
                alert("it is a 204")
                $ionicHistory.nextViewOptions({
                  historyRoot: true,
                  disableBack: true
                });
                $state.go('landing');
            }else {
                 alert("Could not logout at this moment, try again.");
            }
        }, function(response) {
            alert("Could not logout at this moment, try again.");
        });
    }
    //Get Questions Initially if they are not already stored
    
   
    function getQuestions()
    {
        ServerQuestionService.all($window.localStorage['token'])
        .then(function(response) {
            if (response.status === 200) {
                var questions = response.data;
                TKQuestionsService.setQuestions(questions);
                $window.localStorage.questions = JSON.stringify(questions);
            } else {
                // invalid response
                confirmPrompt();
            }
        }, function(response) {
            // something went wrong
            confirmPrompt();
        });
    }
    
    function confirmPrompt()
    {
        var response = confirm("The questions could not be retrieved at this time, do you want to try again?");
        if (response == true) {
            getQuestions();
        }
    }
    $scope.takeTestButtonTapped = function()
    {
        alert("it took the tap");
        if($window.localStorage.questions === undefined)
            getQuestions();
        else {
            $state.go('test.detail',{testID:1});
        }
    };
    
    if($window.localStorage.questions === undefined)
        getQuestions();
    else
   TKQuestionsService.setQuestions(JSON.parse($window.localStorage.questions));
}])
.controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state',
function($scope, testInfo, $stateParams, $state) {
    //testInfo is passed in the router to obtain the questions
    var qNumber = $stateParams.testID;
    $scope.title = "Question #"+qNumber;
    testInfo.forEach(function(infoDict)
{
        if(infoDict.Answer_ID === "A")
            $scope.questionA = infoDict;
        if(infoDict.Answer_ID === "B")
            $scope.questionB = infoDict;
        

 });
         $scope.buttonClicked = function ( option ) {
                if(option === "A") {
                    console.log("Chose A");
                }
                else if(option === "B") {
                    console.log("Chose B");
                }
                var nextqNumber = Number(qNumber) +1;
                if(nextqNumber>30) {
                    $state.go('results');
                }else {
                    $state.go('test.detail',{testID:nextqNumber});
                }
            };

}]);
