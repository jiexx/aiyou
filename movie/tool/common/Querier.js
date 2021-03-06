var Querier =  {
	browser: null,
	url: null,
	addr: null,
	target: null,
	selector: null,
	results: [],
	_init: function() {
		var args = require('system').args;
		var a = JSON.parse(args[0]);
		this.addr = a.addr;
		this.url = a.url;
		this.target = a.target;
		this.selector = a.selector;
		this.filter.push((/[^www\.]*(www\.)+\.(.*)/g).exec(a.url)[1]);
		this.filter.push(a.target.replace(/\./, '\.'));
		var browser = require('casper').create({
			pageSettings: {
				loadImages:  a.options.loadImages, 
				loadPlugins: a.options.loadPlugins, 
				timeout: a.options.timeout,
				userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
			},
			verbose: true  
		});;
		browser.options.onResourceRequested = function(C, requestData, request) {
			var ok = false;
			for(i in this.filter) {
				if(this.filter[i].test(requestData['url'])){
					ok = true;
				}
			}
			if(!ok) {
				request.abort();
			}
		};
		browser.options.retryTimeout = a.options.retryTimeout;
		browser.options.waitTimeout = a.options.waitTimeout; 
		this.browser = browser;
	},
	_debug: function() {
		var browser = this.browser;
		browser.on('error', function(msg,backtrace) {
			this.echo("<----------error--------------");
			this.echo(msg);
			this.echo(backtrace);
			this.echo("------------------------>");
		});
		browser.on("page.error", function(msg, backtrace) {
			this.echo("<----------page.error--------------");
			this.echo(msg);
			this.echo(backtrace);
			this.echo("------------------------>");
		});
		browser.on("remote.message", function(msg) {
			this.echo("<----------remote.message--------------");
			this.echo(msg);
			this.echo("------------------------>");
		});
		browser.on("page.created", function(){
			this.page.onResourceTimeout = function(request){
				this.echo("<---------onResourceTimeout---------------");
				this.echo(request);
				this.echo("------------------------>");
			};
		});
	},
	_return: function(result) {
		var browser = this.browser;
		var r = JSON.stringify(result);
		r = encodeURI(r);
		browser.thenOpen(this.target, {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: {encode:r}
		}, function(response){
			browser.exit();
		});
	},
	run: function() {
		this._init();
		var browser = this.browser;
		browser.start();
		browser.thenOpen(this.url);
		browser.waitFor(function check(res) {
			return this.evaluate(function() {return document.querySelectorAll('body').length > 0; });
		}, function() {
			var e = true;
			for(var i in this.selector){
				if(browser.exists(this.selector[i].expr)){
					var a = this.getElementsInfo(this.selector[i].expr);
					for(var j in a) {
						if(this.selector[i].prefix) {
							this.results.push({Path:this.selector[i].expr,Out:a[j][this.selector[i].prefix][this.selector[i].attr]});
						}else {
							this.results.push({Path:this.selector[i].expr,Out:a[j][this.selector[i].attr]});
						}
					}
					e = false;
				}
			}
			console.log(JSON.stringify({Err:e, URL:this.url, ADDR:this.addr, RESULT:this.results}));
			//this._return({err:e,result:this.results});
		});
		browser.run();
	},
}

Querier.run();