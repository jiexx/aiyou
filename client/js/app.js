var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui.gestures",
			"mobile-angular-ui"
		]);

app.config(function ($routeProvider, $controllerProvider) {
	app.registerCtrl = $controllerProvider.register;

	$routeProvider.when('/', {
		templateUrl : "home.html",
		reloadOnSearch : false
	});
	$routeProvider.otherwise({
		redirectTo : '/'
	});
});

app.directive('script', ['$window', '$q', function ($window, $q) {
			function load_script(code) {
				var f = new Function(code);
				f();
			}
			function lazyLoadApi(code) {
				var deferred = $q.defer();
				$window.initialize = function () {
					deferred.resolve();
				};
				// thanks to Emil Stenstr?m: http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
				if ($window.attachEvent) {
					$window.attachEvent('onload', function() {load_script(code);});
				} else {
					$window.addEventListener('load', function() {load_script(code);}, false);
				}
				return deferred.promise;
			}
			return {
				restrict : 'E',
				scope : false,
				link : function (scope, elem, attr) {
					if (attr.type === 'text/javascript-lazy') {
						var code = elem.text();
						/*if ($window.google && $window.google.maps) {
							console.log('gmaps already loaded');
							lazyLoadApi(code);
						} else {
							lazyLoadApi(code).then(function () {
								console.log('promise resolved');
								if ($window.google && $window.google.maps) {
									console.log('gmaps loaded');
								} else {
									console.log('gmaps not loaded');
								}
							}, function () {
								console.log('promise rejected');
							});
						}*/
						var f = new Function(code);
						f();
					}
				}
			};
		}
	]);
