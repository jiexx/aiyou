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
	create: function(petri, app, stub, inputs, outputs) {
		function _() {};
		__extends(_, Transition);
		var _this = new _();
		_this.stub = stub;
		_this.inputs = [];
		_this.outputs = [];
		_this.inSlot(inputs);
		_this.outSlot(outputs);
		app.get(stub, function(req, res) {
			var i = _this.fire(req, res);
			if(i > -1) {
				petri.tokenHas(_this.outputs[i].place);
			}
		});
		return _this;
	},
	inSlot: function(inputs) {
		for(var i in inputs) {
			this.inputs[i] = Slot.create(inputs[i]);
		}
	},
	outSlot: function(outputs) {
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
	fire: function(req, res) {
		for(var i in this.outputs) {
			if(this.outputs[i].test(req)) {
				this.outputs[i].place.enter(req, res);
				return i;
			}
		}
		return -1;
	}
}