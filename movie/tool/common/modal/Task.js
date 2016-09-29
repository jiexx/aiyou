(function() {
	var Task =  {
		create: function(name) {
			function C() {};
			C.prototype = Task;
			var obj = new C();
			
			obj.time = (new Date()).toISOString().substring(0, 19).replace('T', ' '),
			obj.pages = {},
			obj.shadows = [],
			obj.root = null,
			obj.incr = false, 
			obj.clock = 0,
			obj.status = 0, //0 start; 1 editing; 2 complete; 3 play; 4 done; 
			obj.name = name;
			obj.root = obj.newPage();
			obj.id = 'TSK'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1))).toUpperCase();
			
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
		
		edited: function() {
			this.status = 2;
		},
		
		changeName: function(name) {
			this.name = name;
		},
		
		newPage: function() {  //web op
			var p = Page.create();
			p.addTag(Tag.create(p));
			this.pages[p.id] = p;
			return p;
		},
		
		addShadow: function(p) {
			this.shadows.push(p);
		},
		
		getPages: function() {  //web ui list
			return this.pages;
		},
		
		getPage: function(id) {
			return this.pages[id];
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