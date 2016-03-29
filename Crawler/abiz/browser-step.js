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
    logLevel: "debug",              // Only "info" level messages will be logged
    verbose: true  
});

phantom.outputEncoding = "GBK";
phantom.cookiesEnabled = true;
phantom.addCookie({
	'name': '_abiz_session',
	'value': 'eyJ1c2VybmFtZSI6IumZiOWHpOWohyIsIm1pY191c2VybmFtZSI6ImVsbGExNTgiLCJfY3NyZiI6IlRtK0QwbFgzOUZ6ZkhPUXEzOC9RRnc9PSIsIl9hX2siOiJlbGxhMTU4IiwidGFnIjoiMDc5NjRmYWYtYzg3Zi00YzgzLThiNmItMWVhN2JhYjkzOWI5IiwiX2FfcG5fIjoiYWJpeiIsImdlbmRlciI6IuWls+WjqyIsInRtX2ZsYWdfZm9yX2NtcyI6IjEiLCJtZW1iZXJJZGVudGl0eSI6IjAwMDEwIiwid2ViVG1fZmxhZ19mb3JfY21zIjoiMSIsInNob3dyb29tX3VzZXJuYW1lIjoiZWxsYTE1OCJ9--HMERu02Cres24oYHqiHR0cFZEdE=',
	'domain': '.abiz.com',
	'path': '/'
});
phantom.addCookie({
	'name': 'Hm_lvt_2a5404afa4139eb47a34deacf850d09f',
	'value': '1459171063,1459250706,1459250735,1459250742',
	'domain': '.abiz.com',
	'path': '/'
});
phantom.addCookie({
	'name': 'Hm_lpvt_2a5404afa4139eb47a34deacf850d09f',
	'value': '1459254169',
	'domain': '.abiz.com',
	'path': '/'
});
phantom.addCookie({
	'name': '_ga',
	'value': 'GA1.2.1813069929.1459097671',
	'domain': '.abiz.com',
	'path': '/'
});
phantom.addCookie({
	'name': '_dc_gtm_UA-34187825-1',
	'value': '1',
	'domain': '.abiz.com',
	'path': '/'
});
phantom.addCookie({
	'name': 'logonTimes',
	'value': '1',
	'domain': '.abiz.com',
	'path': '/'
});


if (browser.cli.args.length == 0) {
	console.log('Usage: browser-step.js <some STRING>' );
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
	this.echo("--->> ERROR:"+msg+" stack:"+backtrace);
});

browser.on("page.error", function(msg, backtrace) {
	var d = new Date();
	fs.write('err/fetch_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("--->> PAGE.ERROR:"+msg+" stack:"+backtrace);
});

browser.on("remote.message", function(msg) {
	fs.write('err/fetch_'+d.getTime().toString()+'.txt',  msg+"\n\n"+browser.getHTML(), 'w');
	this.echo("--->> remote.message: "+msg);
});

browser.on("page.created", function(){
    this.page.onResourceTimeout = function(request){
    	this.echo("--->> onResourceTimeout: "+request);
    };
});
browser.options.retryTimeout = 200;
browser.options.waitTimeout = 240000; 
browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {
	if ( !(/.*\.abiz\..*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url']) 
			){
		console.log(' Skipping file: ' + requestData['url']);
		request.abort();
	}else {
		console.log(' Down file: ' + requestData['url']);
	}
	
};


// for redirect page
var xselButton = 'button#publish';
var xselPrice = 'input#unitPriceNew0';
var xselExpire = 'input#effectiveTime0';
var xselPeriod = 'input#shipDate0';
var xselTax1 = 'input.rdo[name="taxFlag"][value="0"]';
var xselTax2 = 'input.rdo[name="freightFlag"][value="0"]';
var xselGend = 'input[name="gender"][value="0"]';
var xselContact = 'div.contact-panel';
var xselForm = {
				'input#unitPriceNew0': '10000',
				'input#effectiveTime0': '2016-08-31',
				'input#shipDate0': '200',
				'input#mobile':'17802357738',
				'input#comName':'绅度贸易有限公司',
				'input#userName': 'roger',
				'select#telNationalNo': '86',
				'input#email': '411099012@qq.com'
			};

var x = require('casper').selectXPath;
//casperjs browser-step.js "0000" "http://www.abiz.com/inquiries/IxJrcEgUUnzP/quote"

browser.start();

console.log('enter browser step :');
for(var j = 0 ; j < num ; j ++) {
	(function(arg){
		var k = arg;
		
		browser.thenOpen(link[k]);  
		browser.waitFor(function check() {
			return this.evaluate(function(xselButton) {
				//var str = document.body;
				console.log(' xselButton'+document.querySelectorAll(xselButton).length);
				return document.querySelectorAll(xselButton).length > 0
			},xselButton);
		}, function() {
			
			console.log('enter browser input fill');
			browser.fillSelectors('form#form', xselForm, true);
			browser.click(xselTax1);
			browser.click(xselTax2);
			browser.click(xselGend);
			this.evaluate(function(){  
				document.querySelector('form#form').submit();
			});
			browser.then(function() {
				console.log(">>>>>>" + this.getCurrentUrl());
				browser.waitFor(function check() {
					return this.evaluate(function(xselContact) {
						console.log(' xselContact'+document.querySelectorAll(xselContact).length);
						return document.querySelectorAll(xselContact).length > 0
					},xselContact);
				}, function() {
					var contact = browser.getElementInfo(xselContact).text;
					
					var result =  {
						'id': id[k],
						'contact': contact,
						'link':link[k]
					};
					
					var r = JSON.stringify(result);
					console.log('>>>>>>>>>>'+r);
					r = encodeURI(r);
					r = encodeURI(r);
					
					browser.thenOpen('http://127.0.0.1:8081/detail', {
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
					});
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