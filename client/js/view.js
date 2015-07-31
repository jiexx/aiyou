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
			'dot1', //7
			'dot2',
			'dot3',
			'dot4',
			'dot5',
			'dot6',
			'dot7',
			'dot8',
			'dot9', //15
			'Bamboo1', //16
			'Bamboo2',
			'Bamboo3',
			'Bamboo4',
			'Bamboo5',
			'Bamboo6',
			'Bamboo7',
			'Bamboo8',
			'Bamboo9', //24
			'Char1', //25
			'Char2',
			'Char3',
			'Char4',
			'Char5',
			'Char6',
			'Char7',
			'Char8',
			'Char9', //33
			'back');
	var transparent = tags.length;
	var background = tags.length + 1;
	var back = tags.length - 1;
	var INVALIDCARD = 0xff,
	CARDSIZE = 9;
	var
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	DISCARD_DRAW = 0x30000003;

	var Data = function () {
		this.cards = new Array();
		this.showcards = new Array();
		this.discard = transparent;
	};
	function fix(oo) {
	
		var uv = oo.getVerticesData(BABYLON.VertexBuffer.UVKind);
		uv[0] = 0.2;
		uv[2] = 0.8;
		uv[4] = 0.8;
		uv[6] = 0.2;
		oo.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);
		oo.scaling.x = 0.6;
	}
	function Cards() {
		this.cards = new Array();
		this.showcards = new Array();
		this.pump = new Array();
		this.discard = null;
		this.data = new Data();
		this.needUpdate = true;
		this.disCard = function (pos, m) {
			var i;
			for (i = pos; i < this.data.cards.length; i++) {
				this.data.cards[i] = this.data.cards[i + 1];
			}
			if( i == this.data.cards.length ) 
				this.data.cards[i] = transparent;
			
			this.data.discard = m;
			this.needUpdate = true;
		}
		this.pongchi = function (i, j, k) {
			this.data.showcards.push(i);
			this.data.showcards.push(j);
			this.data.showcards.push(k);
		}
		this.start = function (scene, card_y, showcard_y, discard_y, isCardCB, isDiscardCB) {
			_this = this;
			var i;
			for (i = 0; i < MAX; i++) {
				_this.cards[i] = BABYLON.Mesh.CreatePlane('000' + i, CARDSIZE, scene);
				_this.cards[i].position.x = 6 * i;
				_this.cards[i].position.y = card_y;
				_this.cards[i].position.z = 0;
				_this.cards[i].scaling.x = 0.6
				//_this.cards[i].rotation.x = Math.PI/12;
				fix(_this.cards[i]);
				if (isCardCB) {
					_this.cards[i].actionManager = new BABYLON.ActionManager(scene);
					_this.cards[i].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // chu card
							if (evt.source.material != null) {
								var pos = parseInt(evt.source.id, 10);
								var mat = parseInt(evt.source.material.name, 10);
								console.log("disCard " + pos);
								if (evt.source.position.y == card_y) {
									evt.source.position.y += 3;
									_this.pump.push(i);
								} else if (evt.source.position.y == card_y + 3) {
									evt.source.position.y = card_y;
									_this.disCard(pos, mat);
									for (var k in _this.pump) {
										if (_this.pump[k] == i)
											_this.pump.splice(k, 1);
									}
									_this.__proto__.command(DISCARD, i);
								}
							}
						}));
				}
			}
			for (i = 0; i < MAX; i++) {
				_this.showcards[i] = BABYLON.Mesh.CreatePlane('showcard' + i, CARDSIZE, scene);
				_this.showcards[i].position.x = 6 * i;
				_this.showcards[i].position.y = showcard_y;
				_this.showcards[i].position.z = 0;
				_this.showcards[i].scaling.x = 0.6
				//_this.cards[i].rotation.x = Math.PI/12;
				fix(_this.showcards[i]);
			}
			_this.discard = BABYLON.Mesh.CreatePlane('discard', CARDSIZE, scene);
			_this.discard.position.x = 6 * 3;
			_this.discard.position.y = discard_y;
			_this.discard.position.z = 0;
			_this.discard.scaling.x = 0.6
			fix(_this.discard);
			if (isDiscardCB) {
				_this.discard.actionManager = new BABYLON.ActionManager(scene);
				_this.discard.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { //chi card/pong card
						if (evt.source.material != null) {
							var i = parseInt(evt.source.material.name, 10);
							console.log("draw " + evt.source.material.name);
							if (_this.pump.length == 2) {
								if (_this.pump[0] == _this.pump[1] && _this.pump[0] == i) {
									_this.command(DISCARD_PONG, i);
									Cards.pongchi(_this.pump[0], _this.pump[1], i);
								} else if (Cards.chi(_this.pump[0], _this.pump[1], i)) {
									_this.command(DISCARD_CHI, i);
									Cards.pongchi(_this.pump[0], _this.pump[1], i);
								} else {
									Cards.warning();
								}
							} else {
								Cards.warning();
							}
						}
					}));
			}
		}
		this.invalidate = function (scene, materials) {
			if( this.needUpdate ) {
				var i = 0;
				for (key in this.data.cards) {
					this.cards[i].material = materials[key];
					i++;
				}
				for (i = this.data.cards.length; i < MAX; i++) {
					this.cards[i].material = materials[transparent];
				}
				i = 0;
				for (key in this.data.showcards) {
					this.showcards[i].material = materials[key];
					i++;
				}
				for (i = this.data.showcards.length; i < MAX; i++) {
					this.showcards[i].material = materials[transparent];
				}
				this.discard.material = materials[this.data.discard];
				this.needUpdate = false;
			}
		}
		return this;
	};
	Cards.prototype.chi = function (i, j, k) {
		var a;
		if (i > j) {
			a = i;
			i = j;
			j = a;
		}
		if (j > k) {
			a = k;
			k = j;
			j = a;
		}
		if (i + 1 == j && j + 1 == k)
			if ((i >= 7 && k <= 15) || (i >= 16 && k <= 24) || (i >= 25 && k <= 33))
				return true;
		return false;
	};
	Cards.prototype.warning = function () {
		console.log("warning ");
	};
	Cards.prototype.command = function (cmd, cardid) {
		console.log("command "+ cmd + " " + cardid);
	};
	function View() {
		this.cardMats = new Array();
		this.mycards = new Cards();
		this.hiscards = new Cards();
		this.desk = null;
		this.draw = null;
		this.cardDraw = INVALIDCARD; //invalid card
		this.canvas = null;
		this.scene = null;
		this.data = new Data();

		// Resize
		//window.addEventListener("resize", function () {
		//	this.engine.resize();
		//});
		this.roundDealcards = function (cards) {
			this.mycards.data.cards = cards;
		}
		this.roundDealcard = function (round_dealcard) {
			this.cardDraw = round_dealcard;
		};
		this.himDiscard = function (him_discard) {
			console.log("disCard " + discard);
			this.hiscards.data.discard = him_discard;
			this.invalidate();
		};
		this.who = function (hiscards, isLosed) {
		};
		this.create = function (canvas) {
			this.canvas = canvas;
			var engine = new BABYLON.Engine(canvas, true);
			this.scene = new BABYLON.Scene(engine);
			this.scene.clearColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
			var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(3 * MAX, 0, -100), this.scene);
			var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(3 * MAX, 0, -70), this.scene);
			//var camera = new BABYLON.ArcRotateCamera('Camera', 1, .8, 10, new BABYLON.Vector3(0, 0, 0), scene);
			this.start();

			//this.scene.activeCamera.attachControl(canvas);

			var _this = this;
			engine.runRenderLoop(function () {
				_this.invalidate();
				_this.scene.render();
			});
			return this;
		};
		this.start = function () {
			var _this = this;
			_this.cardMats[transparent] = new BABYLON.StandardMaterial('00' + tags.length, _this.scene);
			//_this.cardMats[transparent].specularColor = new BABYLON.Color3(0, 0, 0);
			_this.cardMats[transparent].alpha = 0.0;
			for (key in tags) {
				_this.cardMats[key] = new BABYLON.StandardMaterial('00' + key, _this.scene);
				_this.cardMats[key].diffuseTexture = new BABYLON.Texture('./asserts/Mahjong/' + tags[key] + '.png', _this.scene/*, true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE, function () {
						_this.scene.render();
					}*/);
				_this.cardMats[key].diffuseTexture.hasAlpha = true;
				_this.cardMats[key].specularColor = new BABYLON.Color3(0, 0, 0);
			}
			_this.cardMats[background] = new BABYLON.StandardMaterial('00' + background, _this.scene);
			_this.cardMats[background].specularColor = new BABYLON.Color3(0, 0, 0);
			//_this.cardMats[background].specularPower = 100;
			_this.cardMats[background].diffuseColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);

			_this.mycards.start(_this.scene, -25, -15, -5, true, false);
			_this.hiscards.start(_this.scene, 25, 15, 5, false, true);

			_this.draw = BABYLON.Mesh.CreatePlane('draw', CARDSIZE, _this.scene);
			_this.draw.position.x = 6 * (MAX - 5);
			_this.draw.position.y = 0;
			_this.draw.position.z = 0;
			//_this.draw.rotation.x = Math.PI*2;
			//fix(_this.draw);
			_this.draw.actionManager = new BABYLON.ActionManager(_this.scene);
			_this.draw.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					if (cardDraw != INVALIDCARD && _this.mycards.data.length == MAX - 1) {
						_this.mycards.data[MAX] = cardDraw;
					} else {
						Cards.warning();
					}
				}));
			_this.draw.material = _this.cardMats[back];
			console.log(_this.draw.getVertexBuffer(BABYLON.VertexBuffer.PositionKind).getData());

			_this.desk = BABYLON.Mesh.CreatePlane('desk', 500, _this.scene);
			_this.desk.position.x = 0;
			_this.desk.position.y = 0;
			_this.desk.position.z = 10;
			//_this.draw.rotation.x = Math.PI*2;
			//fix(_this.desk);
			_this.desk.actionManager = new BABYLON.ActionManager(_this.scene);
			_this.desk.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					if (cardDraw != INVALIDCARD && _this.mycards.data.length == MAX - 1) {
						_this.mycards.data[MAX] = cardDraw;
					} else {
						Cards.warning();
					}
				}));
			_this.desk.material = _this.cardMats[background];
			console.log(_this.desk.getVertexBuffer(BABYLON.VertexBuffer.UVKind).getData());
		};
		this.invalidate = function () {
			this.mycards.invalidate(this.scene, this.cardMats);
			this.hiscards.invalidate(this.scene, this.cardMats);
		};
	}

	if (typeof exports !== "undefined" && exports !== null) {
		exports.View = new View();
	}
	if (typeof window !== "undefined" && window !== null) {
		window.View = new View();
	} else if (!exports) {
		self.View = new View();
	}
}).call(this);
