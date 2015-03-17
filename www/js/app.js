// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'starter.controllers',
    'starter.models',
    'starter.utils',
    'LocalStorageModule',
    'ngCordova'
])

.constant('PRODUCTION', false)
// .constant('WEBSERVICE_URL', 'http://192.168.254.101:777/pullse-ws')
.constant('WEBSERVICE_URL', 'http://bbgl.kinghost.net')
.constant('FACEBOOK_APP_ID', 401554549993450)
.constant('PUSH_NOTIFICATION_SENDER_ID', '552977488644')
.constant('CLUB_ID', 1)

.run(function(
    $ionicPlatform,
    $rootScope,
    PUSH_NOTIFICATION_SENDER_ID,
    $cordovaPush,
    PRODUCTION
) {

    $ionicPlatform.ready(function() {

        // var config = {
        //     "senderID": PUSH_NOTIFICATION_SENDER_ID,
        // };

        // if (PRODUCTION) {
        //     $cordovaPush.register(config).then(function(result) {
        //         alert("result: " + result);
        //     }, function(err) {
        //         alert("Registration error: " + err);
        //     });
        // }

        // $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
        //     switch(notification.event) {
        //         case 'registered':
        //             if (notification.regid.length > 0 ) {
        //                 alert('registration ID = ' + notification.regid);
        //             }
        //             break;
        //     }
        // });

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
        controller: 'AppController'
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
    .state('app.checkin-tabs', {
        url: "/checkin-tabs",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-tabs.html",
                controller: 'CheckinTabsController'
            }
        }
    })
    .state('app.checkin-perfil', {
        url: "/checkin-perfil/:id/:eventId",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-perfil.html",
                controller: 'CheckinPerfilController'
            }
        }
    })
    .state('tab.teste', {
        url: "/teste",
        views: {
            'tab-teste': {
                templateUrl: "templates/teste.html",
                // controller: 'CheckinPerfilController'
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
    .state('app.checkin-heart-me', {
        url: "/checkin-heart-me/:eventId",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-heart-me.html",
                controller: 'CheckinHeartMeController'
            }
        }
    })
    .state('app.checkin-my-heart-', {
        url: "/checkin-my-heart/:eventId",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-my-heart.html",
                controller: 'CheckinMyHeartController'
            }
        }
    })
    .state('app.checkin-matches', {
        url: "/checkin-matches/:eventId",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-matches.html",
                controller: 'CheckinMatchesController'
            }
        }
    })
    .state('app.checkin-busca', {
        url: "/checkin-busca/:eventId",
        views: {
            'menuContent': {
                templateUrl: "templates/checkin-busca.html",
                controller: 'CheckinBuscaController'
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
    .state('logout', {
        url: "/logout",
        templateUrl: "templates/logout.html",
        controller: 'LogoutController'
    })
    .state('dispatcher', {
        url: "/dispatcher",
        templateUrl: "templates/dispatcher.html",
        controller: 'DispatcherController'
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/dispatcher');
});
