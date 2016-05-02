var Petri = {
	create: function(name, app) {
		function _() {};
		var _this = new _();
		_this.name = name;
		_this.app = app;
		_this.places = [];
		_this.transitions = [];
		_this.token = null;
		return _this;
	},
	place: function(page) {
		this.places[page] = Place.create(page);
	},
	transition: function(stub, inputs, outputs) {
		this.transitions[stub] = Transition.create(this, this.app, stub, inputs, outputs);
	},
	tokenHas: function(place) {
		this.token = place;
	},
	
	
}