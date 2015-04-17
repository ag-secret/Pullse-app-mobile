angular.module('starter.utils', [])
.factory('Network', function(
	$cordovaNetwork,
	$cordovaToast,
	$ionicPlatform,
	$q,
	$timeout,
	PRODUCTION
){
 
	return {
		check: function(){
			var defer = $q.defer();
			if (PRODUCTION) {
				$timeout(function(){
					document.addEventListener("deviceready", function () {
						var isOnline = $cordovaNetwork.isOnline();
		 
			            if (isOnline) {
			            	defer.resolve();
			            } else {
			            	$cordovaToast.show('Sem conexão com a internet', 'short', 'bottom');
			            	defer.reject();
			            }
					}, false);
				});
			} else {
				defer.resolve();
			}

        	return defer.promise;
		}
	};
});