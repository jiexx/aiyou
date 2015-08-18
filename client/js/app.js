
var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui.gestures",
			"mobile-angular-ui",
			"ngCookies"
		]);

app.config(function ($routeProvider, $controllerProvider, $locationProvider) {
	app.registerCtrl = $controllerProvider.register;
	//$locationProvider.html5Mode(true);
	$routeProvider.when('/', {
		templateUrl : "home.html",
		controller : 'homeCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/home-list', {
		templateUrl : "home-list.html",
		controller : 'homeListCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/user', {
		templateUrl : "user.html",
		controller : 'userCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/shop', {
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

app.factory('DATA', function () {
	return {
		userid : 15800000000,
		lng : 121.443794,
		lat : 31.268964,
		au : 0,
		auth : function(a){
			if( this.au == 0 )
				return 'register';
			return a;
		},
		stars : []
	}
});
app.controller('appCtrl', function ($scope, $location, $cookieStore, DATA) {
	console.log(DATA.title);
	$scope.title = DATA.title;
});

app.controller('registerCtrl', function ($scope, $location, $cookieStore) {
	var nav = $scope.$parent;
	nav.title = '注册';
	nav.navLnk = '/';
	nav.listStyle = false;
  
  var fd = new FormData();
  
  $scope.avatarHint = 1;
  $scope.holder = '昵称';
  $scope.nickName = '';
  
  $scope.submit = function () {
    if( $scope.avatarHint != 0 ) {
      $scope.avatarHint = -1;
    }else if( $scope.nickName == '') {
      $scope.holder = '请输入昵称';
    }else {
      fd.append("name", $scope.nickName);
      $http.post('http://127.0.0.1:9090/register.do', fd, {
        withCredentials : true,
        headers : {
          'Content-Type' : undefined
        },
        transformRequest : angular.identity
      }).success(function (resp, status, headers, config) {
        delete fd;
        fd = null;
        $location.path('/');
        $scope.$apply();
      }).error(function (resp, status, headers, config) {});
    }
  };
  
	$scope.uploadAvatar = function (files) {
    //Take the first selected file
    if( files[0] == undefined || files[0] == null || files[0].type == undefined || files[0].type == null )
      return;
    var chars = ['飞','雪','连','天','射','白','鹿','笑','书','神','侠','倚','碧','鸳'];
    var name = "";
    var n = Math.ceil(Math.random()*5);
    for(var i = 0; i < n ; i ++) {
      var id = Math.ceil(Math.random()*13);
      name += chars[id];
    }
    $scope.nickName = name;
    if( files[0].type.indexOf('image') > -1 ) {
      var reader = new FileReader();  
      reader.onloadend = function(evt){
        var avatar = document.getElementById("imgAvatar");
        var ctx = avatar.getContext("2d");
        var img = new Image();
        img.src = evt.target.result;
        ctx.clearRect(0, 0, avatar.width, avatar.height);
        ctx.drawImage(img, 0, 0, avatar.width, avatar.height);
        fd.append('avatar', avatar.toDataURL());
        $scope.avatarHint = 0;
        $scope.$apply();
      }  
      reader.readAsDataURL(files[0]);  
    }else {
      $scope.avatarHint = 1;
      $scope.$apply();
    }
	};
});

app.controller('userCtrl', function ($scope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.navLnk = '/';
	nav.listStyle = false;
	
	$scope.userLnk = DATA.auth('message/?id=' + $location.search().id);
	
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
	var nav = $scope.$parent;
	nav.navLnk = '/';
	nav.listStyle = false;

	$scope.bottomReached = function () {
		/* global alert: false; */
		//alert('Congrats you scrolled to the end of the list!');
	};
	$scope.stars = DATA.stars;
});

app.controller('homeCtrl', function ($scope, $location, $cookieStore, DATA) {
	var nav = $scope.$parent;
	nav.title = '哎呦';
	nav.navLnk = 'home-list';
	nav.listStyle = true;
	DATA.stars = [{
					x : 31.268964,
					y : 121.443794,
					clz : '3100',
					id : 15800000000,
					name : 'test1',
					avatar : 'asserts/1.jpg',
					thumb : '/9j/4AAQSkZJRgABAQEAYABgAAD/4QDoRXhpZgAATU0AKgAAAAgAAwEPAAIAAAAFAAAAMgEQAAIAAAAIAAAAOIdpAAQAAAABAAAAQAAAAABTT05ZAABJTENFLTdSAAAHgpoABQAAAAEAAACagp0ABQAAAAEAAACiiCcAAwAAAAEGQAAAkAMAAgAAABQAAACqkgkAAwAAAAEAEAAAkgoABQAAAAEAAAC+pDQAAgAAABgAAADGAAAAAAAAAAEAAAA8AAAABAAAAAEyMDE0OjEyOjA4IDA4OjMyOjU0AAAAABwAAAABRkUgMjgtNzBtbSBGMy41LTUuNiBPU1MAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAPABUDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7a+Bvx08M3/wJ8F3PiTVviRrfiTW9DsbxtF02eZlsbgwW/mxvPLsjkkSWZUaRQxDHdghhXmP7Un7duueONctdG0PSb7QdFjupraxTTUtpLzUZoI4pDvVmzu5KIskZjlYSsGIGG/PH4k+JvG1pBp/iix11GuNUMd41jql/fKIUk2zNbRyW0g2geewUgICV+fKnZXHfEr9qq603xFp0fgnw2mg6lpCm18u88T6hebhFaXUZXzDgpIuSEZSVBBLKxYMnlYqtnmPpum5JcultVsuqa/4c9ChTyLL6sask5KWt9Gte1m/+AfWs37UHxW1K58vwton/AAnFnaxRRPdWev6bbhDsGCz/AGUJNu5/eJLODt5kJzRXzb8C/wBtzQtL0nUrzXvEPxz0rWdVuVuLk2OvQ62bnEaqjyXUxtpXbYFADIdqBVHKksV8nUyrjBStT9m10bSv+n5H0X9rcLy97kkr/wCJ/jc//9k='
				}, {
					x : 31.266617,
					y : 121.416328,
					clz : '0110',
					id : 15800000001,
					name : 'test2',
					avatar : 'asserts/1.jpg',
					thumb : '/9j/4AAQSkZJRgABAQEAYABgAAD/4QDoRXhpZgAATU0AKgAAAAgAAwEPAAIAAAAFAAAAMgEQAAIAAAAIAAAAOIdpAAQAAAABAAAAQAAAAABTT05ZAABJTENFLTdSAAAHgpoABQAAAAEAAACagp0ABQAAAAEAAACiiCcAAwAAAAEGQAAAkAMAAgAAABQAAACqkgkAAwAAAAEAEAAAkgoABQAAAAEAAAC+pDQAAgAAABgAAADGAAAAAAAAAAEAAAA8AAAABAAAAAEyMDE0OjEyOjA4IDA4OjMyOjU0AAAAABwAAAABRkUgMjgtNzBtbSBGMy41LTUuNiBPU1MAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAPABUDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7a+Bvx08M3/wJ8F3PiTVviRrfiTW9DsbxtF02eZlsbgwW/mxvPLsjkkSWZUaRQxDHdghhXmP7Un7duueONctdG0PSb7QdFjupraxTTUtpLzUZoI4pDvVmzu5KIskZjlYSsGIGG/PH4k+JvG1pBp/iix11GuNUMd41jql/fKIUk2zNbRyW0g2geewUgICV+fKnZXHfEr9qq603xFp0fgnw2mg6lpCm18u88T6hebhFaXUZXzDgpIuSEZSVBBLKxYMnlYqtnmPpum5JcultVsuqa/4c9ChTyLL6sask5KWt9Gte1m/+AfWs37UHxW1K58vwton/AAnFnaxRRPdWev6bbhDsGCz/AGUJNu5/eJLODt5kJzRXzb8C/wBtzQtL0nUrzXvEPxz0rWdVuVuLk2OvQ62bnEaqjyXUxtpXbYFADIdqBVHKksV8nUyrjBStT9m10bSv+n5H0X9rcLy97kkr/wCJ/jc//9k='
				}
			];
	/*$http({
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
	});*/
});

app.directive('carousel', function () {
	return {
		restrict : 'C',
		scope : {},
		controller : function () {
			this.itemCount = 0;
			this.activeItem = null;

			this.addItem = function () {
				var newId = this.itemCount++;
				this.activeItem = this.itemCount === 1 ? newId : this.activeItem;
				return newId;
			};

			this.next = function () {
				this.activeItem = this.activeItem || 0;
				this.activeItem = this.activeItem === this.itemCount - 1 ? 0 : this.activeItem + 1;
			};

			this.prev = function () {
				this.activeItem = this.activeItem || 0;
				this.activeItem = this.activeItem === 0 ? this.itemCount - 1 : this.activeItem - 1;
			};
		}
	};
});

app.directive('carouselItem', function ($drag) {
	return {
		restrict : 'C',
		require : '^carousel',
		scope : {},
		transclude : true,
		template : '<div class="item"><div ng-transclude></div></div>',
		link : function (scope, elem, attrs, carousel) {
			scope.carousel = carousel;
			var id = carousel.addItem();

			var zIndex = function () {
				var res = 0;
				if (id === carousel.activeItem) {
					res = 2000;
				} else if (carousel.activeItem < id) {
					res = 2000 - (id - carousel.activeItem);
				} else {
					res = 2000 - (carousel.itemCount - 1 - carousel.activeItem + id);
				}
				return res;
			};

			scope.$watch(function () {
				return carousel.activeItem;
			}, function () {
				elem[0].style.zIndex = zIndex();
			});

			$drag.bind(elem, {
				//
				// This is an example of custom transform function
				//
				transform : function (element, transform, touch) {
					//
					// use translate both as basis for the new transform:
					//
					var t = $drag.TRANSLATE_BOTH(element, transform, touch);

					//
					// Add rotation:
					//
					var Dx = touch.distanceX,
					t0 = touch.startTransform,
					sign = Dx < 0 ? -1 : 1,
					angle = sign * Math.min((Math.abs(Dx) / 700) * 30, 30);

					t.rotateZ = angle + (Math.round(t0.rotateZ));

					return t;
				},
				move : function (drag) {
					if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
						elem.addClass('dismiss');
					} else {
						elem.removeClass('dismiss');
					}
				},
				cancel : function () {
					elem.removeClass('dismiss');
				},
				end : function (drag) {
					elem.removeClass('dismiss');
					if (Math.abs(drag.distanceX) >= drag.rect.width / 4) {
						scope.$apply(function () {
							carousel.next();
						});
					}
					drag.reset();
				}
			});
		}
	};
});

app.directive('script', ['$window', '$q', '$http', 'DATA', function ($window, $q, $http, DATA) {
			return {
				restrict : 'E',
				scope : false,
				controller : function ($scope) {
					console.log($scope);
				},
				link : function (scope, elem, attr) {
					if (attr.type === 'text/javascript-home') {
						var code = elem.text();
						var f = new Function(code);
						f();
						Home.clean();
						Home.layout(31.268964, 121.443794);
						Home.star(0, DATA.stars);
					}else if(attr.type === 'text/javascript-user') {
						var code = elem.text();
						var f = new Function(code);
						f();
						var c = Car.load("./asserts/car/bmw_m3_e92/", "bmw.babylon");
						c.render();
					}
				}
			};
		}
	]);
