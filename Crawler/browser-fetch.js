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
console.log( 'redirect num of links:'+num );
var id = [];
var link = [];
for(var i = 0 ; i < browser.cli.args.length ; i += 2) {
	id[i] = browser.cli.get(i);
	link[i] = browser.cli.get(i+1);
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
	//console.log('Down JS file: ' + requestData['url']);
};


// for redirect page
var xpathDesc = '//div[@class="productDescriptionWrapper"]';
var xpathImage = '//div[@id="imgTagWrapperId"]/img';

var x = require('casper').selectXPath;

browser.start();  
console.log('browser fetch');
for(var j = 0 ; j < num ; j ++) {
	browser.thenOpen(link[j]);  
	console.log("id["+j+"]:"+id[j]+" link["+j+"]: "+link[j]);
	browser.waitForUrl(link[j], function(j) {
		console.log('fetch '+this.page.childFramesName().toString());
		
		this.withFrame('product-description-iframe', function() {
			var product = this.getElementInfo(x(xpathDesc));
			var image = this.getElementsAttribute(x(xpathImage), 'src');
			this.download(image, 'img/'+id[browser.couter]+'.jpg');
			
			var result =  {
				'id': id[j],
				'desc': product.text
			};
			console.log('fetch '+result.toString());
			browser.thenOpen('http://127.0.0.1:8081/detail', {
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
		        },
			    method: 'POST',
			    data: result
			}, function(response){
				this.echo("POST fetch has been sent.")
			});
		});
	});
}
	
  
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();