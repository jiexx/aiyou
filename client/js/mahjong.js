var Property = (function () {
	function Property() {
		this.position = new BABYLON.Vector3(0, 0, 0);
		this.materials = null;
		this.isVisible = false;
		this.onClick = null;
	};
	Property.prototype.invalidate = function (stuff, data) {
		if(data == -1)
			stuff.set(this.materials[data], this.position.x, this.position.y, this.position.z, false);
		else
			stuff.set(this.materials[data], this.position.x, this.position.y, this.position.z, this.isVisible);
	};
	Property.prototype.set = function (mats, x, y, z, isVisible, onClick) {
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.isVisible = isVisible;
		this.materials = mats;
		this.onClick = onClick;
	};
	return Property;
})();
var PropSet = (function () {
	function PropSet(mats, count) {
		this.properties = new Array();
		this.materials = mats;
		for (var i = 0; i < count; i++) {
			this.properties.push(new Property());
		}
	};
	PropSet.prototype.init = function (state, xdelta, y, z, isVisible, onClick) {
		this.properties[state].set(this.materials, xdelta, y, z, isVisible, onClick);
	};
	PropSet.prototype.invalidate = function (state, stuff, data, sequence) {
		this.properties[state].invalidate(stuff, data);
		stuff.mesh.position.x = this.properties[state].position.x * sequence;
	};
	return PropSet;
})();
var Stuff = (function () {
	function Stuff(scene, name, size, that) {
		this.mesh = BABYLON.Mesh.CreatePlane(name, size, scene);
		this.mesh.layerMask = 5;
		this.mesh.isVisible = false;
		this.mesh.actionManager = new BABYLON.ActionManager(scene);
		this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
				var onClick = that.prop.properties[that.state].onClick;
				if (onClick != null)
					onClick(that);
			}));
	};
	Stuff.prototype.set = function (material, x, y, z, isVisible) {
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
		this.mesh.isVisible = isVisible;
		this.mesh.material = material;
	};
	return Stuff;
})();
var Desktop = (function () {
	function Desktop(scene) {
		var mat = new BABYLON.StandardMaterial('desktop', scene);
		mat.specularColor = new BABYLON.Color3(0, 0, 0);
		mat.diffuseColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
		this.stuff = new Stuff(scene, 'desktop', 500, this);
		this.stuff.set(mat, 0, 0, 10, true);
		this.prop = new PropSet(mat, 1);
		this.state = 0;
	};
	Desktop.prototype.init = function (x, y, z, isVisible, onClick) {
		this.prop.init(0, x, y, z, isVisible, onClick);
		this.stuff.set(this.prop.materials, x, y, z, true);
	};
	return Desktop;
})();
var Card = (function () {
	var INVALID = -1;
	var EMPTY1 = 0,	SHOW1 = 1,	UNFOCUSED1 = 2,	FOCUSED1 = 3,	DISCARD1 = 4;
	var EMPTY2 = 0,	BACK2 = 1,	SHOW2 = 2,	DISCARD2 = 3;
	function Card(scene, index, ps) {
		this.stuff = new Stuff(scene, '000' + index, 9, this);
		var mesh = this.stuff.mesh;
		mesh.scaling.x = 0.6;
		var uv = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
		uv[0] = 0.2; uv[2] = 0.8; uv[4] = 0.8; uv[6] = 0.2;
		mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);

		this.state = EMPTY1;
		this.prop = ps;
		this.data = INVALID;
		this.sequence = 0;
	};
	Card.INVALID = INVALID;
	
	Card.EMPTY1 = EMPTY1;
	Card.SHOW1 = SHOW1;
	Card.UNFOCUSED1 = UNFOCUSED1;
	Card.FOCUSED1 = FOCUSED1;
	Card.DISCARD1 = DISCARD1;
	
	Card.EMPTY2 = EMPTY2;
	Card.BACK2 = BACK2;
	Card.SHOW2 = SHOW2;
	Card.DISCARD2 = DISCARD2;
	Card.prototype.isEmpty = function () {
		return this.state == Card.EMPTY1;
	};
	Card.prototype.invalidate = function () {
		this.prop.invalidate(this.state, this.stuff, this.data, this.sequence);
	};
	Card.prototype.reset = function () {
		this.state = Card.EMPTY1;
		this.data = Card.INVALID;
		this.sequence = 0;
	};
	return Card;
})();

var CardGroup = (function () {
	var MAX = 15; // include one discard card;
	var STARTTIME = 0,	DISCARDTIME = 1,	DRAWTIME = 2;
	function CardGroup(scene, ps) {
		this.cards = new Array();
		this.drop = null;
		this.pick = null;
		this.state = STARTTIME;
		for (var i = 0; i < MAX; i++) {
			this.cards.push(new Card(scene, i, ps));
		}
	};
	CardGroup.MAX = MAX; 
	CardGroup.prototype.nextState = function (count){
		if (this.state == STARTTIME) {
			if (count == MAX - 2) {
				this.state = DRAWTIME;
				this.pick = this.cards[MAX - 2];
				this.drop = this.cards[MAX - 1];
			} else if (count == MAX - 1) {
				this.state = DISCARDTIME;
				this.pick = this.cards[MAX - 2];
				this.drop = this.cards[MAX - 1];
			} else {
				return false;
			}
		} else if (this.state == DISCARDTIME) {
			if (this.pick == null || this.pick.state != Card.EMPTY1) {
				this.state = DRAWTIME;
			} else {
				return false;
			}
		} else if (this.state == DRAWTIME) {
			if (this.pick != null && this.pick.state == Card.EMPTY1) {
				this.state = DISCARDTIME;
			} else {
				return false;
			}
		}
		return true;
	};
	CardGroup.prototype.restart = function() {
		this.drop = null;
		this.pick = null;
		this.state = STARTTIME;
	};
	CardGroup.prototype.reset = function (state, data) {
		var count = data.length;
		if (this.nextState(count)) {
			var i;
			for (i = 0; i < count; i++) {
				this.cards[i].state = state;
				this.cards[i].data = data[i];
			}
			for (i = count; i < MAX; i++) {
				this.cards[i].reset();
			}
		}
	};
	CardGroup.prototype.replace = function (src, dst) {
		for (var i = 0; i < MAX; i++) {
			if (this.cards[i].state == src)
				this.cards[i].state = dst;
		}
	};
	CardGroup.prototype.findState = function (index, state) {
		var i;
		for (i = index; i < MAX; i++) {
			if (state == this.cards[i].state)
				break;
		}
		if (i != MAX)
			return i;
		else
			return -1;
	};
	CardGroup.prototype.findBack = function (data) {
		var i;
		for (i = 0; i < DRAWINDEX; i++) {
			if (Card.BACK2 == this.cards[i].state)
				break;
		}
		if (i != MAX)
			return i;
		else
			return -1;
	};
	CardGroup.prototype.hisDiscard = function () {
		return this.drop;
	};
	CardGroup.prototype.hisDiscardPongci = function () {
		this.drop.state = Card.EMPTY1;
	};
	CardGroup.prototype.tryDraw = function (data) {
		if (this.state == DRAWTIME && this.nextState(0)) {
			this.pick.state = Card.UNFOCUSED1;
			this.pick.data = data;
			return true;
		}
		return false;
	};
	CardGroup.prototype.tryDiscard = function (that) {
		if (this.state == DISCARDTIME && this.nextState(0)) {
			this.drop.state = Card.DISCARD1;
			this.drop.data = that.data;
			this.pick = that;
			this.pick.state = Card.EMPTY1;
			return true;
		}
		return false;
	};
	CardGroup.prototype.tryPong = function (that) {
		var i = this.findState(0, Card.FOCUSED1);
		var j = this.findState(i + 1, Card.FOCUSED1);
		if (i > -1 && j > -1 && this.cards[i].data == that.data && this.cards[j].data == that.data) {
			if (this.state == DRAWTIME && this.nextState(0)) {
				this.pick.state = Card.SHOW1;
				this.pick.data = that.data;
				this.cards[i].state = Card.SHOW1;
				this.cards[j].state = Card.SHOW1;
				return true;
			}
		}
		return false;
	};
	CardGroup.prototype.eat = function (i, j, k) {
		var a;
		if (i > j) {
			a = i;	i = j;	j = a;
		}
		if (j > k) {
			a = k;	k = j;	j = a;
		}
		if (i > j) {
			a = i;	i = j;	j = a;
		}
		if (i + 1 == j && j + 1 == k)
			if ((i >= 8 && k <= 16) || (i >= 17 && k <= 25) || (i >= 26 && k <= 34))
				return true;
		return false;
	};
	CardGroup.prototype.tryCi = function (that) {
		var i = this.findState(0, Card.FOCUSED1);
		var j = this.findState(i + 1, Card.FOCUSED1);
		if (i > -1 && j > -1 && this.eat(this.cards[i].data, that.data, this.cards[j].data)) {
			if (this.state == DRAWTIME && this.nextState(0)) {
				this.pick.state = Card.SHOW1;
				this.pick.data = that.data;
				this.cards[i].state = Card.SHOW1;
				this.cards[j].state = Card.SHOW1;
				return true;
			}
		}
		return false;
	};
	CardGroup.prototype.discard = function (data) {
		if (this.state == DISCARDTIME && this.nextState(0)) {
			this.drop.state = Card.DISCARD2;
			this.drop.data = data;
			this.pick.state = Card.EMPTY1;
			return true;
		}
		return false;
	};
	CardGroup.prototype.draw = function () {
		if (this.state == DRAWTIME && this.nextState(0)) {
			this.pick.state = Card.BACK2;
			this.pick.data = 0;
			return true;
		}
		return false;
	};
	CardGroup.prototype.pongci = function (disc1, disc2, disc3) {
		if (this.state == DRAWTIME && this.nextState(0)) {
			this.pick.state = Card.BACK2;
			var i = this.findBack();
			this.cards[i].data = disc1;
			this.cards[i + 1].data = disc2;
			this.cards[i + 2].data = disc3;
			this.cards[i].state = Card.SHOW1;
			this.cards[i + 1].state = Card.SHOW1;
			this.cards[i + 2].state = Card.SHOW1;
			return true;
		}
		return false;
	};
	CardGroup.prototype.hisUpdate = function () {
		var c = 0,
		d = 0;
		this.cards.sort(function (a, b) {
			return a.data - b.data;
		});
		for (var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].state == Card.BACK2) {
				this.cards[i].sequence = c;
				c++;
			} else if (this.cards[i].state == Card.SHOW2) {
				this.cards[i].sequence = d;
				d++;

			}
			this.cards[i].invalidate();
		}
	};
	CardGroup.prototype.debug = function () {
		var debug = [];
		for (var i = 0; i < this.cards.length; i++) {
			if( this.cards[i].data > -1 ) {
				debug.push(this.cards[i].stuff.mesh.position.y);
				//debug.push(""+this.cards[i].state);
			}
		}
		console.log(debug);		
	};
	CardGroup.prototype.myUpdate = function () {
		var c = 0, d = 0;
		this.cards.sort(function (a, b) {
			return a.data - b.data;
		});
		for (var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].state == Card.FOCUSED1 || this.cards[i].state == Card.UNFOCUSED1) {
				this.cards[i].sequence = c;
				c++;
			} else if (this.cards[i].state == Card.SHOW1) {
				this.cards[i].sequence = d;
				d++;
			}
			this.cards[i].invalidate();
		}
	};
	return CardGroup;
})();
var ImageProp = (function () {
	function ImageProp(xsize, ysize, xper, yper, onClick) {
		this.sizex = xsize;
		this.sizey = ysize;
		this.perx = xper;
		this.pery = yper;
		this.onClick = onClick;
		this.obj = null;
		this.isVisible = true;
	};
	return ImageProp;
})();

var Picture = (function () {
	function Picture(src){
		this.src = src;
		this.prop = new Array();
	};
	Picture.prototype.add = function (xsize, ysize, xper, yper, onClick) {
		this.prop.push(new ImageProp(xsize, ysize, xper, yper, onClick));
	};
	Picture.prototype.show = function (isVisible) {
		var p;
		for(var key in this.prop){
			p = this.prop[key];
			p.isVisible = isVisible;
			if(p.obj != null){
				p.obj.setVisible(p.isVisible);
			}
		}
	};
	Picture.prototype.getMesh = function () {
		return this.prop[0].obj.mesh;
	}
	return Picture;
})();
var GuiLayer = (function () {
	function GuiLayer(scene) {
		var engine = scene.getEngine();
		var rect = scene.getEngine().getRenderingCanvasClientRect();
		var level = scene.getEngine().getHardwareScalingLevel();
		this.gui = new bGUI.GUISystem(scene, rect.width , rect.height );
		//this.gui.zoom = 0.05;
		this.gui.enableClick();
		this.txtObjs = new Array();
		this.asserts = new Array();
		this.img64Objs = 0;
	};
	GuiLayer.prototype.drawText = function (str, xper, yper, style, clr, onClick) {
		if (style == undefined || style == null)
			style = "16px Segoe UI";
		if (clr == undefined || clr == null)
			clr = "#cecb7a";
		if (onClick == undefined || onClick == null)
			onClick = null;
		var id = this.txtObjs.length;
		var obj = new bGUI.GUIText("" + id, 128, 32, {font : style,	text : str,	color : clr}, this.gui);
		obj.relativePosition(new BABYLON.Vector3(xper, yper, -1000));
		obj.scaling(new BABYLON.Vector3(128, 32, 1));
		obj.onClick = onClick;
		this.txtObjs.push(obj);
		return id;
	};
	GuiLayer.prototype.setTextVisible = function (index, isVisible) {
		var obj = this.txtObjs[index];
		if (obj != null);
			obj.setVisible(isVisible);
	};
	GuiLayer.prototype.dropText = function (index) {
		var obj = this.txtObjs[index];
		if (obj != null);
			obj.dispose();
		this.txtObjs[index] = null;
	};
	GuiLayer.prototype.draw64Image = function (src, xper, yper, xsize, ysize, onClick) {
		if (onClick == undefined || onClick == null)
			onClick = null;
		this.img64Objs ++;
		var id = this.img64Objs;
		var _this = this;
		var t = BABYLON.Texture.CreateFromBase64String(src, "" + id, this.gui._scene, false, true, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
				function () {
				var a = new bGUI.GUIPanel("" + id, t, null, _this.gui);
				a.relativePosition(new BABYLON.Vector3(xper, yper, 0));
				a.scaling(new BABYLON.Vector3(xsize, ysize, 1.0));
				a.onClick = onClick;
			});

		return id;
	};
	GuiLayer.prototype.addImage = function (src, xper, yper, xsize, ysize, onClick, anim) {
		if (onClick == undefined || onClick == null)
			onClick = null;
		var i;
		for(i = 0 ; i < this.asserts.length ; i ++) {
			if( this.asserts[i].src == src )
				break;
		}
		if( i < this.asserts.length ) {
			this.asserts[i].add(xsize, ysize, xper, yper, onClick);
		}else {
			var img = new Picture(src);
			img.add(xsize, ysize, xper, yper, onClick);
			this.asserts.push(img);
			i = this.asserts.length - 1;
		}
		return i;
	};
	GuiLayer.prototype.showImage = function (src, isVisible, anim) {
		var i;
		for(i = 0 ; i < this.asserts.length ; i ++) {
			if( this.asserts[i].src == src )
				break;
		}
		if( i < this.asserts.length ) {
			this.asserts[i].show(isVisible);
			if(isVisible) {
				var mesh = this.asserts[i].getMesh();
				if(anim != null) {
					mesh.animations.push(anim);
				}
				//scene.beginAnimation(mesh, 0, 30, false, 1, function(){
					//engine.stopRenderLoop();
				//});
			}
		}
	};
	GuiLayer.prototype.dropImage = function (index) {
		var len = asserts[index].prop.length;
		for(var j = 0 ; j < len ; j ++ ) {
			var obj = this.asserts[index].prop[j].obj;
			if (obj != null);
				obj.dispose();
			this.asserts[index].prop[j].obj = null;
		}
	};
	GuiLayer.prototype.draw = function () {
		var _this = this;
		var asserts = this.asserts;
		var loader = new BABYLON.AssetsManager(this.gui._scene);
		for (var i = 0 ; i < asserts.length ; i ++) {
			var img = loader.addTextureTask(""+i, './asserts/Mahjong/' + asserts[i].src + '.png');
			img.onSuccess = function (t) {
				var prop = asserts[t.name].prop;
				for(var j = 0 ; j < prop.length ; j ++ ){
					if(prop[j].obj == null) {
						var obj = new bGUI.GUIPanel("img_" + t.name + j, t.texture, null, _this.gui);
						obj.relativePosition(new BABYLON.Vector3(prop[j].perx, prop[j].pery, 0));
						obj.scaling(new BABYLON.Vector3(prop[j].sizex, prop[j].sizey, 1.0));
						obj.mask();
						obj.onClick = prop[j].onClick;
						obj.setVisible(prop[j].isVisible);
						prop[j].obj = obj;
					}
				}
			};
		}
		loader.onFinish = function () {
			setTimeout(function() {
				_this.gui._scene.render();
			}, 10);
		};
		loader.useDefaultLoadingScreen = false;
		loader.load();
	};
	return GuiLayer;
})();

var Layout = (function () {
	//'back'  card.data = 0
	var asserts = ['back', 'east', 'west', 'south', 'north', 'zhong', 'fa', 'bai', 'dot1', 'dot2', 'dot3', 'dot4', 'dot5', 'dot6', 'dot7', 'dot8', 'dot9',
		'Bamboo1', 'Bamboo2', 'Bamboo3', 'Bamboo4', 'Bamboo5', 'Bamboo6', 'Bamboo7', 'Bamboo8', 'Bamboo9',
		'Char1', 'Char2', 'Char3', 'Char4', 'Char5', 'Char6', 'Char7', 'Char8', 'Char9', ];
	//'who',	'draw',	'continue',	'exit',	'loss',	'win'];
	var EXIT = 0x10000003,	CONTINUE = 0x10000004,	DISCARD = 0x20000001,	DISCARD_PONG = 0x30000001,	DISCARD_CHI = 0x30000002,	DISCARD_DRAW = 0x30000003,	WHO = 0x50000001, FINAL = 0x50000003, SELFDRAWHO = 0x50000004;
	function Layout() {
		this.myCards = null;
		this.hisCards = null;
		this.mats = new Array(asserts.length);
		this.desktop = null;
		this.go = null;
		this.gui = null;
		this.msg = -1;
		this.engine = null;
		this.scene = null;
	}
	Layout.prototype.bind = function(go) {
		this.go = go;
	};
	Layout.prototype.create = function(canvas) {
		this.myCards = null;
		this.hisCards = null;
		this.mats = new Array(asserts.length);
		this.desktop = null;
		//this.go = null;
		this.gui = null;
		this.msg = -1;
		this.dealCard = Card.INVALID;
		this.userid = -1;
		
		this.engine = new BABYLON.Engine(canvas, true);
		this.reset();
		return this;
	};
	Layout.prototype.reset = function () {
		if(this.scene != null) {
			this.scene.dispose();
		}
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
		var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(3 * 14, 0, -100), this.scene);
		this.camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(3 * 14, 0, /*-70*/-150), this.scene);
		this.camera.layerMask = 5;
		
		this.init(this.scene);
		this.initLoadGUI(this.scene);
		for( var i = 0 ; i < this.scene.activeCameras.length ; i ++ ) {
			var camera = this.scene.activeCameras[i];
			camera.noRotationConstraint = true;
			camera.upVector = new BABYLON.Vector3(1, 0, 0);
		}
		var _this = this;
		this.scene.executeWhenReady(function () {
			_this.invalidate();
		});
	};
	Layout.prototype.getAnim = function() {
		var bounce = new BABYLON.Animation("bounce", "scaling.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var keys = []; 
		keys.push({
			frame: 0,
			value: 0.2//new BABYLON.Vector3(0.2, 0.2, 1.0)
		});
		keys.push({
			frame: 20,
			value: 1.2//new BABYLON.Vector3(1.2, 1.2, 1.0)
		});
		keys.push({
			frame: 30,
			value: 1.0//new BABYLON.Vector3(1.0, 1.0, 1.0)
		});
		bounce.setKeys(keys);
		return bounce;
	}
	Layout.prototype.initLoadGUI = function (scene) {
		this.gui = new GuiLayer(scene);
		this.msg = this.gui.drawText("等待对手...", 0.5, 0.5);
		this.gui.addImage("exit", 0.9, 0.1, 50.0, 50.0, this.exitOnClick);
		this.gui.draw();
	};
	Layout.prototype.initGUI = function (myAvator, hisAvator, myName, hisName, myChip, hisChip) {
		//this.scene.activeCamera.layerMask    = 5;
		if (this.msg != -1)
			this.gui.setTextVisible(this.msg, false);
		this.gui.drawText(myName, 0.15, 0.8);
		this.gui.drawText(hisName, 0.15, 0.1);
		this.gui.drawText(myChip, 0.15, 0.9);
		this.gui.drawText(hisChip, 0.15, 0.2);

		if(myAvator)
			this.gui.draw64Image(myAvator, 0.1, 0.8, 25.0, 25.0);
		if(hisAvator)
			this.gui.draw64Image(hisAvator, 0.1, 0.1, 25.0, 25.0);
		
		this.gui.addImage("draw", 0.7, 0.5, 50.0, 50.0, this.drawOnClick);
		this.gui.addImage("who", 0.8, 0.5, 50.0, 50.0, this.whoOnClick);
		this.gui.showImage("draw", false);
		this.gui.showImage("who", false);
		
		this.gui.addImage("win", 0.5, 0.5, 200.0, 200.0);
		this.gui.addImage("loss", 0.5, 0.5, 200.0, 200.0);
		this.gui.addImage("continue", 0.9, 0.1, 50.0, 50.0, this.resumeOnClick);
		this.gui.addImage("gold", 0.1, 0.9, 25.0, 25.0);
		this.gui.addImage("gold", 0.1, 0.2, 25.0, 25.0);
		
		this.gui.showImage("win", false);
		this.gui.showImage("loss", false);
		this.gui.showImage("continue", false);
		this.gui.draw();
		
		
	};
	Layout.prototype.init = function (scene) {

		var loader = new BABYLON.AssetsManager(scene);
		var _this = this;
		for (var i = 0 ; i < asserts.length ; i ++ ) {
			var img = loader.addTextureTask(""+i, './asserts/Mahjong/' + asserts[i] + '.png');
			img.onSuccess = function (t) {
				var k = parseInt(t.name);
				_this.mats[k] =  new BABYLON.StandardMaterial('00' + t.name, _this.scene);
				_this.mats[k].diffuseTexture = t.texture;
				_this.mats[k].diffuseTexture.hasAlpha = true;
				_this.mats[k].specularColor = new BABYLON.Color3(0, 0, 0);
			};
		}
		loader.onFinish = function () {
			var ps1 = new PropSet(_this.mats, 5);
			ps1.init(Card.EMPTY1, 0, 0, 0, false, null);
			ps1.init(Card.UNFOCUSED1, 6, -25, 0, true, _this.cardOnClick);
			ps1.init(Card.FOCUSED1, 6, -22, 0, true, _this.cardOnClick);
			ps1.init(Card.SHOW1, 6, -15, 0, true, null);
			ps1.init(Card.DISCARD1, 6 * 3, -5, 0, true, null);
			_this.myCards = new CardGroup(scene, ps1);
      
			var ps2 = new PropSet(_this.mats, 5);
			ps2.init(Card.EMPTY2, 0, 0, 0, false, null);
			ps2.init(Card.BACK2, 6, 25, 0, true, null);
			ps2.init(Card.DISCARD2, 6 * 3, 5, 0, true, _this.cardOnClick);
			ps2.init(Card.SHOW2, 6, 15, 0, true, null);
			_this.hisCards = new CardGroup(scene, ps2);
		};
		loader.useDefaultLoadingScreen = false;
		loader.load();
		
		this.desktop = new Desktop(scene);
		this.desktop.init(0, 0, 10, true, this.desktopOnClick);
	};
	Layout.prototype.instance = function () {
		return this;
	};
	Layout.prototype.exitOnClick = function (that) {
		var _this = Mahjong.instance();
		_this.notify(FINAL, this.userid);
		_this.invalidate();
	};
	Layout.prototype.resumeOnClick = function (that) {
		var _this = Mahjong.instance();
		_this.gui.showImage("who", false);
		_this.gui.showImage("win", false);
		_this.gui.showImage("loss", false);
		_this.gui.showImage("continue", false);
		_this.gui.showImage("draw", false);

		_this.myCards.reset(Card.EMPTY1, []);
		_this.hisCards.reset(Card.EMPTY2, []);
		if (_this.msg != -1)
			_this.gui.setTextVisible(_this.msg, true);
		_this.notify(CONTINUE, this.userid);
		_this.invalidate();
	};
	Layout.prototype.whoOnClick = function (that) {
		var _this = Mahjong.instance();
		_this.gui.showImage("who", false);
		_this.gui.showImage("win", true);
		_this.gui.showImage("continue", true);
		_this.gui.showImage("draw", false);
		var d = _this.hisCards.hisDiscard().data
		if (_this.myCards.tryDraw(d)) { 
			_this.hisCards.hisDiscardPongci();
		}
		_this.notify(WHO, d);
		_this.invalidate();
	};
	Layout.prototype.drawOnClick = function (that) {  //bGUI, if breakpoint, BABYLON.ActionManager.OnPickUpTrigger will be failed, this function will not be called
		var _this = Mahjong.instance();
		_this.draw(_this.dealCard);
		_this.invalidate();
	};
	Layout.prototype.desktopOnClick = function (that) {
		var _this = Mahjong.instance();
		_this.myCards.replace(Card.FOCUSED1, Card.UNFOCUSED1);
		_this.invalidate();
	};
	Layout.prototype.cardOnClick = function (that) {
		var _this = Mahjong.instance();
		if (that.state == Card.UNFOCUSED1) {
			that.state = Card.FOCUSED1;
		} else if (that.state == Card.FOCUSED1) {
			if (_this.myCards.tryDiscard(that)){
				_this.gui.showImage("who", false);
				_this.notify(DISCARD, that.data);
			}else if (_this.myCards.tryPong(_this.hisCards.hisDiscard())){
				_this.hisCards.hisDiscardPongci();
				_this.notify(DISCARD_PONG, that.data);
			}else if (_this.myCards.tryCi(_this.hisCards.hisDiscard())){
				_this.hisCards.hisDiscardPongci();
				_this.notify(DISCARD_CHI, that.data);
			}
		}
		_this.invalidate();
	};
	Layout.prototype.draw = function (data) {
		if (this.myCards.tryDraw(data)) {  // try for my
			this.gui.showImage("draw", false);
			this.gui.showImage("who", false);
			this.notify(DISCARD_DRAW, data);
		}
	};

	Layout.prototype.heDiscard = function (data, dealCard) { // only for his
		var _this = this;
		_this.dealCard = dealCard;
		this.scene.executeWhenReady(function () {
			_this.hisCards.discard(data);
			_this.gui.showImage("draw", true);
			_this.invalidate();
		});
	};
	Layout.prototype.heDraw = function () { // only for his
		var _this = this;
		this.scene.executeWhenReady(function () {
			_this.hisCards.draw();     //no try for his
			_this.invalidate();
		});
	};
	Layout.prototype.hePongci = function (disc1, disc2, disc3) { // only for his
		this.hisCards.pongci(disc1, disc2, disc3);
		this.invalidate();
	};

	Layout.prototype.notify = function (cmd, id) {
		console.log("layout notify: " + cmd + " " + id);
		if (this.go != null)
			this.go.command(cmd, id);
	};
	Layout.prototype.showHand = function (hiscards) {
		var _this = this;
		this.scene.executeWhenReady(function () {
			_this.hisCards.reset(Card.SHOW1, hiscards);
			_this.invalidate();
		});
	};
	Layout.prototype.win = function () {
		var _this = this;
		this.scene.executeWhenReady(function () {
			_this.gui.showImage("who", true);
			_this.invalidate();
		});
	};
	Layout.prototype.loss = function (hiscards) {
		var _this = this;
		this.scene.executeWhenReady(function () {
			_this.gui.showImage("loss", true, null/*_this.getAnim()*/);
			_this.gui.showImage("who", false);
			_this.gui.showImage("continue", true);
			_this.gui.showImage("draw", false);
			_this.myCards.hisDiscardPongci();
			_this.hisCards.reset(Card.SHOW1, hiscards);
			_this.invalidate();
		});
	};
	Layout.prototype.deal = function (cards) {
		if(cards != undefined && cards != null) {
			var _this = this;
			_this.gui.setTextVisible(_this.msg, false);
			_this.scene.executeWhenReady(function () {	
				_this.myCards.restart();
				_this.myCards.reset(Card.UNFOCUSED1, cards);
				console.log(cards);
				_this.hisCards.restart();
				if (cards.length == CardGroup.MAX - 1) {
					_this.hisCards.reset(Card.BACK2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				} else if (cards.length == CardGroup.MAX - 2) {
					_this.hisCards.reset(Card.BACK2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
				}
				_this.invalidate();
			});
		}
	};
	Layout.prototype.invalidate = function () {
		this.myCards.myUpdate();
		this.hisCards.hisUpdate();
		this.camera.layerMask = 5;
		this.scene.render();
	};
	return Layout;
})();
(function () {
	if (typeof exports !== "undefined" && exports !== null) {
		exports.Mahjong = new Layout();
	}
	if (typeof window !== "undefined" && window !== null) {
		window.Mahjong = new Layout();
	} else if (!exports) {
		self.Mahjong = new Layout();
	}
}).call(this);