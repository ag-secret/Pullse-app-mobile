angular.module('starter.models', [])



.factory('Me', function(
	$q,
	$http,
	localStorageService,
	WEBSERVICE_URL
){
	return {
		data: null,
		doLogin: function(id){
			var defer = $q.defer();
			var _this = this;
			$http.get(WEBSERVICE_URL + '/users/doLogin?id=' + id)
				.success(function(data){
					defer.resolve(data);
					_this.data = data;
					localStorageService.set('Me', data);
				})
				.error(function(){
					defer.reject();
				});
			return defer.promise;
		}
	};
})

.factory('CheckinPerfil', function(
	$q, 
	Me,
	$http,
	WEBSERVICE_URL
){
	return {
		perfis: [
			{id: 1, name: 'Natalie Dormer', 'image': 'natalie.jpg'},
			{id: 2, name: 'Katy Perry', 'image': 'katy.jpg'},
			{id: 3, name: 'Snoop Dogg', 'image': 'snoop.jpg'},
			{id: 4, name: 'Beyoncé', 'image': 'beyonce.jpg'},
		],
		get: function(id){
			var _this = this;
			for (i = 0; i < _this.perfis.length; i++) {
				if (_this.perfis[i].id == id) {
					return _this.perfis[i];
				}
			}
			return null;
		},
		getAll: function(event_id, page){
			var defer = $q.defer();

			$http.get(WEBSERVICE_URL + '/checkins/getPerfis?id=' + Me.data.id + '&event_id=' + event_id + '&page=' + page)
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
	$q,
	$http,
	Me,
	WEBSERVICE_URL
){
	return {
		add: function(data){
			console.log(Me);
			var defer = $q.defer();

			$http.post(WEBSERVICE_URL + '/messages?id=' + Me.data.id, data)
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
	$q,
	$http,
	Me,
	WEBSERVICE_URL,
	localStorageService
){
	return {
		currentEvent: null,
		checkinPerfis: [],
		get: function(){
			var defer = $q.defer();
			var _this = this;

			$http.get(WEBSERVICE_URL + '/events?id=' + Me.data.id)
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		getLists: function(page){
			var defer = $q.defer();

			$http.get(WEBSERVICE_URL + '/events/getLists?id=' + Me.data.id + '&page=' + page)
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		addViplistSubscription: function(data){
			var defer = $q.defer();

			$http.post(WEBSERVICE_URL + '/events/addVipListSubscription?id=' + Me.data.id, data)
				.success(function(data){
					defer.resolve(data);
				})
				.error(function(data){
					defer.reject(data);
				});
			return defer.promise;	
		},
		getCurrent: function(){
			var defer = $q.defer();
			var _this = this;

			$http.get(WEBSERVICE_URL + '/events/getCurrent?id=' + Me.data.id)
				.success(function(data){
					defer.resolve(data);
					if (data) {
						_this.currentEvent = data;
						// localStorageService.set('currentEventExpireDate', data.data_fim);
					}
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		},
		doCheckin: function(){
			var defer = $q.defer();
			var _this = this;
			$http.post(WEBSERVICE_URL + '/checkins?id=' + Me.data.id + '&event_id=' + _this.currentEvent.id)
				.success(function(){
					defer.resolve();
				})
				.error(function(){
					defer.reject();
				});

			return defer.promise;
		}
	};
});