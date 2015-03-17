angular.module('starter.controllers', [])

.controller('AppController', function($scope, $ionicModal, $timeout, Me) {
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.me = Me.data;
	});
})
.controller('LoginController', function(
	$scope,
	$ionicLoading,
	$timeout,
	$ionicSlideBoxDelegate,
	$ionicModal,
	$state,
	Evento,
	Me,
	WEBSERVICE_URL,
	Network,
	localStorageService
){
	$scope.userId = null;

	$scope.loginError = false;
	$scope.networkError = false;

	$scope.doLoginTeste = function(id){
		$ionicLoading.show({
			template: 'Entrando...'
		});

		Me.doLoginTeste(id)
			.then(function(result){
				Me.data = result;
				localStorageService.set('Me', Me.data);
				$state.go('app.eventos');
			}, function(err){
				$scope.networkError = true;
			})
			.finally(function(){
				$ionicLoading.hide();
			});
	};

	$scope.doLogin = function(){
		$ionicLoading.show({
			template: 'Entrando...'
		});

		Network.check()
			.then(function(result){
				Me.doLogin()
					.then(function(result){
						if (result) {
							Me.data = result;
							localStorageService.set('Me', Me.data);
							$state.go('app.eventos');
						} else {
							$scope.loginError = true;
						}
					}, function(err){
						$scope.loginError = true;
					})
					.finally(function(){
						$ionicLoading.hide();
					});
				
			}, function(err){
				$scope.networkError = true;
			});
	};
})

.controller('ListaVipController', function(
	$cordovaToast,
	$ionicActionSheet,
	$ionicLoading,
	$ionicModal,
	$ionicPopup,
	$scope,
	$timeout,
	Evento,
	Lista,
	Network
) {

	$scope.communicationError = false;

	$scope.listas = [];
	$scope.currentList = null;

	$scope.moreDataCanBeLoaded = true;

	$scope.page = 0;

	$ionicModal.fromTemplateUrl('templates/modal/lista.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function(lista) {
		//console.log(lista);
		$scope.currentList = lista;
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.send = function(){

		Network.check()
			.then(function(result){
				$ionicLoading.show({
					template: 'Enviando...'
				});
				$timeout(function(){
					Evento.addViplistSubscription({event_id: $scope.currentList.id})
						.then(function(result){
							$cordovaToast.show('Inscrição feita com sucesso!', 'long', 'bottom');
							$scope.closeModal();
						}, function(err){
							if (err.code == 403) {
								var alertPopup = $ionicPopup.alert({
									title: 'Aviso!',
									template: err.message
								});
								alertPopup.then(function(res) {
									$scope.closeModal();
								});
							} else {
								$scope.closeModal();
							}
						}).finally(function(){
							$ionicLoading.hide();
						});
				}, 3000);
			}, function(err){
				$cordovaToast.show('Erro na comunicação com o servidor!', 'long', 'bottom');
			});
	};


	$scope.getMoreListas = function(){
		Network.check()
			.then(function(result){
				Evento.getLists($scope.page)
					.then(function(result){
						$scope.listas = result;
						$scope.communicationError = false;
					}, function(err){
						$scope.communicationError = true;
					})
					.finally(function(){
						$scope.$broadcast('scroll.infiniteScrollComplete');
						$scope.moreDataCanBeLoaded = false;
					});
			}, function(err){
				$scope.communicationError = true;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
	};

	$scope.refreshListas = function(){
		Network.check()
			.then(function(result){
				$timeout(function(){
					$scope.page = 0;
					Evento.getLists($scope.page)
						.then(function(result){
							$scope.listas = result;
							$scope.communicationError = false;
						}, function(err){
							$scope.communicationError = true;
						})
						.finally(function(){
							$scope.$broadcast('scroll.refreshComplete');
						});
				}, 3000);
			}, function(err){
				$scope.communicationError = true;
				$scope.$broadcast('scroll.refreshComplete');
			});
	};
})
.controller('EventosController', function(
	$scope,
	$ionicLoading,
	$timeout,
	$ionicSlideBoxDelegate,
	$ionicModal,
	Evento,
	WEBSERVICE_URL
){

	$scope.imgBaseUrl = WEBSERVICE_URL;
	$scope.events = [];

	$scope.showFirstRefresh = true;

	/**
	 * Como não tem como passar parametro para a modal esta variavel diz a modal qual o atual slide
	 * portanto qual evento mostrar
	 * @type integer
	 */
	$scope.currentEvent = null;

	$ionicModal.fromTemplateUrl('templates/modal/evento.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.$on('$ionicView.afterEnter', function(){
		$scope.firstRefresh();
	});

	$scope.setCurrentEvent = function(index){

		$scope.currentEvent = $scope.events[index];
		// console.log($scope.currentEvent);
	};

	$scope.firstRefresh = function(){
		$scope.showFirstRefresh = true;
		$timeout(function(){
			Evento.get()
				.then(function(result){
					$scope.events = result;
					$ionicSlideBoxDelegate.update();
					//console.log($ionicSlideBoxDelegate.currentIndex);
					//$scope.setCurrentEvent($ionicSlideBoxDelegate.currentIndex);

					// for (i = 0; i>= 10; i++) {

					// }

				}, function(err){
					
				})
				.finally(function(){
					$scope.showFirstRefresh = false;
				});
		}, 1000);
	};

	$scope.refresh = function(){
		Evento.get()
			.then(function(result){
				$scope.events = result;
				//$scope.currentEvent = result[0];

				// for (i = 0; i>= 10; i++) {

				// }
				$scope.$broadcast('scroll.refreshComplete');

				$ionicSlideBoxDelegate.update();
			}, function(err){
				
			})
			.finally(function(){
				$scope.showFirstRefresh = false;
			});
	};
    
})

.controller('DispatcherController', function(
	$state,
	$timeout,
	localStorageService,
	Evento,
	Me,
	$ionicPlatform,
	PRODUCTION,
	PUSH_NOTIFICATION_SENDER_ID,
	$cordovaNetwork
){
	
	$timeout(function(){
		var me = localStorageService.get('Me');
		if (me) {
			Me.data = me;
			$state.go('app.eventos');
		} else {
			$state.go('login');
		}
		
	}, 500);

})
.controller('CheckinMatchesController', function(
	$stateParams,
	$interval,
	$timeout,
	localStorageService,
	Evento,
	Me,
	Checkin,
	$scope,
	Util
){

	$scope.eventId = $stateParams.eventId;
	var interval = null;

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.loading = true;
		$scope.perfis = Checkin.matches;
		$scope.loadPerfis();
	});

	$scope.$on('$ionicView.beforeLeave', function(){
		$scope.stopInterval();
	});

	$scope.startInterval = function(){
		$scope.stopInterval();
		console.log('Iniciando timer matches');
		interval = $interval(function(){
			$scope.loadPerfis();
		}, 1000);
	};

	$scope.stopInterval = function(){
		console.log('Parando timer matches');
		$interval.cancel(interval);
	};

	$scope.loadPerfis = function(){
		$scope.stopInterval();
		Checkin.getMatches($stateParams.eventId, 0)
			.then(function(result){
				if (result) {
					$scope.perfis = Checkin.matches;
					$timeout(function(){
						$scope.loadPerfis();	
					}, 1000);
				} else {
					$scope.loading = false;
					$scope.$broadcast('scroll.refreshComplete');
					$scope.startInterval();
				}
			}, function(err){
				
			})
			.finally(function(){

			});
	};
})
.controller('CheckinMyHeartController', function(
	$stateParams,
	$timeout,
	localStorageService,
	Evento,
	$interval,
	Me,
	Checkin,
	$scope,
	Util
){

	
	$scope.eventId = $stateParams.eventId;

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.loading = true;
		$scope.perfis = Checkin.pleopleThatIHeart;
		$scope.loadPerfis();
	});

	var interval = null;
	$scope.startInterval = function(){
		$scope.stopInterval();
		console.log('Iniciando timer matches');
		interval = $interval(function(){
			$scope.loadPerfis();
		}, 1000);
	};

	$scope.stopInterval = function(){
		console.log('Parando timer matches');
		$interval.cancel(interval);
	};

	$scope.loadPerfis = function(){
		Checkin.getPeopleThatIHeart($scope.eventId, 0)
			.then(function(result){
				if (result) {
					$scope.perfis = Checkin.pleopleThatIHeart;
					$timeout(function(){
						$scope.loadPerfis();	
					}, 1000);
				} else {
					$scope.loading = false;
					$scope.$broadcast('scroll.refreshComplete');
					$scope.startInterval();
				}
			}, function(err){
				
			})
			.finally(function(){

			});
	};
})
.controller('CheckinHeartMeController', function(
	$stateParams,
	$timeout,
	$interval,
	localStorageService,
	Evento,
	Me,
	Checkin,
	$scope,
	Util
){

	$scope.eventId = $stateParams.eventId;

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.loading = true;
		$scope.perfis = Checkin.peopleHeartMe;
		$scope.loadPerfis();
	});

	var interval = null;
	$scope.startInterval = function(){
		$scope.stopInterval();
		console.log('Iniciando timer matches');
		interval = $interval(function(){
			$scope.loadPerfis();
		}, 1000);
	};

	$scope.stopInterval = function(){
		console.log('Parando timer matches');
		$interval.cancel(interval);
	};

	$scope.loadPerfis = function(){
		Checkin.getPeopleHeartMe($scope.eventId, 1)
			.then(function(result){
				if (result) {
					$scope.perfis = Checkin.peopleHeartMe;
					$timeout(function(){
						$scope.loadPerfis();	
					}, 1000);
				} else {
					$scope.loading = false;
					$scope.$broadcast('scroll.refreshComplete');
					$scope.startInterval();
				}
			}, function(err){
				
			})
			.finally(function(){

			});
	};
})
.controller('CheckinBuscaController', function(
	$interval,
	$ionicLoading,
	$ionicScrollDelegate,
	$scope,
	$stateParams,
	$timeout,
	Checkin,
	Evento
) {
	
	$scope.perfis = Checkin.perfis;

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.perfis = Checkin.perfis;
		$scope.getNewPerfis('first');
	});

	$scope.getNewPerfis = function(event){
		$scope.loading = true;
		Checkin.getAll($stateParams.eventId)
			.then(function(result){
				if (result) {
					$scope.perfis = Checkin.perfis;

					$timeout(function(){
						$scope.getNewPerfis(event);
					}, 100);
				} else {
					$scope.loading = false;
				}
			}, function(err){
				
			})
			.finally(function(){
			});
	};

})
.controller('CheckinTabsController', function(
	$ionicLoading,
	$scope,
	$timeout,
	$interval,
	Checkin,
	Evento,
	$ionicScrollDelegate,
	$filter
) {
	/**
	 * Diz qual é o evento atual da tela de checkins
	 * @type {Array Object}
	 */
	$scope.currentEvent = null;

	$scope.alertNoEvents = false;

	$scope.hasNewProfiles = false;

	$scope.showCheckinButton = false;

	$scope.loadingNewData = true;
	
	var timerRefreshData = null;

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.perfis = Checkin.perfis;
		$scope.loadingNewData = true;

		$scope.refreshEvent('first');
	});
	$scope.$on('$ionicView.beforeLeave', function(){
		console.log('Saindo');
		$scope.stopInterval();
	});
	$scope.getNewPerfis = function(event){
		Checkin.getAll($scope.currentEvent.id)
			.then(function(result){
				if (result) {
					if (event == 'first') {
						$scope.perfis = Checkin.perfis;
					} else if(event == 'timer') {
						$scope.hasNewProfiles = true;
					}
					
					$timeout(function(){
						$scope.getNewPerfis(event);
					}, 100);
				} else {
					$scope.loadingNewData = false;
					if (event == 'first') {
						$scope.startInterval();
					} else if (event == 'pullToRefresh'){
						$scope.$broadcast('scroll.refreshComplete');
						$scope.startInterval();
					} else {
						console.log(result);
					}
				}
			}, function(err){
				
			})
			.finally(function(){
			});
	};

	$scope.refreshEvent = function(event){
		Evento.getCurrent()
			.then(function(result){
				if (!result) {
					$scope.currentEvent = null;
					Evento.checkinPerfis = [];
					$scope.perfis = [];
					$scope.loadingNewData = false;
					$scope.alertNoEvents = true;
				} else {
					$scope.currentEvent = result;
				}

				if ($scope.currentEvent) {
					if ($scope.currentEvent.id != result.id) {
						Evento.checkinPerfis = [];
						$scope.perfis = [];
					}
					$scope.getNewPerfis(event);
					if ($scope.currentEvent.id != Evento.checkinInfoEventId) {
						$scope.showCheckinButton = true;
					}
				}
			}, function(err){
				
			})
			.finally(function(){
			});
	};
	$scope.startInterval = function(){
		console.log('Começar interval');
		timerRefreshData = $interval(function(){
			console.log('Rolando timer...');
			$scope.refreshEvent('timer');
		}, 1000);
	};

	$scope.stopInterval = function(){
		console.log('Parando interval');
		$interval.cancel(timerRefreshData);
		timerRefreshData = null;
	};

	$scope.refreshProfiles = function(){
		$ionicScrollDelegate.scrollTop(true);
		$scope.perfis = [];
		$scope.perfis = Checkin.perfis;
		$scope.hasNewProfiles = false;
	};

	$scope.doPullToRefresh = function(){
		$scope.stopInterval();
		$scope.refreshEvent('pullToRefresh');
	};

	$scope.doCheckin = function(){
		$ionicLoading.show({
			template: 'Efetuando checkin em '+Evento.currentEvent.name+'...'
		});
		Evento.doCheckin($scope.currentEvent.id)
			.then(function(result){
				$scope.showCheckinButton = false;
				$ionicLoading.hide();
				$ionicLoading.show({
					template: 'Checkin feito com sucesso',
					noBackdrop: true,
					duration: 2000,
				});
			}, function(err){
				$ionicLoading.hide();
				$ionicLoading.show({
					template: 'Ocorreu um erro ao tentar efetuar o seu checkin',
					noBackdrop: true,
					duration: 2000,
				});
			});
	};
  
})

.controller('CheckinPerfilController', function(
	$ionicLoading,
	$scope,
	$stateParams,
	$ionicPopup,
	Checkin,
	$q
) {

	var id = $stateParams.id;
	var event_id = $stateParams.eventId;
    $scope.profile = Checkin.get(id);

	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.heartMe = false;
		$scope.thatIHeart = false;
		$scope.hasBtnHeart = false;

		$scope.loading = true;
		$scope.getStatus();
	});

	$scope.addHeartPreflight = function(){
		$ionicLoading.show({template: 'Salvando o seu coração...'});
		Checkin.addHeartPreflight(id, event_id)
			.then(function(result){
				console.log(result);
				if (parseInt(result) == 1) {
					$ionicLoading.hide();
					$scope.showPopup();
				} else {
					$scope.addHeart();
				}
			}, function(err){
				
			})
			.finally(function(){
				
			});
	};

	$scope.data = {};
	$scope.data.message = null;
	$scope.messageError = false;
	$scope.showPopup = function(){
		
		var myPopup = $ionicPopup.show({
			templateUrl: 'templates/popup/add-heart.html',
			title: 'Enviar mensagem!',
			subTitle: 'Esta pessoa também te curtiu. você deixar uma mensagem para ela, bem joia ok?',
			scope: $scope,
			buttons: [
				{
					text: '<b>Não enviar</b>',
					type: 'button-assertive',
					onTap: function(e) {
						$scope.addHeart(false);
					}
				},
				{
					text: '<b>Enviar</b>',
					type: 'button-positive',
					onTap: function(e) {
						if (!$scope.data.message) {
							$scope.messageError = true;
							e.preventDefault();
						} else {
							$scope.addHeart(true);		
						}
					}
				}
			]
		});
	};

	$scope.addHeart = function(sendMessage){

		if (!sendMessage) {
			$scope.data.message = null;
		}

		$ionicLoading.show({template: 'Salvando o seu coração...'});
		
		Checkin.addHeart({event_id: event_id, profile_id: id, message: $scope.data.message})
			.then(function(result){
				$scope.thatIHeart = true;
				$scope.hasBtnHeart = false;
			}, function(err){
				
			})
			.finally(function(){
				$ionicLoading.hide();
			});
	};

	$scope.getStatus = function(){
		Checkin.getProfileStatus(id, event_id)
			.then(function(result){
				if (!result) {
					$scope.hasBtnHeart = true;
				} else {
					if (result.length == 1) {
						if (result[0].user_id1 == id) {
							$scope.heartMe = true;
							$scope.hasBtnHeart = true;
						} else {
							$scope.thatIHeart = true;
						}
					} else {
						$scope.heartMe = true;
						$scope.thatIHeart = true;
					}
				}
			}, function(err){
				
			})
			.finally(function(){
				$scope.loading = false;
			});
	};
})
.controller('InstitucionalController', function($scope, $ionicPosition) {
    
})
.controller('ContatoController', function(
	$scope,
	$ionicLoading,
	$timeout,
	Contato,
	Network,
	$cordovaToast
) {

	$scope.mensagem = null;
	$scope.communicationError = false;

	$scope.save = function(){

		Network.check()
			.then(function(){
				$scope.communicationError = false;
				$ionicLoading.show({
					template: 'Enviando contato...'
				});
				Contato.add({mensagem: $scope.mensagem})
					.then(function(result){
						$scope.mensagem = null;
						$cordovaToast.show('Contato enviado, obrigado.', 'long', 'bottom');
					}, function(err){
						$scope.communicationError = true;		
					})
					.finally(function(){
						$ionicLoading.hide();
					});
			}, function(){
				$scope.communicationError = true;
			})
			.finally(function(){
				
			});
	};
})
.controller('LogoutController', function(
	localStorageService,
	$state,
	$ionicLoading,
	Me,
	$timeout
) {
	$timeout(function(){
		$ionicLoading.show({template: 'Saindo...'});
		Me.data = null;
		localStorageService.clearAll();
		$ionicLoading.hide();
		$state.go('login');
	}, 3000);
});