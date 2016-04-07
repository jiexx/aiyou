/**
 * http://usejsdoc.org/
 */
var browser = require('casper').create({
	pageSettings: {
        loadImages:  true,        // The WebPage instance used by Casper will
        loadPlugins: false,         // use these settings
        //javascriptEnabled: false,
        //resourceTimeout: 5000,
        //userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.21 (KHTML, like Gecko) Chrome/25.0.1349.2 Safari/537.21'
        userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.151 Safari/534.16'
    },
    logLevel: "debug",              // Only "info" level messages will be logged
    verbose: true  
});

phantom.outputEncoding = "utf-8";
phantom.cookiesEnabled = true;

console.log('DATA 0:'+browser.cli.get(0));

if (browser.cli.args.length != 1) {
	console.log('Usage: browser-reg.js <some DATA>' );
	browser.exit();
}
var DATA = JSON.parse(decodeURIComponent(decodeURIComponent(browser.cli.get(0))));
console.log('DATA:'+JSON.stringify(DATA) +' link:'+DATA.link);

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
		//console.log(' Skipping file: ' + requestData['url']);
		request.abort();
	}else {
		//console.log(' Down file: ' + requestData['url']);
	}
	
};

var Tab = {
	ocr: function(id) {
		var _this = this;
		_this.done = false;
		_this.tab.thenOpen('http://127.0.0.1:8082/registe', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: {
				'ocr': 1,
				'fileCode': 'code/CODE_'+id+'.png',
			},
		}, function(response){
			console.log("POST browser2 ocr has been sent. "+ _this.tab.page.content );
			if(response.status == 200 && _this.tab.page.content.indexOf("OK.")){
				var value = (/[^\[]*\[([^\]]*)\].*/g).exec(_this.tab.page.content);
				if(value != '' && value[1] != null) {
					_this.ocrVal = value[1];
				}
				_this.done = true;
			}
		});
		_this.tab.run(function() {
			console.log('So the browser2 ocr done.');
		});
	},
	
	update: function(id, callback) {
		var _this = this;
		_this.done = false;
		_this.tab.thenOpen('http://127.0.0.1:8082/registe', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: {
				'ocr': 0,
				'id': id,
				'fileCode': '',
			},
		}, function(response){
			console.log("POST browser2 update has been sent. "+ _this.tab.page.content );
			if(response.status == 200 && _this.tab.page.content.indexOf("OK.")){
				_this.done = true;
				_this.tab.exit();
				if(callback != null)
					callback();
			}
		});
		_this.tab.run(function() {
			console.log('So the browser2 update done.');
		});
	},
	
	create: function() {
		function F() {};
		F.prototype = Tab;
		var f = new F();
		f.ocrVal = '';
		f.done = false;
		f.tab = require('casper').create({
				logLevel: "debug",
				verbose: true
			});
		f.tab.on('error', function(msg,backtrace) {
			this.echo("--->> ERROR browser 2 :"+msg+" stack:"+JSON.stringify(backtrace));
		});
		f.tab.start();
		return f;
	}
	
};

var BROWSER2 = Tab.create();


// for redirect page
var xselCom = 'input[name="comIdentity"][value="'+DATA.type+'"]';
var xselGender = 'input[name="userGender"][value="'+DATA.gender+'"]';
var xselCode = 'img#validation-code';
var xselTip = 'div#errorDiv p#titleTip';
var xselTipSuc = 'div.tip-nor.tip-succ div.tip-hd';
var xselWrong = 'div.wrong';
var xselRefresh = 'a.js-change-validation-code';
var xselForm = {
				'input#userEmail': DATA.email,
				'input#logUserName': DATA.loginname,
				'input#logPassword': DATA.pwd,
				'input#confirmPassword': DATA.pwd,
				'input#comName':DATA.company,
				'input#userName': DATA.username,
				'select#comTelephoneCountryCode': '86',
				'input#userMobile': DATA.phone,
				'input#validateNumber': '3421'
			};

var x = require('casper').selectXPath;
//casperjs browser-step.js "0000" "http://www.abiz.com/inquiries/IxJrcEgUUnzP/quote"

function registe(codeHref) {
	console.log('browser codeHref:'+codeHref);
	var bb = browser.getElementBounds(xselCode);
	console.log(JSON.stringify(bb));
	browser.capture('code/CODE_'+DATA.id+'.png', { top: bb.top, left: bb.left+5, width: bb.width-5, height: bb.height},{format: 'png',quality: 100});
	console.log('DONE :'+BROWSER2.done);
	browser.then(function(){
		BROWSER2.ocr(DATA.id);
	});
	console.log('DONE :'+BROWSER2.done);
	browser.waitFor(function check() {
		console.log('DONE :'+BROWSER2.done);
		return BROWSER2.done;
	}, function() {
		xselForm['input#validateNumber'] = BROWSER2.ocrVal;
		console.log('enter browser input fill:'+JSON.stringify(xselForm));
		browser.fillSelectors('form#form', xselForm, false);
		browser.click(xselCom);
		browser.click(xselGender);
		browser.evaluate(function(){  
			document.querySelector('form#form').submit();
		});
		browser.then(function() {
			console.log(" browser submit " + browser.getCurrentUrl());
			browser.waitFor(function check() {
				return browser.evaluate(function(xselTip, xselTipSuc) {
					console.log(' browser xselTip:'+document.querySelectorAll(xselTip).length+
						' xselTipSuc:'+document.querySelectorAll(xselTipSuc).length+' xselWrong:'+document.querySelectorAll(xselWrong).length);
					return document.querySelectorAll(xselTip).length > 0 || document.querySelectorAll(xselTipSuc).length > 0 || document.querySelectorAll(xselWrong).length > 0 ;
				},xselTip, xselTipSuc);
			}, function() {
				if(browser.exists(xselTip)){
					console.log(' browser submit failed:');
					browser.click(xselRefresh);
					browser.waitFor(function check() {
						return browser.evaluate(function(xselCode, codeHref) {
							//var str = document.body;
							console.log(' xselCode:'+document.querySelectorAll(xselCode).length+
							' href:'+(document.querySelector(xselCode).href != codeHref));
							return document.querySelectorAll(xselCode).length > 0 && document.querySelector(xselCode).href != codeHref
						},xselCode, codeHref);
					}, function() {
						var href = browser.getElementAttribute(xselCode, 'src');
						registe(href);
					});
				}
				else if(browser.exists(xselTipSuc)) {
					console.log(' browser submit success:');
					var cookies = JSON.stringify(phantom.cookies);
					fs.write('cookie/'+DATA.id+'.cookie', cookies, 'w');
					BROWSER2.update(DATA.id, function(){
						browser.exit();
					});
/*var fs = require('fs');
var data = fs.read(cookieFilename);
phantom.cookies = JSON.parse(data);*/
				}
				
			});
			browser.run(function() {
				this.echo('So the browser done.');
			});
		});
	});
	browser.run(function() {
		this.echo('So the browser done.');
	});
}
browser.start();

console.log('enter browser step regitste:'+DATA.link);
browser.thenOpen(DATA.link);  
browser.waitFor(function check() {
	return this.evaluate(function(xselCode) {
		//var str = document.body;
		console.log(' browser xselCode'+document.querySelectorAll(xselCode).length);
		return document.querySelectorAll(xselCode).length > 0
	},xselCode);
}, function() {
	var href = this.getElementAttribute(xselCode, 'src');
	registe(href);
	//test();
});


browser.run(function() {
	this.echo('So the browser done.');
});