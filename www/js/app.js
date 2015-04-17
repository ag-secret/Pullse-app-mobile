// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'LocalStorageModule',
    'angular-preload-image',
    'angularMoment',
    'ionic',
    'ngCordova',
    'starter.controllers',
    'starter.models',
    'starter.utils',
    'starter.directives'
])

.constant('PRODUCTION', true)
// .constant('WEBSERVICE_URL', 'http://192.168.254.101:777/pullse-ws')
.constant('WEBSERVICE_URL', 'http://bbgl.kinghost.net')
.constant('FACEBOOK_APP_ID', 401554549993450)
.constant('PUSH_NOTIFICATION_SENDER_ID', '552977488644')
.constant('CLUB_ID', 1)
.constant('DEFAULT_ROUTE', 'app.lista-vip')

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.transition('none');
    if (ionic.Platform.platform() == 'ios') {
        $ionicConfigProvider.backButton.text('Voltar');
    }
})

.run(function(
    $cordovaLocalNotification,
    $cordovaPush,
    $ionicHistory,
    $ionicPlatform,
    $rootScope,
    $state,
    PRODUCTION,
    PUSH_NOTIFICATION_SENDER_ID
) {

    $ionicPlatform.ready(function() {

        var config = {};
        if (ionic.Platform.isAndroid()) {
            config = {
                'senderID': PUSH_NOTIFICATION_SENDER_ID,
            };
        } else if(ionic.Platform.isIOS()) {
            config = {
                'senderID': 'APN AQUI!',
            };
        }

        if (PRODUCTION) {
            $cordovaPush.register(config).then(function(result) {
                alert('registrou');
            }, function(err) {
            });
        }

        $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
            switch(notification.event) {
                case 'message':
                    // Entra aqui quando recebe um mensagem
                    alert('Recebeu');
                    alert(notification.collapse_key);
                    if (notification.collapse_key == 'combination' || notification.collapse_key == 'like') {
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $state.go('app.checkin-main');
                    }
                    $cordovaLocalNotification.add({
                        id: notification.payload.notId,
                        title: notification.payload.title,
                        message: notification.payload.message,
                    }).then(function () {
                        console.log('callback for adding background notification');
                    });
                break;
            }
        });

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
        .state('app.teste', {
            url: "/teste",
            views: {
                'menuContent': {
                    templateUrl: "templates/teste.html",
                    controller: 'TesteController'
                }
            }
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
        .state('app.checkin-main', {
            url: "/checkin-main",
            views: {
                'menuContent': {
                    templateUrl: "templates/checkin-main.html",
                    controller: 'CheckinMainController'
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
        .state('app.checkin-hearts', {
            url: "/checkin-hearts/:eventId/:flag",
            views: {
                'menuContent': {
                    templateUrl: "templates/checkin-hearts.html",
                    controller: 'CheckinHeartsController'
                }
            }
        })
        .state('app.checkin-hearted-me', {
            url: "/checkin-hearted-me/:eventId/:flag",
            views: {
                'menuContent': {
                    templateUrl: "templates/checkin-hearted-me.html",
                    controller: 'CheckinHeartsController'
                }
            }
        })
        .state('app.checkin-that-i-hearted', {
            url: "/checkin-that-i-hearted/:eventId/:flag",
            views: {
                'menuContent': {
                    templateUrl: "templates/checkin-that-i-hearted.html",
                    controller: 'CheckinHeartsController'
                }
            }
        })
        .state('app.checkin-matches', {
            url: "/checkin-matches/:eventId/:flag",
            views: {
                'menuContent': {
                    templateUrl: "templates/checkin-matches.html",
                    controller: 'CheckinHeartsController'
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
