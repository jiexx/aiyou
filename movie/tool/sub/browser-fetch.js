/**
 * http://usejsdoc.org/
 */
var browser = require('casper').create({
	pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false,         // use these settings
        //javascriptEnabled: false,
        //resourceTimeout: 5000,
        //userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
    }
    //logLevel: "debug",              // Only "info" level messages will be logged
    //verbose: true  
});
phantom.outputEncoding = "GBK";

if (browser.cli.args.length % 3 != 0) {
	console.log('Usage: browser-redirect.js <some ID> <some URL>' );
	browser.exit();
}

var num = (browser.cli.args.length / 3); 
var counter = num;
//console.log( 'fetch num of links:'+num );
var id = [];
var link = [];
var parent = [];
for(var i = 0 ; i < num ; i ++) {
	id[i] = browser.cli.get(3*i);
	link[i] = browser.cli.get(3*i+1);
	parent[i] = browser.cli.get(3*i+2);
	//console.log("args id["+i+"]:"+browser.cli.get(i)+" link["+i+"]: "+browser.cli.get(i+1));
}

var fs = require('fs');

browser.on('error', function(msg,backtrace) {
	var d = new Date();
	fs.write('err/fetch_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("ERROR:");
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("page.error", function(msg, backtrace) {
	var d = new Date();
	fs.write('err/fetch_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("=========================");
	this.echo("PAGE.ERROR:");
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("remote.message", function(msg) {
	this.echo("console.log: "+msg);
});

browser.on("page.created", function(){
    this.page.onResourceTimeout = function(request){
    	this.echo("onResourceTimeout: "+request);
    };
});
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 20000; 
browser.options.onResourceRequested = function(C, requestData, request) {
	if ( !(/.*subhd\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	&&!(/.*all-4465742\.js.*/gi).test(requestData['url']) /*|| requestData['Content-Type'] == 'text/javascript'*/ ) {
		console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		console.log('redirect Down JS file: ' + requestData['url']);
	}
};

// for redirect page
var xpathDownload = '//button[@id="down"]';
var xpathLink = '//span[@id="down_url"]/a';
var xselLink = 'span#down_url a';
var xpathName = '//h1';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser fetch '+num);
for(var j = 0 ; j < num ; j ++) {
	(function(arg){ 
	var k = arg;
	
	browser.thenOpen(link[k]);  
	console.log('fetch '+link[k]);
	
	browser.waitFor(function check() {
		    return this.evaluate(function() {
		        var a = document.querySelectorAll('div#footer').length > 0;
				//console.log(document.body.innerHTML);
				//console.log(a);
		        return a; 
		    });
	}, function() {
		//console.log('fetch '+this.page.childFramesName().toString());
		var domain = this.evaluate(function getLinks() {
			return document.URL.substring(0,document.URL.lastIndexOf('/'));
	    });
		
		var fetchName = '';
		if(browser.exists(x(xpathName))){
		    var a = this.getElementsInfo(x(xpathName));
			fetchName = a[0].text;
		}
		

		browser.click(x(xpathDownload));
		
		browser.then(function() {
			console.log(">>>>>>" + this.getCurrentUrl());
			browser.waitFor(function check() {
				return this.evaluate(function(xselLink) {
					//console.log(' xselLink '+document.querySelectorAll(xselLink).length);
					return document.querySelectorAll(xselLink).length > 0
				},xselLink);
			}, function() {
				//require('utils').dump(this.getElementInfo(xselLink));
				var fetchDownloadLinks = '';
				if(browser.exists(xselLink)){
					fetchDownloadLinks = this.getElementAttribute(xselLink, 'href');
				}
				
				
				var result =  {
					'id': id[k],
					'sub': fetchDownloadLinks,
					'name':fetchName,
					'link':link[k],
					'parent':parent[k]
				};
				//console.log('fetch '+fetchCompany);
				var r = JSON.stringify(result);
				console.log('fetch--------- '+r);
				r = encodeURI(r);
				r = encodeURI(r);
				
				
				this.echo("fetch POST request will send.");
				browser.thenOpen('http://127.0.0.1:8082/detail', {
					headers: {
						'Content-Type': 'application/json; charset=utf-8'
					},
					method: 'POST',
					data: {encode:r}
				}, function(response){
					this.echo("POST fetch has been sent. "+ response.status );
					if(response.status == 200 && this.page.content.indexOf("OK.")){
						counter --;
						this.echo("POST fetch exit "+counter);
						if(counter <= 0) {
							browser.exit();  
						}
					}
				});
			});
		});
	});
	})(j);
}
	
  
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();