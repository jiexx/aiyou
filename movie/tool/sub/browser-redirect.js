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
phantom.outputEncoding = "GBK";

if (browser.cli.args.length % 3 != 0) {
	console.log('Usage: browser-redirect.js <some ID> <some URL> <some Parent> NOT num:'+browser.cli.get(0) );
	browser.exit();
}

var num = (browser.cli.args.length / 3); 
var counter = num;
console.log( 'redirect num of links:'+num );
var id = [];
var link = [];
var parent = [];
for(var i = 0 ; i < num ; i ++) {
	id[i] = browser.cli.get(2*i);
	link[i] = browser.cli.get(2*i+1);
	parent[i] = browser.cli.get(2*i+2);
}

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
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 120000; 
browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {
	if ( !(/.*subhd\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	/*|| requestData['Content-Type'] == 'text/javascript'*/ ) {
		console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		console.log('redirect Down JS file: ' + requestData['url']);
	}
};


// for redirect page
var xpathFetchTitle = '//div[@class="d_title"]/a';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser redirect '+num);
for(var j = 0 ; j < num ; j ++) {
	(function(arg){ 
	var k = arg;
	browser.thenOpen(link[k]);  
	console.log('redirect '+link[k]);
	//setInterval(captureImage(), 6000);
	browser.waitFor(function check() {
		    return this.evaluate(function() {
		        var a = document.querySelectorAll('div#footer').length > 0;
				//console.log(document.body.innerHTML);
				//console.log(a);
		        return a; 
		    });
	}, function() {
		var domain = this.evaluate(function getLinks() {
			return document.URL.substring(0,document.URL.lastIndexOf('/search'));
	    });  
		//this.echo(this.getHTML());
		//this.download(link, 'test.html');
		var fetchTitles = [], fetchLinks = [];
		if(browser.exists(x(xpathFetchTitle))){
			var a = this.getElementsInfo(x(xpathFetchTitle));
			for(var i in a) {
				fetchTitles.push(a[i].text);
		   }
		   var b = this.getElementsAttribute(x(xpathFetchTitle), 'href'); 
		   for(var i in b) {
				fetchLinks.push(domain+b[i]);
		   }
		}

		
		console.log( "fetchTitles.length:"+fetchTitles.length
					+" fetchLinks.length:"+fetchLinks.length);
		var result;
		if(fetchTitles.length == fetchLinks.length) {
			
			result =  {
				'id': id[k],
				'error': 0,
				'fetchTitles': fetchTitles,
				'fetchLinks':fetchLinks,
				'currLink': link[k],
				'parent': parent[k]
			};
			
		}else {
			result =  {
				'id': id[k],
				'error': 1,
				'currLink': link[k],
				'parent':parent[k]
			};
		}
		var r = JSON.stringify(result);
		console.log(JSON.stringify(result));
		r = encodeURI(r);
		r = encodeURI(r);
		
		
		browser.thenOpen('http://127.0.0.1:8082/redirect', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: {encode:r}
		}, function(response){
			this.echo("POST redirect has been sent. "+ response.status +"  \n"+this.page.content.substring(1,100) );
			if(response.status == 200 && this.page.content.indexOf("OK.")){
				counter --;
				this.echo("POST redirect exit "+counter);
				if(counter <= 0) {
					console.log('browser exit 0');
					browser.exit();  
				}
			}
		});
	});
	})(j);
}
	
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();