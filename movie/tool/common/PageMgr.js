var PageMgr =  {
	pages:[],
	shadows: [],
	root: null,
	
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
	
	create: function() {
		function F() {};
		F.prototype = Page;
		var f = new F();
		
		f.root = f.newPage();
		return f;
	}
};