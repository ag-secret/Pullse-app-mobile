angular.module('starter.utils', [])
.factory('Network', function(
	$q,
	$ionicPlatform,
	$cordovaNetwork,
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
	            	defer.reject();
	            }
        	});
 
        	return defer.promise;
		}
	};
});