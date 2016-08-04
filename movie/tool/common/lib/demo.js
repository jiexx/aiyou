
var app = angular.module('roger', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  "ngCookies",
  'myphoto'
]);

app.run(function($transform) {
  window.$transform = $transform;
});


app.config(function($routeProvider) {
  $routeProvider.when('/',            {templateUrl: 'home.html', 		controller : 'home', reloadOnSearch: false});
  $routeProvider.when('/attractions',        {templateUrl: 'afl.html', 		controller : 'attractions', reloadOnSearch: false}); 
  $routeProvider.when('/lodge',        {templateUrl: 'afl.html', 		controller : 'lodge', reloadOnSearch: false}); 
  $routeProvider.when('/food',        {templateUrl: 'afl.html', 		controller : 'food', reloadOnSearch: false}); 
  $routeProvider.when('/edit',        {templateUrl: 'edit.html', 		controller : 'edit', reloadOnSearch: false}); 
  $routeProvider.when('/insert',        {templateUrl: 'insert.html', 		controller : 'insert', reloadOnSearch: false}); 
  $routeProvider.when('/photo',        {templateUrl: 'photo.html', 		controller : 'photo', reloadOnSearch: false}); 
});

app.factory('DATA', function () {
    return {
        //HOST : "http://10.101.1.165:8096",
        IMG_HOST : "http://10.101.1.165:8097/",
		HOST : "http://10.101.1.163:8088",
        USER_ID: 0,
        _self : null,
        getSelf : function() {
            if( this._self == null ) {

            }
            return this._self;
        },
    }
});

function setUserID(userID) {
    console.log('userID = ' + userID);
    angular.element(document.body).injector().get('DATA').USER_ID = userID;
};

app.controller('appCtrl', function ($scope, $rootScope, $location, $cookieStore, DATA) {
	
});

function authorize($cookieStore, $location) {
	if(!$cookieStore.get("uid"))
		$location.path('/');
}


function ajax($http, DATA, qry, callback) {
	$http({
			method : 'GET',
			url : DATA.HOST + qry
		}).success(function (resp, status, headers, config) {
			callback(resp);
		}).error(function (data, status, headers, config) {
			console.log(""+data);
		}); 
};
function ajaxPost($http, DATA, qry, d, callback) {
	$http({
			method : 'POST',
			url : DATA.HOST + qry,
			data : d
		}).success(function (resp, status, headers, config) {
			callback(resp);
		}).error(function (data, status, headers, config) {
			console.log(""+data);
		}); 
};

app.controller('home', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	$scope.userAgent = navigator.userAgent;
	
	$scope.login = function() {
		console.log($cookieStore.get("uid"));
		$cookieStore.remove("uid");
		ajaxPost($http, DATA, '/login', {UserName:$scope.username, UserPWD:$scope.password }, function(resp){
			if(resp && resp.length > 0) {
				$cookieStore.put("uid", $scope.role);
				$location.path('/attractions');//.search({guideID: id});
			}
		});
	}
	
	ajax($http, DATA, '/roles', function(resp){
		$scope.roles = resp;
	});
});

function commonQueryPage(p, $scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	var page = p;
	if(page == 'attractions'){
		$scope.title = '景点';
	}else if(page == 'lodge'){
		$scope.title = '住宿';
	}else if(page == 'food'){
		$scope.title = '美食';
	}
	$scope.page = page;
	var number = 0;
	$scope.scrollItems = [];
	$scope.bottomReached = function(p){
		ajax($http, DATA, '/context?page=' + p +'&no='+number, function(resp){
			$scope.scrollItems = $scope.scrollItems.concat(resp);
		});
		number ++;
	}
	$scope.enableItem = function(p, id, s) {
		ajax($http, DATA, '/enable?id=' + id + '&status=' + s + '&page=' + p, function(resp){
			if(resp == 'ok') {
				for(var i in $scope.scrollItems){
					if($scope.scrollItems[i].id == id) {
						$scope.scrollItems[i].Status = s;
					}
				}
			}
		});
	}
	$scope.deleteItem = function(p, id) {
		ajax($http, DATA, '/remove?id=' + id + '&page=' + p, function(resp){
			if(resp == 'ok') {
				for(var i in $scope.scrollItems){
					if($scope.scrollItems[i].id == id) {
						$scope.scrollItems.splice(i,1);
					}
				}
			}
		});
	}
	$scope.bottomReached(page);
};
app.controller('edit', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	ajax($http, DATA, '/detail?id=' + $location.$$search.id , function(resp){
			$scope.detail = resp;
			$scope.country = resp.resoult[0].CountryID;
			$scope.city = resp.resoult[0].CityID;
		});
	$scope.selectCity = function(id) {
		ajax($http, DATA, '/city?id=' + $scope.country , function(resp){
			$scope.detail.city = resp.city;
		})
	};
	var page = $location.$$search.page;
	if(page == 'attractions'){
		$scope.title = '景点';
		$scope.page = '1';
	}else if(page == 'lodge'){
		$scope.title = '住宿';
		$scope.page = '2';
	}else if(page == 'food'){
		$scope.title = '美食';
		$scope.page = '3';
	}
	$scope.update = function() {
		ajaxPost($http, DATA, '/edit', {SpotsID:$scope.detail.resoult[0].SpotsID, SpotsTypeID:$scope.page, NameCh:$scope.detail.resoult[0].NameCh, NameEn:$scope.detail.resoult[0].NameEn, CountryID:$scope.country, CityID:$scope.city, CommondReason:$scope.detail.resoult[0].CommondReason}, function(resp){
			$scope.result = parseInt(resp);
		});
	};
});
app.controller('attractions', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	//$rootScope.navbarType = 'searchPage';
	authorize($cookieStore, $location);
	commonQueryPage('attractions', $scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA);
});
app.controller('lodge', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	commonQueryPage('lodge', $scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA);
});
app.controller('food', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	commonQueryPage('food', $scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA);
});
app.controller('insert', function ($scope, $rootScope, $location, $cookies, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	var page = $location.$$search.p;
	if(page == 'attractions'){
		$scope.title = '景点';
		$scope.page = '1';
	}else if(page == 'lodge'){
		$scope.title = '住宿';
		$scope.page = '2';
	}else if(page == 'food'){
		$scope.title = '美食';
		$scope.page = '3';
	}
	$scope.result = -1;
	$scope.insert = function() {
		ajaxPost($http, DATA, '/insert', {SpotsTypeID:$scope.page, UserID:$cookieStore.get('uid'), Status:2, NameCh:$scope.NameCh, NameEn:$scope.NameEn, CountryID:$scope.country, CityID:$scope.city, CommondReason:$scope.introduce}, function(resp){
			$scope.result = parseInt(resp);
		});
	};
	$scope.selectCity = function(id) {
		ajax($http, DATA, '/city?id=' + $scope.country , function(resp){
			$scope.detail.city = resp.city;
		})
	};
	ajax($http, DATA, '/locationcfg', function(resp){
		$scope.detail = resp;
	});
});
app.controller('photo', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	var number = 0;
	$scope.title = '图片';
	$scope.imgHost = DATA.IMG_HOST;
	$scope.scrollItems = [];
	var selected = -1;
	$scope.bottomReached = function(){
		ajax($http, DATA, '/photo?id=' + $location.$$search.id +'&no='+number, function(resp){
			$scope.scrollItems = $scope.scrollItems.concat(resp.items);
			$scope.enable = resp.enable;
		});
		number ++;
	}
	$scope.deleteItem = function(id) {
		ajax($http, DATA, '/photo/delete?id='+id.SpotsDetailID, function(resp){
			if(resp == 'ok') {
				for(var i in $scope.scrollItems){
					if($scope.scrollItems[i].SpotsDetailID == id.SpotsDetailID) {
						$scope.scrollItems.splice(i,1);
					}
				}
			}
		});
	};
	$scope.enableItem = function(item) {
		ajax($http, DATA, '/photo/enable?id='+$location.$$search.id+'&u='+item.PicURL, function(resp){
			if(resp == 'ok') {
				$scope.enable = item.PicURL;
			}
		});
	}
	$scope.editPhoto = function(item) {
		selected = item.SpotsDetailID;
	}
	$scope.editImage = function(raw) {
		if(selected > 0) {
			ajaxPost($http, DATA, '/photo/update', {id:selected, pic:raw}, function(resp){
				//console.log(JSON.stringify(resp));
				for(var i in $scope.scrollItems){
					if($scope.scrollItems[i].SpotsDetailID == selected) {
						$scope.scrollItems[i].PicURL = resp;
					}
				}
				selected = -1;
			});
		}
	}
	$scope.editTitle = function(item) {
		ajaxPost($http, DATA, '/photo/title/update', {id:item.SpotsDetailID,  introduce:item.Summary}, function(resp){
			//console.log(JSON.stringify(resp));
		});
	}
	$scope.finish = function(raw) {
		ajaxPost($http, DATA, '/photo/insert', {id:$location.$$search.id, pic:raw, introduce:$scope.introduce}, function(resp){
			//console.log(JSON.stringify(resp));
			$scope.scrollItems = $scope.scrollItems.concat(resp);
		});
	};
	$scope.bottomReached();
	
});
