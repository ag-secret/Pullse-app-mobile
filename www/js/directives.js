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
});