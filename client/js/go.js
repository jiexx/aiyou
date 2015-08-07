var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OPEN = '0x10000001', JOIN = '0x10000002', EXIT = '0x10000003', CONTINUE = '0x10000004', DISCARD = '0x20000001', DISCARD_PONG = '0x30000001', DISCARD_CHI = '0x30000002', DISCARD_DRAW = '0x30000003', WAIT = '0x40000001', START = '0x40000002', OVER = '0x40000003', WHO = '0x50000001', TIMEOUT = '0x50000002';
var V_OPEN = 0x10000001, V_JOIN = 0x10000002, V_EXIT = 0x10000003, V_CONTINUE = 0x10000004, V_DISCARD = 0x20000001, V_DISCARD_PONG = 0x30000001, V_DISCARD_CHI = 0x30000002, V_DISCARD_DRAW = 0x30000003, V_WAIT = 0x40000001, V_START = 0x40000002, V_OVER = 0x40000003, V_WHO = 0x50000001, V_TIMEOUT = 0x50000002;
var Message = (function () {
    function Message() {
        this.cmd = 0;
    }
    return Message;
})();
var State = (function () {
    function State(r) {
        this.transitions = new Array();
        this.init = null;
        this.child = null;
        this.parent = null;
        this.previous = null;
        this.parent = r;
    }
    State.prototype.Exit = function (msg) {
        this.child = this.init;
        if (this.child != null) {
            this.child.reset();
            for (var key in this.transitions) {
                var val = this.transitions[key];
                if (val != null)
                    val.reset();
            }
        }
    };
    State.prototype.Enter = function (msg) {
    };
    State.prototype.Reset = function () {
    };
    State.prototype.getRoot = function () {
        var r = this;
        while (r.parent != null)
            r = r.parent;
        return r;
    };
    State.prototype.setInitState = function (initstate) {
        this.init = initstate;
        this.child = initstate;
        initstate.parent = this;
    };
    State.prototype.addTransition = function (cmd, next) {
        this.transitions[cmd] = next;
    };
    State.prototype.next = function (msg) {
		var funcNameRegex = /function (.{1,})\(/;
        var state = this.transitions['0x' + msg.cmd.toString(16)];
		console.log('---------Command: ' + '0x' + msg.cmd.toString(16) + "   " + (funcNameRegex).exec(state.constructor.toString())[1]);
        if (state != null) {
            this.Exit(msg);
            if (this.child != null) {
                this.child.next(msg);
            }
            state.Enter(msg);
            this.parent.previous = this.parent.child;
            this.parent.child = state;
        }
    };
	State.prototype.recv = function (msg) {
		if( this.child != null )
			this.child.next(msg);
    };
    return State; 
})();
var Ack = (function () {
    function Ack() {
        this.uid = 0;
        this.toid = 0;
        this.cmd = 0;
        this.opt = 0;
    }
    return Ack;
})();
var Round = (function (_super) {
    __extends(Round, _super);
    function Round(r) {
        _super.call(this, r);
        this.userid = '';
        this.roundid = '';
        this.client = null;
    }
    Round.prototype.connect = function (toid) {
        var _this = this;
        var socket = new SockJS('http://localhost:9090/game');
        this.client = Stomp.over(socket);
        this.client.connect({}, function (frame) {
            console.log('Connected: ' + frame);
			if( toid == undefined || toid == null ) {
				var a = new Ack();
				a.cmd = V_OPEN;
				a.uid = parseInt(_this.userid);
				a.toid = 0xffffffff;
				_this.send(a);
			}else {
				var a = new Ack();
				a.cmd = V_JOIN;
				a.uid = parseInt(_this.userid);
				a.toid = toid;
				_this.send(a);
			}
            _this.client.subscribe('/hook/' + _this.userid, function (frame) {
                var msg = JSON.parse(frame.body);
                _this.recv(msg);
            });
        });
    };
    Round.prototype.subscribe = function (point) {
        var _this = this;
        this.client.subscribe('/hook' + point, function (frame) {
            var msg = JSON.parse(frame.body);
            _this.recv(msg);
        });
    };
    Round.prototype.disconnect = function () {
        if (this.client != null) {
            this.client.disconnect();
        }
        console.log("Disconnected");
    };
    Round.prototype.send = function (msg) {
        msg.toid = parseInt(this.roundid);
        this.client.send("/go/game", {}, JSON.stringify(msg));
    };
    return Round;
})(State);
//-----------------------------view---------------------------------------------

//-----------------------------implement----------------------------------------
var StartMessage = (function (_super) {
    __extends(StartMessage, _super);
    function StartMessage() {
        _super.apply(this, arguments);
        this.hu = false;
    }
    return StartMessage;
})(Message);
var OpenMessage = (function (_super) {
    __extends(OpenMessage, _super);
    function OpenMessage() {
        _super.apply(this, arguments);
    }
    return OpenMessage;
})(Message);
var Wait = (function (_super) {
    __extends(Wait, _super);
    function Wait(r) {
        _super.call(this, r);
    }
    Wait.prototype.Enter = function (msg) {
        var round = this.getRoot();
        var open = msg;
		if( open.endp != undefined && open.endp != null )
			round.subscribe(open.endp);
		if( open.roundid != undefined && open.roundid != null )
			round.roundid = open.roundid;
        round.view.reset();
    };
    return Wait;
})(State);
var Going = (function (_super) {
    __extends(Going, _super);
    function Going(r) {
        _super.call(this, r);
    }
    Going.prototype.Enter = function (msg) {
		var round = this.getRoot();
		if( msg.cmd == V_START ) {
			var start = msg;
			round.subscribe(start.endp);
			round.roundid = start.roundid;
			round.view.roundDealcards(start.card);
			round.view.whohint(start.hu);
			round.view.invalidate();
		}else if ( msg.cmd == V_DISCARD ) {
			if( msg.disc != undefined && msg.disc != null ) { //self
				round.view.heDiscard( msg.deal, msg.disc );
				round.view.whohint(msg.hu);
				round.view.invalidate();
			}
		}else if ( msg.cmd == V_DISCARD_PONG || msg.cmd == V_DISCARD_CHI ) {
			if( msg.disc1 != undefined && msg.disc1 != null ) {//not self
				round.view.hePongchi( [msg.disc1, msg.disc2, msg.disc3] );
				round.view.invalidate();
			}else if ( msg.hu != undefined && msg.hu != null ) {
				round.view.whohint(msg.hu);
				round.view.invalidate();
			}
		}else if ( msg.cmd == V_DISCARD_DRAW ) {
			if( msg.hu != undefined && msg.hu != null ) { //self
				round.view.whohint(msg.hu);
				round.view.invalidate();
			}
		}
    };
    return Going;
})(State);
var Hu = (function (_super) {
    __extends(Hu, _super);
    function Hu(r) {
        _super.call(this, r);
    }
    Hu.prototype.Enter = function (msg) {
		if( msg.cmd == V_WHO ) {
			if( msg.other != undefined && msg.other != null ) { //self
				round.view.who(msg.other, msg.hu);
				round.view.invalidate();
			}
		}
    };
    return Hu;
})(State);
var End = (function (_super) {
    __extends(End, _super);
    function End(r) {
        _super.call(this, r);
    }
    End.prototype.Enter = function (msg) {
    };
    return End;
})(State);
var RoundImpl = (function (_super) {
    __extends(RoundImpl, _super);
    function RoundImpl(uid) {
        _super.call(this, null);
        this.view = null;
        this.userid = uid;
        var empty = new State(this);
        var wait = new Wait(this);
        var going = new Going(this);
        var hu = new Hu(this);
        var end = new End(this);
        empty.addTransition(WAIT, wait);
		empty.addTransition(START, going);
        wait.addTransition(START, going);
        wait.addTransition(EXIT, end);
        going.addTransition(OVER, wait);
        going.addTransition(EXIT, end);
        going.addTransition(DISCARD, going);
		going.addTransition(DISCARD_CHI, going);
		going.addTransition(DISCARD_PONG, going);
		going.addTransition(DISCARD_DRAW, going);
        going.addTransition(WHO, hu);
        going.addTransition(TIMEOUT, wait);
        hu.addTransition(START, going);
        hu.addTransition(EXIT, end);
        hu.addTransition(TIMEOUT, wait);
        this.setInitState(empty);
    }
	RoundImpl.prototype.command = function (cmd, cardid) {
		console.log("command " + cmd + " " + cardid);
		var a = new Ack();
		switch(cmd) {
		case V_DISCARD:
			a.cmd = V_DISCARD;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_DISCARD_PONG:
			a.cmd = V_DISCARD_PONG;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_DISCARD_CHI:
			a.cmd = V_DISCARD_CHI;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_DISCARD_DRAW:
			a.cmd = V_DISCARD_DRAW;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_WHO:
			a.cmd = V_WHO;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_CONTINUE:
			a.cmd = V_CONTINUE;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		case V_EXIT:
			a.cmd = V_EXIT;
			a.uid = parseInt(this.userid);
			a.toid = parseInt(this.roundid);
			a.opt = cardid;
			this.send(a);
		break;
		}
	};
    return RoundImpl;
})(Round);
