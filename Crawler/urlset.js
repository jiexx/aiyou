var UrlSet =  {
	fetchUrls: [],
	redirectUrls: [],
	visitedUrls: [],  // if only enter browser, even if browser failed, it will be visited. this for avoiding many repeated visit issue.
	procs: [],
	loopQueue: 0,
	PROCMAX: 8,
	PARAMAX: 32,
	
	LOG: function(func, info) {
		console.log('[UrlSet] ['+func+'] '+info);
	},
	
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
				//this.fetchUrls[id].close();
				this.LOG('visited', 'revisite fetch id:'+id);
			}
		}
		else if(type == 'redirect') {
			if(this.redirectUrls[id] != null) {
				//this.redirectUrls[id].close();
				this.visitedUrls[this.redirectUrls[id].getId()] = this.redirectUrls[id];
				delete this.redirectUrls[id];
			}else {
				this.LOG('visited', 'revisite redirect id:'+id);
			}
		}
	},
	
	loopOneBrowser: function() {
		if(this.getNum(this.procs).HAS < this.PROCMAX && this.getNum(this.fetchUrls).HAS > 0 ) {
			this.openFetch();
		}
		if(this.getNum(this.redirectUrls).HAS > 0) {
			this.openRedirect();
		}
	},
	
	openRedirect: function() {
		var url, args=[], num = 0;
		args.push('browser-redirect.js');
		for(var i in this.redirectUrls) {
			url = this.redirectUrls[i];
			if(url != null && this.visitedUrls[url.getId()] == null && (++num) < this.PARAMAX){
				args.push(url.getId());
				args.push(url.getLink());
				this.visited('redirect', url.getId());// for repeated visit issue.
			}
		}
		var exec = require('child_process');
		
		var proc = exec.spawn('casperjs', args);
		this.procs.push(proc);
		
		var pid = proc.pid;
		this.LOG('openRedirect', 'pid:'+pid);
		console.log('[BROWSER] OPEN Redirect pid: '+pid);
		proc.stdout.on('data', function(data) {
		    console.log('[BROWSER] INFO redirect pid: '+pid +' '+  data.toString());
		});
		
		proc.stderr.on('data', function(data) {
			console.log('[BROWSER] ERROR redirect pid: '+pid +' '+  data.toString());
		});

		var _this = this;
		proc.on('exit', function(data) {
			_this.delProc(proc);
			console.log('[BROWSER] EXIT redirect pid: '+pid +' '+  data.toString());
		});
	},
	
	openFetch: function() {
		var url, args=[], num = 0;
		args.push('browser-fetch.js');
		for(var i in this.fetchUrls) {
			url = this.fetchUrls[i];
			if(url != null && this.visitedUrls[url.getId()] == null && (++num) < this.PARAMAX){
				args.push(url.getId());
				args.push(url.getLink());
				this.visited('fetch', url.getId());// for repeated visit issue.
			}
		}
		var exec = require('child_process');

		var proc = exec.spawn('casperjs', args);
		this.procs.push(proc);
		
		var pid = proc.pid;
		console.log('[BROWSER] OPEN Fetch: '+pid);
		//console.log(args.toString());
		proc.stdout.on('data', function(data) {
			console.log('[BROWSER] INFO fetch pid: '+pid +' '+ data.toString());
		});
		
		proc.stderr.on('data', function(data) {
			console.log('[BROWSER] ERROR fetch pid: '+pid +' '+  data.toString());
		});
		
		var _this = this;
		proc.on('exit', function(data) {
			_this.delProc(proc);
			console.log('[BROWSER] EXIT fetch pid: '+pid +' '+  data.toString());
		});
	},
	
	delProc: function(proc) {
		this.LOG('delProc', 'pid:'+proc.pid+' '+this.counter());
		for(var i in this.procs) {
			if(this.procs[i] == proc){
				this.procs.splice(i,1);
			}
		}
		this.loopOneBrowser();
	},
	
	getNum: function(arr) {
		var no = 0, has = 0;
		for(var i in arr) {
			if(arr[i] == null){
				no ++;
			}else {
				has ++;
			}
		}
		return {HAS:has, NO:no};
	},
	
	counter: function() {
		return 'LOOPQUEUE:'+this.loopQueue+' PROC:' + JSON.stringify(this.getNum(this.procs)) +' REDIRECTS:'+JSON.stringify(this.getNum(this.redirectUrls)) +' FETCHS:'+JSON.stringify(this.getNum(this.fetchUrls));
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