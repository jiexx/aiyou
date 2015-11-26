var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OPEN = '0x10000001', JOIN = '0x10000002', EXIT = '0x10000003', CONTINUE = '0x10000004', DISCARD = '0x20000001', DISCARD_PONG = '0x30000001', DISCARD_CHI = '0x30000002', DISCARD_DRAW = '0x30000003', WAIT = '0x40000001', START = '0x40000002', OVER = '0x40000003', 	START_DEALER = '0x40000004', START_PLAYER = '0x40000005', WHO = '0x50000001', TIMEOUT = '0x50000002', FINAL = '0x50000003', SELFDRAWHO = '0x50000004';
var V_OPEN = 0x10000001, V_JOIN = 0x10000002, V_EXIT = 0x10000003, V_CONTINUE = 0x10000004, V_DISCARD = 0x20000001, V_DISCARD_PONG = 0x30000001, V_DISCARD_CHI = 0x30000002, V_DISCARD_DRAW = 0x30000003, V_WAIT = 0x40000001, V_START = 0x40000002, V_OVER = 0x40000003, V_START_DEALER = 0x40000004, V_START_PLAYER = 0x40000005, V_WHO = 0x50000001, V_TIMEOUT = 0x50000002, V_FINAL = 0x50000003, V_SELFDRAWHO = 0x50000004;
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
			this.child.Exit(msg);
            this.child.Reset();
            for (var key in this.child.transitions) {
                var val = this.child.transitions[key];
                if (val != null) {
					val.Exit(msg);
                    val.Reset();
				}
            }
        }
    };
    State.prototype.Enter = function (msg) {
    };
    State.prototype.Reset = function () {
		this.child = this.init;
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
		//console.log('---------Command: ' + '0x' + msg.cmd.toString(16) + "   " + (funcNameRegex).exec(state.constructor.toString())[1]);
        if (state != null) {
            this.Exit(msg);
            
            state.Enter(msg);
			
			state.recv(msg);
			
            this.parent.previous = this.parent.child;
            this.parent.child = state;
        }else {
			this.recv(msg);
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
var RoundManager = (function () {
	function RoundManager(uid, round, chip, onClose, onGUI){
		this.userid = uid;
		this.roundid = 0xffffffff;
		this.round = round;
		this.chip = chip;
		this.onClose = onClose;
		this.onGUI = onGUI;
		this.client = null;
		this.selfDraw = false;
	};
	RoundManager.prototype.wait = function (msg) {
		this.disconnect();
		var _this = this;
		var socket = new SockJS(this.round.host);
		this.client = Stomp.over(socket);
		this.client.connect({}, function (frame) {
			_this.stub();
			_this.send(msg);
		});
	};
	RoundManager.prototype.stub = function () {
		var _this = this;
		this.subscribe('/game/'+this.userid);
	};
	RoundManager.prototype.join = function () {
		this.round.going.Reset();
		this.dispatchMessage(V_JOIN, this.chip);
	};
	RoundManager.prototype.open = function () {
		this.round.going.Reset();
		this.dispatchMessage(V_OPEN, this.chip);
	};
	RoundManager.prototype.registe = function (id) {
		this.roundid = id;
	};
	RoundManager.prototype.subscribe = function (point) {
		if( point != undefined && point != null ) {
			var _this = this.round;
			this.client.subscribe('/hook' + point, function (frame) {
				var msg = JSON.parse(frame.body);
				_this.recv(msg);
				_this.mgr.debug('####		RECEIVE ', msg.cmd, msg.opt);
			});
		}
	};
	RoundManager.prototype.close = function () {
		this.disconnect();
		if(this.onClose != undefined && this.onClose != null)
			this.onClose();
	};
	RoundManager.prototype.disconnect = function () {
		if (this.client != null && this.client.ws.readyState == SockJS.OPEN) {
			this.client.disconnect();
			console.log("####		Disconnected");
		}
	};
	RoundManager.prototype.dispatchMessage = function (cmd, opt) {
		var msg = new Ack();
		msg.cmd = cmd;
		msg.uid = parseInt(this.userid);
		msg.toid = parseInt(this.roundid);
		msg.opt = opt;
		this.send(msg);
		this.round.recv(msg);
	};
	RoundManager.prototype.sendMessage = function (cmd, opt) {
		var msg = new Ack();
		msg.cmd = cmd;
		msg.uid = parseInt(this.userid);
		msg.toid = parseInt(this.roundid);
		msg.opt = opt;
		this.send(msg);
	};
	RoundManager.prototype.debug = function (prefix, cmd, cardid) {
		var str = '';
		switch(cmd) {
		case V_OPEN: str='OPEN';break;
		case V_JOIN: str='JOIN';break;
		case V_START_DEALER: str='START_DEALER';break;
		case V_START_PLAYER: str='START_PLAYER';break;
		case V_DISCARD: str='DISCARD';break;
		case V_DISCARD_PONG: str='DISCARD_PONG';break;
		case V_DISCARD_CHI: str='DISCARD_CHI';break;
		case V_DISCARD_DRAW: str='DISCARD_DRAW';break;
		case V_WHO: str='WHO';break;
		case V_CONTINUE: str='CONTINUE';break;
		case V_EXIT: str='EXIT';break;
		}
		console.log('####		'+prefix+' message: '+str+' opt: '+cardid);
	};
	RoundManager.prototype.send = function (msg) {
		msg.toid = parseInt(this.roundid);
		if(this.client != null)
			this.client.send("/go/game", {}, JSON.stringify(msg));
		this.debug('####		SEND', msg.cmd, msg.opt);
	};
	return RoundManager;
})();
//-----------------------------view---------------------------------------------

//-----------------------------implement----------------------------------------
var Wait = (function (_super) {
    __extends(Wait, _super);
    function Wait(r) {
			_super.call(this, r);
    }
    Wait.prototype.Enter = function (msg) {
		if(msg.cmd == V_OPEN || msg.cmd == V_JOIN) {
			var mj = Mahjong.instance();
			mj.bind(this.getRoot());
			//mj.initLoadGUI();
			
			var mgr = this.getRoot().mgr;
			msg.cmd = parseInt(msg.cmd);
			mgr.wait(msg);
		}
		else if(msg.cmd == V_EXIT) {
		}
			//var open = msg;
			//if( open.endp != undefined && open.endp != null )
			//	round.subscribe(open.endp);
			//if( open.roundid != undefined && open.roundid != null )
			//	round.roundid = open.roundid;
			//round.view.loadingGUI();
    };
    return Wait;
})(State);
var Deal = (function (_super) {
    __extends(Deal, _super);
    function Deal(r) {
			_super.call(this, r);
    }
    Deal.prototype.Enter = function (msg) {
		var mgr = this.getRoot().mgr;
		var mj = Mahjong.instance();
		if(msg.cmd == V_START_DEALER) {
			if(msg.endp != null && msg.id != null) {
				mgr.registe(msg.rid);
				mgr.subscribe(msg.endp);
				if(mgr.onGUI != undefined && mgr.onGUI != null)
					mgr.onGUI(msg.id[0], mgr);
			}
			
			mj.deal(msg.card);
			if(msg.hu == true) {
				mj.win();
			}
		}else if(msg.cmd == V_DISCARD_DRAW) {
			if(mgr.selfDraw) {
				mj.win();
			}
		}
    };
    return Deal;
})(State);
var Play = (function (_super) {
    __extends(Play, _super);
    function Play(r) {
			_super.call(this, r);
    }
    Play.prototype.Enter = function (msg) {
    };
    return Play;
})(State);
var Deal2 = (function (_super) {
    __extends(Deal2, _super);
    function Deal2(r) {
			_super.call(this, r);
    }
    Deal2.prototype.Enter = function (msg) {
		var mgr = this.getRoot().mgr;
		var mj = Mahjong.instance();
		if(msg.cmd == V_DISCARD) {
			mj.heDiscard(msg.disc, msg.deal);
			if(msg.hu) {
				mj.win();
			}
			mgr.selfDraw = msg.sd;
		}
    };
    return Deal2;
})(State);
var Play2 = (function (_super) {
    __extends(Play2, _super);
    function Play2(r) {
			_super.call(this, r);
    }
    Play2.prototype.Enter = function (msg) {
		var mgr = this.getRoot().mgr;
		var mj = Mahjong.instance();
		if(msg.cmd == V_DISCARD_DRAW) {
			mj.heDraw(0);
		}
		else if(msg.cmd == V_DISCARD_PONG || msg.cmd == V_DISCARD_CHI) {
			mj.hePongci(msg.disc1, msg.disc2, msg.disc3);
		}
		else if(msg.cmd == V_START_PLAYER) {
			if(msg.endp != null && msg.id != null) {
				mgr.registe(msg.rid);
				mgr.subscribe(msg.endp);
				if(mgr.onGUI != undefined && mgr.onGUI != null)
					mgr.onGUI(msg.id[0], mgr);
			}
			var mj = Mahjong.instance();
			mj.deal(msg.card);
		}
    };
    return Play2;
})(State);
var Going = (function (_super) {
	__extends(Going, _super);
	function Going(r) {
		_super.call(this, r);
		this.backup = null;
	}
	Going.prototype.Enter = function (msg) {
		if(msg.cmd == V_EXIT) {
			var mgr = this.getRoot().mgr;
			//mgr.close();
			this.restore();
		}
	};
	Going.prototype.setBackupState = function (state) {
		this.backup = state;
	};
	Going.prototype.restore = function (state) {
		if(this.backup != null)
			this.child = this.backup;
		var mj = Mahjong.instance();
		mj.reset();
	};
	return Going;
})(State);
var Hu = (function (_super) {
	__extends(Hu, _super);
	function Hu(r) {
		_super.call(this, r);
	}
	Hu.prototype.Enter = function (msg) {
		var mgr = this.getRoot().mgr;
		var mj = Mahjong.instance();
		if(msg.cmd == V_WHO) {
			if(msg.hu == true) {
				mj.showHand(msg.other[0]);
			}else if(msg.hu == false) {
				mj.loss(msg.other[0]);
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
		var mgr = this.getRoot().mgr;
		mgr.close();
	};
	return End;
})(State);
var RoundImpl = (function (_super) {
	__extends(RoundImpl, _super);
	function RoundImpl(host, uid, chip, onClose, onGUI) {
		_super.call(this, null);
		this.host = host;
		this.mgr = new RoundManager(uid, this, chip, onClose, onGUI);
		this.going = new Going(this);
		var going = this.going;
		var empty = new State(going);
		var wait = new Wait(going);
		var deal = new Deal(going);
		var play = new Play(going);
		var deal2 = new Deal2(going);
		var play2 = new Play2(going);
		var hu = new Hu(going);
		var end = new End(this);
		
		empty.addTransition(OPEN, wait);
		empty.addTransition(JOIN, wait);
		
		wait.addTransition(START_DEALER, deal);
		wait.addTransition(START_PLAYER, play2);
		
		deal.addTransition(DISCARD, play);
		deal.addTransition(WHO, hu);
		
		play.addTransition(DISCARD_DRAW, play2);
		play.addTransition(DISCARD_PONG, play2);
		play.addTransition(DISCARD_CHI, play2);
		play.addTransition(WHO, hu);
		
		play2.addTransition(DISCARD, deal2);
		play2.addTransition(WHO, hu);
		
		deal2.addTransition(DISCARD_DRAW, deal);
		deal2.addTransition(DISCARD_PONG, deal);
		deal2.addTransition(DISCARD_CHI, deal);
		deal2.addTransition(WHO, hu);
		
		hu.addTransition(CONTINUE, wait);
		hu.addTransition(WHO, hu);
		
		going.setInitState(empty);
		going.setBackupState(wait);
		going.addTransition(FINAL, end);
		going.addTransition(EXIT, going);
		this.setInitState(going);
	};
	RoundImpl.prototype.open = function () {
		this.mgr.dispatchMessage(V_OPEN, this.mgr.chip);
	};
	RoundImpl.prototype.join = function (toid) {
		this.going.Reset();
		this.mgr.registe(toid);
		this.mgr.dispatchMessage(V_JOIN, toid);
	};
	RoundImpl.prototype.command = function (cmd, cardid) {
		var a = new Ack();
		switch(cmd) {
		case V_DISCARD:
		case V_DISCARD_PONG:
		case V_DISCARD_CHI:
		case V_DISCARD_DRAW:
		case V_WHO:
		case V_CONTINUE:
		case V_SELFDRAWHO:
			this.mgr.dispatchMessage(cmd, cardid);
		break;
		case V_FINAL:
			var msg = new Ack();
			msg.cmd = V_EXIT;
			this.mgr.send(msg);
			msg.cmd = cmd;
			this.recv(msg);
		break;
		}
	};
	return RoundImpl;
})(State);
