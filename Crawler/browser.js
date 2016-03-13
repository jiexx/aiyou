/**
 * http://usejsdoc.org/
 */
var browser = require('casper').create(),
	system = require('system');

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

if (system.args.length != 2) {
	console.log('Usage: browser.js <some URL>');
	browser.exit();
}
var id = system.args[1];
var link = system.args[2];
var type = system.args[3];

// for redirect page
var xpathFetch = '//div[contains(@id,"result_")]/div/div[0]/div/div/a';
var xpathRedirect = '//div[@id="pagn")]/span[@class="pagnLink"]/a';
var xpathImage = '//div[contains(@id,"result_")]/div/div[0]/div/div/a/img';

//for fetch page
var xpathDesc = '//div[@id="productDescription")]/div[@class="content"]/div[@class="productDescriptionWrapper"]';

browser.start();  

browser.open(system.args[1]);  
  
browser.thenEvaluate(function out() {
	var info;
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
		var imagesInfo = this.getElementInfo(xpathImage);
		var fetchInfo = this.getElementInfo(xpathFetch);
		var redirectInfo = this.getElementInfo(xpathUpdate);
		
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
	}
});

browser.then(function end() {  
	browser.exit();  
});

browser.run();