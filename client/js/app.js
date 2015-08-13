
var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui.gestures",
			"mobile-angular-ui"
		]);

app.config(function ($routeProvider, $controllerProvider, $locationProvider,) {
	app.registerCtrl = $controllerProvider.register;
  //$locationProvider.html5Mode(true);
	$routeProvider.when('/home', {
		templateUrl : "home.html",
		controller : 'homeCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/homelist', {
		templateUrl : "home-list.html",
    controller : 'homeListCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/user', {
		templateUrl : "user.html",
    controller : 'userCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/', {
		templateUrl : "shop.html",
		reloadOnSearch : false
	});
	$routeProvider.when('/register', {
		templateUrl : "register.html",
		controller : 'registerCtrl',
		reloadOnSearch : false
	});
	$routeProvider.otherwise({
		redirectTo : '/'
	});
});

app.factory('DATA', function() {
  return {
    userid : 15800000000,
    lng : 121.443794,
    lat : 31.268964,
    stars : []
  }
});

app.controller('registerCtrl', function ($scope, $location, $cookieStore) {
	$scope.uploadFile = function(files) {
		var fd = new FormData();
		//Take the first selected file
		fd.append("file", files[0]);

		$http.post(uploadUrl, fd, {
			withCredentials: true,
			headers: {'Content-Type': undefined },
			transformRequest: angular.identity
		}).success( function (resp, status, headers, config) {
		}).error( function (resp, status, headers, config) {
		});
	};
});

app.controller('userCtrl', function ($scope, $location, $cookieStore, DATA) {
	$http({
		method : 'GET',
    //$location.path('/myURL/').search({param: 'value'});
		url : 'http://127.0.0.1:9090/home.do?id=' + $location.search().id + '&lng=' + DATA.lng + '&lat=' + DATA.lat
	}).success(function (resp, status, headers, config) {
	//var token = data.token;
	//$cookieStore.put('token', token);
	//$location.path('/');
	}).error(function (data, status, headers, config) {
		$scope.status = status;
	});
});

app.controller('homeListCtrl', function ($scope, $location, $cookieStore, DATA) {
	$scope.bottomReached = function() {
    /* global alert: false; */
    //alert('Congrats you scrolled to the end of the list!');
  };
  $scope.stars = DATA.stars;
});

app.controller('homeCtrl', function ($scope, $location, $cookieStore, DATA) {
	$scope.title = 'home';
	$http({
		method : 'GET',
		url : 'http://127.0.0.1:9090/home.do?id=' + DATA.userid + '&lng=' + DATA.lng + '&lat=' + DATA.lat
	}).success(function (resp, status, headers, config) {
	//var token = data.token;
	//$cookieStore.put('token', token);
	//$location.path('/');
		console.log(resp);
    DATA.stars = resp;
		Home.clean();
		Home.layout(31.268964, 121.443794);
		Home.star(0, [{
					x : 31.268964,
					y : 121.443794,
					clz : '3110',
					id : 158,
					name : 'test1'
				}, {
					x : 31.266617,
					y : 121.416328,
					clz : '0110',
					id : 158,
					name : 'test2'
				}
			]);
	}).error(function (data, status, headers, config) {
		$scope.status = status;
	});
});

app.directive('carousel', function(){
  return {
    restrict: 'C',
    scope: {},
    controller: function() {
      this.itemCount = 0;
      this.activeItem = null;

      this.addItem = function(){
        var newId = this.itemCount++;
        this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
        return newId;
      };

      this.next = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
      };

      this.prev = function(){
        this.activeItem = this.activeItem || 0;
        this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
      };
    }
  };
});

app.directive('carouselItem', function($drag) {
  return {
    restrict: 'C',
    require: '^carousel',
    scope: {},
    transclude: true,
    template: '<div class="item"><div ng-transclude></div></div>',
    link: function(scope, elem, attrs, carousel) {
      scope.carousel = carousel;
      var id = carousel.addItem();
      
      var zIndex = function(){
        var res = 0;
        if (id === carousel.activeItem){
          res = 2000;
        } else if (carousel.activeItem < id) {
          res = 2000 - (id - carousel.activeItem);
        } else {
          res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
        }
        return res;
      };

      scope.$watch(function(){
        return carousel.activeItem;
      }, function(){
        elem[0].style.zIndex = zIndex();
      });
      
      $drag.bind(elem, {
        //
        // This is an example of custom transform function
        //
        transform: function(element, transform, touch) {
          // 
          // use translate both as basis for the new transform:
          // 
          var t = $drag.TRANSLATE_BOTH(element, transform, touch);
          
          //
          // Add rotation:
          //
          var Dx    = touch.distanceX, 
              t0    = touch.startTransform, 
              sign  = Dx < 0 ? -1 : 1,
              angle = sign * Math.min( ( Math.abs(Dx) / 700 ) * 30 , 30 );
          
          t.rotateZ = angle + (Math.round(t0.rotateZ));
          
          return t;
        },
        move: function(drag){
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            elem.addClass('dismiss');  
          } else {
            elem.removeClass('dismiss');  
          }
        },
        cancel: function(){
          elem.removeClass('dismiss');
        },
        end: function(drag) {
          elem.removeClass('dismiss');
          if(Math.abs(drag.distanceX) >= drag.rect.width / 4) {
            scope.$apply(function() {
              carousel.next();
            });
          }
          drag.reset();
        }
      });
    }
  };
});

app.directive('script', ['$window', '$q', '$http', function ($window, $q, $http) {
			return {
				restrict : 'E',
				scope : false,
				controller : function ($scope) {
					console.log($scope);
				},
				link : function (scope, elem, attr) {
					if (attr.type === 'text/javascript-lazy') {
						var code = elem.text();
						var f = new Function(code);
						f();
					}
				}
			};
		}
	]);
