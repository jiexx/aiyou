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
			'back',
			'draw',
			'who',
			'continue',
			'exit',
			'loss',
			'win');
	//var transparent = tags.length;
	var
	tback = tags.length - 7,
	tdraw = tags.length - 6,
	twho = tags.length - 5,
	tcont = tags.length - 4,
	texit = tags.length - 3,
	tloss = tags.length - 2,
	twin = tags.length - 1,
	tbg = tags.length + 1;
	var INVALIDCARD = tags.length,
	CARDSIZE = 9;
	var
	EXIT = 0x10000003,
	CONTINUE = 0x10000004,
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	DISCARD_DRAW = 0x30000003,
	WHO = 0x50000001;

	var Data = function () {
		this.cards = new Array();
		this.showcards = new Array();
		this.discard = INVALIDCARD;
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
	function createOO(scene, name, x, y, z, needfix, size) {
		var oo = BABYLON.Mesh.CreatePlane('draw', size, scene);
		oo.position.x = x;
		oo.position.y = y;
		oo.position.z = z;
		oo.isVisible = false;
		oo.actionManager = new BABYLON.ActionManager(scene);
		if (needfix)
			fix(oo);
		return oo;
	}
	function chi(i, j, k) {
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
	function Cards() {
		this.cards = new Array();
		this.card_y = 0;
		this.showcards = new Array();
		this.pump = new Array();
		this.discard = null;
		this.data = new Data();
		this.needUpdate = true;
		this.pumpRestore = function () {
			for (var k in this.pump)
				this.cards[this.pump[k]].position.y = this.card_y;
			this.pump.splice(0, this.pump.length);
			this.needUpdate = true;
		}
		this.countOfCard = function () {
			var i,
			count = 0;
			for (i = 0; i < this.data.cards.length; i++) {
				if (this.data.cards[i] != INVALIDCARD)
					count++;
			}
			for (i = 0; i < this.data.showcards.length; i++) {
				if (this.data.cards[i] != INVALIDCARD)
					count++;
			}
			return count;
		}
		this.disCard = function (pos, no) {
			var i;
			for (i = pos; i < this.data.cards.length; i++) {
				this.data.cards[i] = this.data.cards[i + 1];
			}
			if (i == this.data.cards.length)
				this.data.cards[i - 1] = INVALIDCARD;

			this.data.discard = no;
			this.needUpdate = true;
		}
		this.pongchi = function (i, j, k, pos1, pos2) {
			this.data.showcards.push(i);
			this.data.showcards.push(j);
			this.data.showcards.push(k);

			this.data.cards[pos1] = INVALIDCARD;
			this.data.cards[pos2] = INVALIDCARD;
			this.data.cards.sort(function (a, b) {
				return a - b
			});

			this.needUpdate = true;
		}
		this.layout = function (scene, _that, card_y, showcard_y, discard_y, isCardCB, isDiscardCB) {
			var _this = this;
			_this.card_y = card_y;
			var i;
			for (i = 0; i < MAX; i++) {
				_this.cards[i] = BABYLON.Mesh.CreatePlane('000' + i, CARDSIZE, scene);
				_this.cards[i].position.x = 6 * i;
				_this.cards[i].position.y = card_y;
				_this.cards[i].position.z = 0;
				_this.cards[i].scaling.x = 0.6
				_this.cards[i].layerMask = 1;
				//_this.cards[i].rotation.x = Math.PI/12;
				fix(_this.cards[i]);
				if (isCardCB) {
					_this.cards[i].actionManager = new BABYLON.ActionManager(scene);
					_this.cards[i].actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // chu card
							if (evt.source.material != null) {
								var pos = parseInt(evt.source.name, 10);
								var no = parseInt(evt.source.material.name, 10);
								if (evt.source.position.y == card_y) {
									//----------------------------pump------------------------
									evt.source.position.y += 3;
									_this.pump.push(pos);
								} else if (evt.source.position.y == card_y + 3 && no != INVALIDCARD) {
									//----------------------------discard------------------------
									if (_this.pump.length == 1 && _this.countOfCard() == MAX-1) {
										evt.source.position.y = card_y;
										_this.disCard(pos, no);
										_this.pumpRestore();
										_that.command(DISCARD, no);
									} else {
										_that.warning();
										evt.source.position.y = _this.card_y;
										_this.pump.splice(_this.pump.indexOf(pos), 1);
									}
								}
								_that.invalidate();
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
				_this.showcards[i].layerMask = 1;
				fix(_this.showcards[i]);
			}
			_this.discard = BABYLON.Mesh.CreatePlane('discard', CARDSIZE, scene);
			_this.discard.position.x = 6 * 3;
			_this.discard.position.y = discard_y;
			_this.discard.position.z = 0;
			_this.discard.scaling.x = 0.6
			_this.discard.layerMask = 1;
			fix(_this.discard);
			if (isDiscardCB) {
				_this.discard.actionManager = new BABYLON.ActionManager(scene);
				_this.discard.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { //chi card/pong card
						if (evt.source.material != null) {
							var no = parseInt(evt.source.material.name, 10);
							//----------------------------multi draw------------------------
							var that = _that.mycards;
							if (that != null && that.pump.length == 2) {
								var p0 = parseInt(that.cards[that.pump[0]].material.name, 10);
								var p1 = parseInt(that.cards[that.pump[1]].material.name, 10);
								if (p0 == p1 && p1 == no) {
									_that.command(DISCARD_PONG, no);
									that.pongchi(p0, p1, no, that.pump[0], that.pump[1]);
									that.pumpRestore();
									_that.disableDraw();
									_this.data.discard = INVALIDCARD;
									_this.needUpdate = true;
								} else if (chi(p0, p1, no)) {
									_that.command(DISCARD_CHI, no);
									that.pongchi(p0, p1, no, that.pump[0], that.pump[1]);
									that.pumpRestore();
									_that.disableDraw();
									_this.data.discard = INVALIDCARD;
									_this.needUpdate = true;
								} else {
									_that.warning();
								}
							} else {
								_that.warning();
							}
							_that.invalidate();

						}
					}));
			}
		}
		this.invalidate = function (scene, materials) {
			if (this.needUpdate) {
				var i = 0,
				key;
				for (key in this.data.cards) {
					this.cards[i].material = materials[this.data.cards[key]];
					i++;
				}
				for (i = this.data.cards.length; i < MAX; i++) {
					this.cards[i].material = materials[INVALIDCARD];
				}
				i = 0;
				for (key in this.data.showcards) {
					this.showcards[i].material = materials[this.data.showcards[key]];
					i++;
				}
				for (i = this.data.showcards.length; i < MAX; i++) {
					this.showcards[i].material = materials[INVALIDCARD];
				}
				this.discard.material = materials[this.data.discard];
				this.needUpdate = false;
			}
		}
		return this;
	};

	function Buttons() {
		this.draw = null;
		this.who = null;
		this.resume = null; // continue
		this.exit = null;
		//this.ai = null;
		this.yo = null;
		this.reset = function () {
			this.draw.isVisible = false;
			this.who.isVisible = false;
			this.resume.isVisible = false;
			this.exit.isVisible = false;
			//this.ai.isVisible = false;
			this.yo.isVisible = false;
			this.draw.isVisible = false;
		}
		this.layout = function (scene, that) {
			var _this = this;
			_this.draw = createOO(scene, 'draw', 6 * (MAX - 5), 0, 0, true, CARDSIZE);
			this.draw.isVisible = true;
			//_this.draw.rotation.x = Math.PI*2;
			//----------------------------single draw------------------------
			_this.draw.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					if (that.cardDraw != INVALIDCARD && that.mycards.data.cards.length == MAX - 1) {
						that.mycards.data.cards[MAX - 1] = that.cardDraw;
						that.mycards.data.cards.sort(function (a, b) {
							return a - b
						});
						that.mycards.needUpdate = true;
						that.mycards.pumpRestore();
						that.disableDraw();
						that.command(DISCARD_DRAW, 0);
					} else {
						that.warning();
					}
					that.invalidate();
				}));
			_this.draw.material = that.cardMats[tback];
			console.log(_this.draw.getVertexBuffer(BABYLON.VertexBuffer.PositionKind).getData());

			_this.who = createOO(scene, 'who', 6 * (MAX - 6), 0, 0, true, CARDSIZE);
			_this.who.material = that.cardMats[twho];
			_this.who.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					/*if (that.isWinning) {
						//_this.ai.isVisible = true;
						//_this.ai.material = that.cardMats[tai];
						_this.yo.isVisible = true;
						_this.yo.material = that.cardMats[twin];

						_this.resume.isVisible = true;
						_this.exit.isVisible = true;
					}
					_this.who.isVisible = false;
					_this.draw.isVisible = false;
					that.hiscards.needUpdate = true;
					that.hiscards.data.cards = that.tmp;*/
					that.command(WHO, 0);
					//that.invalidate();
				}));

			//----------------------------for who------------------------
			_this.resume = createOO(scene, 'resume', 6 * 12, 10, 2, true, CARDSIZE - 3);
			_this.resume.material = that.cardMats[tcont];
			_this.resume.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
					_this.reset();
					that.reset();
					that.command(CONTINUE, 0);
					that.invalidate();
				}));

			_this.exit = createOO(scene, 'exit', 6 * 12, -10, 2, true, CARDSIZE - 3);
			_this.exit.material = that.cardMats[texit];
			_this.exit.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					_this.reset();
					that.reset();
					that.command(EXIT, 0);
					that.invalidate();
				}));

			//_this.ai = createOO(scene, 'ai', 6 * 3, 0, 2, false, CARDSIZE * 4);

			_this.yo = createOO(scene, 'yo', 6 * 7, 0, 3, false, CARDSIZE * 4);
		}
	};

	function View() {
		this.cardMats = new Array();
		this.mycards = new Cards();
		this.hiscards = new Cards();
		this.desk = null;
		this.buttons = new Buttons();
		this.isWinning = null;
		this.tmp = null;
		this.cardDraw = INVALIDCARD; //invalid card
		this.canvas = null;
		this.engine = null;
		this.scene = null;
		this.go = null;
		this.gui = null;
		this.myAvator = null;
		this.hisAvator = null;
		this.myName = null;
		this.hisName = null;
		this.myChip = null;
		this.hisChip = null;
		//this.data = new Data();

		// Resize
		//window.addEventListener("resize", function () {
		//	this.engine.resize();
		//});
		this.reset = function () {
			this.cardDraw = INVALIDCARD;
			this.mycards.data.cards.splice(0,this.mycards.data.cards.length);
			this.mycards.needUpdate = true;
			this.hiscards.data.cards.splice(0,this.hiscards.data.cards.length);
			this.hiscards.needUpdate = true;
			this.buttons.reset();
		}
		this.roundDealcards = function (cards) {
			this.mycards.data.cards = cards;
			this.hiscards.data.cards = new Array();
			var num = MAX;
			if (cards.length == MAX) {
				num--;
			}/*else {
				this.enableDraw();
			}*/
			this.disableDraw();
			for (var i = 0; i < num; i++)
				this.hiscards.data.cards.push(tback);
			this.mycards.needUpdate = true;
			this.hiscards.needUpdate = true;			
		}
		this.enableDraw = function (dealcard) {
			this.cardDraw = dealcard;
			this.buttons.draw.isVisible = true;
			this.buttons.draw.material = this.cardMats[tdraw];
		}
		this.disableDraw = function () {
			this.cardDraw = INVALIDCARD;
			this.buttons.draw.isVisible = true;
			this.buttons.draw.material = this.cardMats[INVALIDCARD];
		}
		this.hePongchi = function (pongchi) {
			this.disableDraw();
			this.hiscards.data.discard = INVALIDCARD;
			if (pongchi != null && pongchi.length == 3) {
				this.hiscards.data.showcards.push(pongchi);
			}
			this.hiscards.needUpdate = true;	
		};
		this.heDiscard = function (dealcard, hediscard) {
			console.log("disCard " + hediscard);
			this.enableDraw(dealcard);
			this.hiscards.data.discard = hediscard;
			if (this.hiscards.data.length == MAX) {
				this.hiscards.data.cards[MAX] = INVALIDCARD;
			}
			this.hiscards.needUpdate = true;	
		};
		this.whohint = function (isWinning) {
			this.buttons.who.isVisible = isWinning;
		};
		this.who = function (hiscards, isWinning) {
			this.isWinning = isWinning;
			if (isWinning) {
				//this.buttons.who.isVisible = true;
				//this.enableDraw(dealcard);
				//this.tmp = hiscards;
				var _this = this.buttons;
				_this.who.isVisible = false;
				_this.draw.isVisible = false;
				_this.yo.isVisible = true;
				_this.yo.material = this.cardMats[twin];
				
				_this.resume.isVisible = true;
				_this.exit.isVisible = true;
				this.hiscards.data.cards = hiscards;
			}else {
				var _this = this.buttons;
				_this.who.isVisible = false;
				_this.draw.isVisible = false;
				_this.yo.isVisible = true;
				_this.yo.material = this.cardMats[tloss];
				
				_this.resume.isVisible = true;
				_this.exit.isVisible = true;
				this.hiscards.data.cards = hiscards;
			}
			
		};
		this.clean = function (canvas) {
			if( this.engine != null ) {
				this.engine.dispose();
			}
			if( this.gui != null ) {
				this.gui.dispose();
			}
		};
		this.isReady = function () {
			for (var key in tags)
				if (!this.cardMats[key].diffuseTexture.isReady())
					return false;
			return true;
		};
		this.create = function (canvas) {
			this.canvas = canvas;
			this.engine = new BABYLON.Engine(canvas, true);
			this.scene = new BABYLON.Scene(this.engine);
			this.scene.clearColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
			var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(3 * MAX, 0, -100), this.scene);
			var camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(3 * MAX, 0, -70), this.scene);
			this.scene.activeCamera.layerMask = 1;
			//var camera = new BABYLON.ArcRotateCamera('Camera', 1, .8, 10, new BABYLON.Vector3(0, 0, 0), scene);
			this.gui = new bGUI.GUISystem(this.scene, 1200, 780);
			//this.layout();
			//this.layoutGUI();

			//this.scene.activeCamera.attachControl(canvas);

			/*var _this = this;
			var timer = setInterval(function () {
					looper()
				}, 1000);
			function looper() {
				if (_this.isReady()) {
					_this.invalidate();
					clearInterval(timer);
				}
			}*/
		};
		this.loadingGUI = function () {
			var gui = this.gui;
			//this.scene.activeCamera.layerMask    = 1;
			var txt = new bGUI.GUIText("myName", 512, 32, {font:"16px Segoe UI", text:"等待对手...", color:"#cecb7a"}, gui);
            txt.relativePosition(new BABYLON.Vector3(0.5, 0.5, -1000));
			this.scene.render();
		}
		this.layoutGUI = function (myAvator,hisAvator,myName,hisName,myChip,hisChip) {
			var gui = this.gui;
			//http://temechon.github.io/bGUI/ https://doc.babylonjs.com/search?q=gui
			var a1 = BABYLON.Texture.CreateFromBase64String(myAvator, "myAvator", this.scene);
			var a2 = BABYLON.Texture.CreateFromBase64String(hisAvator, "hisAvator", this.scene);
			this.myAvator = new bGUI.GUIPanel("myAvator", a1, null, gui);
            this.myAvator.relativePosition(new BABYLON.Vector3(0.1, 0.1, -1000));
			this.hisAvator = new bGUI.GUIPanel("hisAvator", a2, null, gui);
            this.hisAvator.relativePosition(new BABYLON.Vector3(0.1, 0.85, -1000));
			
			this.myName = new bGUI.GUIText("myName", 32, 128, {font:"20px Segoe UI", text:myName, color:"#cecb7a"}, gui);
            this.myName.relativePosition(new BABYLON.Vector3(0.15, 0.1, -1000));
			this.hisName = new bGUI.GUIText("hisName", 32, 128, {font:"20px Segoe UI", text:hisName, color:"#cecb7a"}, gui);
            this.hisName.relativePosition(new BABYLON.Vector3(0.15, 0.85, -1000));
			
			var myChipIcon = new bGUI.GUIPanel("myChipIcon", new BABYLON.Texture('./asserts/Mahjong/gold.png', this.scene), null, gui);
            myChipIcon.relativePosition(new BABYLON.Vector3(0.1, 0.2, -1000));
			myChipIcon.scaling(new BABYLON.Vector3(0.25, 0.25, 0));
			var hisChipIcon = new bGUI.GUIPanel("hisChipIcon", new BABYLON.Texture('./asserts/Mahjong/gold.png', this.scene), null, gui);
            hisChipIcon.relativePosition(new BABYLON.Vector3(0.1, 0.9, -1000));
			hisChipIcon.scaling(new BABYLON.Vector3(0.25, 0.25, 0));
			
			this.myChip = new bGUI.GUIText("myChip", 32, 128, {font:"20px Segoe UI", text:myChip, color:"#cecb7a"}, gui);
            this.myChip.relativePosition(new BABYLON.Vector3(0.15, 0.2, -1000));
			this.hisChip = new bGUI.GUIText("hisChip", 32, 128, {font:"20px Segoe UI", text:hisChip, color:"#cecb7a"}, gui);
            this.hisChip.relativePosition(new BABYLON.Vector3(0.15, 0.9, -1000));			
		};
		this.instance = function(onLoaded) {
			/*var _this = this;
			this.scene.executeWhenReady(function () {
				_this.invalidate();
				if( onLoaded != undefined && onLoaded != null )
					onLoaded();
			});*/
			return this;
		};
		this.layout = function () {
			var _this = this;
			_this.cardMats[INVALIDCARD] = new BABYLON.StandardMaterial('00' + INVALIDCARD, _this.scene);
			//_this.cardMats[transparent].specularColor = new BABYLON.Color3(0, 0, 0);
			_this.cardMats[INVALIDCARD].alpha = 0.0;
			for (var key in tags) {
				_this.cardMats[key] = new BABYLON.StandardMaterial('00' + key, _this.scene);
				_this.cardMats[key].diffuseTexture = new BABYLON.Texture('./asserts/Mahjong/' + tags[key] + '.png', _this.scene /*, true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE, function () {
						_this.scene.render();
						}*/
					);
				_this.cardMats[key].diffuseTexture.hasAlpha = true;
				_this.cardMats[key].specularColor = new BABYLON.Color3(0, 0, 0);
			}
			_this.cardMats[tbg] = new BABYLON.StandardMaterial('00' + tbg, _this.scene);
			_this.cardMats[tbg].specularColor = new BABYLON.Color3(0, 0, 0);
			//_this.cardMats[tbg].specularPower = 100;
			_this.cardMats[tbg].diffuseColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);

			_this.mycards.layout(_this.scene, this, -25, -15, -5, true, false);
			_this.hiscards.layout(_this.scene, this, 25, 15, 5, false, true);

			_this.buttons.layout(_this.scene, this);
 
			_this.desk = BABYLON.Mesh.CreatePlane('desk', 500, _this.scene);
			_this.desk.position.x = 0;
			_this.desk.position.y = 0;
			_this.desk.position.z = 10;
			_this.desk.layerMask = 1;
			//_this.draw.rotation.x = Math.PI*2;
			//fix(_this.desk);
			//----------------------------undiscard------------------------
			_this.desk.actionManager = new BABYLON.ActionManager(_this.scene);
			_this.desk.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) { // draw card
					if (_this.mycards.pump.length != 0) {
						_this.mycards.pumpRestore();
					}
					_this.invalidate();
				}));
			_this.desk.material = _this.cardMats[tbg];
			console.log(_this.desk.getVertexBuffer(BABYLON.VertexBuffer.UVKind).getData());
		};
		this.invalidate = function () {
			this.mycards.invalidate(this.scene, this.cardMats);
			this.hiscards.invalidate(this.scene, this.cardMats);
			this.scene.render();
		};
		this.attach = function (g) {
			this.go = g;
		}
	}
	View.prototype.warning = function () {
		console.log("warning ");
	};
	View.prototype.command = function (cmd, cardid) {
		console.log("command " + cmd + " " + cardid);
		this.go.command(cmd, cardid);
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
