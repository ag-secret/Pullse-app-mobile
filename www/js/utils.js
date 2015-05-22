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
		check: function(showToast){
			var defer = $q.defer();
			var toastControl = showToast || true;

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
			            	if (toastControl) {
			            		$cordovaToast.show('Sem conexão com a internet.', 'short', 'bottom');	
			            	}
			            	
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