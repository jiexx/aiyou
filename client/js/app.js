var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui.gestures",
			"mobile-angular-ui"
		]);

app.config(function ($routeProvider, $controllerProvider) {
	app.registerCtrl = $controllerProvider.register;

	$routeProvider.when('/', {
		templateUrl : "home.html",
    controller: 'homeReq',
		reloadOnSearch : false
	});
	$routeProvider.otherwise({
		redirectTo : '/'
	});
});

app.controller('homeReq', function ($scope, $location, $cookieStore) {
  $scope.title = 'home';

  $http({
        url: 'http://samedomain.com/GetPersons',
        method: "POST",
        data: '',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function (data, status, headers, config) {
        var token = data.token;
        $cookieStore.put('token', token);
      //$location.path('/');
    }).error(function (data, status, headers, config) {
        $scope.status = status;
    });
});

app.directive('script', ['$window', '$q', function ($window, $q) {
			return {
				restrict : 'E',
				scope : false,
				link : function (scope, elem, attr) {
					if (attr.type === 'text/javascript-lazy') {
						var code = elem.text();
						var f = new Function(code);
						f();
						Home.clean();
						Home.layout(31.268964, 121.443794);
						Home.star(0, [{x: 31.268964, y: 121.443794, clz : '3110', id: 158, name:'test1'}, {x: 31.266617, y: 121.416328, clz : '0110', id: 158, name:'test2'}] );
					}
				}
			};
		}
	]);
