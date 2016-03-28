var iconv = require('iconv-lite');
var Queue = {
	
	statistics: function() {
		return '[QUEUE] '+this.which+' PROC:' + JSON.stringify(this.getNum(this.procs)) 
		+' URLS:'+JSON.stringify(this.getNum(this.urls)) 
		+' VISITING:'+JSON.stringify(this.getNum(this.visiting))
		+' VISITED:'+JSON.stringify(this.getNum(this.visited));
	},
	
	isNoVisit: function(id) {
		return this.visited[id] == null && this.visiting[id] == null;
	},
	
	updateTimeout: function() {
		for(var i in this.visiting) {
			if( this.visiting[i].escape() > this.TIMEOUT ) {
				this.urls[i] = this.visiting[i];
				delete this.visiting[i];
			}
		}
	},
	
	add: function(url) {
		if(this.isNoVisit(url.getId())) {
			this.urls[url.getId()] = url;
		}
	},
	
	_visiting: function(id) {
		if(this.urls[id] != null) {
			this.visiting[id] = this.urls[id];
			delete this.urls[id];
		}else {
			console.log('[QUEUE] '+this.which+' revisiting id: '+id);
		}
	},
	
	_visited: function(id) {
		if(this.visiting[id] != null) {
			this.visited[id] = this.visiting[id];
			delete this.visiting[id];
		}else {
			console.log('[QUEUE] '+this.which+' revisited id: '+id);
		}
	},
	
	_error: function(id) {
		if(this.visiting[id] != null) {
			this.error[id] = this.visiting[id];
			delete this.visiting[id];
		}else {
			console.log('[QUEUE] '+this.which+' rerror id: '+id);
		}
	},
	
	open: function() {
		var url, args=[], num = 0;
		args.push(this.which);
		for(var i in this.urls) {
			url = this.urls[i];
			if(url != null && this.isNoVisit(url.getId()) && (++num) < this.PARAMAX){
				args.push(url.getId());
				args.push(url.getLink());
				this._visiting(url.getId());// for repeated visit issue.
			}
		}
		var exec = require('child_process');
		
		var proc = exec.spawn('casperjs', args);
		console.log(args.toString());
		this.procs.push(proc);
		
		var pid = proc.pid;
		var _this = this;
		console.log('[BROWSER] OPEN '+this.which+' pid: '+pid);
		proc.on('uncaughtException', function (err) { 
			console.log('Caught exception: ' + err); 
		}); 
		proc.stdout.on('data', function(data) {
			var str = iconv.decode(data,'GBK');
		    console.log('[BROWSER] INFO '+_this.which+' pid: '+pid +' '+  str );
		});
		
		proc.stderr.on('data', function(data) {
			var str = iconv.decode(data,'GBK');
			console.log('[BROWSER] ERROR '+_this.which+' pid: '+pid +' '+  str );
		});

		
		proc.on('exit', function(data) {
			_this.exitProc(proc);
			var str = iconv.decode(data,'GBK');
			console.log('[BROWSER] EXIT '+_this.which+' pid: '+pid +' '+  str );
		});
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
	
	exitProc: function(proc) {
		for(var i in this.procs) {
			if(this.procs[i] == proc){
				delete this.procs[i];
			}
		}
		if(this.getNum(this.visiting).HAS > 0) {
			var _this = this;
			setTimeout(function(){
				
				_this.updateTimeout();
				
				if(_this.getNum(_this.visiting).HAS == 0 && _this.getNum(_this.urls).HAS == 0) {
					if(_this.onFinish != null)
						_this.onFinish();
				}else {
					console.log('[BROWSER] TIMEOUT '+_this.which+' pid: '+proc.pid);
					_this.loop();
				}
				
			},this.TIMEOUT);
		}
		else if(this.getNum(this.visiting).HAS == 0 && this.getNum(this.urls).HAS > 0) {
			var _this = this;
			setTimeout(function(){
				
				if(_this.getNum(_this.visiting).HAS == 0 && _this.getNum(_this.urls).HAS == 0) {
					if(_this.onFinish != null) {
						_this.onFinish();
					}
					console.log('[BROWSER] FINISH !!! '+_this.which+' pid: '+proc.pid);	
				}else {
					console.log('[BROWSER] TIMEOUT '+_this.which+' pid: '+proc.pid);
					_this.loop();
				}
				
			},this.TIMEOUT);
		}
	},
	
	loop: function() {
		if(this.getNum(this.procs).HAS < this.PROCMAX && this.getNum(this.urls).HAS > 0 ) {
			
			console.log(this.statistics());
			
			this.open();
		}
		else if(this.getNum(this.procs).HAS >= this.PROCMAX) {
			var _this = this;
			setTimeout(function(){
				
				_this.loop();
				
			},this.TIMEOUT);
		}else {
			console.log(this.statistics());
		}
	},
	
	clear: function() {
		this.urls = [];
		this.visiting = [];
		this.visited = [];
		this.error = [];
		this.procs = [];
	},
	
	create: function(which, procNum, paramNum, onfinish) {
		function F() {};
		F.prototype = Queue;
		var f = new F();
		f.which = which;
		f.PROCMAX = procNum;
		f.urls = [];
		f.visiting = [];
		f.visited = [];
		f.error = [];
		f.procs = [];
		f.PARAMAX = 32;
		f.TIMEOUT = 30000;
		f.onFinish = onfinish;
		return f;
	}
}

var UrlSet =  {
	queueRedirects: null,
	queueFetchs: null,
	
	addFetchUrl: function(url) {
		this.queueFetchs.add(url);
	},
	
	addRedirectUrl: function(url) {
		this.queueRedirects.add(url);
	},
	
	errorRedirectUrl: function(id) {
		this.queueRedirects._error(id);
	},
	
	visitedFetchUrl: function(id) {
		this.queueFetchs._visited(id);
	},
	
	visitedRedirectUrl: function(id) {
		this.queueRedirects._visited(id);
	},
	
	loopFetch: function() {
		this.queueFetchs.loop();
	},
	
	clearFetch: function() {
		this.queueFetchs.clear();
	},
	
	loopRedirect: function() {
		this.queueRedirects.loop();
	},
	
	create: function() {
		function F() {};
		F.prototype = UrlSet;
		var f = new F();
		/*f.queueFetchs = Queue.create('browser-fetch.js', 3, 32, null);
		f.queueRedirects = Queue.create('browser-redirect.js', 3, 32, function(){
			f.queueFetchs.loop();
		});*/
		f.queueFetchs = Queue.create('browser-fetch.js', 3, 32, null);
		f.queueRedirects = Queue.create('browser-redirect.js', 3, 32, null);
		return f;
	}
};