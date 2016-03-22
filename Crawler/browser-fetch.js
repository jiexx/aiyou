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
    //verbose: true  
});

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
//browser.on("page.resource.requested", function(requestData, request) {
	if ( !(/.*amazon\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
			/*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/ ) {
		//console.log('Skipping JS file: ' + requestData['url']);
		request.abort();
	}
	//console.log('Down JS file: ' + requestData['url']);
};


// for redirect page
var xpathDesc = '//div[@class="productDescriptionWrapper"]';
var xpathImage = '//div[@id="imgTagWrapperId"]/img';
var xpathVisible = '//iframe[@id="product-description-iframe"]';
var xpathProducer = '//div[@id="brandBylineWrapper"]/div/a';
var xpathRemark = '//span[@id="acrPopover"]';
var xpathReview = '//span[@id="acrCustomerReviewText"]';

var xselImage = 'div#imgTagWrapperId';
var xselVisible = 'iframe#product-description-iframe';
var xselProducer = 'div#brandBylineWrapper';
var xselRemark = 'span#acrPopover';
var xselReview = 'span#acrCustomerReviewText';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser fetch');
for(var j = 0 ; j < num ; j ++) {
	browser.thenOpen(link[j]);  
	
	(function(arg){ 
	browser.waitFor(function check() {
		    return this.evaluate(function(fs,xpathImage,xpathProducer,xpathRemark,xpathReview ) {
		    	/*console.log('xpathImage '+document.querySelectorAll(xpathImage).length+
		    			' xpathProducer'+document.querySelectorAll(xpathProducer).length+
		    			' xpathRemark'+document.querySelectorAll(xpathRemark).length+
		    			' xpathReview'+document.querySelectorAll(xpathReview).length);*/
		        return document.querySelectorAll(xpathImage).length > 0
		        && document.querySelectorAll(xpathProducer).length > 0
		        && document.querySelectorAll(xpathRemark).length > 0
		        && document.querySelectorAll(xpathReview).length > 0;
		    }, fs,xselImage,xselProducer,xselRemark,xselReview);
	}, function() {
		//console.log('fetch '+this.page.childFramesName().toString());
		var k = arg;
		console.log("-->>  fetch id["+k+"]:"+id[k]+" link["+k+"]: "+link[k]);
		var image = this.getElementsAttribute(x(xpathImage), 'data-a-dynamic-image');
		var producer = this.getElementInfo(x(xpathProducer)).text;
		var score = this.getElementsAttribute(x(xpathRemark), 'title');
		var review = this.getElementInfo(x(xpathReview)).text;
		
		//var info = this.getElementsInfo(x(xpathImage));
		//require('utils').dump(info);
		console.log("fetch image :"+image);
		if(image != null) {
			var a = image.toString().lastIndexOf("jpg\"");
			var b = image.toString().lastIndexOf("\"http");
			var c = image.toString().substring(a+3,b+1);
		}
			
		//console.log("fetch image :"+a + ", "+b+", "+c);
		//this.download(c, 'img/'+id[k]+'.jpg');
		
		this.withFrame('product-description-iframe', function() {
			var product = this.getElementInfo(x(xpathDesc));
			//console.log("id["+k+"]-->>"+image);
			var result =  {
				'id': id[k],
				'desc': product.text,
				'producer':producer,
				'remark':score,
				'review':review,
				'link':link[k]
			};
			console.log('fetch '+JSON.stringify(result));
			this.echo("fetch POST request will send.");
			browser.thenOpen('http://127.0.0.1:8081/detail', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data: result
			}, function(response){
				this.echo("POST fetch has been sent. "+ response.status /*+" "+ this.page.content*/);
				if(response.status == 200 && this.page.content.indexOf("OK.")){
					counter --;
					this.echo("POST fetch exit "+counter);
					if(counter <= 0) {
						browser.exit();  
					}
			    }
			});
		});
	});
	})(j);
}
	
  
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();