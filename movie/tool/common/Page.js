var Page =  {
	id:'',
	name:'Empty',
	url:null,
	isShadow:false,
	tags:[],
	
	addTag: function(tag) {
		if(isShadow) {
			return;
		}
		this.tags[tag.id] = tag;
	},
	
	removeTag: function(tag) {
		if(isShadow) {
			return;
		}
		delete this.tags[tag.id];
	},
	
	getTags: function() {  //web ui list
		return this.tags;
	},
	
	changeUrl: function(url) {
		if(isShadow) {
			return;
		}
		this.url = url;
	},
	
	changeName: function(name) {
		if(isShadow) {
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
		function F() {};
		F.prototype = Page;
		var f = new F();
		
		f.id = this.id;
		f.name = this.name;
		f.isShadow = true;
		f.tags = this.tags;
		return f;
	},
	
	create: function() {
		function F() {};
		F.prototype = Page;
		var f = new F();
		
		f.id = 'PAG'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1)));
		return f;
	}
};