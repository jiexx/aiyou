function writeViewPort() {
	var ua = navigator.userAgent;
	if (ua.indexOf("Android") >= 0 && ua.indexOf("AppleWebKit") >= 0) {
		var webkitVersion = parseFloat(ua.slice(ua.indexOf("AppleWebKit") + 12));
		// targets android browser, not chrome browser (http://jimbergman.net/webkit-version-in-android-version/)
		if (webkitVersion < 535) {
			document.write('<meta name="viewport" content="initial-scale=1" />');
		}
	}
}

writeViewPort();
window.addEventListener("load", function () {
	var loadingText = document.getElementById("progress");
	var canvas = document.querySelector("canvas");
	var engine = new BABYLON.Engine(canvas);
	var scene = new BABYLON.Scene(engine);
	BABYLON.SceneLoader.ImportMesh("", "./asserts/car/bmw_m3_e92/", "bmw.babylon", scene, function (newMeshes) {
		scene.executeWhenReady(function () {
			loadingText.style.display = "none";
		})

		window.myscene = scene;

		//Create Lights
		var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
		light.position = new BABYLON.Vector3(20.311, 35, -17.5);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.specular = new BABYLON.Color3(1, 1, 1);
		light.intensity = 0.75;

		var light0 = new BABYLON.DirectionalLight("light0", new BABYLON.Vector3(1, -2, 1), scene);
		light0.position = new BABYLON.Vector3(35, 35, 0);
		light0.diffuse = new BABYLON.Color3(1, 1, 1);
		light0.specular = new BABYLON.Color3(1, 1, 1);
		light0.intensity = 0.75;

		var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(-1, -2, -1), scene);
		light1.position = new BABYLON.Vector3(-20.311, 35, -17.5);
		light1.diffuse = new BABYLON.Color3(1, 1, 1);
		light1.specular = new BABYLON.Color3(1, 1, 1);
		light1.intensity = 0.75;

		//Call Meshes
		
		var Base				= scene.getMeshByName("Base");
		var BLightL				= scene.getMeshByName("BLightL");
		var BLightR				= scene.getMeshByName("BLightR");
		var Body				= scene.getMeshByName("Body");
		var BumperF				= scene.getMeshByName("BumperF");
		var BumperR				= scene.getMeshByName("BumperR");
		var DoorL				= scene.getMeshByName("DoorL");
		var DoorR				= scene.getMeshByName("DoorR");
		var Exhaust				= scene.getMeshByName("Exhaust");
		var FenderL				= scene.getMeshByName("FenderL");
		var FenderR				= scene.getMeshByName("FenderR");
		var HLightL				= scene.getMeshByName("HLightL");
		var HLightLG			= scene.getMeshByName("HLightLG");
		var HLightR				= scene.getMeshByName("HLightR");
		var HLightRG			= scene.getMeshByName("HLightRG");
		var MirrorL				= scene.getMeshByName("MirrorL");
		var MirrorR				= scene.getMeshByName("MirrorR");
		var Rollcag2			= scene.getMeshByName("Rollcag2");
		var SeatR				= scene.getMeshByName("SeatR");
		var SkirtL				= scene.getMeshByName("SkirtL");
		var SkirtR				= scene.getMeshByName("SkirtR");
		var Spoiler				= scene.getMeshByName("Spoiler");
		var Trunk				= scene.getMeshByName("Trunk");
		var WindF				= scene.getMeshByName("WindF");
		var WindFR				= scene.getMeshByName("WindFR");
		var WindR				= scene.getMeshByName("WindR");
		var WindRL				= scene.getMeshByName("WindRL");
		var WindRR				= scene.getMeshByName("WindRR");
		var TireRR5				= scene.getMeshByName("TireRR5");
		var RotorRR				= scene.getMeshByName("RotorRR");
		var BrakeRR				= scene.getMeshByName("BrakeRR");
		var TireRL5				= scene.getMeshByName("TireRL5");
		var BrakeFR				= scene.getMeshByName("BrakeFR");
		var TireFR1				= scene.getMeshByName("TireFR1");
		var RotorFR				= scene.getMeshByName("RotorFR");
		var RotorFL				= scene.getMeshByName("RotorFL");
		var TireFL1				= scene.getMeshByName("TireFL1");
		var BrakeFL				= scene.getMeshByName("BrakeFL");
		var HoodCarbon			= scene.getMeshByName("Hood Carbon");
		var LicenseF			= scene.getMeshByName("LicenseF");
		var LicenseR			= scene.getMeshByName("LicenseR");
		var SeatR01				= scene.getMeshByName("SeatR01");
		var SeatR02				= scene.getMeshByName("SeatR02");
		scene.clearColor = new BABYLON.Color3(1, 1, 1);
		scene.removeMesh(SeatR01);
		
		var tireMaterial = new BABYLON.StandardMaterial("tireMaterial", scene);
        tireMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        tireMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        tireMaterial.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        TireRR5.material = tireMaterial;
		TireRL5.material = tireMaterial;
		TireFL1.material = tireMaterial;
		TireFR1.material = tireMaterial;

		//Create CarBody Material
		var carbodypaintMaterial = new BABYLON.StandardMaterial("carbodypaintMaterial", scene);
		carbodypaintMaterial.reflectionTexture = new BABYLON.MirrorTexture("carbodypaintTexture", 1024, scene, true);
		carbodypaintMaterial.specularColor = new BABYLON.Color3(0.5, 0.1, 0.1);
		carbodypaintMaterial.specularPower = 100;
		carbodypaintMaterial.diffuseTexture = new BABYLON.Texture("Red.jpg", scene);
		carbodypaintMaterial.ambientTexture = new BABYLON.Texture("Red.jpg", scene);
		carbodypaintMaterial.reflectionTexture.level = 0.45; //Select the level (0.0 > 1.0) of the reflection

		//Chrome Material
		var chromeMaterial = new BABYLON.StandardMaterial("chromemetalMaterial", scene);
		chromeMaterial.reflectionTexture = new BABYLON.MirrorTexture("chromeTexture", 1024, scene, true);
		//chromeMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
		chromeMaterial.specularColor = new BABYLON.Color3(1, 1, 1);
		chromeMaterial.specularPower = 500
		chromeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
		chromeMaterial.ambientTexture = new BABYLON.Texture("brushedmetal.jpg", scene);
		chromeMaterial.ambientTexture.level = 0.5; //Select the level (0.0 > 1.0) of the reflection
		chromeMaterial.reflectionTexture.level = 0.5; //Select the level (0.0 > 1.0) of the reflection

		//Create Mirror Material
		var mirrorMaterial = new BABYLON.StandardMaterial("mirrorMaterial", scene);
		mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirrorTexture", 512, scene, true);
		mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(1, 0, 0, 0);
		mirrorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		mirrorMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		mirrorMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
		mirrorMaterial.reflectionTexture.level = 1; //Select the level (0.0 > 1.0) of the reflection

		//Car Tint Glass Window
		var transglassMaterial = new BABYLON.StandardMaterial("transglassMaterial", scene);
		transglassMaterial.reflectionTexture = new BABYLON.MirrorTexture("transglassTexture", 1024, scene, true);
		transglassMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, 0, 0, 0);
		transglassMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		transglassMaterial.alpha = 0.7;
		transglassMaterial.reflectionTexture.level = 0.7; //Select the level (0.0 > 1.0) of the reflection
		WindF.material = transglassMaterial;
		WindFR.material = transglassMaterial;
		WindR.material = transglassMaterial;
		WindRL.material = transglassMaterial;
		WindRR.material = transglassMaterial;


		for (var index = 0; index < scene.materials.length; index++) {
			scene.materials[index].backFaceCulling = true;
		}
		//Camera
		var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 1, Math.PI / 3, 8, new BABYLON.Vector3(0, 0, 0), scene);
		camera.lowerBetaLimit = 0.1;
		camera.upperBetaLimit = (Math.PI / 2) * 0.9;
		camera.lowerRadiusLimit = 4;
		camera.upperRadiusLimit = 8;
		//camera.attachControl(canvas, false);

		//Camera Rotate
		scene.registerBeforeRender(function () {
			scene.getCameraByID("Camera").alpha += 0.003;
		});
		engine.runRenderLoop(function () {
			scene.render()
		})
	},
		// Here is the 'onProgress' method that will update the HTML element
		function (evt) {
		if (evt.lengthComputable) {
			loadingText.innerHTML = "Loading, please wait..." + (evt.loaded * 100 / evt.total).toFixed() + "%";
		} else {
			dlCount = evt.loaded / (1024 * 1024);
			loadingText.innerHTML = "Loading, please wait..." + Math.floor(dlCount * 100.0) / 100.0 + " MB already loaded.";
		}
	})
})
