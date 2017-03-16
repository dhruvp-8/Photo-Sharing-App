angular.module('managementController', [])

.controller('managementCtrl', function(User){

    var app = this;

    app.loading = true;
    app.accessDenied = true;
    app.errorMsg = false;
    app.editAccess = false;
    app.deleteAccess = false;
    app.limit = 5;

    User.getUsers().then(function(data){
        if(data.data.success){
            if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
                app.users = data.data.users;
                for(var i = 0; i < app.users.length; i++)
                    app.users[i].prof_photo = 'assets/uploads/' + app.users[i].prof_photo;
                console.log(data.data.users);
                app.loading = false;
                app.accessDenied = false;
                if(data.data.permission === 'admin'){
                    app.editAccess = true;
                    app.deleteAccess = true;
                } else if(data.data.permission === 'moderator'){
                    app.editAccess = true;
                }
            }
            else {
                app.errorMsg = 'Insufficient Permissions!'
                app.loading = false;
            }
        }
        else{
            app.errorMsg = data.data.message;
            app.loading = false;
        }
    });

    app.showMore = function(number){
        app.showMoreError = false;
        if(number > 0){
            app.limit = number;
        }
        else{
            app.showMoreError = 'Please Enter a Valid Number!'
        }
    };

    app.showAll = function(){
        app.limit = undefined;
        app.showMoreError = false;
    };


});
