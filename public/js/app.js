/**
 * Created by blackSheep on 27-Mar-17.
 */
var mapCodeApp = angular.module('mapCodeApp',['ngMaterial','ngRoute','ngResource']);
    mapCodeApp.controller('loginCtrl',loginCtrl)
        .controller('registerCtrl',registerCtrl)
        .controller('mainCtrl',mainCtrl)
        .controller('headerCtrl',headerCtrl)
        .service('regService',regService);
