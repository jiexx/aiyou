var Card = (function () {
	var CARDSIZE = 9;
	function Card(scene, index, x, y, z, onClick) {
		this.mesh = BABYLON.Mesh.CreatePlane('000' + index, CARDSIZE, scene);
		this.mesh.position.x = x;
		this.mesh.position.y = y;
		this.mesh.position.z = z;
		this.mesh.scaling.x = 0.6
			var uv = this.mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
		uv[0] = 0.2;
		uv[2] = 0.8;
		uv[4] = 0.8;
		uv[6] = 0.2;
		this.mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uv, false);

		this.mesh.actionManager = new BABYLON.ActionManager(scene);
		this.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
				if (onClick != null)
					onClick(index);
			}));
		this.data = 0;
	}
	return Card;
})();
var Layout = (function () {
	var MAX = 14;
	var asserts = ['back','east','west','south','north','zhong','fa','bai','dot1','dot2','dot3','dot4','dot5','dot6','dot7','dot8','dot9',
		'Bamboo1','Bamboo2','Bamboo3','Bamboo4','Bamboo5','Bamboo6','Bamboo7','Bamboo8','Bamboo9',
		'Char1','Char2','Char3','Char4','Char5','Char6','Char7','Char8','Char9',];
		//'who',	'draw',	'continue',	'exit',	'loss',	'win'];
	function Layout() {
		this.cards = new Array();
		for (var i = 0; i < MAX; i++) {
			var card = new Card(scene, i, 6 * i, -25, 0, this.cardOnClick);
			this.cards.push(card);
			card = new Card(scene, i, 6 * i, -25, 0, this.cardOnClick);
			this.cards.push(card);
		}
	}
	Layout.prototype.cardOnClick = function (index) {};
	Layout.prototype.invalidate = function () {};
	return Layout;
})();
