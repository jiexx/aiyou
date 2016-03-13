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

browser.start();  

browser.open(system.args[1]);  
  
browser.thenEvaluate(function out() {  
	var x = require('casper').selectXPath;
	if(type == 'fetch') {
		var pathImage = '//*[@id="landingImage"]';
		var image = this.getElement(x(pathImage), 'src');
		var pathFetch = '//*[@id="mainResults"]/ul/li[0]/div[0]';
		var linkFetch = this.getElement(x(pathFetch), 'src');
		var pathUpdate = '//*[@class="pagnLink"]';
		var linkUpdate = this.getElement(x(pathUpdate), 'src');
		
		browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'fetch',
		        'fetchLinks': linkFetch,
		        'redirectLinks':  linkUpdate,
		        'name': documment.title,
		        'image': image.src
		    },
		});
	}else if(type == 'redirect') {
		var pathFetch = '//*[@id="mainResults"]/ul/li[0]/div[0]';
		var linkFetch = this.getElement(x(pathFetch), 'src');
		var pathUpdate = '//*[@class="pagnLink"]';
		var linkUpdate = this.getElement(x(pathUpdate), 'src');
		
		browser.open('http://127.0.0.1/update', {
		    method: 'post',
		    data:   {
		    	'id': id,
		    	'type': 'redirect',
		        'linkFetch': linkFetch,
		        'linkUpdate':  linkUpdate,
		        'name': documment.title,
		        'image': image.src
		    },
		});
	}
});

browser.then(function end() {  
	browser.exit();  
});

browser.run();