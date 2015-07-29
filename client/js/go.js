(function () {
	var
	OPEN = 0x10000001,
	JOIN = 0x10000002,
	EXIT = 0x10000003,
	CONTINUE = 0x10000004,
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	WAIT = 0x40000001,
	START = 0x40000002,
	OVER = 0x40000003,
	WHO = 0x50000001,
	TIMEOUT = 0x50000002,
	east		= 1,
	west		= 2,
	south		= 3,
	north		= 4,
	zhong		= 5,
	fa			= 6,
	bai		= 7,
	
	dot1		= 16,
	dot2		= 17,
	dot3		= 18,
	dot4		= 19,
	dot5		= 20,
	dot6		= 21,
	dot7		= 22,
	dot8		= 23,
	dot9		= 24,
	
	Bamboo1	= 25,
	Bamboo2	= 26,
	Bamboo3	= 27,
	Bamboo4	= 28,
	Bamboo5	= 29,
	Bamboo6	= 30,
	Bamboo7	= 31,
	Bamboo8	= 32,
	Bamboo9	= 33,
	
	Char1		= 34,
	Char2		= 35,
	Char3		= 36,
	Char4		= 37,
	Char5		= 38,
	Char6		= 39,
	Char7		= 40,
	Char8		= 41,
	Char9		= 42,
	
	MAX			= 14;
	message = {
		this.uid : '',
		this.toid : '',
		this.cmd : '',
		this.opt : ''
	};
	function State() {
		this.transitions = new Array();
		this.init = null;
		this.child = null;
		this.parent = null;
		this.round = null;
		this.previous = null;
	};
	State.prototype.Exit = function (msg) {
		child = init;
		if (child != null) {
			child.reset();
			for (key in transitions) {
				val = transitions[key];
				if (val != null)
					val.reset();
			}
		}
	};
	State.prototype.Enter = function (msg) {};
	State.prototype.next = function (msg) {
		var state = transitions[msg.cmd];
		if (state != null) {
			Exit(msg);

			if (child != null) {
				child.next(msg);
			}

			state.Enter(msg);

			parent.previous = parent.child;
			parent.child = state;
		}
	};
	State.prototype.Rest = function (msg) {};
	State.prototype.setInitState = function (initstate) {
		init = initstate;
		child = initstate;
		initstate.parent = this;
	};
	State.prototype.addTransition = function (cmd, next) {
		transitions[cmd] = next;
	};
	function Wait() {
		console.log("wait");
		State.apply(this, arguments);
	}

	Wait.prototype = Object.create(State.prototype);
	Wait.prototype.Enter = function (msg) {};

	function Going() {
		console.log("going");
		State.apply(this, arguments);
	}

	Going.prototype = Object.create(State.prototype);
	Going.prototype.Enter = function (msg) {};

	function Hu() {
		console.log("hu");
		State.apply(this, arguments);
	}

	Hu.prototype = Object.create(state.prototype);
	Hu.prototype.Enter = function (msg) {};

	function End() {
		console.log("end");
		State.apply(this, arguments);
	}

	End.prototype = Object.create(State.prototype);
	End.prototype.Enter = function (msg) {};

	/*end = (function () {
	function ctor() {
	console.log("end");
	state.apply(this, arguments);
	}

	ctor.prototype = Object.create(state.prototype);
	ctor.prototype.Enter = function (msg) {};

	return ctor;
	})();*/
	function fsm() {
		this.root = new State(null);

		var empty = new State(this.root);
		var wait = new Wait(this.root);
		var going = new Going(this.root);
		var hu = new Hu(this.root);
		var end = new End(this.root);

		empty.addTransition(OPEN, wait);
		empty.addTransition(START, going);

		wait.addTransition(START, going);
		wait.addTransition(EXIT, end);

		going.addTransition(OVER, wait);
		going.addTransition(EXIT, end);
		going.addTransition(DISCARD, going);
		going.addTransition(WHO, hu);
		going.addTransition(TIMEOUT, wait);

		hu.addTransition(CONTINUE, wait);
		hu.addTransition(EXIT, end);
		hu.addTransition(TIMEOUT, wait);

		this.root.setInitState(empty);
	};
	function View(canvas) {
		this.card = new Array();
		this.canvas = canvas;
	}
	View.prototype.open = function (msg) {
		var engine = new BABYLON.Engine(canvas, true);

		var createScene = function () {
			var scene = new BABYLON.Scene(engine);

			// Create camera and light
			var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), scene);
			var camera = new BABYLON.ArcRotateCamera("Camera", 1, 0.8, 8, new BABYLON.Vector3(0, 0, 0), scene);
			//camera.attachControl(canvas, true);
			
			var spriteManagerTrees = new BABYLON.SpriteManager("cardManager", "textures/palm.png", 1, 64, scene);
			tree = new BABYLON.Sprite("card", spriteManagerTrees);
			tree.position.x = Math.random() * 100 - 50;
			//tree.position.y = -0.3;
            tree.position.z = Math.random() * 100 - 50;
				
			var spriteManagerTrees = new BABYLON.SpriteManager("cardManager", "textures/palm.png", 1, 64, scene);

			return scene;
		}

		var scene = createScene();

		engine.runRenderLoop(function () {
			scene.render();
		});

		// Resize
		window.addEventListener("resize", function () {
			engine.resize();
		});
	};
	var GO = {
		init : function (Id, canvas) {
			id = Id;
			view = new View(canvas);
		},
		connstr : function () {
			return protocol + '://' + server + '/' + port + '/' + endpoint;
		},
		connect : function (ws) {
			states = new fsm();
			var socket = new SockJS(connstr());
			stompClient = Stomp.over(socket);
			stompClient.connect({}, function (frame) {
				setConnected(true);
				console.log('Connected: ' + frame);
				stompClient.subscribe('/' + id, function (greeting) {
					showGreeting(JSON.parse(greeting.body).content);
				});
				stompClient.send(prefix + endpoint, {}, JSON.stringify({
						'name' : name
					}));
			});
		},
		subscribe : function (hooker, func) {
			stompClient.subscribe(prefix + '/' + hooker, func);
		},
		send : function (point, toid, cmd, opt) {
			var msg = new message();
			msg.uid = id;
			msg.toid = toid;
			msg.cmd = cmd;
			msg.opt = opt;
			stompClient.send(prefix + endpoint + point, {}, JSON.stringify(msg));
		},
		stompClient : null,
		protocol : 'ws',
		server : '127.0.0.1',
		port : 9090,
		id : ''
		broker : '/hook',
		prefix : '/go',
		endpoint : '/game',
		states : null;
		view : null;
	};
	if (typeof exports !== "undefined" && exports !== null) {
		exports.GO = GO;
	}
	if (typeof window !== "undefined" && window !== null) {
		window.GO = GO;
	} else if (!exports) {
		self.GO = GO;
	}
}).call(this);
