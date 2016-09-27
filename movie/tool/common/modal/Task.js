(function() {
	var Task =  {
		create: function(name) {
			function C() {};
			C.prototype = Task;
			var obj = new C();
			
			obj.name = '',
			obj.time = new Date().toLocaleString(),
			obj.pages = [],
			obj.shadows = [],
			obj.root = null,
			obj.incr = false, 
			obj.clock = 0,
			obj.status = 0, //0 start; 1 editing; 2 complete; 3 play; 4 done; 
			obj.name = name;
			obj.root = obj.newPage();
			
			return obj;
		},
		
		hasClock: function() {
			return this.clock != 0;
		},
		
		hasIncr: function() {
			return this.incr;
		},
		
		statusString: function() {
			var a = ['start','editing','complete','play','done'];
			return a[this.status];
		},
		
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
	};
	return Task;
})();