(function() {
	var Tag =  {
		id:'',
		expr:'',
		repeated:false,
		trace:null,
		property:'',
		owner: null,
		
		toggleRepeated: function() {  //web op
			this.repeated = !this.repeated;
		},
		
		tracePage: function(pm, page) { //web op
			var p = page;
			if(page.id == this.owner.id) {
				p = this.owner.shadow();
				pm.addShadow(p);
			}
			this.trace = p;
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
		
		create: function(page) {
			function F() {};
			F.prototype = Tag;
			var f = new F();
			f.owner = page;
			f.id = 'TAG'+md5.createHash(''+(new Date().getTime()+Math.floor(Math.random()*1000+1)));
			return f;
		}
	};
	return Tag;
})();