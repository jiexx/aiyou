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


if (browser.cli.args.length % 2 != 0) {
	console.log('Usage: browser-redirect.js <some ID> <some URL>' );
	browser.exit();
}

var num = (browser.cli.args.length / 2); 
var counter = num;
//console.log( 'fetch num of links:'+num );
var id = [];
var link = [];
for(var i = 0 ; i < num ; i ++) {
	id[i] = browser.cli.get(2*i);
	link[i] = browser.cli.get(2*i+1);
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
	if ( !(/.*kat\.cr.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	&&!(/.*all-4465742\.js.*/gi).test(requestData['url']) /*|| requestData['Content-Type'] == 'text/javascript'*/ ) {
		console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		console.log('redirect Down JS file: ' + requestData['url']);
	}
};

// for redirect page
var xpathDownload = '//div[@title="Download torrent file"]//a';
var xpathMagnet = '//div[@title="Torrent magnet link"]//a';
var xpathImage = '//a[@class="movieCover"]/img';
var xpathName = '//ul[@class="block overauto botmarg0"]/li[1]/a';
var xpathType = '//ul[@class="block overauto botmarg0"]/li[7]/a';
var xpathPublish = '//div[@class="dataList"]/ul[2]/li[2]';
var xpathArea = '//li[@class="data_lang"]/span';
var xpathDirector = '//div[@class="dataList"]/ul[2]/li[4]/span/a';
var xpathActor = '//div[@class="floatleft width100perc botmarg10px"][1]/span/a';
var xpathQulity = '//ul[@class="block overauto botmarg0"]/li[2]/span';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser fetch');
for(var j = 0 ; j < num ; j ++) {
	(function(arg){ 
	var k = arg;
	
	browser.thenOpen(link[k]);  
	console.log('fetch '+link[k]);
	
	browser.waitFor(function check() {
		    return this.evaluate(function() {
		        var a = document.querySelectorAll('footer.lightgrey').length > 0;
				//console.log(document.body.innerHTML);
				//console.log(a);
		        return a; 
		    });
	}, function() {
		//console.log('fetch '+this.page.childFramesName().toString());
		
		
		var fetchDownloads = [], fetchDownloadLinks = [], fetchMagnets = [], fetchMagnetLinks = [];
		if(browser.exists(x(xpathDownload))){
			var a = this.getElementsInfo(x(xpathDownload));
			for(var i in a) {
				fetchDownloads.push(a[i].text);
		    }
		    var b = this.getElementsAttribute(x(xpathDownload), 'href');
			for(var i in a) {
				fetchDownloadLinks.push(a[i]);
			}
		}
		
		if(browser.exists(x(xpathMagnet))){
			var a = this.getElementsInfo(x(xpathMagnet));
			for(var i in a) {
				fetchMagnets.push(a[i].text);
		    }
		    var b = this.getElementsAttribute(x(xpathMagnet), 'href');
			for(var i in b) {
				fetchMagnetLinks.push(b[i]);
			}
		}
		
		var fetchImage = '';
		if(browser.exists(x(xpathImage))){
		    var a = this.getElementsAttribute(x(xpathImage), 'src');
			fetchImage = a[0] ;
		}
		
		var fetchName = '';
		if(browser.exists(x(xpathName))){
		    var a = this.getElementsInfo(x(xpathName));
			fetchName = a[0].text;
		}
		
		var fetchType = '';
		if(browser.exists(x(xpathType))){
		    var a = this.getElementsInfo(x(xpathType));
			fetchType = a[0].text;
		}
		
		var fetchPublish = '';
		if(browser.exists(x(xpathPublish))){
		    var a = this.getElementsInfo(x(xpathPublish));
			fetchPublish = a[0].text;
		}
		
		var fetchArea = '';
		if(browser.exists(x(xpathArea))){
		    var a = this.getElementsInfo(x(xpathArea));
			fetchArea = a[0].text;
		}
		
		var fetchDirector = [];
		if(browser.exists(x(xpathDirector))){
		    var a = this.getElementsInfo(x(xpathDirector));
			console.log('fetch '+a.toString());
			for(var i in a) {
				fetchDirector.push(a[i].text);
			}
		}
		
		var fetchActors = [];
		if(browser.exists(x(xpathActor))){
		    var a = this.getElementsInfo(x(xpathActor));
			for(var i in a) {
				fetchActors.push(a[i].text);
			}
		}
		
		var fetchQulity = '';
		if(browser.exists(x(xpathActor))){
		    var a = this.getElementsInfo(x(xpathQulity));
			fetchQulity = a[0].text;
		}
		
		
		var result =  {
			'id': id[k],
			'downtxt':fetchDownloads,
			'down': fetchDownloadLinks,
			'img':fetchImage,
			'name':fetchName,
			'type':fetchType,
			'pub':fetchPublish,
			'area':fetchArea,
			'dir':fetchDirector,
			'act':fetchActors,
			'link':link[k]
		};
		//console.log('fetch '+fetchCompany);
		var r = JSON.stringify(result);
		console.log('fetch '+r);
		r = encodeURI(r);
		r = encodeURI(r);
		
		
		this.echo("fetch POST request will send.");
		/*browser.thenOpen('http://127.0.0.1:8081/detail', {
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
		});*/
	});
	})(j);
}
	
  
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();