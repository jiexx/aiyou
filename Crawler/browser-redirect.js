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
console.log( 'redirect num of links:'+num );
var id = [];
var link = [];
for(var i = 0 ; i < num ; i ++) {
	id[i] = browser.cli.get(2*i);
	link[i] = browser.cli.get(2*i+1);
}



browser.on('error', function(msg,backtrace) {
	this.echo("=========================");
	this.echo("ERROR:");
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("page.error", function(msg, backtrace) {
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

browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {
	if ( !(/.*amazon\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
			/*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/ ) {
		//console.log('Skipping JS file: ' + requestData['url']);
		request.abort();
	}
	console.log('Down JS file: ' + requestData['url']);
};


// for redirect page
var xpathFetch = '//li[contains(@id,"result_")]/div/div[2]/div[1]/a';
var xpathRedirect = '//span[@class="pagnLink"]/a';
var xpathImage = '//li[contains(@id,"result_")]/div/div[1]/div/div/a/img';

var x = require('casper').selectXPath;

browser.start();  

for(var j = 0 ; j < num ; j ++) {
	browser.thenOpen(link[j]);  
	console.log("id["+j+"]:"+id[j]+" link["+j+"]: "+link[j]);
	(function(arg){ 
	browser.waitForUrl(link[j], function() {
		var k = ''+arg;
		console.log(""+k+"-->>"+ arg);
		var domain = this.evaluate(function getLinks() {
			return document.domain;
	    });
	
		//this.echo(this.getHTML());
		//this.download(link, 'amazon.html');
		var linksImage = this.getElementsAttribute(x(xpathImage), 'src');
		var fetchs = this.getElementsInfo(x(xpathFetch));
		var linksFetch = this.getElementsAttribute(x(xpathFetch), 'href');
		var titlesFetch = this.getElementsAttribute(x(xpathFetch), 'title');
		var linksRedirect = this.getElementsAttribute(x(xpathRedirect), 'href');
		
		var names = [];
		for(var i in titlesFetch) {
			if(titlesFetch[i].length > 0)
				names.push(titlesFetch[i]);
		}
		var fetchs = [];
		for(var i in linksFetch) {
			if(linksFetch[i].length > 0)
				fetchs.push(linksFetch[i]);
			console.log(linksFetch[i]);
		}

		var redirects = [];
		for(var i in linksRedirect) {
			if(linksRedirect[i].length > 0)
				redirects.push('http://'+domain+linksRedirect[i]);
		}
		
		console.log("id["+k+"]-->>"+ k.toString());
		var result =  {
		    'id': id[k],
	        'fetchLinks': fetchs,
	        'redirectLinks':  redirects,
	        'names': names,
	        'linksImage': linksImage
	    };
		
		if(fetchs.length == names.length && names.length == linksImage.length) {
			browser.thenOpen('http://127.0.0.1:8081/redirect', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data: result
			}, function() {
			    this.echo("POST request has been sent.");
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