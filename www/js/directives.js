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
});