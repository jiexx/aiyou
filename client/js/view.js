(function () {
	var MAX = 14;
	var card = {
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
		'Char9'
	};
	var
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	DISCARD_DRAW = 0x30000003;
	function View() {
		this.cards = new Array();
		this.cardMats = new Array();
		this.discard = null;
		this.draw = null;
		this.canvas = null;
		this.scene = null;
		this.handcards = new Array();

		// Resize
		//window.addEventListener("resize", function () {
		//	this.engine.resize();
		//});
	}
	View.prototype.dealCard = function (cards) {
		this.handcards = cards;
	}
	View.prototype.insCard = function (draw) {
		this.discard.material = this.cardMats[draw];

		for (i = 0; i < MAX && draw > this.handcards[i]; i++);

		for (j = MAX - 1; j > i; j--)
			this.handcards[j + 1] = this.handcards[j];

		this.handcards[i] = draw;
	};
	View.prototype.disCard = function (discard) {
		console.log("disCard " + discard);
		for (key : handcards) {
			this.cards[i].material = this.cardMats[key];
		}
	};
	View.prototype.command = function (cmd, cardid) {};
	View.prototype.who = function (hiscards, isLosed) {
		for (key : hiscards) {
			var card = BABYLON.Mesh.CreatePlane('hiscard' + i, 5, this.scene);
			card.position.x = 20 * i;
			card.position.y = 20;
			card.position.z = 10;
			card.rotation.z = Math.PI;
			card.material.specularColor = new BABYLON.Color3(0, 0, 0);
			card.material = this.cardMats[key];
		}
		if (isLosed) {}
	};
	View.prototype.open = function () {};
	View.prototype.create = function (canvas) {
		this.cards = new Array();
		this.cardMats = new Array();
		this.discard = null;
		this.draw = null;
		this.canvas = canvas;
		var engine = new BABYLON.Engine(canvas, true);
		this.scene = new BABYLON.Scene(engine);
		var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), this.scene);
		var camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 8, new BABYLON.Vector3(0, 0, 0), this.scene);

		this.handcards = new Array();
		
		start();

		engine.runRenderLoop(function () {
			this.scene.render();
		});
	};
	View.prototype.start = function () {
		for (i = 0; i < MAX; i++) {
			this.cards[i] = BABYLON.Mesh.CreatePlane('card' + i, 5, this.scene);
			this.cards[i].position.x = 20 * i;
			this.cards[i].position.y = -10;
			this.cards[i].position.z = 10;
			this.cards[i].material.specularColor = new BABYLON.Color3(0, 0, 0);

			this.cards[i].actionManager = new BABYLON.ActionManager(scene);
			this.cards[i].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // chu card
					var i = parseInt(evt.source.material.name, 10);
					disCard(i);
					command(DISCARD, i);
				}));
		}
		this.discard = BABYLON.Mesh.CreatePlane('discard', 5, this.scene);
		this.discard.position.x = 20 * i;
		this.discard.position.y = 0;
		this.discard.position.z = 10;
		this.discard.material.specularColor = new BABYLON.Color3(0, 0, 0);
		this.discard.actionManager = new BABYLON.ActionManager(scene);
		this.discard.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { //chi card/pong card
				var i = parseInt(evt.source.material.name, 10);
				invalidate();
				command(DISCARD_PONG, i);
			}));
		this.draw = BABYLON.Mesh.CreatePlane('draw', 5, this.scene);
		this.draw.position.x = 20 * i;
		this.draw.position.y = 0;
		this.draw.position.z = 10;
		this.draw.material.specularColor = new BABYLON.Color3(0, 1, 0);
		this.discard.actionManager = new BABYLON.ActionManager(scene);
		this.discard.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
				var i = parseInt(evt.source.material.name, 10);
				command(DISCARD_DRAW, i);
			}));

		for (key : card) {
			this.cardMats[key] = new BABYLON.StandardMaterial('00' + key, this.scene);
			this.cardMats[key].diffuseTexture = new BABYLON.Texture('./asserts/Mahjong/' + card[key] + '.png', this.scene);
		}
	};
	View.prototype.invalidate = function () {
		this.discard.material = null;
		for (key : this.handcards) {
			this.cards[i].material = this.cardMats[key];
		}
	};

	if (typeof exports !== "undefined" && exports !== null) {
		exports.View = new View();
	}
	if (typeof window !== "undefined" && window !== null) {
		window.View = new View();
	} else if (!exports) {
		self.View = new View();
	}
}).call(this);
