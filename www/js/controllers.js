angular.module('starter.controllers', [])

.controller('AppController', function($scope, $ionicModal, $timeout, Me) {
	$scope.$on('$ionicView.beforeEnter', function(){
		$scope.me = Me.data;
	});
})

.controller('TesteController', function(){
	
})

.controller('LoginController', function(
	$scope,
	$ionicLoading,
	$timeout,
	$ionicSlideBoxDelegate,
	$ionicModal,
	$state,
	$ionicHistory,
	Evento,
	Me,
	WEBSERVICE_URL,
	Network,
	localStorageService
){

	$ionicHistory.clearHistory();
	$ionicHistory.clearCache();
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

/**
 * A view ligada a este controller tem o cache-view ligado
 * Sempre quando entrar na view ele irá recarregar as listas com a única diferença que
 * se de começo o $scope.listas estiver vazio ele mostra o loader, caso contrario ele
 * nao mostra nada e faz o recarregamento no fundo.
 *
 * IMPORTANTE!
 * O carregamento das listas não faz nenhum tipo de paginação ou "Lazy load", ou seja,
 * sempre que se vai no servidor ele retornar TODAS AS LISTAS ATIVAS DAQUELA BOATE NO MOMENTO
 * assume-se o cenário que cada boate terá no máximo 20 listas ativas (Exagerando para mais)
 * caso no futuro veja que as boates carregaram bem mais que isso será preciso mudar a forma de 
 * carregar
 */
.controller('ListaVipController', function(
	$ionicLoading,
	$ionicModal,
	$document,
	$ionicPopup,
	$scope,
	$timeout,
	WEBSERVICE_URL,
	Evento,
	Network
) {
	$scope.imgBaseUrl = WEBSERVICE_URL;
	/**
	 * Mostra/esconde a mensagem de "Nenhuma lista"
	 * 
	 * Por que não Escondemos/mostramos esta mensagem baseados $scope.listas vazio ou não?
	 * Por que as vezes antes de carregar o $scope.lista pode estar vazio mas
	 * não por que não tenha listas e sim por que elas ainda não foram carregadas.
	 * 
	 * Esta variavel garante que a mensagem irá aparecer somente quando realmente
	 * o servidor retornar que não há listas para serem carregadas.
	 * @type {Boolean}
	 */
	$scope.noLists = false;
	/**
	 * Como não tem como passar parametros para a modal, esta variavel diz qual é
	 * a lista atual (que foi clicada) e quando abre o modal ele saberá o que mostrar
	 * @type {Object}
	 */
	$scope.currentList = null;

	$scope.$on('$ionicView.beforeEnter', function(){
		/**
		 * Listas
		 * @type {Array}
		 */
		$scope.listas = Evento.listas;
		/**
		 * Só mostra o loading se a tela estiver vazio de listas,
		 * caso contrario ele não mostra e o carregamento será feito no fundo.
		 * @type {Boolean}
		 */
		$scope.loading = $scope.listas.length === 0 ? true : false;
		/**
		 * Carrega as listas antes de entrar na view
		 */
		$scope.getLists();
	});

	/**
	 * Cria a modal que irá exibir os detalhes da lista
	 */
	$ionicModal.fromTemplateUrl('templates/modal/lista.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	/**
	 * Abre a modal de detalhes da lista
	 * @param {Object} lista - Os dados referentes a linha clicada na lista de listas hehe
	 */
	$scope.openModal = function(lista) {
		$scope.currentList = lista;
		$scope.modal.show();
	};
	/**
	 * Fecha a modal
	 */
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	/**
	 * Carrega listas
	 */
	$scope.getLists = function(){
		Network.check()
			.then(function(){
				$timeout(function(){
					Evento.getLists($scope.page)
						.then(function(result){
							console.log(result);
							$scope.listas = Evento.listas;
							$scope.noLists = $scope.listas.length === 0 ? true : false;
						})
						.finally(function(){
							$scope.loading = false;
							$scope.$broadcast('scroll.refreshComplete');
						});
				/**
				 * Caso o leader esteja aparecendo colocamos 1500ms de timeout
				 * pois se a requisição for feita muito rápida o loader irá 
				 * aparecer e desaparecer muito rapido fazendo um estranho efeito de "piscar".
				 * Caso o loader nao esteja aparecendo e a requisição esteja sendo feita no fundo
				 * não é necessário esta espera.
				 */
				}, $scope.loading ? 1500 : 0);
			}, function(){
				$scope.loading = false;
				$scope.$broadcast('scroll.refreshComplete');
			});
	};

	/**
	 * Executa quando clica em "Enviar nome" para a lista selecionada
	 */
	$scope.send = function(){
		Network.check()
			.then(function(result){
				$ionicLoading.show({
					template: 'Enviando...'
				});
				$timeout(function(){
					Evento.addViplistSubscription({event_id: $scope.currentList.id})
						.then(function(result){
							$scope.closeModal();
						}).finally(function(){
							$ionicLoading.hide();
						});
				}, 1500);
			}, function(){
				$ionicLoading.hide();
			});
	};
})
.controller('EventosController', function(
	$cordovaToast,
	$ionicLoading,
	$ionicModal,
	$ionicSideMenuDelegate,
	$ionicSlideBoxDelegate,
	$scope,
	$timeout,
	Evento,
	Network,
	WEBSERVICE_URL
){
	/**
	 * Base URL para carregarmos as images.
	 * @type {string}
	 */
	$scope.imgBaseUrl = WEBSERVICE_URL;
	/**
	 * Controla o alert que não tem eventos. Não usamos o "eventos.length == 0" por que antes de
	 * carregar esta condição seria satisfeito porém não quer dizer que nao tenha evento e sim
	 * que ainda nao carregou, por isso precisamos desta variavel para controlar o alert corretamente.
	 * @type {Boolean}
	 */
	$scope.alertNoEvents = false;
	/**
	 * Como não tem como passar parametro para a modal esta variavel diz a modal qual o atual slide
	 * portanto qual evento mostrar
	 * @type integer
	 */
	$scope.currentEvent = null;
	$scope.$on('$ionicView.beforeEnter', function(){
		 /**
		 * Eventos
		 * @type {Array}
		 */
		$scope.events = Evento.eventos;

		$ionicSideMenuDelegate.canDragContent(false);
		$ionicSlideBoxDelegate.update();
		if ($scope.events.length === 0) {
			$scope.getEvents();
		}
	});
	$scope.$on('$ionicView.beforeLeave', function(){
		$ionicSideMenuDelegate.canDragContent(true);
	});
	/**
	 * Criação da modal
	 */
	$ionicModal.fromTemplateUrl('templates/modal/evento.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	/**
	 * Pega todos os eventos
	 * @param  {string} event - Como a carregada pela primeira vez usa este mesmo metodo e o atualizar pelo botão
	 * também então este parametro assume 'first' ou 'refresh' e serve para o metodo saber de aonde ele
	 * foi chamado
	 */
	$scope.getEvents = function(){
		$scope.events = [];
		$scope.loading = true;
		Network.check()
			.then(function(result){
				$ionicSlideBoxDelegate.update();
				$scope.loading = true;
				$timeout(function(){
					Evento.get()
						.then(function(result){
							if (result) {
								$scope.events = result;
								/**
								 * Faz um update do Slide Box para ele se reajustar para os novos
								 * itens dele
								 */
								$ionicSlideBoxDelegate.update();
								/**
								 * Aqui é uma pequena gambi, se o slide atual for o ultimo e quando atulizar ele
								 * nao existir mais todo o slidebox sumia, então indo para o primeiro resolve o problema
								 */
								// $ionicSlideBoxDelegate.slide(0);	
								/**
								 * Caso não venha nenhum valor do servidor mostramos o alert
								 * falando que não existe nenhum evento cadastrado
								 */
								$scope.alertNoEvents = false;
							} else {
								$scope.events = [];
								/**
								 * Explicado no 'if' acima.
								 */
								$scope.alertNoEvents = true;
							}
						}).finally(function(){
							$scope.loading = false;
						});
				}, 1500);
			}, function(){
				/**
				 * Neste caso como usamos um loading que obstrui a tela é necessario escode-lo
				 * caso a internet falhe
				 */
				$scope.loading = false;
				if ($scope.events.length === 0) {
					$scope.alertNoEvents = true;
				}
			});
	};
	/**
	 * Abre o modal
	 * @param  {Object} currentEvent - Quando o usuario clica no evento ele passa o evento
	 * atual como parametro para carregarmos na modal
	 */
	$scope.openModal = function(currentEvent) {
		$scope.currentEvent = currentEvent;
		$scope.modal.show();
	};
	/**
	 * Fecha a modal
	 */
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
})

.controller('DispatcherController', function(
	$ionicPlatform,
	$state,
	$timeout,
	DEFAULT_ROUTE,
	Evento,
	Me,
	localStorageService
){
	
	var me = localStorageService.get('Me');
	if (me) {
		Evento.listas = localStorageService.get('listas');
		Evento.eventos = localStorageService.get('eventos');
		Me.data = me;
		$state.go(DEFAULT_ROUTE);
	} else {
		$state.go('login');
	}
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

	$scope.$on('$ionicView.enter', function(){
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
.controller('CheckinThatIHeartedController', function(
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

	$scope.$on('$ionicView.loaded', function(){
		$scope.loading = true;
		$scope.perfis = Checkin.pleopleThatIHeart;
		$scope.loadPerfis();
	});
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
.controller('CheckinHeartsController', function(
	$cordovaToast,
	$interval,
	$scope,
	$stateParams,
	$timeout,
	Checkin,
	Network
){
	var intervalTime = 2000;
	/**
	 * Controla o alert que diz que não há pessoas
	 * @type {Boolean}
	 */
	$scope.noPeople = false;
	/**
	 * Flag que diz o que o controller deve carregar:
	 * 1 = Me curtiram
	 * 2 = Eu curti
	 * 3 = Combinações
	 * @type {Number}
	 */
	var flag = parseInt($stateParams.flag);
	/**
	 * Id do evento atual passado pela URL por parametro
	 * @type {Number}
	 */
	$scope.eventId = $stateParams.eventId;
	/**
	 * Intervalo
	 * @type {Promise}
	 */
	var interval = null;
	/**
	 * Ocorre toda vez que entra na view, seja ela com cache-view ligado ou nao
	 */
	$scope.$on('$ionicView.beforeEnter', function(){
		switch(flag){
			case 1:
				$scope.perfis = Checkin.peopleHeartedMe;
				break;
			case 2:
				$scope.perfis = Checkin.peopleThatIHearted;
				break;
			case 3:
				$scope.perfis = Checkin.matches;
				break;
		}

		if ($scope.perfis.length === 0) {
			$scope.loading = true;	
		}

		$scope.loadPerfis('first');
	});
	/**
	 * Pausa o timer na saida da view para nao sobrecarregar
	 */
	$scope.$on('$ionicView.beforeLeave', function(){
		$scope.loading = false;
		$scope.stopInterval();
	});
	/**
	 * Incia o Timer
	 * @return {[type]} [description]
	 */
	$scope.startInterval = function(){
		console.log('Iniciando INTERVALO!!!!!!!!');
		$scope.stopInterval();
		$timeout(function(){
			interval = $interval(function(){
				$scope.loadPerfis('timer');
			}, intervalTime);
		}, intervalTime);
		
	};

	$scope.stopInterval = function(){
		console.log('Parando intervalo!!!!!');
		$interval.cancel(interval);
		interval = null;
	};

	$scope.loadPerfis = function(event){
		$scope.stopInterval();
		Network.check()
			.then(function(result){
				Checkin.getHearts($scope.eventId, flag)
					.then(function(result){
						if (result) {
							switch(flag){
								case 1:
									$scope.perfis = Checkin.peopleHeartedMe;
									break;
								case 2:
									$scope.perfis = Checkin.peopleThatIHearted;
									break;
								case 3:
									$scope.perfis = Checkin.matches;
									break;
							}
							
							$timeout(function(){
								$scope.loadPerfis(event);	
							}, 1000);
						} else {
							if ($scope.perfis.length === 0) {
								$scope.noPeople = true;
							} else {
								$scope.noPeople = false;
							}
							$scope.loading = false;
							if (event == 'refresher') {
								$scope.$broadcast('scroll.refreshComplete');
							}

							$scope.startInterval();
						}
					}, function(err){
						$scope.loading = false;
						$scope.$broadcast('scroll.refreshComplete');
					});
			}, function(err){
				$scope.loading = false;
				$scope.$broadcast('scroll.refreshComplete');
			});
	};
})
// .controller('CheckinBuscaController', function(
// 	$cordovaToast,
// 	$interval,
// 	$ionicLoading,
// 	$ionicScrollDelegate,
// 	$scope,
// 	$stateParams,
// 	$timeout,
// 	Checkin,
// 	Network
// ) {
	
// 	$scope.eventId = $stateParams.eventId;
// 	$scope.perfis = Checkin.perfis;

// 	$scope.$on('$ionicView.beforeEnter', function(){
// 		$scope.perfis = Checkin.perfis;
// 		$scope.getNewPerfis('first');
// 	});

// 	$scope.getNewPerfis = function(event){
// 		Network.check()
// 			.then(function(result){
// 				$scope.loading = true;
// 					Checkin.getAll($stateParams.eventId)
// 						.then(function(result){
// 							if (result) {
// 								$scope.perfis = Checkin.perfis;

// 								$timeout(function(){
// 									$scope.getNewPerfis(event);
// 								}, 100);
// 							} else {
// 								$scope.loading = false;
// 							}
// 						}, function(err){
// 							$cordovaToast.show('Erro na comunicação com o servidor, favor tentar novamente.', 'long', 'bottom');
// 						});
// 			}, function(err){
// 				$scope.loading = false;
// 			});
// 	};

// })
.controller('CheckinMainController', function(
	$cordovaToast,
	$interval,
	$ionicLoading,
	$ionicModal,
	$ionicScrollDelegate,
	$q,
	$ionicHistory,
	$scope,
	$timeout,
	Checkin,
	Evento,
	Me,
	Network
) {
	$ionicModal.fromTemplateUrl('templates/modal/checkin-main-search.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	/**
	 * Fecha a modal
	 */
	$scope.closeModal = function() {
		$scope.modal.hide();
	};

	$scope.alertNoEvents = false;
	$scope.alertNoProfiles = false;
	$scope.hasNewProfiles = false;

	$scope.showCheckinButton = false;
	
	var timerRefreshData = null;
	var timerCheckCurrentEvent = null;
	
	$scope.currentEvent = null;
	
	$scope.perfis = Checkin.perfis;
	
	$scope.$on('$ionicView.beforeEnter', function(){
		$ionicHistory.clearHistory();
		var flag = false;
		
		if ($scope.perfis.length === 0) {
			$scope.alertNoProfiles = true;
			$scope.loading = true;
			flag = true;
		}
		$timeout(function(){
			$scope.getCurrentEvent(flag);
		}, 1000);
	});
	$scope.getCurrentEvent = function(flag){
		Network.check()
			.then(function(result){
				Evento.getCurrent()
					.then(function(result){
						if (!result) {
							/**
							 * Se não houver evento atual, limpar os perfis do cache
							 * e da tela e alertNoEvents recebe true que aparece a informação
							 * e o botão para carregar novos
							 */
							$scope.currentEvent = null;
							Checkin.perfis = [];
							$scope.perfis = [];
							$scope.alertNoEvents = true;
							$scope.showCheckinButton = false;
							$scope.loading = false;

							$scope.stopInterval();
							$scope.stopCheckEventTimer();
						} else {
							console.log(result);
							/**
							 * Aqui verifica se o evento mudou, se sim ele
							 * limpa os perfis e manda carregar novos agora baseado no
							 * novo evento
							 */
							if ($scope.currentEvent) {
								if ($scope.currentEvent.id != result.id) {
									$scope.perfis = [];
									Checkin.perfis = [];
								}
							}
							$scope.currentEvent = result;
							$scope.alertNoEvents = false;
							$scope.loading = false;
							
							if (result.hasCheckin > 0) {
								$scope.showCheckinButton = false;
							} else {
								$scope.showCheckinButton = true;
							}
							
							$scope.getNewPerfis(flag);
							$scope.startCheckEventTimer();
						}
					}, function(err){
						$scope.loading = false;
					});
			}, function(err){
				$scope.loading = false;
			});
	};
	/**
	 * Pausa o timer na saida da view para nao sobrecarregar
	 */
	$scope.$on('$ionicView.beforeLeave', function(){
		$scope.stopInterval();
		$scope.stopCheckEventTimer();
	});
	/**
	 * Inicia o timer que atualiza os dados da tela tanto do evento quanto dos
	 * perfis deste evento
	 */
	$scope.startInterval = function(){
		$scope.stopInterval();
		timerRefreshData = $interval(function(){
			$scope.getNewPerfis(false);
		}, 1000);
	};
	/**
	 * Para o intervalo
	 */
	$scope.stopInterval = function(){
		console.log('Parando interval');
		$interval.cancel(timerRefreshData);
		timerRefreshData = null;
	};

	$scope.startCheckEventTimer = function(){
		$scope.stopCheckEventTimer();
		timerCheckCurrentEvent = $interval(function(){
			$scope.getCurrentEvent(false);
		}, 3000);
	};
	$scope.stopCheckEventTimer = function(){
		console.log('Parando interval event');
		$interval.cancel(timerCheckCurrentEvent);
		timerCheckCurrentEvent = null;
	};

	
	$scope.getNewPerfis = function(flag){
		$scope.stopInterval();
		Network.check()
			.then(function(result){
				Checkin.getAll($scope.currentEvent.id)
					.then(function(result){
						if (result) {
							$scope.alertNoProfiles = false;
							/**
							 * Se ouver resultado ele verifica o evento, se for o first ou o byButton
							 * ele carrega os perfis novos na tela caso seja timer, ele mostra o 
							 * botao de 'novos perfis'. Independendo do evento caso haja perfis novos
							 * ele chama o refresh Events novamente para refazer todo o processo
							 */
							if (flag || $scope.perfis.length === 0) {
								$scope.perfis = Checkin.perfis;
							} else {
								$scope.hasNewProfiles = true;
							}
							/**
							 * Faz um delay para chamar novamente para nao sobrecarregar o banco de dados]
							 */
							$timeout(function(){
								$scope.getNewPerfis(flag);
							}, 2000);
						} else {
							$scope.loading = false;
							if ($scope.perfis.length === 0) {
								$scope.alertNoProfiles = true;
							}
							$scope.startInterval();
						}
					});
			}, function(err){
				$scope.loading = false;
			});
	};
	/**
	 * Evento para quando o usuario clica no botao "Novos perfis"
	 * ele joga o scroll para o topo, atualiza os perfis com os perfis do cache e por ultimo
	 * some com o botao
	 */
	$scope.refreshProfiles = function(){
		$timeout(function(){
			$ionicScrollDelegate.scrollBottom(true);		
		}, 500);
		
		$scope.perfis = [];
		$scope.perfis = Checkin.perfis;
		$scope.hasNewProfiles = false;
	};
	/**
	 * Atualiza os dados quando o usuario usa o Refresher, ele passa o evento 
	 * pullToRefresh para o metodo
	 */
	$scope.doPullToRefresh = function(){
		$scope.stopInterval();
		Network.check()
			.then(function(result){
				Checkin.getAll($scope.currentEvent.id)
					.then(function(result){
						if (result) {
							$scope.alertNoProfiles = false;
							$scope.perfis = Checkin.perfis;
							$timeout(function(){
								$scope.doPullToRefresh();
							}, 1000);
						} else {
							if ($scope.perfis.length === 0) {
								$scope.alertNoProfiles = true;
							}
							$scope.$broadcast('scroll.refreshComplete');
							$scope.startInterval();
						}
					}, function(err){
						$scope.$broadcast('scroll.refreshComplete');
					})
					.finally(function(){
						$scope.hasNewProfiles = false;
					});
			}, function(err){
				$scope.$broadcast('scroll.refreshComplete');
			});
	};

	/**
	 * Atualiza os dados quando o usuario clica no botao de atualizar, ele passa
	 * o evento byButton para o metodo
	 */
	$scope.getCurrentEventByButton = function(){
		$scope.loading = true;
		$scope.getCurrentEvent(true);
	};
	$scope.doCheckin = function(){
		Network.check()
			.then(function(result){
				$ionicLoading.show({
					template: 'Efetuando checkin em '+$scope.currentEvent.name+'...'
				});
				$timeout(function(){
					Evento.doCheckin($scope.currentEvent.id)
						.then(function(result){
							$scope.showCheckinButton = false;
							$cordovaToast.show('Checkin feito com sucesso =)', 'long', 'bottom');
						}).finally(function(){
							$ionicLoading.hide();
						});
				}, 1000);
			}, function(err){
				$ionicLoading.hide();
			});
	};
  
})

.controller('CheckinPerfilController', function(
	$cordovaToast,
	$ionicLoading,
	$ionicPopup,
	$scope,
	$stateParams,
	$timeout,
	Checkin,
	Evento,
	Me,
	Network
) {
	/**
	 * Id do Perfil
	 * @type {Number}
	 */
	var id = $stateParams.id;
	/**
	 * Id do event, pois para saber o relacionamento devemos
	 * ter como parametro o evento atual
	 * @type {Number}
	 */
	var event_id = $stateParams.eventId;
	/**
	 * Pega o perfil no cache baseado no ID
	 * @type {Number}
	 */
    $scope.profile = Checkin.get(id);

    $scope.messageSender = null;
    $scope.message = null;
    $scope.messageCreated = null;
	
	$scope.$on('$ionicView.beforeEnter', function(){
		/**
		 * Todos os relacionamentos possíveis começam 'zerados'
		 * @type {Boolean}
		 */
		$scope.loading = true;

		$timeout(function(){
			$scope.getStatus();
		}, 1000);
	});

	$scope.canLike = function(){
		if (Evento.currentEvent.hasCheckin > 0) {
			return true;
		}
		return false;
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
		Network.check()
			.then(function(result){
				Checkin.addHeart({event_id: event_id, profile_id: id, message: $scope.data.message})
					.then(function(result){
						$scope.getStatus();
					})
					.finally(function(){
						$ionicLoading.hide();
					});				
			}, function(err){
				$ionicLoading.hide();
			});
	};

	$scope.addHeartPreflight = function(){
		$ionicLoading.show({template: 'Salvando o seu coração...'});
		Network.check()
			.then(function(result){
				Checkin.addHeartPreflight(id, event_id)
					.then(function(result){
						if (parseInt(result) == 1) {
							$ionicLoading.hide();
							$scope.showPopup();
						} else {
							$scope.addHeart();
						}
						$ionicLoading.hide();
					});
			}, function(err){
				$ionicLoading.hide();
			});
	};

	$scope.getStatus = function(){
		$scope.heartMe = false;
		$scope.thatIHeart = false;
		$scope.hasBtnHeart = false;

		$scope.loading = true;
		Network.check()
			.then(function(result){
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

								$scope.messageSender = result[0].message_sender;
    							$scope.message = result[0].message;
    							$scope.messageCreated = result[0].message_created;
							}
						}
					})
					.finally(function(){
						$scope.loading = false;
					});
			}, function(err){
				$scope.loading = false;
			});
	};
})
.controller('SobreController', function($scope, $ionicPosition) {
    
})
.controller('InstitucionalController', function($scope, FACEBOOKFANPAGE, PHONE) {
	$scope.phone = PHONE;
	
	$scope.openFacebookFanPage = function(){
		window.open(FACEBOOKFANPAGE, '_system', 'location=yes');
	};
	$scope.openDial = function(){
		window.open('tel:' + PHONE, '_system', 'location=no');
	};
})
/**
 * Envio de contato para o servidor
 * A view que está ligada a este controller possui o cache-view do Ionic
 * ligado, portanto se ele digitar algo na textarea, mudar de view e depois voltar
 * o texto não será apagado.
 */
.controller('ContatoController', function(
	$scope,
	Contato
) {
	/**
	 * É executado quando usuario aperta o botão de enviar o contato 
	 */
	$scope.save = function(){
		Contato.save({mensagem: $scope.mensagem})
			.then(function(){
				/**
				 * Reseta o texto da caixa de texto.
				 */
				$scope.mensagem = null;
			});
	};
})

.directive('teste', function($window){
	return {
		link: function(scope, element, attrs){
			var h = element.parent();
			h = h[0].offsetHeight;
			element.css({height: (h - 30) + 'px'});
		}
	};
})

.controller('LogoutController', function(
	localStorageService,
	$state,
	$ionicLoading,
	Me,
	Evento,
	Checkin,
	$timeout
) {
	$ionicLoading.show({template: 'Saindo...'});
	$timeout(function(){
		/**
		 * Evento
		 */
		Evento.currentEvent = null;
		Evento.checkinPerfis = [];
		Evento.checkinInfoEventId = null;
		Evento.currentEvent = null;
		/**
		 * Checkin
		 */
		Checkin.perfis = [];
		Checkin.peopleHeartedMe = [];
		Checkin.peopleThatIHearted = [];
		Checkin.matches = [];
		/**
		 * Me
		 */
		Me.data = null;
		localStorageService.clearAll();
		$ionicLoading.hide();
		$state.go('login');
	}, 1000);
})

.controller('MapaController', function(
	$scope,
	uiGmapGoogleMapApi
){

	uiGmapGoogleMapApi.then(function(maps) {
		$scope.marker = {
			label: 'Pullse Club',
			options: {
			
			},
			location: {
				latitude: -22.510743,
				longitude: -44.081037				
			},
			place: {
				query: 'Pullse Club Volta Redonda'
			}
		};
		$scope.map = {
			center:
				{
					latitude: -22.510743,
					longitude: -44.081037
				},
			options: {
				zoomControl: false,
				streetViewControl: false,
				mapTypeControl: false
			},
			zoom: 17
		};
		$scope.infoWindow = {};
	});
	
});