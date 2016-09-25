
var app = angular.module('roger', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  'mobile-angular-ui.core.sharedState',
  "ngCookies",
  'myphoto'
]);

app.run(function($transform) {
  window.$transform = $transform;
});


app.config(function($routeProvider) {
  $routeProvider.when('/',            {templateUrl: 'home.html', 		controller : 'home', reloadOnSearch: false});
  $routeProvider.when('/tasklist',    {templateUrl: 'tasks.html', 		controller : 'tasklist', reloadOnSearch: false}); 
  $routeProvider.when('/taskdetail',        {templateUrl: 'detail.html', 		controller : 'taskdetail', reloadOnSearch: false}); 
  $routeProvider.when('/pagelist',    {templateUrl: 'pages.html', 		controller : 'pagelist', reloadOnSearch: false}); 
  $routeProvider.when('/config',        {templateUrl: 'config.html', 		controller : 'config', reloadOnSearch: false}); 
});

app.factory('DATA', function () {
    return {
        HOST : "http://10.101.1.165:8066",
        IMG_HOST : "http://10.101.1.165:8097/",
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
	//if(!$cookieStore.get("uid"))
	//	$location.path('/');

	//$http.get('../lib/barcfg.js').success (function(CFG){
	//});//load file...
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
		//ajaxPost($http, DATA, '/login', {UserName:$scope.username, UserPWD:$scope.password }, function(resp){
		//	if(resp && resp.length > 0) {
				$cookieStore.put("uid", 123);
				$location.path('/attractions');//.search({guideID: id});
		//	}
		//});
	}
});


app.controller('tasklist', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	$scope.tasks = [{id:1, name:'127.0.0.1',start:'2016-09-02T03:00:00.000Z',end:'2016-09-02T04:00:00.000Z'},{id:1, name:'127.0.0.1',start:'2016-09-02T03:00:00.000Z',end:'2016-09-02T04:00:00.000Z'}];

});

app.controller('taskdetail', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, SharedState, DATA) {
	authorize($cookieStore, $location);
	$scope.currPage = 0;
	$scope.pages = [{id:new Date().getTime(), name:'空(*自己)', url: '', tags: [{expr:'',arrays:false,property:null,value:''}] }];
	$scope.addTag = function() {
		var a = [{expr:'',arrays:false,property:null,value:''}];
		$scope.pages.tags = $scope.pages.tags.push(a);
		for( var i in arguments ){
			SharedState.initialize($rootScope, arguments[i]);
		}
		
	};
});

app.controller('pagelist', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	$scope.title = '页面';
	authorize($cookieStore, $location);
	ajaxPost($http, DATA, '/page/list', {Name:$location.$$search.name,Pager:null}, function(resp){
		$scope.results = resp;
		//$state.go($state.current, {}, {reload: true});
		//$SharedState.initialize($scope, 'myId');
	});
});

app.controller('config', function ($scope, $rootScope, $location, $cookieStore, $http, $timeout, DATA) {
	authorize($cookieStore, $location);
	$scope.proxies = [{id:1, ip:'127.0.0.1',port:80,status:true},{id:2, ip:'192.168.1.1',port:80,status:false}];
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
