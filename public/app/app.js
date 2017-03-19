angular.module('userApp', ['appRoutes','userControllers','userServices','ngAnimate','mainController','authServices','managementController','emailController'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
});
