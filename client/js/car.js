(function () {
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

	function Car(canvas) {
		this.canvas = null;
		this.engine = null;
		this.scene = null;
		this.car = null;
		writeViewPort();
	};
	
	Car.prototype.create = function(canvas) {
		//if( this.engine == null ) {
			//document.querySelector("canvas");
			this.canvas = canvas;
			this.engine = new BABYLON.Engine(this.canvas);
			this.scene = new BABYLON.Scene(this.engine);
			this.scene.clearColor = new BABYLON.Color3(1, 1, 1);
			this.car = new BABYLON.Mesh.CreateBox("car", 1, this.scene);
			this.car.isVisible = false;
			//this.car.position= new BABYLON.Vector3(-1, -1, 1);
			
			var camera = new BABYLON.ArcRotateCamera("Camera", -0.8, 1.2, 10, new BABYLON.Vector3(0, 1, 0), this.scene);
			//camera.fovMode = camera.FOVMODE_HORIZONTAL_FIXED;
			camera.fov = 0.9;
			camera.lowerBetaLimit = 0.1;
			camera.upperBetaLimit = (Math.PI / 2) * 0.9;
			camera.lowerRadiusLimit = 4;
			camera.upperRadiusLimit = 8;
			camera.attachControl(canvas, false);
		//}
	}
	
	Car.prototype.clean = function() {
		if( this.scene != null ) {
			this.scene.dispose();
		}
	}
	
	Car.prototype.load = function(dir, file, onLoaded) {
		var scene = this.scene;
		var engine = this.engine;
		var car = this.car;
		BABYLON.SceneLoader.ImportMesh("", dir, file, scene, function (newMeshes) {
			scene.executeWhenReady(function () {
				for( var i in newMeshes ) {
					newMeshes[i].parent = car;
					newMeshes[i].isVisible = true;
				}
				if( onLoaded != undefined && onLoaded != null )
					onLoaded();
				
				//scene.render();
			})

			//Create Lights
			var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
			light.position = new BABYLON.Vector3(20, 40, 20);
			light.diffuse = new BABYLON.Color3(1, 1, 1);
			light.specular = new BABYLON.Color3(1, 1, 1);
			light.intensity = 1.8;
			


			/*var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(-1, -2, -1), scene);
			light1.position = new BABYLON.Vector3(-20.311, 35, -17.5);
			light1.diffuse = new BABYLON.Color3(1, 1, 1);
			light1.specular = new BABYLON.Color3(1, 1, 1);
			light1.intensity = 0.75;*/

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
			var WindFL				= scene.getMeshByName("WindFL");
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
			var HoodCarbon			= scene.getMeshByName("HoodCarbon");
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
			carbodypaintMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
			carbodypaintMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
			carbodypaintMaterial.specularPower = 100;
			//carbodypaintMaterial.diffuseTexture = new BABYLON.Texture("Red.jpg", scene);
			//carbodypaintMaterial.ambientTexture = new BABYLON.Texture("Red.jpg", scene);
			carbodypaintMaterial.reflectionTexture.level = 0.45; //Select the level (0.0 > 1.0) of the reflection
			FenderL.material = carbodypaintMaterial;
			FenderR.material = carbodypaintMaterial;
			BumperF.material = carbodypaintMaterial;
			BumperR.material = carbodypaintMaterial;
			Trunk.material = carbodypaintMaterial;
			Body.material = carbodypaintMaterial;
			DoorL.material = carbodypaintMaterial;
			DoorR.material = carbodypaintMaterial;
			HoodCarbon.material = carbodypaintMaterial;

			//Chrome Material
			var chromeMaterial = new BABYLON.StandardMaterial("chromemetalMaterial", scene);
			chromeMaterial.reflectionTexture = new BABYLON.MirrorTexture("chromeTexture", 1024, scene, true);
			//chromeMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
			chromeMaterial.specularPower = 100
			chromeMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6);
			//chromeMaterial.ambientTexture = new BABYLON.Texture("brushedmetal.jpg", scene);
			//chromeMaterial.ambientTexture.level = 0.5; //Select the level (0.0 > 1.0) of the reflection
			//chromeMaterial.reflectionTexture.level = 0.5; //Select the level (0.0 > 1.0) of the reflection
			HoodCarbon.material = chromeMaterial;

			//Create Mirror Material
			/*var mirrorMaterial = new BABYLON.StandardMaterial("mirrorMaterial", scene);
			mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirrorTexture", 512, scene, true);
			mirrorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(1, 0, 0, 0);
			mirrorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			mirrorMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
			mirrorMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
			mirrorMaterial.reflectionTexture.level = 1; //Select the level (0.0 > 1.0) of the reflection*/

			//Car Tint Glass Window
			var transglassMaterial = new BABYLON.StandardMaterial("transglassMaterial", scene);
			transglassMaterial.reflectionTexture = new BABYLON.MirrorTexture("transglassTexture", 1024, scene, true);
			transglassMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, 0, 0, 0);
			transglassMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
			transglassMaterial.alpha = 0.7;
			transglassMaterial.reflectionTexture.level = 0.7; //Select the level (0.0 > 1.0) of the reflection
			WindF.material = transglassMaterial;
			WindFR.material = transglassMaterial;
			WindR.material = transglassMaterial;
			WindRL.material = transglassMaterial;
			WindRR.material = transglassMaterial;
			WindFL.material = transglassMaterial;


			for (var index = 0; index < scene.materials.length; index++) {
				scene.materials[index].backFaceCulling = true;
			}
			//Camera
			for( var i in newMeshes ) {
				newMeshes[i].isVisible = false;
			}
		});
		return this;
	};

	Car.prototype.render = function() {
		var _this = this;
		/*var keys = []; 
		keys.push({frame: 0,value: 150});
		keys.push({frame: 80,value: 0});
		keys.push({frame: 90,value: 1});
		keys.push({frame: 100,value: 0});
		var animation = new BABYLON.Animation("myAnimation", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		animation.setKeys(keys);
		
		var car = this.car;
		car.animations.push(animation);
		this.scene.beginAnimation(car, 0, 100, false);*/
        _this.engine.runRenderLoop(function() {
			_this.scene.render();
			//if( animation.isStopped()  ) {
			//	_this.engine.stopRenderLoop();
			//	console.log("stop");
			//}
        })
	};
	if (typeof exports !== "undefined" && exports !== null) {
		exports.Car = new Car();
	}
	if (typeof window !== "undefined" && window !== null) {
		window.Car = new Car();
	} else if (!exports) {
		self.Car = new Car();
	}
}).call(this);
