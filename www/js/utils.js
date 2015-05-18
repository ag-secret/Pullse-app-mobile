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
					// alert('Antes do Device Ready');
					document.addEventListener("deviceready", function () {
						// alert('Depois do Device Ready');
						var isOnline = $cordovaNetwork.isOnline();
						// alert($cordovaNetwork.getNetwork());
		 
			            if (isOnline) {
			            	defer.resolve();
			            } else {
			            	$cordovaToast.show('Sem conexão com a internet.', 'short', 'bottom');
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