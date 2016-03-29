/**
 * http://usejsdoc.org/
 */
console.log("start");
var browser = require('casper').create({
	pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false,         // use these settings
        //javascriptEnabled: false,
        //resourceTimeout: 30000,
        //userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
    },
    //logLevel: "debug",              // Only "info" level messages will be logged
    verbose: true  
});
phantom.outputEncoding = "utf-8";


var fs = require('fs');

browser.on('error', function(msg,backtrace) {
	var d = new Date();
	fs.write('err/direct_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("=========================");
	this.echo("ERROR:");
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("page.error", function(msg, backtrace) {
	var d = new Date();
	fs.write('err/direct_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("=========================");
	this.echo("PAGE.ERROR:");
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("remote.message", function(msg) {
	this.echo("console.log: "+msg.toString());
});

browser.on("page.created", function(){
    this.page.onResourceTimeout = function(request){
    	this.echo("onResourceTimeout: "+request);
    };
});
browser.options.retryTimeout = 150;
browser.options.waitTimeout = 12000000000000000; 
browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {

};


// for redirect page

var x = require('casper').selectXPath;
browser.start();  
console.log('enter browser redirect');
for(var i = 0; i < 1000000 ; i ++){
(function(arg) {
	var j = arg;
	//browser.clear();
	browser.thenOpen("http://b2b.hc360.com/cgi-bin/get_back?id="+j);  
	browser.then(function(){
		var d = new Date();
		browser.waitFor(
			function check() {
				return this.evaluate(function() {
					console.log(document.querySelectorAll('img').length);
					return document.querySelectorAll('img').length > 0;
				});
			}, function() {
				require('utils').dump(x('//img'));
				this.captureSelector('captcha/'+d.getTime().toString()+'.png', x('//img'));
			}
		);
	});
})(i);
}

browser.run();





browser.run();