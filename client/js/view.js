(function () {
	var MAX = 14;
	var tags = new Array(
			'east',
			'west',
			'south',
			'north',
			'zhong',
			'fa',
			'bai',
			'dot1',
			'dot2',
			'dot3',
			'dot4',
			'dot5',
			'dot6',
			'dot7',
			'dot8',
			'dot9',
			'Bamboo1',
			'Bamboo2',
			'Bamboo3',
			'Bamboo4',
			'Bamboo5',
			'Bamboo6',
			'Bamboo7',
			'Bamboo8',
			'Bamboo9',
			'Char1',
			'Char2',
			'Char3',
			'Char4',
			'Char5',
			'Char6',
			'Char7',
			'Char8',
			'Char9');
	var
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	DISCARD_DRAW = 0x30000003;
	var Data = function () {
		this.handcards = new Array(),
		this.discard = tags.length, //transparent material
		this.draw = tags.length;
	}
	function View() {
		this.cards = new Array();
		this.cardMats = new Array();
		this.discard = null;
		this.draw = null;
		this.canvas = null;
		this.scene = null;
		this.data = new Data();		

		// Resize
		//window.addEventListener("resize", function () {
		//	this.engine.resize();
		//});
		this.dealCard = function (cards) {
			this.data.draw = tags.length;
			this.data.discard = tags.length;
			this.data.handcards = cards;
		}
		this.insCard = function (draw) {
			this.discard.material = this.cardMats[draw];

			for (i = 0; i < MAX && draw > this.handcards[i]; i++);

			for (j = MAX - 1; j > i; j--)
				this.handcards[j + 1] = this.handcards[j];

			this.handcards[i] = draw;
		};
		this.disCard = function (discard) {
			console.log("disCard " + discard);
			this.cards[discard].material = null;
		};
		this.who = function (hiscards, isLosed) {
			for (key in hiscards) {
				var card = BABYLON.Mesh.CreatePlane('hiscard' + i, 5, this.scene);
				card.position.x = 20 * i;
				card.position.y = 20;
				card.position.z = -10;
				card.rotation.z = Math.PI;
				card.material = this.cardMats[key];
			}
			if (isLosed) {}
		};
		this.create = function (canvas) {
			var _this = this;
			_this.cards = new Array();
			_this.cardMats = new Array();
			_this.discard = null;
			_this.draw = null;
			_this.canvas = canvas;
			var engine = new BABYLON.Engine(canvas, true);
			this.scene = new BABYLON.Scene(engine);
			this.scene.clearColor = new BABYLON.Color3(35/255.0, 116/255.0, 172/255.0);
			var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(3 * MAX, 0, -80), _this.scene);
			var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(3 * MAX, 0, -60), _this.scene);
			//var camera = new BABYLON.ArcRotateCamera('Camera', 1, .8, 10, new BABYLON.Vector3(0, 0, 0), scene);
			_this.start();
			
			this.scene.activeCamera.attachControl(canvas);

			engine.runRenderLoop(function () {
				_this.scene.render();
			});
			return this;
		};
		this.start = function () {
			var _this = this;
			for (var i = 0; i < MAX; i++) {
				_this.cards[i] = BABYLON.Mesh.CreatePlane('card' + i, 5, _this.scene);
				_this.cards[i].position.x = 6 * i;
				_this.cards[i].position.y = -20;
				_this.cards[i].position.z = 0;
				//_this.cards[i].rotation.x = Math.PI/12;
				_this.cards[i].actionManager = new BABYLON.ActionManager(_this.scene);
				_this.cards[i].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // chu card
						var card = parseInt(evt.source.material.name, 10);
						_this.disCard(i);
						_this.command(DISCARD, card);
					}));
			}
			_this.discard = BABYLON.Mesh.CreatePlane('discard', 5, _this.scene);
			_this.discard.position.x = 6 * (i-3);
			_this.discard.position.y = -10;
			_this.discard.position.z = 0;
			//_this.discard.rotation.x = Math.PI/12;
			_this.discard.actionManager = new BABYLON.ActionManager(_this.scene);
			_this.discard.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { //chi card/pong card
					var i = parseInt(evt.source.material.name, 10);
					_this.invalidate();
					_this.command(DISCARD_PONG, i);
				}));
			_this.draw = BABYLON.Mesh.CreatePlane('draw', 5, _this.scene);
			_this.draw.position.x = 6 * (i-5);
			_this.draw.position.y = -10;
			_this.draw.position.z = 0;
			//_this.draw.rotation.x = Math.PI*2;
			_this.draw.actionManager = new BABYLON.ActionManager(_this.scene);
			_this.draw.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					var i = parseInt(evt.source.material.name, 10);
					command(DISCARD_DRAW, i);
				}));

			_this.cardMats[tags.length] = new BABYLON.StandardMaterial('00' + tags.length, _this.scene);
			_this.cardMats[tags.length].alpha = 0.0;        
			for (key in tags) {
				_this.cardMats[key] = new BABYLON.StandardMaterial('00' + (key+1), _this.scene);
				_this.cardMats[key].diffuseTexture = new BABYLON.Texture('./asserts/Mahjong/' + tags[key] + '.png', _this.scene);
				_this.cardMats[key].diffuseTexture.hasAlpha = true;
				_this.cardMats[key].specularColor = new BABYLON.Color3(0, 0, 0);
			}
		};
		this.invalidate = function () {
			this.draw.material = this.cardMats[this.data.draw];
			this.discard.material = this.cardMats[this.data.discard];
			var i = 0;
			for (key in this.data.handcards) {
				this.cards[i].material = this.cardMats[key];
				i ++;
			}
			for( i = this.data.handcards.length ; i < MAX ; i ++ ) {
				this.cards[i].material = this.cardMats[tags.length];
			}
		};
	}
	View.prototype.command = function (cmd, cardid) {};

	View.prototype.open = function () {};

	if (typeof exports !== "undefined" && exports !== null) {
		exports.View = new View();
	}
	if (typeof window !== "undefined" && window !== null) {
		window.View = new View();
	} else if (!exports) {
		self.View = new View();
	}
}).call(this);
