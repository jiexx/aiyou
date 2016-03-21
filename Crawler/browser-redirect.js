/**
 * http://usejsdoc.org/
 */
var browser = require('casper').create({
	pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false,         // use these settings
        //javascriptEnabled: false,
        //resourceTimeout: 30000,
        //userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
        userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.151 Safari/534.16'
    },
    //logLevel: "debug",              // Only "info" level messages will be logged
    verbose: true  
});

if (browser.cli.args.length % 2 != 0) {
	console.log('Usage: browser-redirect.js <some ID> <some URL>' );
	browser.exit();
}

var num = (browser.cli.args.length / 2); 
var counter = num;
console.log( 'redirect num of links:'+num );
var id = [];
var link = [];
for(var i = 0 ; i < num ; i ++) {
	id[i] = browser.cli.get(2*i);
	link[i] = browser.cli.get(2*i+1);
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
	this.echo("console.log: "+msg);
});

browser.on("page.created", function(){
    this.page.onResourceTimeout = function(request){
    	this.echo("onResourceTimeout: "+request);
    };
});
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 600000; 
browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {
	if ( !(/.*amazon\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
			&&!(/.*s\.amazon-adsystem\.com.*/gi).test(requestData['url']) 
			&&!(/.*fls-na\.amazon\.com.*/gi).test(requestData['url']) /*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/ ) {
		//console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		//console.log('redirect Down JS file: ' + requestData['url']);
	}
};


// for redirect page
var xpathFetch = '//a[@class="a-link-normal s-access-detail-page  a-text-normal"]';
var xpathRedirect = '//a[@id="pagnNextLink"]';
var xpathImage = '//li[contains(@id,"result_")]/div/div[1]/div/div/a/img';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser redirect');
for(var j = 0 ; j < num ; j ++) {
	browser.thenOpen(link[j]);  
	(function(arg){ 
	browser.waitUntilVisible(x(xpathImage), function() {
		var k = arg;
		console.log("-->> redirect id["+k+"]:"+id[k]+" link["+k+"]: "+link[k]);
		var domain = this.evaluate(function getLinks() {
			return document.domain;
	    });
	
		//this.echo(this.getHTML());
		//this.download(link, 'amazon.html');
		var linksImage = this.getElementsAttribute(x(xpathImage), 'src');
		var fetchs = this.getElementsInfo(x(xpathFetch));
		var linksFetch = this.getElementsAttribute(x(xpathFetch), 'href');
		var titlesFetch = this.getElementsAttribute(x(xpathFetch), 'title');
		var linksRedirect;
		if(browser.exists(x(xpathRedirect))){
		   linksRedirect = this.getElementsAttribute(x(xpathRedirect), 'href');
		}
		
		var names = [];
		for(var i in titlesFetch) {
			if(titlesFetch[i].length > 0)
				names.push(titlesFetch[i]);
		}
		var fetchs = [];
		for(var i in linksFetch) {
			if(linksFetch[i].length > 0)
				fetchs.push(linksFetch[i]);
			//console.log(linksFetch[i]);
		}

		var redirects = [];
		for(var i in linksRedirect) {
			var c;
			if(linksRedirect[i].length > 300) {
				var a = linksRedirect[i].indexOf('spIA=');
				var b = linksRedirect[i].indexOf('&', a);
				if(b > -1) {
					c = linksRedirect[i].substring(0,a-1)+linksRedirect[i].substring(b);
				}else {
					c = linksRedirect[i].substring(0,a-1);
				}
			}else {
				c = linksRedirect[i];
			}
			if(linksRedirect[i].length > 0) {
				redirects.push('http://'+domain+c);
			}
			
		}
		
		var result =  {
		    'id': id[k],
	        'fetchLinks': fetchs,
	        'redirectLinks':  redirects,
	        'names': names,
	        'linksImage': linksImage
	    };
		//console.log( redirects[0].toString());
		
		if(fetchs.length == names.length && names.length == linksImage.length) {
			browser.thenOpen('http://127.0.0.1:8081/redirect', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data: result
			}, function(response){
				this.echo("POST redirect has been sent. "+ response.status /*+" "+ this.page.content*/);
				if(response.status == 200 && this.page.content.indexOf("OK.")){
					counter --;
					this.echo("POST redirect exit "+counter);
					if(counter <= 0) {
						browser.exit();  
					}
			    }
			});
		}
	});
	})(j);
}
	
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();