var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
//var iconv = require('iconv-lite');

var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});
var dbReady = false;
connection.connect(function(error, results) {
	if (error) {
		console.log('Connection Error: ' + error.message);
		return;
	}
	console.log('Connected to MySQL');
	connection.query('update amazon.xunleitai set sub = ""; ', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			return;
		}
		dbReady = true;
	});
});
var app = express();
var router = express.Router();
var fs = require("fs");
var request = require('request');

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

var rows = [];
function selectSubRows(){
	console.log('downSub');
	connection.query(
		'SELECT id, title, link FROM amazon.xunleitai where clazz="kickass" limit 0, 1; ', function(error, results, fields) {
			if (error) {
				console.log("select Error: " + error.message);
				connection.end();
				return;
			}
			if (!fs.existsSync('sub')) {
				fs.mkdirSync('sub');
			}
			if(fs.exists('sub.txt')) {
				fs.unlink('sub.txt');
			}
		
			console.log('downSub go...'+results.length);
			
			for(var a in results) {
				var row = results[a];
				if (!fs.existsSync('sub/'+row.id)) {
					fs.mkdirSync('sub/'+row.id);
				}
				if(row.title) {
					rows.push({id:row.id, link:row.link, uri:'http://www.subhd.com/search/'+row.title});
				}
			}
			if (rows.length > 0) {
				us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
				rows.splice(0,1);
			}
			us.loopRedirect();
		});
}

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
	console.log('Hello World!');
	res.send('Hello World!');
});

function download(uri, filename, callback){
	request.head(uri, function(err, res, body){
		console.log('uri:', uri);
		if(res) {
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			/*request(uri, function (error, response, body) {
				console.log('####'+error+' '+body.length);
				if(error){
					fs.appendFile('sub.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
				}else {
					fs.writeFileSync(filename, body);
				}
			});*/
			var writestrm = request(uri).pipe(fs.createWriteStream(filename));
			writestrm.on('error', function(){
				fs.appendFile('sub.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
			});
			writestrm.on('finish', callback);
		}
		fs.appendFile('sub.txt', 'SUC_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {console.log('DOWN SUB :  '+err)});
	});
};

app.post('/detail', upload.array(), function(req, res) {
	
	//console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode)));
	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/detail] '+__dirname+'/'+'sub/'+data.parent+'/'+data.name+data.sub.substr(data.sub.lastIndexOf('.')));
	
	us.visitedFetchUrl(data.id);
	if(data.sub) {
		download(data.sub, __dirname+'/'+'sub/'+data.parent+'/'+data.sub.substr(data.sub.lastIndexOf('/')), function(){
			console.log('done');
			if(us.getCountOfFetchs() > 0) {
				us.loopFetch();
			}
		});
	}
	
	res.send('OK.');
});

app.post('/redirect', upload.array(), function(req, res) {

	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/redirect] '+data.id);
	
	if(data.error == 1) {
		us.errorRedirectUrl(data.id);
		fs.appendFile('redirects.txt', 'ERR_LINKS_SUB '+data.currLink.toString()+'\n', 'utf-8', function (err) {});
		
		if (rows.length > 0) {
			us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
			rows.splice(0,1);
		}
	
		res.send('OK.');
		
		us.loopRedirect();
		return;
	}

	us.visitedRedirectUrl(data.id);
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.fetchLinks+'\n', 'utf-8', function (err) {});
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.createByParent(data.fetchLinks[i], data.parent);
		us.addFetchUrl(fetch);
	}

	if (rows.length > 0) {
		us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
		rows.splice(0,1);
	}
	
	res.send('OK.');
	var x = us.getCountOfRedirects();

	if(us.getCountOfRedirects() > 0) {
		us.loopRedirect();
	}else {
		us.loopFetch();
	}
});

var server = app
		.listen(
				8082,
				function() {

					var host = server.address().address;
					var port = server.address().port;

					console.log("RUNNING http://%s:%s", host, port);
					if(fs.exists('sub.txt')) {
						fs.unlink('sub.txt');
					}
					if (!fs.existsSync('sub')) {
						fs.mkdirSync('sub');
					}
					if (!fs.existsSync('bt')) {
						fs.mkdirSync('bt');
					}
					selectSubRows();
				});
server.on('error', function(err) { 
	console.log('SERVER ERR:  '+err);
});
	
				
process.on('SIGINT', function() {
    console.log('Naughty SIGINT-handler');
});
process.on('exit', function () {
    console.log('exit');
    //us.close();
});
process.on('SIGINT', function() {
	connection.end();
    console.log('Nice SIGINT-handler');
    listeners = process.listeners('SIGINT');
    process.exit();
});
process.on('uncaughtException', function(err) {
    console.log(err);
    //server.kill();
    process.kill();
});
