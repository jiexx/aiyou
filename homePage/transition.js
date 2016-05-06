var Slot = {
	create: function(place, petri) {
		function _() {};
		var _this = new _();
		_this.place = place;
		_this.onFire = function(_this.finish){
			_this.finish({});
			return true;
		};
		_this.finish = function(data){
			petri._tokenHas(place, data);
		};
		_this.fire = function() {
			return onFire(_this.finish);
		};
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
		_this._outSlot(outputs, petri);
		app.get(stub, upload.array(), function(req, res) {
			petri.req = req;
			petri.res = res;
			for(var i in _this.outputs) {
				if(_this.outputs[i].fire()) 
					break;
			}
		});
		return _this;
	},
	_inSlot: function(inputs) {
		for(var i in inputs) {
			this.inputs[i] = Slot.create(inputs[i]);
		}
	},
	_outSlot: function(outputs, petri) {
		for(var o in outputs) {
			this.outputs[o] = Slot.create(outputs[o], petri);
		}
	},
}