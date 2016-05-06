var Petri = {
	create: function(name, app, upload) {
		function _() {};
		var _this = new _();
		_this.name = name;
		_this.app = app;
		_this.upload = upload;
		_this.res = null;
		_this.req = null;
		_this.places = [];
		_this.transitions = [];
		_this.token = null;
		return _this;
	},
	Place: function(page) {
		this.places[page] = Place.create(page);
		return this.places[page];
	},
	Transition: function(stub, inputs, outputs) {
		this.transitions[stub] = Transition.create(this, this.app, this.upload, stub, inputs, outputs);
		return this.transitions[stub];
	},
	_tokenHas: function(place, data) {
		this.token = place;
		place.accept(this);
		this.res.render(place.page, data);
	}
}