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
var browser2 = require('casper').create({
	logLevel: "debug",
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

browser2.on("resource.requested", function(requestData, networkRequest){
	console.log("----"+requestData['url']);
  if(!(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url']) ){
    console.log("----I can ignore this------");
    request.abort();
  }
});


// for redirect page
var xselCom = 'input.rdo[name="comIdentity"][value="'+DATA.type+'"]';
var xselGender = 'input.rdo[name="userGender"][value="'+DATA.gender+'"]';
var xselCode = 'img#validation-code';
var xselTip = 'div#errorDiv p#titleTip';
var xselTipSuc = 'div.tip-nor.tip-succ div.tip-hd';
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
function test() {
	browser2.start();
	browser2.thenOpen('http://127.0.0.1:8082/registe', {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		method: 'POST',
		data: {
			    	'ocr': 1,
			        'fileCode': 'code/CODE_'+DATA.id+'.png',
			    },
	}, function(response){
		console.log("POST browser2 has been sent. "+ response.status + '  ' + browser2.page.content );
	});
	browser2.run()
}

function registe(codeHref) {
	console.log('browser codeHref:'+codeHref);
	var bb = browser.getElementBounds(xselCode);
	var done = false, value = '';
	console.log(JSON.stringify(bb));
	browser.capture('code/CODE_'+DATA.id+'.png', { top: bb.top, left: bb.left+5, width: bb.width-5, height: bb.height},{format: 'png',quality: 100});
	browser.then(function(){
		console.log("POST browser2 open. ");
		browser2.start();
		browser2.thenOpen('http://127.0.0.1:8082/registe', {
			headers: {
				'Content-Type': 'application/json; charset=utf-8'
			},
			method: 'POST',
			data: {
						'ocr': 1,
						'fileCode': 'code/CODE_'+DATA.id+'.png',
					},
		}, function(response){
			console.log("POST browser2 has been sent. "+ browser2.page.content );
			if(response.status == 200 && browser2.page.content.indexOf("OK.")){
				done = true;
				value = (/[^\[]*\[([^\]]*)\].*/g).exec(browser2.page.content);
			}
		});
		browser2.run();
	});
	browser.waitFor(function check() {
		console.log(' DOING: '+done);
		return done;
	}, function() {
		console.log("POST browser2 fetch receive. "+value.toString());
		if(value != '' && value[1] != null) {
			xselForm['input#validateNumber'] = value[1];
			console.log('enter browser input fill:'+JSON.stringify(xselForm));
			browser.fillSelectors('form#form', xselForm, true);
			browser.click(xselCom);
			browser.click(xselGender);
			browser.evaluate(function(){  
				document.querySelector('form#form').submit();
			});
			browser.then(function() {
				console.log(" browser submit" + browser.getCurrentUrl());
				browser.waitFor(function check() {
					return browser.evaluate(function(xselTip, xselTipSuc) {
						console.log(' browser xselTip:'+document.querySelectorAll(xselTip).length+
							' xselTipSuc:'+document.querySelectorAll(xselTipSuc).length);
						return document.querySelectorAll(xselTip).length > 0 || document.querySelectorAll(xselTipSuc).length > 0;
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
						browser.thenOpen('http://127.0.0.1:8082/registe', {
							headers: {
								'Content-Type': 'application/json; charset=utf-8'
							},
							method: 'POST',
							data: {
										'ocr': 0,
										'id': DATA.id,
										'fileCode': '',
									},
						}, function(response){
							console.log("POST browser2 fetch exit has been sent. "+ response.status );
							if(response.status == 200 && browser2.page.content.indexOf("OK.")){
								browser.exit(); 
								browser2.exit();
							}
						});
/*var fs = require('fs');
var data = fs.read(cookieFilename);
phantom.cookies = JSON.parse(data);*/
					}
					
				});
			});
		}
	});
}
browser.start();

console.log("POST browser2 open. ");
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


browser.run();