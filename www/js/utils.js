angular.module('starter.utils', [])
.factory('Network', function(
	$cordovaNetwork,
	$cordovaToast,
	$ionicPlatform,
	$q,
	PRODUCTION
){
 
	return {
		check: function(){
 
			var defer = $q.defer();
			
			$ionicPlatform.ready(function() {
	            var isOnline = PRODUCTION ? $cordovaNetwork.isOnline() : true ;
 
	            if (isOnline) {
	            	defer.resolve();
	            } else {
	            	$cordovaToast.show('Sem conexão com a internet', 'long', 'bottom');
	            	defer.reject();
	            }
        	});
 
        	return defer.promise;
		}
	};
});