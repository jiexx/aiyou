
var app = angular.module('aiyou', [
			"ngRoute",
			"mobile-angular-ui",
			"mobile-angular-ui.gestures",
			"ngCookies",
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
	$routeProvider.when('/bbs', {
		templateUrl : "bbs.html",
		controller : 'bbsCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/user', {
		templateUrl : "user.html",
		controller : 'userCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/setting', {
		templateUrl : "setting.html",
		controller : 'settingCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/recharge', {
		templateUrl : "recharge.html",
		controller : 'rechargeCtrl',
		reloadOnSearch : false
	});
	$routeProvider.when('/refund', {
		templateUrl : "refund.html",
		controller : 'refundCtrl',
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
	delete $httpProvider.defaults.headers.common['Access-Control-Request-Headers'];
});

app.factory('DATA', function () {
	return {
		HOST : 'http://127.0.0.1:9090',
		userid : 15800000000,
		lng : 121.443794,
		lat : 31.268964,
		au : 1,
		auth : function (a) {
			if (this.au == 0)
				return 'register';
			return a;
		},
		stars : [],
		getUserById : function(id) {
			for( var u in this.stars ) {
				if( this.stars[u].id == id )
					return this.stars[u];
			}
			return null;
		},
		_self : null,
		getSelf : function() {
			if( this._self == null ) {
				this._self = this.getUserById(this.userid);
			}
			return this._self;
		},
	}
});


app.controller('appCtrl', function ($scope, $location, $cookieStore, DATA) {
	$scope.title = DATA.title;
	$scope.titleVisible = true;
	if( $location.search().srv != null )
		DATA.HOST = atob($location.search().srv);
	DATA.userid = $location.search().id;
	if( $location.search().lat != null ) {
		DATA.lat = $location.search().lat;
	}
	if( $location.search().lng != null ) {
		DATA.lng = $location.search().lng;
	}else if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function showPosition(position){
			DATA.lat = position.coords.latitude;
			DATA.lng = position.coords.longitude;
			console.log('geolocation '+DATA.lat);
		});
    }
	//debug for test : ?id=15800000000&lng=31.268964&lat=121.443794
});

app.controller('gameCtrl', function ($scope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.titleVisible = false;
	nav.title = '麻将';
	nav.navLnk = '/';
	nav.listStyle = false;
	
	var toid = $location.search().id;
	if( DATA.userid == undefined || DATA.userid == null || toid == undefined || toid == null )
		return;
	
	var onClose = function() {
		//round.view.clean();
		$location.path('/').search({id:DATA.userid,lng:DATA.lng,lat:DATA.lat});
		$scope.$apply();
	};
	var onGUI = function(uid, mgr) {
		$http({
			method  : 'GET',
			url: DATA.HOST+'/entity/gqry.do', 
			params: {id: uid, id2: DATA.userid}, 
		}).success(function (resp, status, headers, config) {
			if( resp.err == 0 && resp.gid > -1 ) {
				var user = DATA.getSelf();
				var mj = Mahjong.instance();
				mj.initGUI(user.thumb,resp.avatar1,user.name,resp.name1,resp.balance1,resp.balance2);
			}else {
				mgr.close();
			}
		}).error(function (resp, status, headers, config) {
			mgr.close();
		});
	};
	var round = new RoundImpl(DATA.userid, $location.search().chip, onClose, onGUI);
	nav.navClick = function(){
		round.mgr.close();
		return true;
	};
	if( DATA.userid == toid ) {
		round.open();
	}else {
		round.join(toid);
	}
});

app.controller('registerCtrl', function ($scope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '注册';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	
	var clazz = 1;
	
	$scope.classify = function(activeTab) {
		clazz = activeTab;
	};

	var fd = '';// new FormData();

	$scope.avatarHint = 1;
	$scope.holder = '昵称';
	$scope.nickName = '';

	$scope.submit = function () {
		if ($scope.avatarHint != 0) {
			$scope.avatarHint = -1;
		} else if ($scope.nickName == '') {
			$scope.holder = '请输入昵称';
		} else {
			//fd.append("n", $scope.nickName);
			//fd.append("id", DATA.userid);
			$http({
				method  : 'POST',
				url: DATA.HOST+'/entity/reg.do', 
				data: {id: DATA.userid, n : $scope.nickName, a : fd, s : clazz, lat : DATA.lat, lng : DATA.lng}, 
				//dataType: 'json',
				//headers : {
				//	'Content-Type': 'application/x-requested-with; charset=UTF-8'
				//}
			}).success(function (resp, status, headers, config) {
				delete fd;
				fd = null;
				$location.path('/').search({id:DATA.userid,lng:DATA.lng,lat:DATA.lat});
				//$scope.$apply();
			}).error(function (resp, status, headers, config) {
				console.log(resp);
			});
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
				ctx.fillStyle="#ffffff";
				ctx.fillRect(0, 0, avatar.width, avatar.height);
				//ctx.clearRect(0, 0, avatar.width, avatar.height);
				if(img.width == img.height) {
					ctx.drawImage(img, 0, 0, avatar.width, avatar.height);
				}else if(img.width > img.height){
					var s = parseFloat(avatar.width);
					var h = parseFloat(img.height) * s / parseFloat(img.width);
					ctx.drawImage(img, 0, (s-h)/2.0, s, h);
				}else {
					var s = parseFloat(avatar.height);
					var w = parseFloat(img.width) * s / parseFloat(img.height);
					ctx.drawImage(img, (s-w)/2.0, 0, w, s);
				}
				//ctx.font = "30px Arial";
				//ctx.fillText("Hello",0,30);
				fd = avatar.toDataURL("image/jpeg");
				//document.write("<img src='"+fd+"' />");
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
	nav.title = DATA.getUserById($location.search().id).name;
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	
	var initCar = function( canvas, dir, file ) {
		if( canvas != null ) {
			Car.create( canvas );
			var c = Car.load(dir, file);
			c.render();
		}
	};
	var query = function( canvas ) {
		$http({
			method : 'GET',
			//$location.path('/myURL/').search({param: 'value'});
			url: DATA.HOST+'/entity/dqry.do?id=' + $location.search().id
		}).success(function (resp, status, headers, config) {
			//var token = data.token;
			//$cookieStore.put('token', token);
			//$location.path('/');
			if( resp.err == 0 ) {
				$scope.images = resp.imgs;
				$scope.chip = resp.balance;
				$scope.car = resp.car.split("|");
				initCar( canvas, $scope.car[0], $scope.car[1] );
			}
		}).error(function (data, status, headers, config) {
			$scope.status = status;
		});
	};

	$scope.userLnk = DATA.auth('bbs/?id=' + $location.search().id);
	$scope.avatar = DATA.getUserById($location.search().id).thumb;
	$scope.car = null;
	$scope.commentSell = '';
	
	$scope.loadCar = function(canvas) {
		if( canvas != null ) {
			if( $scope.car != null && $scope.car.length == 2 ) {
				initCar( canvas, $scope.car[0], $scope.car[1] );
			}else {
				query( canvas );
			}
		}
	};	
	query();
});

app.controller('settingCtrl', function ($scope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '设置';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	
	var initCar = function( canvas, dir, file ) {
		if( canvas != null ) {
			Car.create( canvas );
			var c = Car.load(dir, file);
			c.render();
		}
	};
	var query = function( canvas ) {
		$http({
			method : 'GET',
			//$location.path('/myURL/').search({param: 'value'});
			url: DATA.HOST+'/image/qry.do?uid=' + $location.search().id
		}).success(function (resp, status, headers, config) {
			if( resp.err == 0 ) {
				$scope.images = resp.imgs;
				$scope.images.push({id:0,uid:0,img:'',intro:'',time:''});
				/*while ( resp.imgs.length ) {
					$scope.images.push( resp.imgs.splice(0, 2) );
				}*/
				$scope.chip = resp.balance;
				$scope.car = resp.car.split("|");
				initCar( canvas, $scope.car[0], $scope.car[1] );
			}
		}).error(function (data, status, headers, config) {
			$scope.status = status;
		});
	};

	$scope.userLnk = DATA.auth('bbs/?id=' + $location.search().id);
	$scope.avatar = DATA.getUserById($location.search().id).thumb;
	$scope.car = null;
	$scope.commentSell = '';
	
	$scope.loadCar = function(canvas) {
		if( canvas != null ) {
			if( $scope.car != null && $scope.car.length == 2 ) {
				initCar( canvas, $scope.car[0], $scope.car[1] );
			}else {
				query( canvas );
			}
		}
	};
	var ft = '';
	$scope.uploadImgSell = function (files) {
		//Take the first selected file
		if (files[0] == undefined || files[0] == null || files[0].type == undefined || files[0].type == null)
			return;
		if (files[0].type.indexOf('image') > -1) {
			var reader = new FileReader();
			reader.onloadend = function (evt) {
				$scope.sell = this.result;
				//fd = imgSell.toDataURL("image/jpeg");
				$scope.$apply();
			}
			reader.readAsDataURL(files[0]);
			ft = files[0].type.substr(6);
		} else {
			$scope.$apply();
		}
	};
	$scope.submitSell = function() {
		if (true) {
			$http({
				method  : 'POST',
				url: DATA.HOST+'/image/upload', 
				data: {id: DATA.userid, n : Date.parse(new Date()), a : $scope.sell, desc: $scope.table.commentSell, t:ft}, 
			}).success(function (resp, status, headers, config) {
				$scope.images.unshift({id:parseInt(resp.code),uid:DATA.userid,img:$scope.sell,intro:$scope.table.commentSell,time:''});
				$scope.sell = '';
				$scope.table.commentSell = '';
			}).error(function (resp, status, headers, config) {
				console.log(resp);
			});
		}
	};
	$scope.delSell = function(index, item) {
		$http({
			method  : 'GET',
			url: DATA.HOST+'/image/del.do?id=' + item.id , 
		}).success(function (resp, status, headers, config) {
			$scope.images.splice(index, 1);
		}).error(function (resp, status, headers, config) {
			console.log(resp);
		});
	};
	$scope.uploadImgAvatar = function() {
		if (files[0] == undefined || files[0] == null || files[0].type == undefined || files[0].type == null)
			return;
		if (files[0].type.indexOf('image') > -1) {
			var reader = new FileReader();
			reader.onloadend = function (evt) {
				$scope.avatar = this.result;
				$scope.$apply();
				$http({
					method  : 'POST',
					url: DATA.HOST+'/entity/avatar.do', 
					data: {id: DATA.userid, a : this.result}, 
				}).success(function (resp, status, headers, config) {
				
				}).error(function (resp, status, headers, config) {
					console.log(resp);
				});
			}
			reader.readAsDataURL(files[0]);
		} else {
			$scope.$apply();
		}
	};
	
	query();
});

app.controller('homeListCtrl', function ($scope, $rootScope, $location, $cookieStore, DATA) {
	var nav = $scope.$parent;
	nav.title = '列表';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		$rootScope.loading = true;
		return true;
	};

	$scope.bottomReached = function () {
		/* global alert: false; */
		//alert('Congrats you scrolled to the end of the list!');
	};
	$scope.auth = (DATA.au == 0? 0 : 1);
	$scope.stars = DATA.stars;
	$scope.clickPlay = function(userid, $event){
		console.log("play click");
		if( DATA.au == 0 ) {
			$location.path('/register');
			return;
		}
		if( userid == DATA.userid ) {
			$rootScope.Ui.turnOn('mbi');
			$scope.mbiConfirm = function() {
				$http({
					method : 'GET',
					//$location.path('/myURL/').search({param: 'value'});
					url: DATA.HOST+'/entity/eqry.do?id=' + userid + '&chip=' + this.mbiChip,
				}).success(function (resp, status, headers, config) {
					$location.path('/game').search({id:userid,chip:resp.chip});
				}).error(function (data, status, headers, config) {
					$scope.status = status;
				});
			};
		}else {
			$http({
				method : 'GET',
				//$location.path('/myURL/').search({param: 'value'});
				url: DATA.HOST+'/entity/cqry.do?id=' + userid + '&myid=' + DATA.userid,
			}).success(function (resp, status, headers, config) {
				$rootScope.Ui.turnOn('mb');
				if( resp.enough ) {
					$scope.mbChip = '本局金币 '+resp.chip;
					$scope.mbOptionText = '取消';
					$scope.mbOption = function() {
					};
					$scope.mbConfirmText = '继续';
					$scope.mbConfirm = function() {
						$location.path('/game').search({id:resp.gid,chip:resp.chip});
					};
				}else {
					$scope.mbChip = '您的金币不足,可以选择好友推广挣金币<br>或者直接充值';
					$scope.mbOptionText = '充值';
					$scope.mbOption = function() {
						//var n = encodeURIComponent(JSON.stringify({id:resp.gid,chip:resp.chip}));
						$location.path('/recharge').search({id:DATA.userid});
					};
					$scope.mbConfirmText = '推广';
					$scope.mbConfirm = function() {
						window.location.href = "aiyou://1.1.1.1/register.do?ref="+DATA.userid;
					};
				}
			}).error(function (data, status, headers, config) {
				$scope.status = status;
			});
			
		}
	}
});

app.controller('bbsCtrl', function ($scope, $rootScope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '聊天广场';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	$scope.myid = DATA.userid;
	$scope.commentVisible = (DATA.userid != $location.search().id);
	
	$scope.onClickCommentItem = function(topicid) {
		$http({
			method : 'GET',
			//$location.path('/myURL/').search({param: 'value'});
			url: DATA.HOST+'/bbs/topic.do?id=' + topicid,
		}).success(function (resp, status, headers, config) {
			$scope.replies = resp.star;
		}).error(function (data, status, headers, config) {
			$scope.status = status;
		});
	};
	var msgBox = function(str, confirm) {
		$rootScope.Ui.turnOn('mb');
		$scope.mbChip = str;
		$scope.mbOptionText = '取消';
		$scope.mbOption = function() {
		};
		$scope.mbConfirmText = '继续';
		$scope.mbConfirm = confirm;
	}
	$scope.onClickReply = function(topicid, replyText) {
		if(replyText != null && replyText.length > 8) {
			$http({
				method : 'GET',
				//$location.path('/myURL/').search({param: 'value'});
				url: DATA.HOST+'/bbs/reply.do?id=' + topicid + '&uid=' + DATA.userid + '&str=' + replyText,
			}).success(function (resp, status, headers, config) {
				msgBox('回复成功', function() {
					var user = DATA.getSelf();
					$scope.replies.push({content:replyText,dnd:1,time:(new Date()).format('mmm dd, yyyy HH:MM:ss TT'),name:user.name,avatar:user.thumb});
				});
			}).error(function (data, status, headers, config) {
				msgBox('回复失败', function() {
				});
			});
		}else {
			msgBox('回复多几个字，至少8个', function() {
			});
		}
	};
	$scope.onClickComment = function(commentText) {
		if(commentText != null && commentText.length > 8) {
			$http({
				method : 'GET',
				//$location.path('/myURL/').search({param: 'value'});
				url: DATA.HOST+'/bbs/comment.do?toid=' + $location.search().id + '&uid=' + DATA.userid + '&str=' +commentText,//$scope.commentText,
			}).success(function (resp, status, headers, config) {
				msgBox('发表成功', function() {
					var user = DATA.getSelf();
					$scope.comments.push({uid:DATA.userid,id:resp.code,content:commentText,dnd:1,time:(new Date()).format('mmm dd, yyyy HH:MM:ss TT'),user:user.name,avatar:user.thumb});
				});
			}).error(function (data, status, headers, config) {
				msgBox('发表失败', function() {
				});
			});
		}else {
			msgBox('发表多几个字，至少8个', function() {
			});
		}
	};

	$http({
		method : 'GET',
		//$location.path('/myURL/').search({param: 'value'});
		url: DATA.HOST+'/bbs/user.do?id=' + $location.search().id,
	}).success(function (resp, status, headers, config) {
		$scope.comments = resp.star;
		$scope.goods = resp.goods;
	}).error(function (data, status, headers, config) {
		$scope.status = status;
	});
});

app.controller('homeCtrl', function ($scope, $rootScope, $location, $cookieStore, $http, $compile, DATA) {
	$scope.$parent.titleVisible = true;
	$rootScope.loading = false;

	var nav = $scope.$parent;
	nav.title = '哎呦';
	nav.navLnk = 'home-list';
	nav.listStyle = true;
	nav.navClick = function(){
		return true;
	};
	
	var msgBox = function() {
		$scope.mbChip = '您的金币不足,可以选择好友推广挣金币<br>或者直接充值';
		$scope.mbOptionText = '充值';
		$scope.mbOption = function() {
			$location.path('/recharge').search({id:DATA.userid});
		};
		$scope.mbConfirmText = '推广';
		$scope.mbConfirm = function() {
			window.location.href = "aiyou://1.1.1.1/register.do?ref="+DATA.userid;
		};
	};
	
	$scope.clickPlay = function(userid, $event){
		console.log("play click");
		if( DATA.au == 0 ) {
			$location.path('/register');
			return;
		}
		if( userid == DATA.userid ) {
			$rootScope.Ui.turnOn('mbi');
			$scope.mbiConfirm = function() {
				$http({
					method : 'GET',
					//$location.path('/myURL/').search({param: 'value'});
					url: DATA.HOST+'/entity/eqry.do?id=' + userid + '&chip=' + this.mbiChip,
				}).success(function (resp, status, headers, config) {
					if( resp.enough )
						$location.path('/game').search({id:userid,chip:resp.chip});
					else
						msgBox();
				}).error(function (data, status, headers, config) {
					$scope.status = status;
				});
			};
		}else {
			$http({
				method : 'GET',
				//$location.path('/myURL/').search({param: 'value'});
				url: DATA.HOST+'/entity/cqry.do?id=' + userid + '&myid=' + DATA.userid,
			}).success(function (resp, status, headers, config) {
				$rootScope.Ui.turnOn('mb');
				if( resp.enough ) {
					$scope.mbChip = '本局金币 '+resp.chip;
					$scope.mbOptionText = '取消';
					$scope.mbOption = function() {
					};
					$scope.mbConfirmText = '继续';
					$scope.mbConfirm = function() {
						$location.path('/game').search({id:resp.gid,chip:resp.chip});
					};
				}else {
					msgBox();
				}
			}).error(function (data, status, headers, config) {
				$scope.status = status;
			});
			
		}
	}

	$http({
		method : 'GET',
		url : DATA.HOST+'/home.do?id=' + DATA.userid + '&lng=' + DATA.lng + '&lat=' + DATA.lat
	}).success(function (resp, status, headers, config) {
		//var token = data.token;
		//$cookieStore.put('token', token);
		//$location.path('/');
		DATA.stars = resp.star;
		Home.clean();
		Home.layout(DATA.lat, DATA.lng);
		DATA.au = resp.au == 268435456 ? 0 : 1;
		Home.star(DATA.au, resp.star, $compile, $scope);
	}).error(function (data, status, headers, config) {
		console.log(DATA.HOST+'  ');
		$scope.status = status;
	});
	
});

app.controller('rechargeCtrl', function ($scope, $rootScope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '充值';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	
	var ci = null;
	$scope.hasCard = 0;
	var initialize = function() {
		$http({
			method : 'GET',
			url: DATA.HOST+'/charge/key.do?id=' + DATA.userid
		}).success(function (resp, status, headers, config) {
			ci = resp;
			if( ci.number != null ) {
				$scope.cardType = ci.type;
				$scope.number = ci.number;
				$scope.hasCard = 1;
			}else {
				$scope.hasCard = 2;
			}
		}).error(function (data, status, headers, config) {
			$scope.status = status;
		});
	};
	initialize();
	$scope.cardNumber = function(number) {
		$scope.errHint = '';
		if( number.charAt(number.length-1) < '0' || number.charAt(number.length-1) > '9' ) {
			if( (number.length == 4 || number.length == 9 || number.length == 14) && number.charAt(number.length-1) == ' ' ) {
				return;
			}
			$scope.number = number.substr(0, number.length-1);
			$scope.cardNumberHint = "卡号为数字";
			return;
		}
		if( number.length == 4 || number.length == 9 || number.length == 14 ) {
			$scope.number = number  + ' ';
		}
		if( number.length > 19 ) {
			$scope.number = number.substr(0, 19);
		}
		$scope.cardNumberHint = "";
	};
	$scope.cardDate = function(expire) {
		$scope.errHint = '';
		if( expire.charAt(expire.length-1) < '0' || expire.charAt(expire.length-1) > '9' ) {
			if( expire.length == 3 && expire.charAt(3) == '/' ) {
				return;
			}
			$scope.expire = expire.substr(0, expire.length-1);
			$scope.cardDateHint = "有效期为数字";
			return;
		}
		if( expire.length == 2 ) {
			if( parseInt(expire) < 15 ) {
				$scope.expire = '';
				$scope.cardDateHint = "有效年份";
				return;
			}else {
				$scope.expire = expire  + '/';
			}
		}
		if( expire.length == 5 ) {
			if( parseInt(expire.substr(3,2)) > 12 ) {
				$scope.expire = expire.substr(0,3);
				$scope.cardDateHint = "月份";
				return;
			}
		}
		if( expire.length > 5 ) {
			$scope.expire = expire.substr(0, 5);
		}
		$scope.cardDateHint = "";
	};
	$scope.cardCVV2 = function(ccv2) {
		$scope.errHint = '';
		if( ccv2.charAt(ccv2.length-1) < '0' || ccv2.charAt(ccv2.length-1) > '9' ) {
			$scope.ccv2 = ccv2.substr(0, ccv2.length-1);
			$scope.cardCCV2Hint = "背面3位数字";
		}
		if( ccv2.length > 3 ) {
			$scope.ccv2 = ccv2.substr(0, 3);
		}
	};
	
	$scope.mbpayConfirm = function( canvas ) {
		if( ci != null ) {
			$rootScope.loading = true;
			var t = $rootScope.Ui.get('button1') ? 1 : $rootScope.Ui.get('button2') ? 2 : 3;
			var v = $rootScope.Ui.get('button4') ? 20 : $rootScope.Ui.get('button5') ? 50 : 100;
			var salt = {number:$scope.number, expire:$scope.expire, ccv2:$scope.ccv2, value:v, name:$scope.name, type:t};
			if( salt.number != null ) 
				salt.number = salt.number.replace(/ /g, '');
			if( salt.expire != null )
				salt.expire = salt.expire.replace(/\//g, '');
			var str = JSON.stringify(salt);
			RSA.setPublic(ci.pwd, '10001');
			var encrypted = RSA.encrypt(str);
			str = null;
			salt = null;
			//var test = Aes.Ctr.decrypt(encrypted, ci.pwd, ci.pwd.length * 8 );
			$http({
				method : 'GET',
				url: DATA.HOST+'/charge/fill.do?id=' + DATA.userid+'&str='+encrypted//encodeURIComponent(encrypted)
			}).success(function (resp, status, headers, config) {
				$rootScope.loading = false;
				if( resp.err == 0 ) {
					$scope.sucHint = "充值成功，请返回";
				}else if( resp.err == 0x0000001f ) {
					$scope.errHint = '会话超时';
					initialize();
				}else if( resp.code != null ){
					$scope.errHint = '您提交的信用卡错误信息:'+resp.code;
				}
			}).error(function (resp, status, headers, config) {
				
				$scope.status = status;
			});
		}
	};
});

app.controller('refundCtrl', function ($scope, $rootScope, $location, $cookieStore, $http, DATA) {
	var nav = $scope.$parent;
	nav.title = '退款';
	nav.navLnk = '/';
	nav.listStyle = false;
	nav.navClick = function(){
		return true;
	};
	DATA.userid = 15800000000;
	var ci = null;
	$scope.hasEmail = 0;
	
	$http({
		method : 'GET',
		url: DATA.HOST+'/charge/email.do?id=' + DATA.userid
	}).success(function (resp, status, headers, config) {
		ci = resp;
		if( ci.err == 0 ) {
			if( ci.email != null ) {
				$scope.hasEmail = 1;
				$scope.email = ci.email;
			}else {
				$scope.hasEmail = 0;
			}
		}else {
			$scope.hasEmail = 2;
		}
	}).error(function (data, status, headers, config) {
		$scope.status = status;
	});
	$scope.refundConfirm = function( canvas ) {
		if( ci != null ) {
			$rootScope.loading = true;
			if( $scope.email.search(/^\s*[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z]\.){1,4}[a-z]{2,4}\s*$/) > -1 ) {
				$http({
					method : 'GET',
					url: DATA.HOST+'/charge/refund.do?id=' + DATA.userid+'&email='+$scope.email.replace(/\s*([^\s]*)\s*/, "$1")
				}).success(function (resp, status, headers, config) {
					$rootScope.loading = false;
					if( resp.err == 0 ) {
						$scope.sucHint = "退款成功，请返回";
					}else if( resp.code != null ){
						$scope.errHint = '您的退款错误信息:'+resp.code;
					}
				}).error(function (resp, status, headers, config) {
					$scope.status = status;
				});
			}else {
				$scope.errHint = '电子邮件地址格式不正确'
			}
		}
	};
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

app.directive('directiveCar', ['$window', '$http', 'DATA', function ($window, $http, DATA)  {
			return {
				restrict : 'A',
				scope : false,
				link: function(scope, elem) {
					//var DATA = elem.injector().get('DATA');
					scope.loadCar( elem[0] )
				}
			};
		}
]);

app.directive('script', ['$window', '$q', '$http', 'DATA', function ($window, $q, $http, DATA) {
			return {
				restrict : 'E',
				scope : false,
				//controller : function ($scope) {
				//	console.log($scope);
				//},
				link : function (scope, elem, attr) {
					if (attr.type === 'text/javascript-home') {
						var code = elem.text();
						var f = new Function(code);
						f();
						//Home.clean();
						//Home.layout(DATA.lat, DATA.lng);
						//Home.star(DATA.au, DATA.stars);
					} else if (attr.type === 'text/javascript-user') {
						var code = elem.text();
						var f = new Function(code);
						f();
						//var c = Car.load("./asserts/car/bmw_m3_e92/", "bmw");
						//c.render();
					} else if (attr.type === 'text/javascript-game') {
						var code = elem.text();
						var f = new Function(code);
						f();
					}
				}
			};
		}
	]);
app.directive('whenReady', ['$interpolate', function($interpolate) {
  return {
    restrict: 'A',
    priority: Number.MIN_SAFE_INTEGER, // execute last, after all other directives if any.
    link: function($scope, $element, $attributes) {
		if( window.J2J != null ) {
			window.J2J.didLoad();
			console.log('ready j2j');
		}
		console.log('ready');
    }
  };
}]);
