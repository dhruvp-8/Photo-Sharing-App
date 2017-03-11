angular.module('uploadFileService',[])

.service('uploadFile', function($http){
    this.upload = function(file,username){
        var fd = new FormData();
        fd.append('uid', username);
        fd.append('myFile', file.upload);
        return $http.post('/api/upload', fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    };
});
