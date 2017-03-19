angular.module('mainController',['authServices','fileModelDirective','uploadFileService','userServices'])

.controller('mainCtrl', function(Auth,$timeout,$location,$rootScope,$window,$scope,uploadFile,$interval,$route,User,AuthToken){
    var app = this;
    app.loadme = false;

    //app.prof_photo = 'nothing';
    app.checkSession = function(){
        if(Auth.isLoggedIn()){
            app.checkingSession = true;
            var interval = $interval(function(){
                var token = $window.localStorage.getItem('token');
                if(token === null){
                    $interval.cancel(interval);
                }
                else{
                    self.parseJwt = function(token){
                        var base64Url = token.split('.')[1];
                        var base64 = base64Url.replace('-','+').replace('_','/');
                        return JSON.parse($window.atob(base64));
                    };
                    var expireTime = self.parseJwt(token);
                    var timeStamp = Math.floor(Date.now() / 1000);
                    //console.log(expireTime.exp,timeStamp);
                    var timeCheck = expireTime.exp - timeStamp;
                    //console.log('timeCheck:'+ timeCheck);
                    if(timeCheck <= 0){
                        //console.log('token has expired');
                        showModal(1);
                        $interval.cancel(interval);
                    }
                    else{
                        //console.log('token has not yet expired');
                    }
                }
            },2000);
        }
    };

    app.checkSession();

    var showModal = function(option){
        app.choiceMade = false;

        app.modalHeader = undefined;
        app.modalBody = undefined;
        app.hideButton = false;
        if(option === 1){

            app.modalHeader = 'Timeout Warning';
            app.modalBody = 'Your session will expire in 5 minutes. Would you like to renew session?';
            $('#ourModal').modal({ backdrop: "static" });

        }else if(option === 2){
            app.hideButton = true;
            app.modalHeader = 'Logging Out';
            $('#ourModal').modal({ backdrop: "static" });
            $timeout(function(){
                Auth.logout();
                $location.path('/');
                hideModal();
                $route.reload();
            },2000);

        }
        $timeout(function(){
                if(!app.choiceMade){
                    hideModal();
                }
            },40000);
    };

    app.renewSession = function(){
        app.choiceMade = true;
        //console.log('123');
        User.renewSession(app.username).then(function(data){
           if(data.data.success){
                AuthToken.setToken(data.data.token);
                app.checkSession();
           }
           else{
               app.modalBody = data.data.message;
           }
        });
        hideModal();
    };

    app.endSession = function(){
        app.choiceMade = true;
        $timeout(function(){
            showModal(2);
        },1000);
        hideModal();
    };

    var hideModal = function(){
        $('#ourModal').modal('hide');
    };


    var usrname;
    $rootScope.$on('$routeChangeStart', function(){
        if(!app.checkSession){
            app.checkSession();
        }
        if(Auth.isLoggedIn()){
            app.isLoggedIn = true;
            Auth.getUser().then(function(data){
                app.id = data.data._id;
                app.name = data.data.name;
                app.username = data.data.username;
                usrname = app.username;
                app.email = data.data.email;
                app.prof_photo =  'assets/uploads/' + data.data.prof_photo;

                User.getPermission().then(function(data){
                    if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                        app.authorized = true;
                        app.loadme = true;
                    }else{
                        app.loadme = true;
                    }
                });
            });
        }
        else {
            app.isLoggedIn = false;
            app.name = '';
            app.loadme = true;
        }
        if($location.hash() == '_=_') $location.hash(null);
    });

    this.facebook = function(){
        app.disabled = true;
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    };


    this.doLogin = function(loginData){
        app.errorMsg = false;
        app.successMsg = false;
        app.loading = true;
        app.expired = false;
        app.disabled = true;

        Auth.login(app.loginData).then(function(data){
            if(data.data.success){
                app.loading = false;
                app.successMsg = data.data.message + ' ...Redirecting!';
                $timeout(function(){
                    $location.path('/about');
                    app.loginData = '';
                    app.successMsg = false;
                    app.checkSession();
                },2000);
            }
            else{
                if(data.data.expired){
                    app.expired = true;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }else{
                    app.disabled = false;
                    app.loading = false;
                    app.errorMsg = data.data.message;
                }
            }
        });
    };

    this.openModal = function(){
        $('#myModal').modal('show');
    };

    app.logout = function(){
        app.disabled = false;
        showModal(2);
    };


        $scope.file = {};

        $scope.Submit = function(){
            $scope.uploading = true;
            $scope.notFinished = true;
            uploadFile.upload($scope.file,usrname).then(function(data){
                if(data.data.success){
                    $scope.timesense = true;
                    $scope.uploading = false;
                    $scope.alert = 'alert alert-success';
                    $scope.notFinished = false;
                    $scope.message = data.data.message;
                    app.prof_photo = 'assets/uploads/' + data.data.url;
                    $scope.file = {};
                }
                else{
                    $scope.uploading = false;
                    $scope.notFinished = false;
                    $scope.alert = 'alert alert-danger';
                    $scope.message = data.data.message;
                    $scope.file = {};
                }
                $('#fileUploader').val("");
            });
        };

        $scope.photoChanged = function(files){
            $scope.notFinished = true;
            if(files.length > 0 && files[0].name.match(/\.(png|jpeg|jpg|JPG|JPEG|PNG)$/)){
                $scope.uploading = true;
                var file = files[0];
                var fileReader = new FileReader();
                fileReader.readAsDataURL(file);
                fileReader.onload = function(e){
                    $timeout(function(){
                        $scope.thumbnail = {};
                        $scope.thumbnail.dataUrl = e.target.result;
                        $scope.uploading = false;
                        $scope.message = false;
                    });
                };
            }
            else{
                $scope.thumbnail = {};
                $scope.message = false;
            }

        };

        /*this.showProf = function(user){
            app.openModal();
            app.uname = user.username;
            app.em = user.email;
            app.nm = user.name;
            app.prof_pic = 'assets/uploads/' + user.prof_photo;
        };*/

});
