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
    }
    //logLevel: "debug",              // Only "info" level messages will be logged
    //verbose: true  
});

if (browser.cli.args.length == 1) {
	console.log('Usage: browser-translate.js <some STRING>' );
	browser.exit();
}

var num = (browser.cli.args.length); 
var counter = num;
//console.log( 'fetch num of links:'+num );
var str = [];
for(var i = 0 ; i < num ; i ++) {
	str[i] = browser.cli.get(i);
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
	this.echo("--->> remote.message: "+msg);
});

browser.on("page.created", function(){
    this.page.onResourceTimeout = function(request){
    	this.echo("--->> onResourceTimeout: "+request);
    };
});
browser.options.retryTimeout = 20;
browser.options.waitTimeout = 20000; 
browser.options.onResourceRequested = function(C, requestData, request) {
//browser.on("page.resource.requested", function(requestData, request) {
//	if ( !(/.*amazon\.com.*/gi).test(requestData['url']) && !(/http:\/\/127\.0\.0\.1.*/gi).test(requestData['url']) 
//			){
//		request.abort();
//	}
};


// for redirect page
var xpathButton = '//div[@id="TranslateButton"]';
var xpathSourceBtn = '//div[@class="col translationContainer sourceText"]/div[class="LanguageSelector"]';
var xpathSourceLan = '//div[@class="col translationContainer sourceText"]/td[@value="en"]';
var xpathSourceTxt = '//textarea[@id="srcText"]';

var xpathDestBtn = '//div[@class="col translationContainer destinationText"]/div[class="LanguageSelector"]';
var xpathDestLan = '//div[@class="col translationContainer destinationText"]/td[@value="zh-CHS"]';
var xpathDestTxt = '//textarea[@id="destText"]/div[@paragraphname="paragraph0"]';

var xpathDestStr = '//textarea[@id="destText"]';

var xselButton = 'div#TranslateButton';

var x = require('casper').selectXPath;

browser.start();  
console.log('enter browser translator');
browser.thenOpen('http://www.bing.com/Translator/');  
for(var j = 0 ; j < num ; j ++) {
	(function(k){
		browser.waitFor(function check() {
			return this.evaluate(function(xselButton) {
				console.log(' xselButton'+document.querySelectorAll(xselButton).length);
				return document.querySelectorAll(xselButton).length > 0
			},xselButton);
		}, function() {
			
			console.log('enter browser xpathButton');
			browser.click(x(xpathSourceBtn)).waitUntilVisible(x(xpathSourceLan), function(){
				browser.click(x(xpathSourceLan));
				browser.thenClick(x(xpathDestBtn)).waitUntilVisible(x(xpathDestLan), function(){
					browser.sendKeys(x(xpathSourceTxt), str[k]).waitUntilVisible(x(xpathDestTxt), function(){
						if(this.exists(x(xpathDestStr))) {
							var destStr = this.getElementInfo(x(xpathDestStr)).text;
							console.log('translate result:'+destStr);
							browser.thenOpen('http://127.0.0.1:8081/translate', {
								headers: {
									'Content-Type': 'application/json; charset=utf-8'
						        },
							    method: 'POST',
							    data: destStr
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