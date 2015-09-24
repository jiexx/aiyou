var Property = (function () {
	function Property() {
		this.position = null;
		this.materials = null;
		this.isVisible = false;
		this.data = -1;
	};
	Property.prototype.invalidate = function (mesh, data) {
		mesh.position.x = this.position.x;
		mesh.position.y = this.position.y;
		mesh.position.z = this.position.z;
		mesh.isVisible = this.isVisible;
		if( data > -1 ) {
			mesh.material = this.materials[data];
		}
	};
	Property.prototype.set = function (mats, x, y, z, isVisible) {
		this.position.x = x;
		this.position.y = y;
		this.position.z = z;
		this.isVisible = isVisible;
		this.materials = mats;
	};
	return Property;
})();
var Stuff = (function () {
	function Stuff(scene, name, size, onClick, that) {
		this.mesh = BABYLON.Mesh.CreatePlane(name, size, scene);
		this.mesh.layerMask = 1;
		if (onClick != null) {
			this.mesh.actionManager = new BABYLON.ActionManager(scene);
			this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
					onClick(that);
				}));
		}
	};
	Stuff.prototype.set = function (material, x, y, z) {
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
		this.mesh.material = material;
	};
	return Stuff;
})();
var Card = (function () {
	var SHOW1 = 0, UNFOCUSED1 = 1, FOCUSED1 = 2, DISCARD1 = 3;
	var BACK2 = 0, SHOW2 = 1, DISCARD2 = 2;
	function Card(scene, index, count, onClick) {
		this.stuff = new Stuff(scene, '000' + index, 9, onClick, this);
		
		var mesh = this.stuff.mesh;
		mesh.scaling.x = 0.6
		var uv = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
		uv[0] = 0.2; uv[2] = 0.8; uv[4] = 0.8; uv[6] = 0.2;
		mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);
		
		this.state = UNFOCUSED;
		this.properties = new Array(count);
		this.data = -1;
	};
	Card.prototype.invalidate = function () {
		this.properties[this.state].invalidate(this.stuff.mesh, this.data);
	};
	return Card;
})();

var CardGroup = (function () {
	var MAX = 15;
	function CardGroup(scene, mats, count, onClick) {
		this.cards = new Array();
		this.material = mats;
		this.xdelta = 0;
		this.pump = new Array();
		this.show = new Array();
		for (var i = 0; i < MAX; i++) {
			var card = new Card(scene, i, count, onClick);
			this.cards.push(card2);
		}
	};
	CardGroup.prototype.init1 = function (state, xdelta, y, z, isVisible) {
		this.xdelta = xdelta;
		for (var i = 0; i < MAX; i++) {
			this.cards[i].properties[state].set(this.material, xdelta * i, y, z, isVisible);
		}
	};
	CardGroup.prototype.init2 = function (state, x, y, z, isVisible) {
		for (var i = 0; i < MAX; i++) {
			this.cards[i].properties[state].set(this.material, x, y, z, isVisible);
		}
	};
	CardGroup.prototype.resetState = function (state) {
		for (var i = 0; i < MAX; i++) {
			this.cards[i].state = state;
		}
	};
	CardGroup.prototype.resetData = function (data) {
		for (var i = 0; i < MAX; i++) {
			this.cards[i].data = data;
		}
	};
	CardGroup.prototype.setStateByArray = function (a) {
		if( a.length != MAX )
			return;
		for (var i = 0; i < MAX; i++) {
			this.cards[i].state = a[i];
		}
	};
	CardGroup.prototype.setDataByArray = function (a) {
		if( a.length != MAX )
			return;
		for (var i = 0; i < MAX; i++) {
			this.cards[i].data = a[i];
		}
	};
	CardGroup.prototype.hasPong = function (data) {
		this.pump.splice(0,this.pump.length);
		for (var key in this.cards) {
			if( this.cards[key].state == Card.FOCUSED1 && this.cards[key].data == data ) 
				this.pump.push(this.cards[key]);
		}
		return this.pump.length == 2;
	};

	CardGroup.prototype.hasChi = function (data) {
		this.pump.splice(0,this.pump.length);
		for (var key in this.cards) {
			if( this.cards[key].state == Card.FOCUSED1 ) 
				this.pump.push(this.cards[key]);
		}
		if( this.pump.length == 2 ) {
			if( this.pump[0].data - 1 == data && data == this.pump[1].data + 1 )
				return true;
		}
		return false;
	};
	CardGroup.prototype.pong = function () {
		for( var key in this.pump ) {
			this.pump[key].state = Card.SHOW1;
		}
		var card = new Card(scene, cards.length, 1, null);
		card.properties[Card.SHOW1].set(mat, 0, y, z, isVisible);
		this.cards.push(card2);
	};
	CardGroup.prototype.chi = function () {
		for( var key in this.pump ) {
			this.pump[key].state = Card.SHOW1;
		}
	};
	CardGroup.prototype.hasFull = function () {
		var c = 0;
		for (var key in this.cards) {
			if( this.cards[key].state != Card.DISCARD1 ) 
				c ++;
		}
		return c == MAX - 1;  //include discard card in desktop
	};
	CardGroup.prototype.getDiscard = function () {
		for (var key in this.cards) {
			if( this.cards[key].state == Card.DISCARD2 ) 
				return this.cards[key];
		}
		return null;
	};
	CardGroup.prototype.invalidate = function (show, unfocused, focus) {
		var c = 0, d = 0;
		for (var i = 0 ; i < this.cards.length ; i ++ ) {
			var state = this.cards[i].state;
			if( state == show ) {
				this.cards[i].properties[state].position.x = this.xdelta * c;
				c ++;
			}
			else if( state == unfocused || state == focus ) {
				this.cards[i].properties[state].position.x = this.xdelta * d;
				d ++;
			}
			this.cards[i].invalidate();
		}
	};
	return CardGroup;
})();

var Layout = (function () {
	
	var asserts = ['back', 'east', 'west', 'south', 'north', 'zhong', 'fa', 'bai', 'dot1', 'dot2', 'dot3', 'dot4', 'dot5', 'dot6', 'dot7', 'dot8', 'dot9',
		'Bamboo1', 'Bamboo2', 'Bamboo3', 'Bamboo4', 'Bamboo5', 'Bamboo6', 'Bamboo7', 'Bamboo8', 'Bamboo9',
		'Char1', 'Char2', 'Char3', 'Char4', 'Char5', 'Char6', 'Char7', 'Char8', 'Char9', ];
	//'who',	'draw',	'continue',	'exit',	'loss',	'win'];
	var	EXIT = 0x10000003, CONTINUE = 0x10000004, DISCARD = 0x20000001, DISCARD_PONG = 0x30000001, DISCARD_CHI = 0x30000002, DISCARD_DRAW = 0x30000003, WHO = 0x50000001;
	function Layout(go) {
		this.myCards = null;
		this.hisCards = null;
		this.mats = new Array();
		this.desktop = null;
		this.go = go;
		this.init();
	}
	Layout.prototype.initGUI = function (scene) {
	}
	Layout.prototype.init = function (scene) {
		var loader = new BABYLON.AssetsManager(scene);
		var _this = this;
		for (var key in asserts) {
			var img = loader.addTextureTask(key, './asserts/Mahjong/' + asserts[key] + '.png');
			img.onSuccess = function (t) {
				_this.mats[key] = t.texture;
				_this.mats[key].diffuseTexture.hasAlpha = true;
				_this.mats[key].specularColor = new BABYLON.Color3(0, 0, 0);
			};
		});
		loader.onFinish = function () {
			_this.myCards = new CardGroup(scene, _this.mats, 5, this.cardOnClick);
			_this.myCards.init1(Card.UNFOCUSED1, 6, -25, 0, true);
			_this.myCards.init1(Card.FOCUSED1, 6, -22, 0, true);
			_this.myCards.init1(Card.SHOW1, 6, -15, 0, true);
			_this.myCards.init2(Card.DISCARD1, 6 * 3, -5, 10, false);
			
			_this.hisCards = new CardGroup(scene, _this.mats, 4, null);
			_this.hisCards.init1(Card.BACK2, _this.mats, 6, 25, 0, true);
			_this.hisCards.init1(Card.SHOW2, _this.mats, 6, 15, 0, true);
			_this.hisCards.init2(Card.DISCARD2, _this.mats, 6 * 3, 5, 10, false);
			
			_this.invalidate();
		};
		
		var mat = new BABYLON.StandardMaterial('desktop', scene);
		mat.specularColor = new BABYLON.Color3(0, 0, 0);
		mat.diffuseColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
		this.desktop = new Stuff(scene, 'desktop', 500, this.desktopOnClick, this.desktop);
		this.desktop.set(mat, 0, 0, 10);
	};
	Layout.prototype.desktopOnClick = function (that) {
		this.myCards.resetState(Card.UNFOCUSED1)
		this.invalidate();
	};
	Layout.prototype.cardOnClick = function (that) {
		if( that.state == Card.UNFOCUSED1 ) {
			that.state = Card.FOCUSED1;
		}
		else if ( that.state == Card.FOCUSED1 && this.myCards.hasFull() ) {
			that.state = Card.DISCARD1;
			that.properties[Card.DISCARD1].isVisible = true;
			this.notify(DISCARD, that.data);
		}
		else if ( that.state == Card.FOCUSED1 ) {
			if( this.hisCards.getDiscard().data == that.data && this.myCards.hasPong(that.data) ){
				this.myCards.pong();
				this.notify(DISCARD_PONG, that.data);
			}
		}
		this.invalidate();
	};
	Layout.prototype.draw = function (data) {
		this.go.command(cmd, id);
	};
	Layout.prototype.notify = function (cmd, id) {
		console.log("layout notify: " + cmd + " " + cardid);
		this.go.command(cmd, id);
	};
	Layout.prototype.deal = function (cards) {
		if( cards.length == MAX ) {
			this.myCards.resetState(Card.UNFOCUSED1);
			this.myCards.setDataByArray(cards);

			this.hisCards.resetState(Card.BACK2);
			this.hisCards.cards[MAX-1].state = Card.EMPTY2;
			this.hisCards.resetData(0);
		}
		else if ( cards.length == MAX-1 ) {
			cards.push(0);
			this.myCards.resetState(Card.UNFOCUSED1);
			this.myCards.setDataByArray(cards);
			this.myCards.cards[MAX-1].state = Card.EMPTY1;
			
			this.hisCards.resetState(Card.BACK2);
			this.hisCards.resetData(0);
		}
		this.myCards.number = cards.length;
		this.invalidate();
	};
	Layout.prototype.invalidate = function () {
		this.myCards.invalidate(Card.SHOW1, Card.UNFOCUSED1, Card.FOCUSED1);
		this.hisCards.invalidate(Card.SHOW2, Card.UNFOCUSED2, Card.FOCUSED2);
	};
	return Layout;
})();
