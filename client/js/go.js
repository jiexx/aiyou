var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var OPEN = 'x10000001', JOIN = 'x10000002', EXIT = 'x10000003', CONTINUE = 'x10000004', DISCARD = 'x20000001', DISCARD_PONG = 'x30000001', DISCARD_CHI = 'x30000002', DISCARD_DRAW = 'x30000003', WAIT = 'x40000001', START = 'x40000002', OVER = 'x40000003', WHO = 'x50000001', TIMEOUT = 'x50000002';
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
        while ((r = r.parent) != null)
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
        var state = this.transitions['x' + msg.cmd];
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
        this.root = new State(null);
        this.client = null;
    }
    Round.prototype.recv = function (msg) {
        this.root.child.next(msg);
    };
    Round.prototype.connect = function () {
        var _this = this;
        var socket = new SockJS('http://localhost:9090/game');
        this.client = Stomp.over(socket);
        this.client.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            var a = new Ack();
            a.cmd = parseInt(OPEN.substr(1), 16);
            a.uid = parseInt(_this.userid);
            _this.send(a);
            _this.client.subscribe('/' + _this.userid, function (str) {
                var msg = JSON.parse(str);
                _this.recv(msg);
            });
        });
    };
    Round.prototype.subscribe = function (point) {
        var _this = this;
        var pos = point.indexOf('/', 6);
        this.roundid = point.substring(6, pos);
        this.client.subscribe(point, function (str) {
            var msg = JSON.parse(str);
            _this.root.next(msg);
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
        round.subscribe(open.endp);
        round.view.reset();
        var ack = new Ack();
        msg.cmd = parseInt(OPEN.substr(1));
        round.send(ack);
    };
    return Wait;
})(State);
var Going = (function (_super) {
    __extends(Going, _super);
    function Going(r) {
        _super.call(this, r);
    }
    Going.prototype.Enter = function (msg) {
        var start = msg;
        var round = this.getRoot();
        round.view.roundDealcards(start.card);
    };
    return Going;
})(State);
var Hu = (function (_super) {
    __extends(Hu, _super);
    function Hu(r) {
        _super.call(this, r);
    }
    Hu.prototype.Enter = function (msg) {
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
    }
    return RoundImpl;
})(Round);
