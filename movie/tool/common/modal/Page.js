(function() {
	var Page =  {
		create: function() {
			function C() {};
			C.prototype = Page;
			var obj = new C();
			
			obj.name = 'Empty',
			obj.url = null,
			obj.isShadow = false,
			obj.tags = {},
			obj.id = 'PAG'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1))).toUpperCase();

			return obj;
		},
		
		newTag: function() {  //web op
			var t = Tag.create(this);
			this.addTag(t);
		},
		
		addTag: function(tag) {
			if(this.isShadow) {
				return;
			}
			this.tags[tag.id] = tag;
		},
		
		removeTag: function(tag) {
			if(this.isShadow) {
				return;
			}
			delete this.tags[tag.id];
		},
		
		getTags: function() {  //web ui list
			return this.tags;
		},
		
		getTag: function(id) {  //web ui list
			return this.tags[id];
		},
		
		cleanCheck: function() {
			for(var i in this.tags){
				console.log('x '+this.tags[i].expr);
				if(!this.tags[i].expr || this.tags[i].expr.trim() == '' ) {
					delete this.tags[i];
				}
			}
			// check if xpath
			return true;
		},
		
		changeName: function(name) {
			if(this.isShadow) {
				return;
			}
			this.name = name;
		},
		
		print: function() {
			var output = '{id:"'+this.id+'",name:"'+this.name+'",url:"'+this.url+'",isShadow:"'+this.isShadow+'",Tags:[';
			for(var i in this.tags) {
				output += this.tags[i].print();
			}
			output +=']}';
			return output;
		},
		
		shadow: function() {
			var obj = this.create();
			
			obj.url = null;
			obj.id = this.id;
			obj.name = this.name;
			obj.isShadow = true;
			obj.tags = this.tags;
			return obj;
		},
	};
	return Page;
})();