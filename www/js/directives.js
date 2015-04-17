angular.module('starter.directives', [])
.directive('myContentFullHeight', function($window){
	return {
		restrict: 'C',
		link: function (scope, element) {
			console.log(element);
			var windowH = $window.innerHeight;
			console.log(windowH);
			element.css('height', (windowH)  + 'px');
		}
	};
})
.directive('myLoader', function($window){
	return {
		templateUrl: function(elem, attr){
			return 'templates/elements/loader.html';
		}
	};
})

.factory('preload', ['$q', function($q) {
  return function(url) {
    var defer = $q.defer(),
    image = new Image();

    image.src = url;

    if (image.complete) {
  
      defer.resolve();
  
    } else {
  
      image.addEventListener('load', function() {
        defer.resolve();
      });
  
      image.addEventListener('error', function() {
        defer.reject();
      });
    }

    return defer.promise;
  };
}])

.directive('preloadBg', ['preload', '$timeout', function(preload, $timeout) {
    return {
    transclude: true,
      restrict: 'E',
      link: function(scope, element, attrs, tabsCtrl) {
      	console.log(attrs.url);
        element.css('display', 'none');
        
        preload(attrs.url).then(function(){
        	
	          element.css({
	            "background-image": "url('" + attrs.url + "')"
	          });
	          $timeout(function(){
				element.css('display', 'block');
	          }, 1000);
          
        });
      }
    };
  }]);
