

var UrlSet =  {
	fetchUrls: [],
	redirectUrls: [],
	visitedUrls: [],
	
	addFetchUrls: function(list) {
		for(url in list) {
			var visited = this.visitedUrls[url.getId()];
			if(visited == null || visited == false) {
				this.fetchUrls[url.getId()] = url;
			}
		}
	},
	
	addRedirectUrls: function(list) {
		for(url in list) {
			var visited = this.visitedUrls[url.getId()];
			if(visited == null || visited == false) {
				this.redirectUrls[url.getId()] = url;
			}
		}
	},

	visited: function(type, id) {
		if(type == 'fetch') {
			if(fetchUrls[id] != null) {
				visitedUrls[fetchUrls[id].getId()] = true;
				delete fetchUrls[id];
			}else {
				console.log('ERROR: invalid fetch id'+id)
			}
		}
		else if(type == 'redirect') {
			if(redirectUrls[id] != null) {
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
	
	loop: function() {
		var url;
		for(url in this.fetchUrls) {
			url.open();
		}
		for(url in this.redirectUrls) {
			url.open();
		}
	}
}