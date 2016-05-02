var Place = {
	create: function(page) {
		function _() {};
		var _this = new _();
		_this.page = page;
		_this.out = null;
		return _this;
	},
	out: function(t) {
		this.out = t;
	}
}