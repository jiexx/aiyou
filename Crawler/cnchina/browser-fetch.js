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
phantom.outputEncoding = "utf-8";
phantom.cookiesEnabled = true;
phantom.addCookie({
	'name': 'c9ce811bf4',
	'value': '50102',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': '48b579ba8d',
	'value': '50222',
	'domain': '.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'china_uv',
	'value': '7ccc37c5b2072b293d7e96fc397fd954',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'f1bfea8f08',
	'value': '50001',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'U',
	'value': 'id%3D3915171107%26k%3D4a7ffe29%26n%3Della158%26usertype%3D0%26contact%3D%E9%99%88%E6%98%8E',
	'domain': '.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'U',
	'value': 'id%3D3915171107%26k%3D4a7ffe29%26n%3Della158%26usertype%3D0%26contact%3D%E9%99%88%E6%98%8E',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'CS',
	'value': 'c%3D3915171105%26l%3D0%26t%3D1',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'Hm_lvt_066cf190c4bdf8653ad5ea8f496c4a13',
	'value': '1459646808',
	'domain': '.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'Hm_lpvt_066cf190c4bdf8653ad5ea8f496c4a13',
	'value': '1459648315',
	'domain': '.cn.china.cn',
	'path': '/'
});
phantom.addCookie({
	'name': 'china_upf',
	'value': 'a%3A1%3A%7Bs%3A8%3A%22categroy%22%3Ba%3A1%3A%7Bi%3A4449%3Bi%3A12%3B%7D%7D',
	'domain': '.cn.china.cn',
	'path': '/'
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
	if ( !(/.*cn\.china\.cn.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url'])
	/*|| (/.*\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/javascript'*/ ) {
		//console.log('redirect Skipping JS file: ' + requestData['url']);
		request.abort();
	}else {
		//console.log('redirect Down JS file: ' + requestData['url']);
	}
};


// for redirect page
var xpathDesc = '//div[@class="qg_details"]/p[2]';
var xpathCompany = '//li[@class="link-name"]/span[@class="f_text"]/strong';
var xpathPhone = '//span[@class="fl-bold"]';
var xpathEmail = '//span[@class="f_text n_text"]';
var xpathLeft = '//div[@class="dtime"]/span/em';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser fetch');
for(var j = 0 ; j < num ; j ++) {
	if(link[j].indexOf('http://') != 0) {
		continue;
	}
	(function(arg){ 
	var k = arg;
	
	browser.thenOpen(link[k]);  
	console.log('fetch '+link[k]);
	
	browser.waitFor(function check() {
		    return this.evaluate(function(fs) {
		        var a = document.querySelectorAll('div.warn-detail.fl-clr').length > 0;
				//console.log(document.body.innerHTML);
				//console.log(a);
		        return a; 
		    }, fs);
	}, function() {
		//console.log('fetch '+this.page.childFramesName().toString());
		
		
		var fetchDesc = '';
		if(browser.exists(x(xpathDesc))){
		   fetchDesc = this.getElementInfo(x(xpathDesc)).text;
		   fetchDesc = fetchDesc.replace(/[\n\t]/g, "");
		}
		
		var fetchCompany = '';
		if(browser.exists(x(xpathCompany))){
		   fetchCompany = this.getElementInfo(x(xpathCompany)).text;
		   fetchCompany = fetchCompany.replace(/[\n\t]/g, "");
		}
		
		var fetchPhone = '';
		if(browser.exists(x(xpathPhone))){
		   fetchPhone = this.getElementInfo(x(xpathPhone)).text;
		}
		
		var fetchEmail = '';
		if(browser.exists(x(xpathEmail))){
		   fetchEmail = this.getElementInfo(x(xpathEmail)).text;
		}
		
		var fetchLeft = '';
		if(browser.exists(x(xpathLeft))){
		   fetchLeft = this.getElementInfo(x(xpathLeft)).text;
		}
		
		var result =  {
			'id': id[k],
			'desc': fetchDesc,
			'company':fetchCompany,
			'phone':fetchPhone,
			'email':fetchEmail,
			'left':fetchLeft,
			'link':link[k]
		};
		//console.log('fetch '+fetchCompany);
		var r = JSON.stringify(result);
		console.log('fetch '+r);
		r = encodeURI(r);
		r = encodeURI(r);
		
		
		this.echo("fetch POST request will send.");
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
	})(j);
}
	
  
browser.then(function() {  
	browser.exit();  
	console.log('browser exit');
});

browser.run();