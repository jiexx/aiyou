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

function capture(url, res, type) {
	console.log(url);
	phantom.create().then(function (ph) {
		ph.createPage().then(function (page) {
			page.on('onConsoleMessage', function (msg) {
				console.log(msg);
			});
			page.on('onResourceRequested', function (requestData, networkRequest) {
				//console.log(requestData.url); // this would push the url into the urls array above
				//networkRequest.abort(); // This will fail, because the params are a serialized version of what was provided
			});
			
			page.open(url).then(function (status) {
				var start = new Date().getTime();
				page.evaluate(function() {
					//console.log(document.querySelector('.MicrosoftMapDrawing'));
					if ( document.querySelector('svg') ) {
						//console.log(document.querySelector('.MicrosoftMapDrawing').getBoundingClientRect());
						return document.querySelector('svg').getBoundingClientRect();
					}
					else {
						//console.log("null...");
						return null;
					}
				}).then(function(clipRect){
					if(!clipRect) {
						evaluate();
					}
					console.log(clipRect.height+' '+clipRect.top + ' ' + clipRect.width + ' ' + clipRect.left);
					page.property('clipRect', {
						top:    clipRect.top,
						left:   clipRect.left,
						width:  clipRect.width,
						height: clipRect.height
					});
					page.renderBase64('JPG').then(function(base64){ 
						setTimeout(function(){
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
						}, 8000)
					});
				});
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
