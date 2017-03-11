angular.module('mainController',['authServices','fileModelDirective','uploadFileService'])

.controller('mainCtrl', function(Auth,$timeout,$location,$rootScope,$window,$scope,uploadFile){
    var app = this;
    app.loadme = false;
    app.prof_photo = 'nothing';
    var usrname;
    $rootScope.$on('$routeChangeStart', function(){
        if(Auth.isLoggedIn()){
            app.isLoggedIn = true;
            Auth.getUser().then(function(data){
                app.name = data.data.name;
                app.username = data.data.username;
                usrname = app.username;
                app.email = data.data.email;
                app.prof_photo =  'assets/uploads/' + data.data.prof_photo;
                console.log(app.prof_photo);
                app.loadme = true;
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
        //console.log("123");
        $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
    };


    this.doLogin = function(loginData){
        app.errorMsg = false;
        app.successMsg = false;
        app.loading = true;

        Auth.login(app.loginData).then(function(data){
            if(data.data.success){
                app.loading = false;
                app.successMsg = data.data.message + ' ...Redirecting!';
                $timeout(function(){
                    $location.path('/about');
                    app.loginData = '';
                    app.successMsg = false;
                },2000);
            }
            else{
                app.loading = false;
                app.errorMsg = data.data.message;
            }
        });
    };

    this.openModal = function(){
        console.log("123");
        $('#myModal').modal('show');
    };

    this.logout = function(){
        Auth.logout();
        $location.path('/logout');
        $timeout(function(){
            $location.path('/');
        },100);
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

});
