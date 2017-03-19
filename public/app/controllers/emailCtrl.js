angular.module('emailController', ['userServices'])

    .controller('emailCtrl', function($routeParams,User,$timeout,$location){
        app = this;
        User.activeAccount($routeParams.token).then(function(data){

            app.errorMsg = false;
            app.successMsg = false;

            if(data.data.success){
                app.successMsg = data.data.message + '...Redirecting';
                $timeout(function(){
                    $location.path('/login');
                },3000);
            }
            else{
                app.errorMsg = data.data.message + '...Redirecting';
                $timeout(function(){
                    $location.path('/login');
                },3000);
            }

        });
    })

    .controller('resendCtrl', function(User){

        app = this;
        app.checkCredentials = function(loginData){
            app.errorMsg = false;
            app.successMsg = false;
            app.disabled = true;

            User.checkCredentials(app.loginData).then(function(data){
                if(data.data.success){
                    User.resendLink(app.loginData).then(function(data){
                        if(data.data.success){
                            app.successMsg = data.data.message;
                        }
                    });
                }else{
                    app.disabled = false;
                    app.errorMsg = data.data.message;
                }
            });
        };

    });
