var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer({ dest: 'uploads/' }); 
var phantom= require('phantom'); //npm install phantom.
//var iconv = require('iconv-lite');
var app = express();
var router = express.Router();

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/html', express.static(__dirname + '/html'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
var Timeouter =  {
	start: function () {
		console.log(""+new Date().getTime()+"    start-----------> "+(new Date().getTime() - this.begin));
		var _this = this;
		this.interval = setInterval(function() {
			if ( (new Date().getTime() - _this.begin < _this.maxtimeOutMillis)) {
				_this.testFx();
			} else {
				console.log(""+new Date().getTime()+"    onTimeout "+(new Date().getTime() - _this.begin)+"  "+_this.begin);
				_this.onTimeout();
				clearInterval(_this.interval);
			}
		}, 1000); //< repeat check every 250ms
	},
	
	stop: function() {
		console.log(""+new Date().getTime()+"    clearInterval-----------> "+(new Date().getTime() - this.begin));
		clearInterval(this.interval);
	},
	create: function(testFx, onTimeout) {
		function F() {};
		F.prototype = Timeouter;
		var f = new F();
		f.interval = null;
		f.begin = new Date().getTime();
		f.maxtimeOutMillis = 10000;
		f.testFx = testFx;
		f.onTimeout = onTimeout;
		return f;
	}
};
function render(clipRect, type, ph, page, res) {
	console.log("render "+clipRect.height+' '+clipRect.top + ' ' + clipRect.width + ' ' + clipRect.left);
	page.property('clipRect', {
		top:    clipRect.top,
		left:   clipRect.left,
		width:  clipRect.width,
		height: clipRect.height
	});
	page.renderBase64('JPG').then(function(base64){ 
		console.log("JPG."+base64.constructor.name);
		if(type=='64') {
			console.log("64."+base64.constructor.name);
			
			res.send(base64);
		}else {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<html><body><img src="data:image/jpeg;base64,')
			res.write(base64);
			res.end('"/></body></html>');
			console.log("other."+base64.constructor.name);
		}
		page.close();
		//console.log("exit."+base64.constructor.name);
		ph.exit();
	});
};
function capture(url, res, type) {
	console.log(url);
	phantom.create().then(function (ph) {
		ph.createPage().then(function (page) {
			console.log(""+new Date().getTime()+"    createPage ");
			var timeouter = Timeouter.create(function () {
					console.log(""+new Date().getTime()+"    evaluate ");
					page.evaluate(function() {
						console.log(""+new Date().getTime()+"    check1 "+document.querySelector('.MicrosoftMapDrawing'));
						if(document.querySelector('#zoom') != null) {
							if (typeof window.callPhantom === 'function') {
								var clipRect = document.querySelector('.MicrosoftMapDrawing').getBoundingClientRect(); 
								console.log("callPhantom "+JSON.stringify(clipRect));
								window.callPhantom(clipRect);
							}
						}
					});
				},function(){
					page.close();
					ph.exit();
					res.send("");
				}
			);
			page.on('onConsoleMessage', function (msg) {
				console.log(msg);
			});
			page.on('onResourceRequested', function (requestData, networkRequest) {
				//console.log(""+new Date().getTime()+"    "+requestData.url); // this would push the url into the urls array above
				//networkRequest.abort(); // This will fail, because the params are a serialized version of what was provided
			});
			page.on('onCallback', function (data) {
				console.log(""+new Date().getTime()+"    onCallback "+data.constructor.name);
				timeouter.stop();
				setTimeout(function(){
					render(data, type, ph, page, res);
				},1000);
			});
			page.open(url).then(function(){
				timeouter.start();
			});
		});
	});
}

app.get('/map/capture', upload.array(), function(req, res) {
	var start = req.query.start;
	var end = req.query.end;
	var width = req.query.width;
	var height = req.query.height;
	var type = req.query.type;
	capture('http://127.0.0.1:8088/html/mapcapture.html?s='+start+'&e='+end+'&w='+width+'&h='+height, res, type);
});

var server = app.listen(8088, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log("RUNNING http://%s:%s", host, port);
});
process.on('uncaughtException', function(err) {
    console.log('UncaughtException:'+err);
});
server.on('error', function(err) { 
	console.log('SERVER ERR:  '+err);
});
process.on('SIGINT', function() {
    console.log('Naughty SIGINT-handler');
	process.exit();
});
