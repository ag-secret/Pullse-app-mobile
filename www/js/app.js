// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.models', 'LocalStorageModule'])

.constant('WEBSERVICE_URL', 'http://192.168.254.110:777/pullse-ws')

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

    .state('app.lista-vip', {
      url: "/lista-vip",
      views: {
        'menuContent': {
          templateUrl: "templates/lista-vip.html",
          controller: 'ListaVipController'
        }
      }
    })
    .state('app.eventos', {
        url: "/eventos",
        views: {
            'menuContent': {
                templateUrl: "templates/eventos.html",
                controller: 'EventosController'
            }
        }
    })
    .state('app.checkin', {
        url: "/checkin",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin.html",
                controller: 'CheckinController'
            }
        }
    })
    .state('app.checkin-perfil', {
        url: "/checkin-perfil/:id",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-perfil.html",
                controller: 'CheckinPerfilController'
            }
        }
    })
    .state('app.contato', {
        url: "/contato",
        views: {
            'menuContent': {
                templateUrl: "templates/contato.html",
                controller: 'ContatoController'
            }
        }
    })
    .state('app.institucional', {
        url: "/institucional",
        views: {
            'menuContent': {
                templateUrl: "templates/institucional.html",
                controller: 'InstitucionalController'
            }
        }
    })
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginController'
    })
    .state('dispatcher', {
        url: "/dispatcher",
        templateUrl: "templates/dispatcher.html",
        controller: 'DispatcherController'
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dispatcher');
});
