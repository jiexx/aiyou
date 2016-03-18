

var UrlSet =  {
	fetchUrls: [],
	redirectUrls: [],
	visitedUrls: [],
	
	addFetchUrl: function(url) {
		var visited = this.visitedUrls[url.getId()];
		if(visited == null) {
			this.fetchUrls[url.getId()] = url;
		}
	},
	
	addRedirectUrl: function(url) {
		var visited = this.visitedUrls[url.getId()];
		if(visited == null) {
			this.redirectUrls[url.getId()] = url;
		}
	},
	
	isVisited: function(id) {
		return this.visitedUrls[id] != null;
	},

	visited: function(type, id) {
		if(type == 'fetch') {
			if(this.fetchUrls[id] != null) {
				//this.fetchUrls[id].close();
				this.visitedUrls[this.fetchUrls[id].getId()] = this.fetchUrls[id];
				delete this.fetchUrls[id];
			}else {
				this.fetchUrls[id].close();
				console.log('INFO: revisit fetch id:'+id);
			}
		}
		else if(type == 'redirect') {
			if(this.redirectUrls[id] != null) {
				//this.redirectUrls[id].close();
				this.visitedUrls[this.redirectUrls[id].getId()] = this.redirectUrls[id];
				delete this.redirectUrls[id];
			}else {
				console.log('INFO: revisit redirect id:'+id);
			}
		}
	},
	
	loopOneBrowser: function() {
		//this.openRedirect();
		this.openFetch();
	},
	
	openRedirect: function() {
		var url, args=[];
		args.push('browser-redirect.js');
		for(i in this.redirectUrls) {
			url = this.redirectUrls[i];
			if(url != null && this.visitedUrls[url.getId()] == null){
				args.push(url.getId());
				args.push(url.getLink());
			}
		}
		var exec = require('child_process');

		this.proc = exec.spawn('casperjs', args);
		
		var pid = this.proc.pid;
		console.log('OPEN Redirect: '+pid);
		console.log(args.toString());
		this.proc.stdout.on('data', function(data) {
		    console.log(data.toString());
		});
		
		this.proc.stderr.on('data', function(data) {
			console.log(data.toString());
		});

		this.proc.on('close', function(data) {
			console.log('close '+data.toString());
		});
	},
	
	openFetch: function() {
		var url, args=[];
		args.push('browser-fetch.js');
		for(i in this.fetchUrls) {
			url = this.fetchUrls[i];
			if(url != null && this.visitedUrls[url.getId()] == null){
				args.push(url.getId());
				args.push(url.getLink());
			}
		}
		var exec = require('child_process');

		this.proc = exec.spawn('casperjs', args);
		
		var pid = this.proc.pid;
		console.log('OPEN Fetch: '+pid);
		console.log(args.toString());
		this.proc.stdout.on('data', function(data) {
		    console.log(data.toString());
		});
		
		this.proc.stderr.on('data', function(data) {
			console.log(data.toString());
		});

		this.proc.on('close', function(data) {
			console.log('close '+data.toString());
		});
	},
	
	counter: function() {
		return 'fetchUrls:' + this.fetchUrls.length +' redirectUrls:' + this.redirectUrls.length + 'visitedUrls:' + this.visitedUrls.length + ' ';
	},
	
	close: function() {
		var url, i;
		for(i in this.fetchUrls) {
			url = this.fetchUrls[i];
			if(url != null)
				url.close();
		}
		for(i in this.redirectUrls) {
			url = this.redirectUrls[i];
			if(url != null)
				url.close();
		}
	},
	
	loop: function() {
		var i;
		for(i in this.fetchUrls) {
			var visited = this.visitedUrls[this.fetchUrls[i].getId()];
			if(visited == null) {
				this.fetchUrls[i].open('fetch');
			}
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