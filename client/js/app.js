var app = angular.module('aiyou', [
    "ngRoute",
    "mobile-angular-ui.gestures",
    "mobile-angular-ui"
]);
 
app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/',			{templateUrl: "home.html", reloadOnSearch: false});
	$routeProvider.otherwise({redirectTo: '/'});
});

app.service('lazyLoad', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {

    function loader(createElement) {
        var promises = {};

        return function (url) {
            if (typeof promises[url] === 'undefined') {
                var deferred = $q.defer();
                var element = createElement(url);

                element.onload = element.onreadystatechange = function (e) {
                    $timeout(function () {
                        deferred.resolve(e);
                    });
                };
                element.onerror = function (e) {
                    $timeout(function () {
                        deferred.reject(e);
                    });
                };

                promises[url] = deferred.promise;
            }

            return promises[url];
        };
    }


    this.loadScript = loader(function (src) {
        var script = $document[0].createElement('script');

        script.src = src;

        $document[0].body.appendChild(script);
        return script;
    });


    this.loadCSS = loader(function (href) {
        var style = $document[0].createElement('link');

        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = href;

        $document[0].head.appendChild(style);
        return style;
    });
}]);

app.service('map', function ($window, $q, lazyLoad) {
    this.MAP = function () {
        var deferred = $q.defer();

        if (typeof $window.MAP === "undefined") {
				lazyLoad.loadScript('lib/ckeditor/ckeditor.js').then(function () {
                deferred.resolve($window.MAP);
            }).catch(function () {
                console.log('Error loading ');
                deferred.resolve($window.MAP);
            });
        } else {
            deferred.resolve($window.MAP);
        }

        return deferred.promise;
    }

});

app.controller('mapper', function (map) {

     map.MAP();

})