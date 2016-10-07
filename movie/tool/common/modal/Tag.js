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
		
		hasRepeated: function() {
			return this.repeated;
		},
		hasPropSelected: function() {
			return this.property != '';
		},
		hasTraceNew: function() {
			return this.trace != null;
		},
		
		toggleRepeated: function() {  //web op
			this.repeated = !this.repeated;
		},
		
		toggleTracePage: function(task, page) { //web op
			if( this.trace == null) {
				var p = page;
				if(page.id == this.owner.id && this.trace == null) {
					p = this.owner.shadow();
					task.addShadow(p);
				}
				this.trace = p;
			}else {
				this.trace = null;
			}
		},
		
		untrace: function() {
			this.trace = null;
		},
		
		getTrace: function() {
			return this.trace;
		},
		
		markProperty: function(prop) {  //web op
			this.property = prop;
		},
		
		print: function() {
			var output = '{id:"'+this.id+'",expr:"'+this.expr+'",repeated:'+this.repeated+',property:"'+this.property+'",trace:"';
			if(this.trace) {
				output += this.trace.print();
			}
			output +='"}';
			return output;
		},
	};
	return Tag;
})();