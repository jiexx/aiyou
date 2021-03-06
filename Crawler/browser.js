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
        userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.151 Safari/534.16',
    },
    logLevel: "debug",              // Only "info" level messages will be logged
    verbose: true  
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

browser.on('error', function(msg,backtrace) {
	this.echo("=========================");
	this.echo("ERROR:" + ''+type+' id:'+id+' link:'+link);
	this.echo(msg);
	this.echo(backtrace);
	this.echo("=========================");
});

browser.on("page.error", function(msg, backtrace) {
	this.echo("=========================");
	this.echo("PAGE.ERROR:" + ''+type+' id:'+id+' link:'+link);
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
	//console.log('Down JS file: ' + requestData['url']);
};


// for redirect page
var xpathFetch = '//li[contains(@id,"result_")]/div/div[2]/div[1]/a';
var xpathRedirect = '//span[@class="pagnLink"]/a';
var xpathImage = '//li[contains(@id,"result_")]/div/div[1]/div/div/a/img';

//for fetch page
var xpathDesc = '//div[@id="productDescription")]';//'//div[@id="productDescription")]/div[@class="content"]/div[@class="productDescriptionWrapper"]';

var x = require('casper').selectXPath;

browser.start();  

browser.open(link);  

browser.then(function() {
	var domain = this.evaluate(function getLinks() {
        /*var links = document.querySelectorAll('span.pagnLink a');
        return Array.prototype.map.call(links, function(e) {
            return e.getAttribute('href')
        });*/
		return document.domain;
    });
	
	/*console.log( '--------------->'+linksRedirect );*/
	
	if(type == 'fetch') {  // can be 
		
		console.log('fetch '+this.page.childFramesName().toString());
		
		this.withFrame('product-description-iframe', function() {
			console.log('product-description.......');
			var product = this.getElementInfo(x('//div[@class="productDescriptionWrapper"]'));
			console.log(product.text);
			
			browser.open('http://127.0.0.1:8081/detail', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data:   {
			    	'id': id,
			        'desc': product.text,
			    },
			}, function(response){
				this.echo("POST fetch has been sent.")
			});
		});
		
		/*this.waitFor(function check() {
		    return this.evaluate(function() {
		        return document.querySelectorAll('div.productDescriptionWrapper').length > 0;
		    });
		}, function then() {
		    this.captureSelector('yoursitelist.png', 'div.productDescriptionWrapper');
		    console.log('yoursitelist.......');
		}, function timeout() { 
			console.log('timeout.......'+this.page.childFramesName());
			this.echo('Page url is ' + this.getCurrentUrl());
			this.captureSelector('body.png', 'body#dp');
			this.captureSelector('product.png', 'iframe#product-description-iframe');
			var info = this.getElementsInfo(x('//iframe[@id="product-description-iframe"]'));
			require('utils').dump(info);
			//var fs = require('fs');
			//fs.write('amazon.html', this.page.content, 'w');
		}, 5000);

		
		browser.withFrame('flashHolder', function() {
			this.test.assertSelectorExists('#the-flash-thing', 'Should show Flash');
		});*/
		//var descInfo = this.getElementsInfo(x(xpathDesc));
		
		//require('utils').dump(descInfo);
	}else if(type == 'redirect') {
		console.log( 'redirect' );
		//this.echo(this.getHTML());
		//this.download(link, 'amazon.html');
		var linksImage = this.getElementsAttribute(x(xpathImage), 'src');
		var fetchs = this.getElementsInfo(x(xpathFetch));
		var linksFetch = this.getElementsAttribute(x(xpathFetch), 'href');
		var titlesFetch = this.getElementsAttribute(x(xpathFetch), 'title');
		var linksRedirect = this.getElementsAttribute(x(xpathRedirect), 'href');
		
		/*for(var i in linksImage) {
			this.download(linksImage[i], id+'.png');
		}*/
		
		
		console.log( 'linksImage, size '+linksImage.length );
		console.log( linksImage );
		console.log( 'titlesFetch, size '+titlesFetch.length );
		var names = [];
		for(var i in titlesFetch) {
			if(titlesFetch[i].length > 0)
				names.push(titlesFetch[i]);
		}
		console.log( 'linksFetch, size '+linksFetch.length );
		var fetchs = [];
		for(var i in linksFetch) {
			console.log('linksFetch '+i+' '+linksFetch[i]);
			if(linksFetch[i].length > 0)
				fetchs.push(linksFetch[i]);
		}
		console.log( 'linksRedirect, size '+linksRedirect.length );
		var redirects = [];
		for(var i in linksRedirect) {
			console.log('linksRedirect '+i+' '+linksRedirect[i]);
			if(linksRedirect[i].length > 0)
				redirects.push('http://'+domain+linksRedirect[i]);
		}
		console.log( titlesFetch );
		console.log( 'linksRedirect, size '+linksRedirect.length );
		console.log( linksRedirect );
		console.log( 'fetchs, size '+fetchs.length+' names, size '+names.length+' linksImage, size '+ linksImage.length);
		if(fetchs.length == names.length && names.length == linksImage.length) {
			console.log( 'redirect : thenOpen'  );
			browser.open('http://127.0.0.1:8081/redirect', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data:   {
			    	'id': id,
			        'fetchLinks': fetchs,
			        'redirectLinks':  redirects,
			        'names': names,
			        'linksImage': linksImage
			    },
			}, function() {
			    this.echo("POST request has been sent.")
			});
		}
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
		var links = document.querySelectorAll('ul#horizontalList li.paddingRight6 a');
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