/**
 * http://usejsdoc.org/
 */
var browser = require('casper').create({
	pageSettings: {
        loadImages:  false,        // The WebPage instance used by Casper will
        loadPlugins: false         // use these settings
    },
    //logLevel: "info",              // Only "info" level messages will be logged
    verbose: true  
});

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

var id = browser.cli.get(0);
var link = browser.cli.get(1);
var type = browser.cli.get(2);

if (browser.cli.args.length != 3) {
	console.log('Usage: browser.js <some URL>' );
	console.log(browser.cli.args.length + " " + id + " " + link + " " + type );
	browser.exit();
}
console.log(browser.cli.args.length + " " + id + " " + link + " " + type );
// for redirect page
var xpathFetch = '//div[contains(@id,"result_")]/div/div[0]/div/div/a';
var xpathRedirect = '//div[@id="pagn")]/span[@class="pagnLink"]/a';
var xpathImage = '//div[contains(@id,"result_")]/div/div[0]/div/div/a/img';

//for fetch page
var xpathDesc = '//div[@id="productDescription")]/div[@class="content"]/div[@class="productDescriptionWrapper"]';

browser.start();  

browser.open(link);  

browser.then(function() {
	var info;
	console.log( 'thenEvaluate' );
	if(type == 'fetch') {  // can be 
		var descInfo = this.getElementInfo(xpathDesc);
		
		browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'fetch',
		        'desc': descInfo,
		    },
		});
	}else if(type == 'redirect') {
		console.log( 'redirect' );
		var imagesInfo = this.getElementInfo(xpathImage);
		console.log( 'imagesInfo' );
		var fetchInfo = this.getElementInfo(xpathFetch);
		var redirectInfo = this.getElementInfo(xpathUpdate);
		
		console.log( fetchInfo );
		
		var linksImage = [];
		for(info in imagesInfo) {
			linksImage.push(info.attributes.src);
		}
		
		var linksFetch = [];
		var titlesFetch = [];
		for(info in fetchInfo) {
			linksFetch.push(info.attributes.href);
			titlesFetch.push(info.attributes.title)
		}
		
		var linksRedirect = [];
		for(info in redirectInfo) {
			linksRedirect.push(info.attributes.href);
		}
		
		/*browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'fetch',
		        'fetchLinks': linksFetch,
		        'redirectLinks':  linksRedirect,
		        'name': titlesFetch,
		        'image': linksImage
		    },
		});*/
		console.log(titlesFetch);
	}
});
  
/*browser.thenEvaluate(function(browser, id, type, xpathFetch, xpathRedirect, xpathImage, xpathDesc) {
	var info;
	console.log( 'thenEvaluate' );
	if(type == 'fetch') {  // can be 
		var descInfo = this.getElementInfo(xpathDesc);
		
		browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'fetch',
		        'desc': descInfo,
		    },
		});
	}else if(type == 'redirect') {
		console.log( 'redirect' );
		var imagesInfo = browser.getElementInfo(xpathImage);
		console.log( 'imagesInfo' );
		var fetchInfo = browser.getElementInfo(xpathFetch);
		var redirectInfo = browser.getElementInfo(xpathUpdate);
		
		console.log( fetchInfo );
		
		var linksImage = [];
		for(info in imagesInfo) {
			linksImage.push(info.attributes.src);
		}
		
		var linksFetch = [];
		var titlesFetch = [];
		for(info in fetchInfo) {
			linksFetch.push(info.attributes.href);
			titlesFetch.push(info.attributes.title)
		}
		
		var linksRedirect = [];
		for(info in redirectInfo) {
			linksRedirect.push(info.attributes.href);
		}
		
		browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'fetch',
		        'fetchLinks': linksFetch,
		        'redirectLinks':  linksRedirect,
		        'name': titlesFetch,
		        'image': linksImage
		    },
		});
		console.log(titlesFetch);
	}
}, browser, id, type, xpathFetch, xpathRedirect, xpathImage, xpathDesc);*/

browser.then(function() {  
	browser.exit();  
	console.log('exit');
});

browser.run();