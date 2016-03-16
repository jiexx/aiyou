

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
			if(fetchUrls[id] != null) {
				fetchUrls[id].close();
				visitedUrls[fetchUrls[id].getId()] = true;
				delete fetchUrls[id];
			}else {
				console.log('ERROR: invalid fetch id'+id)
			}
		}
		else if(type == 'redirect') {
			if(redirectUrls[id] != null) {
				redirectUrls[id].close();
				visitedUrls[redirectUrls[id].getId()] = true;
				delete redirectUrls[id];
			}else {
				console.log('ERROR: invalid redirect id'+id)
			}
		}
	},
	
	counter: function() {
		return 'fetchUrls:' + fetchUrls.length +' redirectUrls:' + redirectUrls.length + 'visitedUrls:' + visitedUrls.length + ' ';
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
		var url;
		for(url in this.fetchUrls) {
			url.open('fetch');
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