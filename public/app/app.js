angular.module('userApp', ['appRoutes','userControllers','userServices','ngAnimate','mainController','authServices','managementController','emailController','dataController'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
});
