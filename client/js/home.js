var map;

function LocalMapType() {}

LocalMapType.prototype.tileSize = new google.maps.Size(256, 256);
LocalMapType.prototype.maxZoom = 16; 
LocalMapType.prototype.minZoom = 13; 
LocalMapType.prototype.name = "home;
LocalMapType.prototype.alt = "home";
LocalMapType.prototype.getTile = function (coord, zoom, ownerDocument) {
	var img = ownerDocument.createElement("img");
	img.style.width = this.tileSize.width + "px";
	img.style.height = this.tileSize.height + "px";

	mapPicDir = "../../3rd-lib/maptile/tiles/";
	var curSize = Math.pow(2, zoom);
	strURL = mapPicDir + zoom + "/" + (coord.x % curSize) + "/" + (coord.y % curSize) + ".PNG";
	img.src = strURL;
	return img;
};

var localMapType = new LocalMapType();

function initialize() {
	var myLatlng = new google.maps.LatLng(31.268964, 121.443794); //(30.587, 114.312);
	var mapOptions = {
		zoom : 5,
		center : myLatlng,
		disableDefaultUI : true,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		panControl : false,
		zoomControl : false,
		mapTypeControl : false,
		scaleControl : true,
		streetViewControl : false,
		overviewMapControl : false
	}

	map = new google.maps.Map(document.getElementById('mapper'), mapOptions);
	map.mapTypes.set('localMap', localMapType); 
	map.setMapTypeId('localMap'); 
	map.setOptions({
		draggable : false
	});
	var infowindow = new google.maps.InfoWindow({
			content : '<img src="../../3rd-lib/images/flowers.jpg"><br/><center>Wuhan</center>'
		});
	var image = '../../3rd-lib/images/user.png';
	var myLatLng = new google.maps.LatLng(31.268964, 121.443794); 

	var marker = new google.maps.Marker({
			position : myLatlng,
			map : map,
			title : '',
			icon : image
		});
	google.maps.event.addListener(marker, 'click', function () {
		infowindow.open(map, marker);
	});

	//default icons
	var parliament = new google.maps.LatLng(31.266617, 121.416328); 
	var marker2 = new google.maps.Marker({
			map : map,
			draggable : true,
			animation : google.maps.Animation.DROP,
			position : parliament
		});
	google.maps.event.addListener(marker2, 'click', toggleBounce);

	function toggleBounce() {

		if (marker2.getAnimation() != null) {
			marker2.setAnimation(null);
		} else {
			marker2.setAnimation(google.maps.Animation.BOUNCE);
		}
	}
};
app.registerCtrl('map', function($scope)
{
   $scope.content = '...'; 
});
