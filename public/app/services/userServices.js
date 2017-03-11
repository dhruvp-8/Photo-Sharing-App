angular.module('userServices',[])

.factory('User', function($http){
    userFactory = {};

    userFactory.create = function(regData){
        return $http.post('/api/users',regData);
    };

    userFactory.checkUsername = function(regData){
        return $http.post('/api/checkusername',regData);
    };

    userFactory.checkEmail = function(regData){
        return $http.post('/api/checkemail',regData);
    };

    return userFactory;
});