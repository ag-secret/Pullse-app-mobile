angular.module('starter.models', [])

.constant('COMMUNICATION_ERROR_MESSAGE', 'Erro na comunicação com o servidor, favor tentar novamente.')
.constant('COMMUNICATION_TIMEOUT', 15000)

.factory('Util', function(
	$cordovaToast,
	$state,
	COMMUNICATION_ERROR_MESSAGE,
	Me
){
	return {
		setAuthCredentials: function(params){
			params.id = Me.data.id;
			params.app_access_token = Me.data.app_access_token;
			return params;
		},
		handleRequestError: function(code){
			switch(code){
				case 0:
					$cordovaToast.show('O servidor demorou muito para responder, favor tentar novamente.', 'short', 'bottom');
					break;
				case 401:
					$cordovaToast.show('A sua sessão expirou, favor logar novamente.', 'short', 'bottom');
					$state.go('logout');
					break;
				default:
					$cordovaToast.show(COMMUNICATION_ERROR_MESSAGE, 'short', 'bottom');
					break;
			}
		},
		getGreaterField: function(field, data){
			var greater = 0;
			// console.log('Iniciando looping');
			for (i = 0; i < data.length; i++) {
				if (parseInt(data[i][field]) > greater) {
					greater = data[i][field];
				}
				// console.log('Greater' + greater + ' | CheckinId: ' + _this.perfis[i].checkinId);
			}
			return greater;
		},
	};
})
.factory('Me', function(
	$q,
	$http,
	localStorageService,
	WEBSERVICE_URL,
	PUSH_NOTIFICATION_SENDER_ID,
	$cordovaPush,
	$rootScope,
	$cordovaOauth,
	$cordovaToast,
	$ionicPlatform,
	FACEBOOK_APP_ID,
	CLUB_ID
){
	return {
		localData: {},
		data: null,
		doLoginTeste: function(id){
			var defer = $q.defer();

			$http.get(WEBSERVICE_URL + '/users/getUserTeste?id=' +id+ '&club_id=' + CLUB_ID)
				.success(function(result){
					defer.resolve(result);
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		getUser: function(regid, facebookToken){
			var _this = this;
			var defer = $q.defer();
			// alert('Fazendo o post para: ' + WEBSERVICE_URL + '/users/getAccessByFacebook');
			$http.post(WEBSERVICE_URL + '/users/getAccessByFacebook',
					{
						access_token: facebookToken,
						push_reg_id: regid,
						club_id: CLUB_ID,
						platform: ionic.Platform.platform()
					}
				)
				.success(function(result){
					defer.resolve(result);
				})
				.error(function(data){
					defer.reject(data);
				});

			return defer.promise;
		},
		doLogin: function(){
			var defer = $q.defer();
			var _this = this;
			// $http.get(WEBSERVICE_URL + '/users/doLogin?id=' + id)
			// 	.success(function(data){
			// 		defer.resolve(data);
			// 		_this.data = data;
			// 		localStorageService.set('Me', data);
			// 	})
			// 	.error(function(){
			// 		defer.reject();
			// 	});

			//alert('Chamando o push reg id');
			_this.getPushRegid()
				.then(function(regid){
					//alert('Reg id ' + regid);
					//alert('Chamando o Facebook getAccess');
					_this.getFacebookAccessToken()
						.then(function(facebookToken){
							// alert('Regid: ' + regid);
							// alert('facebookToken: ' + facebookToken);
							//alert('Pegando user');
							_this.getUser(regid, facebookToken)
								.then(function(result){
									// alert('Deu boa');
									//alert(JSON.stringify(result));
									defer.resolve(result);
								}, function(err){
									// alert('Deu ruim');
									//alert(JSON.stringify(err));
									$cordovaToast.show('Ocorreu um erro ao obter o usuário nos nossos servidores', 'short', 'bottom');
									defer.reject();
								});

						}, function(err){
							// alert('Rejeitou get facebook token');
							$cordovaToast.show(err, 'short', 'bottom');
							defer.reject();
						});
				}, function(err){
					$cordovaToast.show('Ocorreu um erro ao obter o regid do dispositivo', 'short', 'bottom');
					defer.reject();
				})
				.finally(function(){
					
				});

			return defer.promise;
		},
		getFacebookAccessToken: function()
		{
			var _this = this;
			var scope = 'email,user_birthday,user_photos';

			var defer = $q.defer();
			//alert('Estrou na função mas nao vai entrar no platform ready eu acho');
			$ionicPlatform.ready(function() {
				//alert('Etrou no platform ready');
				//alert('Vai usar o Oauth');
	            $cordovaOauth.facebook(FACEBOOK_APP_ID, [scope]).then(function(result) {
	                defer.resolve(result.access_token);
	                
	            /**
	             * Erro ao pegar o accesstoken do Facebook
	             * @param  {string} err 	Descrição do erro
	             * @return {string}			Descrição do erro
	             */
	            }, function(err) {
	            	//alert(err);
	                defer.reject(err);
	            });
			});

			return defer.promise;
		},
		getPushRegid: function(){
			var defer = $q.defer();

			if (ionic.Platform.isAndroid()) {
			    var androidConfig = {senderID: PUSH_NOTIFICATION_SENDER_ID};
				// alert('Antes de registrar');
				$ionicPlatform.ready(function() {
		            $cordovaPush.register(androidConfig).then(function(result) {
		                // Success
		                // alert('Registrou agora acho que nao vai entrar no registered');
		            }, function(err) {
		                // Error
		                defer.reject('Erro ao registrar Push Notification');
		            });
		        });

	            $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
	                switch(notification.event) {
	                    case 'registered':
	                   		// alert('entrou hahah' + notification.regid);
	                        if (notification.regid.length > 0 ) {
	                            defer.resolve(notification.regid);
	                        } else {
	                        	defer.reject('Erro ao obter regid');
	                        }
	                    break;
	                }
	            });
			} else if(ionic.Platform.isIOS()){
	            config = {
	                "badge": true,
	                "sound": true,
	                "alert": true,
	            };

                $cordovaPush.register(config).then(function(result) {
                    // alert("result: " + result);
                    defer.resolve(result);
                }, function(err) {
                	defer.reject('Erro ao obter o token push IOS');
                    // alert("Registration error: " + err);
                });
			} else {
				defer.reject('Plataforma nao identificada');
			}

            return defer.promise;
        }
	};
})

.factory('Checkin', function(
	$http,
	$q, 
	COMMUNICATION_TIMEOUT,
	Me,
	Util,
	WEBSERVICE_URL,
	localStorageService
){
	return {
		perfis: [],
		peopleHeartedMe: [],
		peopleThatIHearted: [],
		matches: [],
		resetPerfis: function(){
			localStorageService.set('checkinPerfis', []);
			this.perfis = [];
		},
		getGreaterId: function(){
			var _this = this;
			var greater = 0;
			// console.log('Iniciando looping');
			for (i = 0; i < _this.perfis.length; i++) {
				if (parseInt(_this.perfis[i].checkinId) > greater) {
					greater = _this.perfis[i].checkinId;
				}
				// console.log('Greater' + greater + ' | CheckinId: ' + _this.perfis[i].checkinId);
			}
			return greater;
		},
		get: function(id){
			var _this = this;

			for (i = 0; i < _this.perfis.length; i++) {
				if (_this.perfis[i].id == id) {
					return _this.perfis[i];
				}
			}
			return null;
		},
		/**
		 * Pega todos os perfis que fizeram checkin no evento atual
		 */
		getAllProfiles: function(event_id){
			var defer = $q.defer();
			var _this = this;

			var params = Util.setAuthCredentials({
				event_id: event_id,
				last_id: Util.getGreaterField('checkinId', _this.perfis || [])
			});

			$http({
				method: 'get',
				url: WEBSERVICE_URL + '/checkins/getPerfis',
				params: params,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				/**
				 * Se eu já tenho perfis no cache eu concateno os novos, caso contrario o 
				 * valor atual dos perfis serão o que foi recebido por esta requisição
				 */
				if (_this.perfis) {
					if (data) {
						var concat = _this.perfis.concat(data);
						_this.perfis = concat;
					}
				} else {
					_this.perfis = data;
				}
				localStorageService.set('checkinPerfis', _this.perfis);
				defer.resolve(data);
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});
			return defer.promise;
		},
		getHearts: function(event_id, flag){
			var defer = $q.defer();
			var _this = this;
			var arrayHearts = [];
			var url = WEBSERVICE_URL + '/checkins/getHearts';

			switch(flag){
				case 1:
					arrayHearts = _this.peopleHeartedMe;
					break;
				case 2:
					arrayHearts = _this.peopleThatIHearted;
					break;
				case 3:
					arrayHearts = _this.matches;
					url = WEBSERVICE_URL + '/checkins/getCombinations';
					break;
			}

			var params = Util.setAuthCredentials({
				/**
				 * 'Quem me curtiu' e 'Quem eu curti' usam o mesmo método e esta flag
				 * serve exatamente para o metodo saber qual dos dois ele deve retornar
				 * @type {Number(0 ou 1)}
				 */
				flag: flag,
				event_id: event_id,
				last_id: Util.getGreaterField('heart_id', arrayHearts)
			});

			$http({
				method: 'get',
				url: url,
				params: params,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				switch(flag){
					case 1:
						if (_this.peopleHeartedMe) {
							if (data) {
								var concatHeartedMe = _this.peopleHeartedMe.concat(data);
								_this.peopleHeartedMe = concatHeartedMe;
							}
						} else {
							_this.peopleHeartedMe = data;
						}
						break;
					case 2:
						if (_this.peopleThatIHearted) {
							if (data) {
								var concatThatIHearted = _this.peopleThatIHearted.concat(data);
								_this.peopleThatIHearted = concatThatIHearted;
							}
						} else {
							_this.peopleThatIHearted = data;
						}
						break;
					case 3:
						if (_this.matches) {
							if (data) {
								var concatMatches = _this.matches.concat(data);
								_this.matches = concatMatches;
							}
						} else {
							_this.matches = data;
						}
						break;
				}

				defer.resolve(data);
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});
			return defer.promise;
		},
		getMatches: function(event_id){
			var defer = $q.defer();
			var _this = this;

			var params = Util.setAuthCredentials({
				event_id: event_id,
				last_id: Util.getGreaterField('heart_id', _this.matches)
			});

			$http({
				method: 'get',
				url: WEBSERVICE_URL + '/checkins/getCombinations',
				params: params,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				if (_this.matches) {
					if (data) {
						var concat = _this.matches.concat(data);
						_this.matches = concat;
					}
				} else {
					_this.matches = data;
				}
				defer.resolve(data);
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});
			return defer.promise;
		},
		getProfileStatus: function(profile_id, event_id){
			var defer = $q.defer();
			var _this = this;
			
			var params = Util.setAuthCredentials({
				profile_id: profile_id,
				event_id: event_id				
			});

			$http({
				method: 'GET',
				url: WEBSERVICE_URL + '/checkins/getProfileStatus',
				params: params,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				defer.resolve(data);
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});
			return defer.promise;
		},
		addHeartPreflight: function(profile_id, event_id){
			var defer = $q.defer();
			var _this = this;

			var params = Util.setAuthCredentials({
				event_id: event_id,
				profile_id: profile_id
			});

			$http({
					method: 'get',
					url: WEBSERVICE_URL + '/checkins/addHeartPreflight',
					params: params,
					timeout: COMMUNICATION_TIMEOUT
				})
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(data, code){
					Util.handleRequestError(code);
					defer.reject();
				});
			return defer.promise;
		},
		addHeart: function(data){
			var _this = this;
			var defer = $q.defer();

			$http({
				method: 'post',
				url: WEBSERVICE_URL + '/checkins/addHeart',
				params: Util.setAuthCredentials({}),
				data: data,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(){
				defer.resolve();
			})
			.error(function(data, code){
				// alert(code);
				// alert(JSON.stringify(data));
				Util.handleRequestError(code);
				defer.reject();
			});

			return defer.promise;
		}
	};
})
.factory('Lista', function(
	$http,
	$q,
	Me,
	WEBSERVICE_URL
){
	return {};
})

.factory('Contato', function(
	$cordovaToast,
	$ionicLoading,
	$timeout,
	$http,
	$q,
	$state,
	Network,
	COMMUNICATION_ERROR_MESSAGE,
	COMMUNICATION_TIMEOUT,
	Me,
	WEBSERVICE_URL,
	Util
){
	return {
		/**
		 * Envia o contato para o servidor
		 * @param {message: string} data Contém a mensagem a ser enviada
		 *                       
		 */
		save: function(data){
			var params = Util.setAuthCredentials({});
			var defer = $q.defer();

			$ionicLoading.show({
				template: 'Enviando contato, aguarde...'
			});
			Network.check()
				.then(function(result){
					var duration = 3000;
					$timeout(function(){
						$http({
							method: 'post',
							url: WEBSERVICE_URL + '/messages',
							params: params,
							data: data,
							timeout: COMMUNICATION_TIMEOUT
						})
						.success(function(){
							$cordovaToast.show('Contato enviado, obrigado.', 'short', 'bottom');
							defer.resolve();
						})
						.error(function(data, code){
							Util.handleRequestError(code);
							defer.reject();
						})
						.finally(function(){
							$ionicLoading.hide();
						});
					}, duration);
				}, function(){
					$ionicLoading.hide();
				});
			return defer.promise;
		}
	};
})
.factory('Evento', function(
	$cordovaDialogs,
	$cordovaGeolocation,
	$cordovaToast,
	$http,
	$ionicPlatform,
	$ionicPopup,
	$q,
	COMMUNICATION_TIMEOUT,
	COMMUNICATION_ERROR_MESSAGE,
	Me,
	WEBSERVICE_URL,
	localStorageService,
	Util
){
	return {
		eventos: [],
		listas: [],
		currentEvent: null,
		checkinPerfis: [],
		checkinInfoEventId: null,
		resetCurrentEvent: function(){
			this.currentEvent = null;
			localStorageService.set('currentEvent', null);
		},
		get: function(){
			var defer = $q.defer();
			var _this = this;

			$http({
				method: 'get',
				url: WEBSERVICE_URL + '/events',
				params: Util.setAuthCredentials({}),
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				var eventos = [];
				//Acertando alguns campos para na hora do template ele apenas chamar
				//os dados.
				if (data) {
					angular.forEach(data, function(value, key) {
						var baseImageURL = 'http://bbgl.kinghost.net/img/eventos/' + value.id + '/' + value.imagem_capa;
						value.finalImage = value.imagem_capa ? baseImageURL : value.facebook_img;
						eventos.push(value);
					});
				} else {
					eventos = [];
				}
				Me.localData.eventos = eventos;
				localStorageService.set('localData', Me.localData);
				defer.resolve();
			})
			.error(function(data, code){
				// alert(WEBSERVICE_URL + '/events');
				// alert(data);
				// alert(code);
				Util.handleRequestError(code);
				defer.reject();
			});

			return defer.promise;
		},
		getLists: function(){
			var defer = $q.defer();
			var _this = this;

			$http({
				method: 'get',
				url: WEBSERVICE_URL + '/events/getLists',
				params: Util.setAuthCredentials({}),
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				// _this.listas = data ? data : [];
				// localStorageService.set('listas', _this.listas);
				var listas = [];
				if (data) {
					angular.forEach(data, function(value, key) {
						var baseImageURL = 'http://bbgl.kinghost.net/img/eventos/' + value.id + '/' + value.imagem_capa;
						value.finalImage = value.imagem_capa ? baseImageURL : value.facebook_img;
						listas.push(value);
					});
				}
				Me.localData.listas = listas;
				localStorageService.set('localData', Me.localData);
				defer.resolve();
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});

			return defer.promise;
		},
		/**
		 * Faz a inscrição do usuario na lista
		 * @param {Array Object} data - {event_id: number}
		 */
		addViplistSubscription: function(data){
			var defer = $q.defer();

			$http({
				method: 'post',
				url: WEBSERVICE_URL + '/events/addVipListSubscription',
				params: Util.setAuthCredentials({}),
				data: data,
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				$cordovaToast.show('Inscrição feita com sucesso!', 'short', 'bottom');
				defer.resolve(data);
			})
			.error(function(data, status){
				/**
				 * Se der o erro 403 significa que a inscrição foi rejeitada,
				 * por algum motivo (vagas esgotadas, incompatibilidade de genero etc)
				 * é importante lembrar que se der outro erro, normalmente o 400
				 * é por que deu algum erro no servidor e entao mostramos a Toast padrão
				 * para esse tipo de situação
				 */
				if (status == 403) {
					$ionicPlatform.ready(function(){
						$cordovaDialogs.alert(data.message, 'Aviso!', 'OK');
					});
				} else {
					Util.handleRequestError(code);	
				}
				defer.reject(data);
			});
			return defer.promise;	
		},
		/**
		 * Pega o evento que está ocorrendo neste exato momento,
		 * é usado no checkin
		 */
		getCurrent: function(){
			var defer = $q.defer();
			var _this = this;

			$http({
				method: 'get',
				url: WEBSERVICE_URL + '/events/getCurrent',
				params: Util.setAuthCredentials({}),
				timeout: COMMUNICATION_TIMEOUT
			})
			.success(function(data){
				_this.currentEvent = data;
				localStorageService.set('currentEvent', data);
				defer.resolve(data);
			})
			.error(function(data, code){
				Util.handleRequestError(code);
				defer.reject();
			});

			return defer.promise;
		},
		doCheckin: function(eventId){
			var defer = $q.defer();
			var _this = this;

			$ionicPlatform.ready(function(){
				var posOptions = {timeout: 10000, enableHighAccuracy: false};
				$cordovaGeolocation
					.getCurrentPosition(posOptions)
					.then(function (position) {
						var lat  = position.coords.latitude;
						var lng = position.coords.longitude;

						$http({
							method: 'post',
							url: WEBSERVICE_URL + '/checkins',
							params: Util.setAuthCredentials({}),
							data: {
								event_id: eventId,
								lat: lat,
								lng: lng
							},
							timeout: COMMUNICATION_TIMEOUT
						})
						.success(function(){
							_this.currentEvent.hasCheckin = 1;
							defer.resolve();
						})
						.error(function(data, code){
							if (code == 405) {
								$cordovaToast.show(data.message, 'short', 'bottom');
							} else {
								Util.handleRequestError(code);	
							}
							
							defer.reject();
						});
					}, function(err) {
						$ionicPlatform.ready(function(){
							$cordovaDialogs.alert('Erro ao detectar a sua localização, certifique-se que a localização em alta precisão do seu dispositivo está habilitada.', 'Aviso!', 'OK');
						});
						defer.reject();
					});
			});
			return defer.promise;
		}
	};
});