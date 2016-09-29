(function() {
	var Tag =  {
		create: function(page) {
			function C() {};
			C.prototype = Tag;
			var obj = new C();
			
			obj.expr = '';
			obj.repeated = false;
			obj.trace = null;
			obj.property = '';
			obj.owner = page;
			obj.id = 'TAG'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1))).toUpperCase();
			
			return obj;
		},
		
		isTagged: function() {
			return this.repeated || this.property != '' || this.trace != null;
		},
		
		tagRepeated: function() {
			return this.repeated;
		},
		tagPropSelected: function() {
			return this.property != '';
		},
		tagTraceNew: function() {
			return this.trace != null;
		},
		
		toggleRepeated: function() {  //web op
			this.repeated = !this.repeated;
		},
		
		tracePage: function(task, page) { //web op
			var p = page;
			if(page.id == this.owner.id) {
				p = this.owner.shadow();
				task.addShadow(p);
			}
			this.trace = p;
			return p;
		},
		
		getTrace: function() {
			return this.trace;
		},
		
		markProperty: function(prop) {  //web op
			this.property = prop;
		},
		
		print: function(output) {
			output += '{id:'+this.id+',expr:'+this.expr+',repeated:'+this.repeated+',repeated:'+this.repeated+',property:'+this.property;
			if(trace) {
				output += trace.id;
			}
			output +='}';
		},
	};
	return Tag;
})();