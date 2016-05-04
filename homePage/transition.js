var Slot = {
	create: function(place) {
		function _() {};
		var _this = new _();
		_this.place = place;
		_this.test = function(req) {return true;};
		return _this;
	},
},
var Transition = {
	create: function(petri, app, upload, stub, inputs, outputs) {
		function _() {};
		__extends(_, Transition);
		var _this = new _();
		_this.stub = stub;
		_this.inputs = [];
		_this.outputs = [];
		_this._inSlot(inputs);
		_this._outSlot(outputs);
		app.get(stub, upload.array(), function(req, res) {
			petri.req = req;
			petri.res = res;
			if(_this.fire() > -1) {
				petri._tokenHas(_this.outputs[i].place);
			}
		});
		return _this;
	},
	_inSlot: function(inputs) {
		for(var i in inputs) {
			this.inputs[i] = Slot.create(inputs[i]);
		}
	},
	_outSlot: function(outputs) {
		for(var o in outputs) {
			this.outputs[o] = Slot.create(outputs[o]);
		}
	},
	enable: function(req) {
		for(var i in this.inputs) {
			if(this.inputs[i].test(req))
				return i;
		}
		return -1;
	},
	fire: function() {
		for(var i in this.outputs) {
			if(this.outputs[i].test()) {
				return i;
			}
		}
		return -1;
	}
}