angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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
	WEBSERVICE_URL
){
	$scope.userId = null;

	$scope.doLogin = function(id){
		$ionicLoading.show({
			template: 'Entrando...'
		});

		Me.doLogin(id)
			.then(function(result){
				$ionicLoading.hide();
				if (result) {
					$state.go('dispatcher');
				} else {
					$ionicLoading.hide();
					$ionicLoading.show({
						template: 'Usuário não existe',
						noBackdrop: true,
						duration: 2000
					});
				}
			}, function(err){
				$ionicLoading.hide();
			});
	};
})

.controller('ListaVipController', function(
	$scope,
	Lista,
	$ionicPopup,
	$ionicLoading,
	$timeout,
	$ionicActionSheet,
	$ionicModal,
	Evento
) {

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
		$ionicLoading.show({
			template: 'Enviando...'
		});

		Evento.addViplistSubscription({event_id: $scope.currentList.id})
			.then(function(result){
				Evento.getLists()
					.then(function(result){
						$scope.listas = result;
					}, function(err){
						
					})
					.finally(function(){
						$scope.closeModal();
						$ionicLoading.hide();

						$ionicLoading.show({
							template: 'Sua inscrição feita com sucesso!',
							noBackdrop: true,
							duration: 2000
						});
					});
			}, function(err, tey){
				$ionicLoading.hide();
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
			});
	};


	$scope.getMoreListas = function(){
		Evento.getLists($scope.page)
			.then(function(result){
				$scope.listas = result;
			}, function(err){
				
			})
			.finally(function(){
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.moreDataCanBeLoaded = false;
			});
	};

	$scope.refreshListas = function(){
		$scope.page = 0;
		Evento.getLists($scope.page)
			.then(function(result){
				$scope.listas = result;
			}, function(err){
				
			})
			.finally(function(){
				$scope.$broadcast('scroll.refreshComplete');
			});
	};

	// $scope.getListas();

	// $scope.refreshListas = function(){
	// 	Lista.get()
	// 		.then(function(result){
	// 			$scope.listas = result;
	// 		}, function(err){
				
	// 		})
	// 		.finally(function(){
	// 			console.log('here');
	// 			$scope.$broadcast('scroll.refreshComplete');
	// 		});
	// };


	

	// $scope.eventos = Lista.eventos;
	// var comboEmpty = {id: null, name: 'Escolha o evento:'};
	// $scope.eventoAtual = comboEmpty;
	// $scope.datapopup = {};

	// $scope.showPopup = function(){
	// 	var myPopup = $ionicPopup.show({
	// 		template: '<ion-list><label class="item item-radio" ng-repeat="evento in eventos"><input type="radio" name="group" ng-model="datapopup.eventoAtual" ng-value="{{evento}}"><div class="item-content">{{evento.name}}</div><i class="radio-icon ion-checkmark"></i></label></ion-list>',
	// 		title: 'Escolha o evento',
	// 		scope: $scope,
	// 		buttons: [
	// 			{
	// 				text: 'Escolher',
	// 				type: 'button-positive',
	// 				onTap: function(e) {
	// 					$scope.eventoAtual = $scope.datapopup.eventoAtual;
	// 					console.log($scope.eventoAtual);
	// 					return true;
	// 				}
	// 			}
	// 		]
	// 	});

	// 	myPopup.then(function(res) {
	// 		console.log('Tapped!', res);
	// 	});
	// };

	// $scope.save = function(){
	// 	$ionicLoading.show({
	// 		template: 'Enviando...'
	// 	});

	// 	$timeout(function(){
	// 		$scope.eventoAtual = comboEmpty;
	// 		$ionicLoading.hide();
	// 	}, 3000);
	// };

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
	Me
){
	$timeout(function(){
		Me.data = localStorageService.get('Me');
		if (Me.data) {
			$state.go('app.checkin');	
		} else {
			$state.go('login');
		}
	}, 1000);
})
.controller('CheckinController', function(
	$ionicLoading,
	$scope,
	$timeout,
	CheckinPerfil,
	Evento
) {

	$scope.page = 0;
	$scope.moreDataCanBeLoaded = true;
	$scope.perfis = [];
	$scope.hasEvent = false;
	$scope.currentEvent = null;

	$scope.showCheckinButton = true;

	$scope.loading = true;
	
	$scope.$on('$ionicView.afterEnter', function(){
		Evento.getCurrent()
			.then(function(result){
				if (result) {
					$scope.currentEvent = result;
					$scope.hasEvent = true;
					$scope.perfis = Evento.checkinPerfis;
					$scope.showCheckinButton = true;
				} else {
					$scope.showCheckinButton = false;
				}
			}, function(err){
				
			})
			.finally(function(){
				$scope.loading = false;
			});
		// var now = moment().format('YYYY-MM-DD HH:mm:ss');
		// var expireDate = Evento.currentEventExpireDate;
		// console.log('Aqui');
		// console.log(expireDate);
		// if (expireDate) {
		// 	if(expireDate <= now){
		// 		console.log('Espirou');
		// 	} else {
		// 		console.log('Não espirou');
		// 	}
		// } else {
		// 	console.log('Espirou');
		// }
	});

	$scope.doCheckin = function(){
		$ionicLoading.show({
			template: 'Efetuando checkin em '+Evento.currentEvent.name+'...'
		});
		Evento.doCheckin()
			.then(function(result){
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

	$scope.loadMore = function(){
		CheckinPerfil.getAll($scope.currentEvent.id, $scope.page)
			.then(function(result){
				if ($scope.perfis) {
					var concat = $scope.perfis.concat(result);
					$scope.perfis = concat;
				} else {
					$scope.perfis = result;	
				}
				
				if (!result) {
					$scope.moreDataCanBeLoaded = false;
				}
			}, function(err){
				
			})
			.finally(function(){
				$scope.page++;
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
	};

	// $timeout(function(){
	// 	Evento.getCurrent()
	// 		.then(function(result){
				
	// 		}, function(err){
				
	// 		})
	// 		.finally(function(){
	// 			$scope.loading = false;
	// 		});
	// }, 2000);

	// $timeout(function(){
	// 	$scope.perfis = CheckinPerfil.perfis;
	// 	$scope.$broadcast('scroll.infiniteScrollComplete');
	// 	$scope.moreDataCanBeLoaded = false;
	// }, 1000);

	// $scope.refreshPerfis = function(){
	// 	$timeout(function(){
	// 		$scope.$broadcast('scroll.refreshComplete');
	// 	}, 1000);
		
	// };
    
})

.controller('CheckinPerfilController', function(
	$scope,
	$stateParams,
	CheckinPerfil
) {

	var id = $stateParams.id;
    $scope.profile = CheckinPerfil.get(id);
})
.controller('InstitucionalController', function($scope, $ionicPosition) {
    
})
.controller('ContatoController', function(
	$scope,
	$ionicLoading,
	$timeout,
	Contato
) {

	$scope.mensagem = null;

	$scope.save = function(){
		$ionicLoading.show({
			template: 'Enviando contato...'
		});

		$timeout(function(){
			Contato.add({mensagem: $scope.mensagem})
			.then(function(result){
				
			}, function(err){
				
			})
			.finally(function(){
				$scope.mensagem = null;
				$ionicLoading.hide();
				$ionicLoading.show({
					template: 'Contato enviado, obrigado',
					noBackdrop: true,
					duration: 2000				
				});
			});	
		}, 2000);
	};
});