
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
	console.log('Usage: browser-bank.js <some ID> <some URL>' );
	browser.exit();
}

var num = (browser.cli.args.length / 2);  
var counter = num;

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
};


// for redirect page
var xpathRedirect = '//a';
var dicts = [/采购/g, /招标/g];

var x = require('casper').selectXPath;

browser.start(); 
console.log('enter browser bank');
for(var j = 0 ; j < num ; j ++) {
	
	(function(arg){ 
		var k = arg;
		console.log(':'+link[k]);
		browser.thenOpen(link[k]);  
		browser.waitForResource(function testResource(resource) {
			console.log("-->> : "+link[k]+" -->>"+JSON.stringify(resource));
		    return resource.contentType.indexOf("text/html") >= 0;
		}, function onReceived() {
		
		var domain = this.evaluate(function getLinks() {
			return document.domain;
	    });
		//console.log('getHTML:'+this.getHTML());
	    var n = 0;
	    for(var i in dicts) {
	    	var a = this.getHTML().match(dicts[i]);
	    	if(a != null)
	    		n += this.getHTML().match(dicts[i]).length;
	    }
	    
	
		//this.echo(this.getHTML());
		//this.download(link, 'amazon.html');
		var linksRedirect, linksText;
		if(browser.exists(x(xpathRedirect))){
			linksText = this.getElementsInfo(x(xpathRedirect));
			//linksRedirect = this.getElementsAttribute(x(xpathRedirect), 'href');
		}
		//require('utils').dump(linksText);
		
		var m = 0;
		for(var i in linksText) {
			for(var t in dicts) {
				var a = linksText[i].text.match(dicts[t]);
				if(a != null)
					m += a.length;
			}
	    }

		var redirects = [];
		for(var i in linksText) {
			var c = linksText[i].attributes.href;
			if(c == null) {
				continue;
			}
			if( c.indexOf('http://') == 0){
				if(c.indexOf(document.domain) < 0) {
					fs.write('bank_external.txt',  c +"\t\t\t\t"+linksText[i].text+"\n", 'a');
					continue;
				}
			}
			var b = 0;
			for(var t in dicts) {
				var a = linksText[i].text.match(dicts[t]);
				if(a != null)
					b = a.length;
				if(b > 0)
					console.log(c+' '+b);
			}
			if(c.indexOf('/') == 0) {
				redirects.push({link:'http://'+domain+c, hit:b});
			}
		}
		
		var result =  {
				'id': id[k],
				'hitPage': n,
				'hitLink': m,
				'redirectLinks':  redirects,
				'currLink': link[k],
			};
		//console.log( JSON.stringify(result) );
		browser.thenOpen('http://127.0.0.1:8081/bank', {
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
	});
	})(j);
}
	
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();