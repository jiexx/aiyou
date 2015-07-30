(function () {
	var
	OPEN = 0x10000001,
	JOIN = 0x10000002,
	EXIT = 0x10000003,
	CONTINUE = 0x10000004,
	DISCARD = 0x20000001,
	DISCARD_PONG = 0x30000001,
	DISCARD_CHI = 0x30000002,
	DISCARD_DRAW = 0x30000003
	WAIT = 0x40000001,
	START = 0x40000002,
	OVER = 0x40000003,
	WHO = 0x50000001,
	TIMEOUT = 0x50000002;
	
		
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
