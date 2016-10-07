var Querier =  {
	casper: null,
	/*name: '',
	url: '';
	isShadow: false,
	tags: null,
	id: 0;*/
	page: null,
	filter: [],
	create: function() {
		function Q() {};
		Q.prototype = Querier;
		var obj = new Q();
		
		var args = require('system').args;
		var js = JSON.parse(args[0]);
		
		obj.filter.push((/[^www\.]*(www\.)+\.(.*)/g).exec(a.url)[1]);
		
		obj.page = js.page;
		obj.casper = require('casper').create({
			pageSettings: {
				loadImages:  js.conf.loadImages, 
				loadPlugins: js.conf.loadPlugins, 
				timeout: js.conf.timeout,
				userAgent: js.conf.userAgent
			},
			verbose: true  
		});
		obj.casper.options.retryTimeout = js.conf.retryTimeout;
		obj.casper.options.waitTimeout = js.conf.waitTimeout; 
		
		obj.casper.options.onResourceRequested = function(C, requestData, request) {
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
		
		return obj;
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
	run: function() {
		var browser = this.create();
		var casper = browser.casper;
		casper.start();
		casper.thenOpen(browser.url);
		casper.waitFor(function check(res) {
			return this.evaluate(function() {return document.querySelectorAll('body').length > 0; });
		}, function() {
			var e = true;
			for(var i in browser.page.tags){
				if(browser.exists(browser.page.tags[i].expr)){
					var a = this.getElementsInfo(browser.page.tags[i].expr);
					for(var j in a) {
						if(browser.page.tags[i].prefix) {
							this.results.push({Path:browser.page.tags[i].expr,Out:a[j][browser.page.tags[i].prefix][browser.page.tags[i].attr]});
						}else {
							this.results.push({Path:browser.page.tags[i].expr,Out:a[j][browser.page.tags[i].attr]});
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