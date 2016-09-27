(function() {
	var Page =  {
		create: function() {
			function C() {};
			C.prototype = Page;
			var obj = new C();
			
			obj.name = 'Empty',
			obj.url = null,
			obj.isShadow = false,
			obj.tags = [],
			obj.id = 'PAG'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1)));
			
			obj.addTag(Tag.create(obj));
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
		
		changeUrl: function(url) {
			if(this.isShadow) {
				return;
			}
			this.url = url;
		},
		
		changeName: function(name) {
			if(this.isShadow) {
				return;
			}
			this.name = name;
		},
		
		print: function(output) {
			output += '{id:'+this.id+',name:'+this.name+',url:'+this.url+',tags:[';
			for(var i in this.tags) {
				this.tags[i].print(output);
			}
			output +=']}';
		},
		
		shadow: function() {
			var obj = this.create();
			
			obj.id = this.id;
			obj.name = this.name;
			obj.isShadow = true;
			obj.tags = this.tags;
			return obj;
		},
	};
	return Page;
})();