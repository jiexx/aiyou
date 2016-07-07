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
	
	killZombie: function(callback) {
		console.log('..... killZombie: '+ JSON.stringify(this.procs));
		var now = (new Date()).getTime();
		for(var i = 0 ; i < this.procs.length ; i ++ ){
			if(now - this.procs[i].e > this.TIMEOUT * 4){
				console.log('************************************************************************  killZombie ' + this.procs[i].p);
				//process.kill(this.procs[i].p, 'SIGKILL');
				this.procs.splice(i,1);
				var spawn = require('child_process').spawn;    
				var proc = spawn("taskkill", ["/pid", this.procs[i].p, '/f', '/t']);
				var _this = this;
				proc.stdout.on('data', function(data){
					console.log('************************************************************************ killZombie  open ');
					callback();
				});
				proc.stderr.on('data', function(data){
					console.log('************************************************************************ killZombie  NOT exist ');
				});
				for(var i in this.visiting) {
					if( this.visiting[i].escape() > this.TIMEOUT * 5 ) {
						this.visiting.slice(i,1);
					}else {
						this.urls[i] = this.visiting[i];
						delete this.visiting[i];
					}
				}
			}
		}
		if(this.procs.length == 0) {
			console.log('************************************************************************  killZombie ');
			//process.kill(this.procs[i].p, 'SIGKILL');
			this.procs.splice(i,1);
			var spawn = require('child_process').spawn;    
			var proc = spawn("taskkill", ["/pid", this.procs[i].p, '/f', '/t']);
			var _this = this;
			proc.stdout.on('data', function(data){
				console.log('************************************************************************ killZombie  open ');
				callback();
			});
			proc.stderr.on('data', function(data){
				console.log('************************************************************************ killZombie  NOT exist ');
			});
			for(var i in this.visiting) {
				if( this.visiting[i].escape() > this.TIMEOUT * 5 ) {
					this.visiting.slice(i,1);
				}else {
					this.urls[i] = this.visiting[i];
					delete this.visiting[i];
				}
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
		//args.push("--ssl-protocol=any");
		args.push(this.which);
		for(var i in this.urls) {
			url = this.urls[i];
			if(url != null && this.isNoVisit(url.getId()) && (++num) < this.PARAMAX){
				args.push(url.getId());
				args.push(url.getLink());
				if(url.getParent()){
					args.push(url.getParent());
				}
				this._visiting(url.getId());// for repeated visit issue.
			}
		}
		var exec = require('child_process');
		
		var proc = exec.spawn('casperjs', args);
		console.log(args.toString());
		var pid = proc.pid;
		this.procs.push({p:pid,e:(new Date()).getTime()});
		
		
		var _this = this;
		console.log('[BROWSER] OPEN '+this.which+' pid: '+pid);
		proc.on('uncaughtException', function (err) { 
			console.log('Caught exception: ' + err); 
		}); 
		proc.stdout.on('data', function(data) {
			//var str = iconv.decode(data,'utf8');
		    console.log('[BROWSER] INFO '+_this.which+' pid: '+pid +' '+  data );
		});
		
		proc.stderr.on('data', function(data) {
			//var str = iconv.decode(data,'utf8');
			console.log('[BROWSER] ERROR '+_this.which+' pid: '+pid +' '+  data );
		});

		
		proc.on('exit', function(data) {
			console.log('[BROWSER] EXIT '+_this.which+' pid: '+pid +' '+  data );
			_this.exitProc(pid);
			//var str = iconv.decode(data,'GBK');
			
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
	
	getUrlsNum: function() {
		return this.getNum(this.urls).HAS;
	},
	
	exitProc: function(pid) {
		console.log('[BROWSER] exitProc pid: '+pid + ' in '+ JSON.stringify(this.procs));
		for(var i in this.procs) {
			if(this.procs[i].p == pid){
				this.procs.splice(i,1);
			}
		}
		console.log('[BROWSER] exitProc pid: '+pid + ' in '+ JSON.stringify(this.procs));
		if(this.getNum(this.visiting).HAS > 0) {
			var _this = this;
			setTimeout(function(){
				
				_this.updateTimeout();
				
				if(_this.getNum(_this.visiting).HAS == 0 && _this.getNum(_this.urls).HAS == 0) {
					if(_this.onFinish != null)
						_this.onFinish();
				}else {
					console.log('[BROWSER] TIMEOUT '+_this.which+' pid: '+pid);
					_this.loop(pid);
				}
				
			},this.TIMEOUT);
		}
		else if(this.getNum(this.visiting).HAS == 0 && this.getNum(this.urls).HAS > 0) {
			var _this = this;
			//setTimeout(function(){
				
				if(_this.getNum(_this.visiting).HAS == 0 && _this.getNum(_this.urls).HAS == 0) {
					if(_this.onFinish != null) {
						_this.onFinish();
					}
					console.log('[BROWSER] FINISH !!! '+_this.which+' pid: '+pid);	
				}else {
					console.log('[BROWSER] TIMEOUT '+_this.which+' pid: '+pid);
					_this.loop(pid);
				}
				
			//},this.TIMEOUT);
		}
	},
	
	loop: function(pid) {
		console.log(this.statistics());
		if(this.getNum(this.procs).HAS < this.PROCMAX && this.getNum(this.urls).HAS > 0 ) {
			this.open();
		}
		else if(this.getNum(this.procs).HAS >= this.PROCMAX) {
			
			/*setTimeout(function(){
				console.log('[BROWSER] TIMEOUT TRY ' + _this.TIMEOUT_NUM + ' pid:'+ pid);
				console.log('[BROWSER] loop pid: '+pid + ' in '+ JSON.stringify(_this.procs));
				_this.TIMEOUT_NUM --;
				if(_this.TIMEOUT_NUM > 0) {
					_this.loop(pid);
				}else {
					if(pid) {
						//console.log('[BROWSER] SIGINT ' + pid);
						//process.kill(pid, 'SIGINT');
						_this.open();
					}
					
					_this.TIMEOUT_NUM = 10;
				}
			},this.TIMEOUT);*/
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
		f.TIMEOUT_NUM = 10;
		f.onFinish = onfinish;
		var _this = this;
		return f;
	}
}

var UrlSet =  {
	queueRedirects: null,
	queueFetchs: null,
	
	getCountOfRedirects: function() {
		return this.queueRedirects.getUrlsNum();
	},
	
	getCountOfFetchs: function() {
		return this.queueFetchs.getUrlsNum();
	},
	
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
		var _this = this.queueRedirects;
		setInterval(function(){ 
			console.log('===========================================');
			_this.killZombie(function(){_this.open();});
		}, _this.TIMEOUT * 4);
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