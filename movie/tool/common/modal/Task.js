(function() {
	var Task =  {
	name:'',
	time:new Date().toLocaleString(),
	pages:[],
	shadows: [],
	root: null,
	
	changeName: function(name) {
		this.name = name;
	},
	
	newPage: function() {  //web op
		var p = Page.create();
		this.pages[p.id] = p;
		return p;
	},
	
	addShadow: function(p) {
		var p = Page.create();
		this.shadows[p.id] = p;
		return p;
	},
	
	getPages: function() {  //web ui list
		return this.pages;
	},
	
	getPage: function(id) {
		return this.pages[id];
	},
	
	getShadow: function(id) {
		return this.shadows[id];
	},
	
	getRootPage: function() {
		return this.root;
	},
	
	removePage: function(id) {
		if(this.root == this.pages[id]){
			return false;
		}
		delete this.pages[id];
		return true;
	},
	
	print: function() {
		var output = '[';
		for(var i in this.pages) {
			this.pages[i].print(output);
		}
		output +=']';
		console.log(output);
	},
	
	create: function(name) {
		function F() {};
		F.prototype = Task;
		var f = new F();
		f.name = name;
		f.root = f.newPage();
		return f;
	}
};
	return Task;
})();