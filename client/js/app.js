
var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui.gestures",
			"mobile-angular-ui",
			"ngCookies"
		]);

app.config(function ($routeProvider, $controllerProvider, $locationProvider, $httpProvider) {
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
	$routeProvider.when('/game', {
		templateUrl : "game.html",
		controller : 'gameCtrl',
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
		au : 1,
		auth : function (a) {
			if (this.au == 0)
				return 'register';
			return a;
		},
		stars : []
	}
});
app.controller('appCtrl', function ($scope, $location, $cookieStore, DATA) {
	console.log(DATA.title);
	$scope.title = DATA.title;
	$scope.titleVisible = true;
	DATA.userid = $location.search().id;
	DATA.lng = $location.search().lng;
	DATA.lat = $location.search().lat;
	//debug for test : ?id=15800000000&lng=31.268964&lat=121.443794
});

app.controller('gameCtrl', function ($scope, $location, $cookieStore, DATA) {
	console.log(DATA.title);
	$scope.$parent.titleVisible = false;
	$scope.avatar1 = '';
	$scope.avatar2 = 'asserts/1.jpg';
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
		if ($scope.avatarHint != 0) {
			$scope.avatarHint = -1;
		} else if ($scope.nickName == '') {
			$scope.holder = '请输入昵称';
		} else {
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
		if (files[0] == undefined || files[0] == null || files[0].type == undefined || files[0].type == null)
			return;
		var chars = ['飞', '雪', '连', '天', '射', '白', '鹿', '笑', '书', '神', '侠', '倚', '碧', '鸳'];
		var name = "";
		var n = Math.ceil(Math.random() * 5);
		for (var i = 0; i < n; i++) {
			var id = Math.ceil(Math.random() * 13);
			name += chars[id];
		}
		$scope.nickName = name;
		if (files[0].type.indexOf('image') > -1) {
			var reader = new FileReader();
			reader.onloadend = function (evt) {
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
		} else {
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

	$http.jsonp(
		//$location.path('/myURL/').search({param: 'value'});
		'http://127.0.0.1:9090/home.do?id=' + $location.search().id + '&lng=' + DATA.lng + '&lat=' + DATA.lat
	).success(function (resp, status, headers, config) {
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

app.controller('homeCtrl', function ($scope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '哎呦';
	nav.navLnk = 'home-list';
	nav.listStyle = true;

	$http({
		method : 'JSONP',
		url : 'http://127.0.0.1:9090/home.do?id=' + DATA.userid + '&lng=' + DATA.lng + '&lat=' + DATA.lat
	}).success(function (resp, status, headers, config) {
		//var token = data.token;
		//$cookieStore.put('token', token);
		//$location.path('/');
		console.log(resp);
		DATA.stars = resp.star;
		Home.clean();
		Home.layout(DATA.lat, DATA.lng);
		DATA.au = resp.au == 268435456 ? 0 : 1;
		Home.star(DATA.au, resp.star);
	}).error(function (data, status, headers, config) {
		console.log(data);
		$scope.status = status;
	});
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
						Home.star(DATA.au, DATA.stars);
					} else if (attr.type === 'text/javascript-user') {
						var code = elem.text();
						var f = new Function(code);
						f();
						var c = Car.load("./asserts/car/bmw_m3_e92/", "bmw");
						c.render();
					} else if (attr.type === 'text/javascript-game') {
						var code = elem.text();
						var f = new Function(code);
						f();
						var round = new RoundImpl('15800000000');
						round.view = View.instance();
						round.view.attach(round);
						round.connect();
					}
				}
			};
		}
	]);
