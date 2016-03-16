

var UrlSet =  {
	fetchUrls: [],
	redirectUrls: [],
	visitedUrls: [],
	
	addFetchUrl: function(url) {
		var visited = this.visitedUrls[url.getId()];
		if(visited == null || visited == false) {
			this.fetchUrls[url.getId()] = url;
		}
	},
	
	addRedirectUrl: function(url) {
		var visited = this.visitedUrls[url.getId()];
		if(visited == null || visited == false) {
			this.redirectUrls[url.getId()] = url;
		}
	},

	visited: function(type, id) {
		if(type == 'fetch') {
			if(this.fetchUrls[id] != null) {
				this.fetchUrls[id].close();
				this.visitedUrls[fetchUrls[id].getId()] = true;
				delete this.fetchUrls[id];
			}else {
				console.log('INFO: invalid fetch id:'+id)
			}
		}
		else if(type == 'redirect') {
			if(this.redirectUrls[id] != null) {
				this.redirectUrls[id].close();
				this.visitedUrls[redirectUrls[id].getId()] = true;
				delete this.redirectUrls[id];
			}else {
				console.log('INFO: invalid redirect id:'+id)
			}
		}
	},
	
	counter: function() {
		return 'fetchUrls:' + this.fetchUrls.length +' redirectUrls:' + this.redirectUrls.length + 'visitedUrls:' + this.visitedUrls.length + ' ';
	},
	
	close: function() {
		var url;
		for(url in this.fetchUrls) {
			url.close();
		}
		for(url in this.redirectUrls) {
			url.close();
		}
	},
	
	loop: function() {
		var i;
		for(i in this.fetchUrls) {
			this.fetchUrls[i].open('fetch');
		}
		/*
		 * for(url in this.redirectUrls) { url.open('redirect'); }
		 */
	},
	
	create: function() {
		function F() {};
		F.prototype = UrlSet;
		return new F();
	}
};