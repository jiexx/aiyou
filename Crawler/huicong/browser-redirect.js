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
phantom.outputEncoding = "GBK";

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
	this.echo("console.log: "+msg.toString());
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
	if ( !(/.*hc360\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	/*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/ ) {
		//console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		//console.log('redirect Down JS file: ' + requestData['url']);
	}
};


// for redirect page
var xpathFetchTitle = '//h3[@class="titlelist"]/a';
var xpathFetchPrice = '//li[@class="instr"]';
var xpathFetchDay = '//div[@class="tileft day"]';
var xpathRedirect = '//a[@data-useractivelogs="UserBehavior_s_nextpage"]';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser redirect');
for(var j = 0 ; j < num ; j ++) {
	browser.thenOpen(link[j]);  
	(function(arg){ 
	browser.waitUntilVisible(x(xpathRedirect), function() {
		var k = arg;
		var domain = this.evaluate(function getLinks() {
			return document.domain;
	    });
	
		//this.echo(this.getHTML());
		//this.download(link, 'amazon.html');
		var fetchTitles;
		if(browser.exists(x(xpathFetchTitle))){
		   fetchTitles = this.getElementsAttribute(x(xpathFetchTitle), 'title');
		}
		var fetchPrices = [], fetchAmounts = [];
		if(browser.exists(x(xpathFetchPrice))){
		   var a = this.getElementsInfo(x(xpathFetchPrice));
		   for(var i in a) {
				var f = a[i].text;
				var b = f.indexOf('：')+1;
				var c = f.indexOf('\n', b);
				var d = f.lastIndexOf('：')+1;
				var e = f.lastIndexOf('\n');
				fetchPrices.push(f.substring(b,c));
				fetchAmounts.push(f.substring(d,e));
		   }
		}
		require('utils').dump(fetchPrices);
		require('utils').dump(fetchAmounts);
		var fetchDays = [];
		if(browser.exists(x(xpathFetchDay))){
		   var a = this.getElementsInfo(x(xpathFetchDay));
		   for(var i in a) {
				fetchDays.push(a[i].text);
		   }
		}
		//require('utils').dump(fetchDays);
		var linksRedirect;
		if(browser.exists(x(xpathRedirect))){
		   linksRedirect = this.getElementsAttribute(x(xpathRedirect), 'href');
		}
		
		console.log( "fetchTitles.length:"+fetchTitles.length
					+" fetchPrices.length:"+fetchPrices.length
					+" fetchAmounts.length:"+fetchAmounts.length
					+" fetchDays.length:"+fetchDays.length );
		var result;
		if(fetchTitles.length == fetchAmounts.length && 
			fetchTitles.length == fetchPrices.length && 
		   fetchTitles.length == fetchDays.length) {
			result =  {
				'id': id[k],
				'error': 0,
				'fetchTitles': fetchTitles,
				'fetchPrices': fetchPrices,
				'fetchAmounts': fetchAmounts,
				'fetchDays': fetchDays,
				'redirectLinks':  linksRedirect,
			};
		}else {
			result =  {
				'id': id[k],
				'error': 1,
				'redirectLinks':  linksRedirect,
				'currLink': link[k]
			};
		}
		console.log(JSON.stringify(result));
		/*browser.thenOpen('http://127.0.0.1:8081/redirect', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: result
		}, function(response){
			this.echo("POST redirect has been sent. "+ response.status );
			if(response.status == 200 && this.page.content.indexOf("OK.")){
				counter --;
				this.echo("POST redirect exit "+counter);
				if(counter <= 0) {
					browser.exit();  
				}
			}
		});*/
	});
	})(j);
}
	
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();