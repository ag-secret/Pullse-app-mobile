angular.module('starter.models', [])
.factory('Util', function(
){
	return {
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
	$ionicPlatform,
	FACEBOOK_APP_ID,
	CLUB_ID
){
	return {
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
			alert('Fazendo o post para: ' + WEBSERVICE_URL + '/users/getAccessByFacebook');
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
				.error(function(){
					defer.reject();
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

			alert('Chamando o push reg id');
			_this.getPushRegid()
				.then(function(regid){
					_this.getFacebookAccessToken()
						.then(function(facebookToken){
							alert('Regid: ' + regid);
							alert('facebookToken: ' + facebookToken);
							
							_this.getUser(regid, facebookToken)
								.then(function(result){
									alert(JSON.stringify(result));
									defer.resolve(result);
								}, function(err){
									defer.reject();
								})
								.finally(function(){
									
								});

						}, function(err){
							alert('Rejeitou get facebook token');
							defer.reject();
						})
						.finally(function(){
							
						});
				}, function(err){
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
			alert('Estrou na função mas nao vai entrar no platform ready eu acho');
			$ionicPlatform.ready(function() {
				alert('Etrou no platform ready');
	            $cordovaOauth.facebook(FACEBOOK_APP_ID, [scope]).then(function(result) {
	            	alert('Voltou do facebook api');
	                defer.resolve(result.access_token);
	                
	            /**
	             * Erro ao pegar o accesstoken do Facebook
	             * @param  {string} err 	Descrição do erro
	             * @return {string}			Descrição do erro
	             */
	            }, function(err) {
	                defer.reject(err);
	            });
			});

			return defer.promise;
		},
		getPushRegid: function(){
			var defer = $q.defer();

		    var androidConfig = {senderID: PUSH_NOTIFICATION_SENDER_ID};
			alert('Antes de registrar');
			$ionicPlatform.ready(function() {
	            $cordovaPush.register(androidConfig).then(function(result) {
	                // Success
	                alert('Registrou agora acho que nao vai entrar no registered');
	            }, function(err) {
	                // Error
	                defer.reject('Erro ao registrar Push Notification');
	            });
	        });

            $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
                switch(notification.event) {
                    case 'registered':
                   		alert('entrou hahah' + notification.regid);
                        if (notification.regid.length > 0 ) {
                            defer.resolve(notification.regid);
                        } else {
                        	defer.reject('Erro ao obter regid');
                        }
                    break;
                }
            });

            return defer.promise;
        }
	};
})

.factory('Checkin', function(
	$http,
	$q, 
	Me,
	Util,
	WEBSERVICE_URL,
	localStorageService
){
	return {
		currentEvent: null,
		perfis: [],
		peopleHeartedMe: [],
		peopleThatIHearted: [],
		matches: [],
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
		getAll: function(event_id){
			var defer = $q.defer();
			var _this = this;

			$http({
					method: 'GET',
					url: WEBSERVICE_URL + '/checkins/getPerfis',
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
						event_id: event_id,
						last_id: Util.getGreaterField('checkinId', _this.perfis),

					}
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
					defer.resolve(data);
				})
				.error(function(){
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
			$http({
					method: 'GET',
					url: url,
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
						/**
						 * 'Quem me curtiu' e 'Quem eu curti' usam o mesmo método e esta flag
						 * serve exatamente para o metodo saber qual dos dois ele deve retornar
						 * @type {Number(0 ou 1)}
						 */
						flag: flag,
						event_id: event_id,
						last_id: Util.getGreaterField('heart_id', arrayHearts)
					}
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
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		},
		getMatches: function(event_id){
			var defer = $q.defer();
			var _this = this;

			$http.get(WEBSERVICE_URL + '/checkins/getCombinations?id=' + Me.data.id + '&event_id=' + event_id + '&last_id=' + Util.getGreaterField('heart_id', _this.matches))
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
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		},
		getProfileStatus: function(profile_id, event_id){
			var defer = $q.defer();
			var _this = this;

			$http({
					method: 'GET',
					url: WEBSERVICE_URL + '/checkins/getProfileStatus',
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
						profile_id: profile_id,
						event_id: event_id
					}

				})
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		},
		addHeartPreflight: function(profile_id, event_id){
			var defer = $q.defer();
			var _this = this;

			$http({
					method: 'GET',
					url: WEBSERVICE_URL + '/checkins/addHeartPreflight',
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
						event_id: event_id,
						profile_id: profile_id
					}
				})
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		},
		addHeart: function(data){
			var _this = this;
			var defer = $q.defer();

			$http.post(
					WEBSERVICE_URL + '/checkins/addHeart?id=' + Me.data.id + '&app_access_token='+Me.data.app_access_token,
					data
				)
				.success(function(){
					defer.resolve();
				})
				.error(function(){
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
	return {
		get: function(){
			var defer = $q.defer();

			$http.get(WEBSERVICE_URL + '/guestLists?id=' + Me.data.id)
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		}
	};
})

.factory('Contato', function(
	$http,
	$q,
	Me,
	WEBSERVICE_URL
){
	return {
		/**
		 * Envia o contato para o servidor
		 * @param {message: string} data Contém a mensagem a ser enviada
		 *                       
		 */
		add: function(data){
			var defer = $q.defer();

			$http.post(
				WEBSERVICE_URL + '/messages?id=' + Me.data.id + '&app_access_token=' + Me.data.app_access_token,
				data
			)
			.success(function(){
				defer.resolve();
			})
			.error(function(){
				defer.reject();
			});
			return defer.promise;
		}
	};
})
.factory('Evento', function(
	$cordovaToast,
	$http,
	$q,
	Me,
	WEBSERVICE_URL,
	localStorageService
){
	return {
		currentEvent: null,
		checkinPerfis: [],
		checkinInfoEventId: null,
		get: function(){
			var defer = $q.defer();
			var _this = this;

			$http.get(WEBSERVICE_URL + '/events?id=' + Me.data.id + '&app_access_token=' + Me.data.app_access_token)
				.success(function(data){
					_this.events = data;
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		getLists: function(page){
			var defer = $q.defer();
			$http({
					url: WEBSERVICE_URL + '/events/getLists',
					method: 'GET',
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
						
					}
				})
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
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

			$http.post(WEBSERVICE_URL + '/events/addVipListSubscription?id=' + Me.data.id + '&app_access_token=' + Me.data.app_access_token, data)
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(data){
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
					method: 'GET',
					url: WEBSERVICE_URL + '/events/getCurrent',
					params: {
						id: Me.data.id,
						app_access_token: Me.data.app_access_token,
					}
				})
				.success(function(data){
					_this.currentEvent = data;
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		doCheckin: function(eventId){
			var defer = $q.defer();
			var _this = this;

			$http.post(
				WEBSERVICE_URL + '/checkins?id=' + Me.data.id + '&app_access_token=' + Me.data.app_access_token,
				{
					event_id: eventId
				})
				.success(function(){
					_this.currentEvent.hasCheckin = 1;
					defer.resolve();
				})
				.error(function(){
					$cordovaToast.show('Erro na comunicação com o servidor, favor tentar novamente.', 'long', 'bottom');
					defer.reject();
				});

			return defer.promise;
		}
	};
});