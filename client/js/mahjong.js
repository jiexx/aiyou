var Property = (function () {
	function Property() {
		this.position = new BABYLON.Vector3(0, 0, 0);
		this.materials = null;
		this.isVisible = false;
		this.onClick = null;
	};
	Property.prototype.invalidate = function (stuff, data) {
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
var Stuff = (function () {
	function Stuff(scene, name, size, that) {
		this.mesh = BABYLON.Mesh.CreatePlane(name, size, scene);
		this.mesh.layerMask = 1;
		this.mesh.actionManager = new BABYLON.ActionManager(scene);
		this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
				var onClick = that.properties[that.state].onClick;
				if( onClick != null )
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
var Card = (function () {
	var INVALID = -1;
	var EMPTY1 = 0,	SHOW1 = 1,	UNFOCUSED1 = 2,	FOCUSED1 = 3,	DISCARD1 = 4;	
	var EMPTY2 = 0,	BACK2 = 1,	SHOW2 = 2,	DISCARD2 = 3;
	function Card(scene, index, count) {
		this.stuff = new Stuff(scene, '000' + index, 9, this);
		this.next = null;
		var mesh = this.stuff.mesh;
		mesh.scaling.x = 0.6;
		var uv = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
		uv[0] = 0.2;
		uv[2] = 0.8;
		uv[4] = 0.8;
		uv[6] = 0.2;
		mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);

		this.state = EMPTY1;
		this.properties = new Array(count);
		this.data = INVALID;
		this.sequence = 0;
	};
	Card.prototype.isEmpty = function () {
		return this.state == Card.EMPTY1;
	};
	Card.prototype.invalidate = function () {
		this.stuff.mesh.position.x = this.properties[this.state].position.x * this.sequence;
		this.properties[this.state].invalidate(this.stuff, this.data);
	};
	Card.prototype.reset = function () {
		this.state = Card.EMPTY1;
		this.data = Card.INVALID;
		this.sequence = 0 ;
	};
	return Card;
})();

var CardGroup = (function () {
	var MAX = 15;  // include one discard card;
	var DRAWINDEX = MAX - 2, DISCARDINDEX = MAX - 1;
	function CardGroup(scene, mats, count) {
		this.cards = new Array();
		this.material = mats;
		for( var i = 0 ; i < MAX ; i ++ ) {
			this.cards.push( new Card(scene, 0, count) );
		}
	};
	CardGroup.prototype.init = function (state, xdelta, y, z, isVisible, onClick) {
		for( var i = 0 ; i < MAX ; i ++ ) {
			this.cards[i].properties[state].set(this.material, xdelta, y, z, isVisible, onClick);
		}
	};
	CardGroup.prototype.reset = function (state, data) {
		var count = data.length;
		if( count != MAX - 2 || count != MAX - 1 )
			return;
		var i;
		for (i = 0; i < count; i++) {
			this.cards[i].state = state;
			this.cards[i].data = data[i];
		}
		for (i = count; i < MAX; i++) {
			this.cards[i].reset();
		}
	};
	CardGroup.prototype.replace = function (src, dst) {
		for (var i = 0; i < MAX; i++) {
			if (this.cards[i].state == src)
				this.cards[i].state = dst;
		}
	};
	CardGroup.prototype.find = function (data) {
		var i;
		for (i = 0; i < DRAWINDEX; i++) {
			if (data >= this.cards[i].data)
				break;
		}
		return i;
	};
	CardGroup.prototype.indexOf = function (card) {
		for (var i = 0; i < DRAWINDEX; i++) {
			if (card == this.cards[i])
				return i;
		}
		return -1;
	};
	CardGroup.prototype.tryDraw = function (data) {
		if( this.cards[DRAWINDEX].isEmpty() ) {
			this.cards[DRAWINDEX].state = Card.UNFOCUSED1;
			this.cards[DRAWINDEX].data = data;
			var i = this.find(data);
			this.cards.splice(i, 0, this.cards[DRAWINDEX]);
			return true;
		}
		return false;
	};
	CardGroup.prototype.tryDiscard = function (that) {
		if( !this.cards[DRAWINDEX].isEmpty() ) {
			this.cards[DISCARDINDEX].state = Card.DISCARD1;
			this.cards[DISCARDINDEX].data = that.data;
			var i = this.indexOf(that);
			if( i > 0 ) {
				this.cards.splice(i, 1);
				that.state = Card.EMPTY1;
				this.cards.push(that);
				return true;
			}
		}
		return false;
	};
	CardGroup.prototype.tryPong = function (card) {
		if( 
		for (var key in this.cards) {
			if (this.cards[key].state == Card.FOCUSED1 && this.cards[key].data == data)
				this.pump.push(this.cards[key]);
		}
		return this.pump.length == 2;
	};
	CardGroup.prototype.discard = function (data) {
		if( !this.cards[DRAWINDEX].isEmpty() ) {
			this.cards[DISCARDINDEX].state = Card.DISCARD2;
			this.cards[DISCARDINDEX].data = data;
			this.cards[DRAWINDEX].state = Card.EMPTY1;
		}
		return false;
	};
	CardGroup.prototype.draw = function () {
		if( this.cards[DRAWINDEX].isEmpty() ) {
			this.cards[DRAWINDEX].state = Card.BACK2;
		}
		return false;
	};
	

	CardGroup.prototype.hasChi = function (data) {
		this.pump.splice(0, this.pump.length);
		for (var key in this.cards) {
			if (this.cards[key].state == Card.FOCUSED1)
				this.pump.push(this.cards[key]);
		}
		if (this.pump.length == 2) {
			if (this.pump[0].data - 1 == data && data == this.pump[1].data + 1)
				return true;
		}
		return false;
	};
	CardGroup.prototype.pong = function () {
		for (var key in this.pump) {
			this.pump[key].state = Card.SHOW1;
		}
		var card = new Card(scene, cards.length, 1, null);
		card.properties[Card.SHOW1].set(mat, 0, y, z, isVisible);
		this.cards.push(card2);
	};
	CardGroup.prototype.chi = function () {
		for (var key in this.pump) {
			this.pump[key].state = Card.SHOW1;
		}
	};
	
	
	CardGroup.prototype.tryPongci = function (d1, d2) {
		if( this.dataSet.length == MAX - 1 ) {
			for (var i = 0; i < this.dataSet.length; i++) {
				if(this.dataSet[i] == d1 ) {
					this.dataSet.splice(i, 1);
					d1 = 0;
				}else if( this.dataSet[i] == d2 ) {
					this.dataSet.splice(i, 1);
					d2 = 0;
				}
			}
			if( d1 == 0 && d2 == 0 ) 
				return true;
		}
		return false;
	};
	CardGroup.prototype.hisUpdate = function () {
		var c = 0, d = 0;
		for (var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].state == Card.BACK2) {
				this.cards[i].sequence = c ;
				c ++;
			}
			else if (this.cards[i].state == Card.SHOW2) {
				this.cards[i].sequence = d ;
				d ++;
				
			}
			else if (this.cards[i].state == Card.DISCARD2) {
			}
			this.cards[i].invalidate();
		}
	};
	CardGroup.prototype.myUpdate = function () {
		var c = 0, d = 0;
		for (var i = 0; i < this.cards.length; i++) {
			if (this.cards[i].state == Card.FOCUSED1 || this.cards[i].state == Card.UNFOCUSED1) {
				this.cards[i].sequence = c ;
				c ++;
			}
			else if (this.cards[i].state == Card.SHOW1) {
				this.cards[i].sequence = d ;
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
	var EXIT = 0x10000003,	CONTINUE = 0x10000004,	DISCARD = 0x20000001,	DISCARD_PONG = 0x30000001,	DISCARD_CHI = 0x30000002,	DISCARD_DRAW = 0x30000003,	WHO = 0x50000001;
	function Layout(go) {
		this.myCards = null;
		this.hisCards = null;
		this.mats = new Array();
		this.desktop = null;
		this.go = go;
		this.init();
	}
	Layout.prototype.initGUI = function (scene) {}
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
			_this.myCards = new CardGroup(scene, _this.mats, 5);
			_this.myCards.init(Card.EMPTY1, _this.mats, 0, 0, 0, false, null);
			_this.myCards.init(Card.UNFOCUSED1, 6, -25, 0, true, this.cardOnClick);
			_this.myCards.init(Card.FOCUSED1, 6, -22, 0, true, this.cardOnClick);
			_this.myCards.init(Card.SHOW1, 6, -15, 0, true, null);
			_this.myCards.init(Card.DISCARD1, 6 * 3, -5, 10, true, null);

			_this.hisCards = new CardGroup(scene, _this.mats, 4);
			_this.hisCards.init(Card.EMPTY2, 0, 0, 0, false, null);
			_this.hisCards.init(Card.BACK2, 6, 25, 0, true, null);
			_this.hisCards.init(Card.SHOW2, 6, 15, 0, true, null);
			_this.hisCards.init(Card.DISCARD2, 6 * 3, 5, 10, true, this.cardOnClick);
		};

		var mat = new BABYLON.StandardMaterial('desktop', scene);
		mat.specularColor = new BABYLON.Color3(0, 0, 0);
		mat.diffuseColor = new BABYLON.Color3(35 / 255.0, 116 / 255.0, 172 / 255.0);
		this.desktop = new Stuff(scene, 'desktop', 500, this.desktop);
		this.desktop.set(mat, 0, 0, 10, this.desktopOnClick);
	};
	Layout.prototype.desktopOnClick = function (that) {
		this.myCards.replace(Card.FOCUSED1, Card.UNFOCUSED1);
		this.invalidate();
	};
	Layout.prototype.cardOnClick = function (that) {
		if (that.state == Card.UNFOCUSED1) {
			that.state = Card.FOCUSED1;
		} else if (that.state == Card.FOCUSED1 && this.myCards.canDiscard()) {
			that.state = Card.DISCARD1;
			this.notify(DISCARD, that.data);
		} else if (that.state == Card.FOCUSED1 || that.state == Card.DISCARD2) {
			if (this.hisCards.getDiscard().data == that.data && this.myCards.hasPong(that.data)) {
				this.myCards.pong();
				this.notify(DISCARD_PONG, that.data);
			}
		}
		this.invalidate();
	};
	Layout.prototype.discard = function (data) { // only for his
		
	};
	Layout.prototype.draw = function (data) {
		if( this.myCards.tryDraw() ) {
			this.notify(cmd, id);
		}
	};
	Layout.prototype.notify = function (cmd, id) {
		console.log("layout notify: " + cmd + " " + cardid);
		if( this.go != null ) 
			this.go.command(cmd, id);
	};
	Layout.prototype.deal = function (cards) {
		this.myCards.reset(Card.UNFOCUSED1, cards);
		if (cards.length == CardGroup.MAX - 1) {
			this.hisCards.reset(Card.BACK2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		} else if (cards.length == CardGroup.MAX - 2) {
			this.hisCards.reset(Card.BACK2, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		}
		this.invalidate();
	};
	Layout.prototype.invalidate = function () {
		this.myCards.myUpdate();
		this.hisCards.hisUpdate();
	};
	return Layout;
})();
