function scale(src_w, src_h, dst_w, dst_h) {
	var sw = parseFloat(src_w);
	var sh = parseFloat(src_h);
	var dw = parseFloat(dst_w);
	var dh = parseFloat(dst_h);
	var k = dst_h > dst_w ? src_h / dst_h : src_w / dst_w ;
	return  dst_h > dst_w ? (dst_h < src_h ? {w:dst_w, h:dst_h}:{w:dst_w * k, h:dst_h * k}) : (dst_w < src_w ? {w:dst_w, h:dst_h}:{w:dst_w * k, h:dst_h * k});
}
angular.module('myphoto', [])
	.directive('rogerPhoto', [function() {
		return {
			scope: {
				id: '@',
				rogerData: '=',
				rogerWidth: '=',
				rogerHeight: '=',
				rogerOptions: '@',
				rogerFinish: '&'
			},
			template: '<div><canvas id="photo" style="position:relative;width:100%;height:100%" /><input type="file" style="position:absolute;opacity:0;top:0;bottom:0;left:0;right:0;width:100%" onchange="angular.element(this).scope().upload(this.files)"/></div>',
			replace: true,
			link: function($scope, elem, attr, ctrl) {
				$scope.upload = function (files) {
					//Take the first selected file
					if (!files[0] || !files[0].type)
						return;
					if (files[0].type.indexOf('image') > -1) {
						var reader = new FileReader();
						reader.onloadend = function (evt) {
							var img = new Image();
							img.src = evt.target.result;
							var avatar = document.getElementById("photo");
							var w = $scope.rogerWidth ? $scope.rogerWidth : 300;
							var h = $scope.rogerHeight ? $scope.rogerHeight : 150;
							var ctx = avatar.getContext("2d");
							ctx.fillStyle="#ffffff";
							ctx.fillRect(0, 0, avatar.width, avatar.height);
							img.onload = function() {
								var k = scale(w, h, img.width, img.height);
								avatar.width = k.w;
								avatar.height = k.h;
								ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, avatar.width, avatar.height);
								$scope.rogerFinish({raw:avatar.toDataURL("image/jpeg"),data:$scope.rogerData});
								ctx.clearRect(0, 0, avatar.width, avatar.height);
							}
							//scope.$apply();
						}
						reader.readAsDataURL(files[0]);
					} else {
						$scope.rogerData = null;
						$scope.$apply();
					}
					
				};
				//var p = $('div', elem).attr('ng-model', 'rogerData');
				//$compile(p)($scope.$parent);
			}
		};
	}]);