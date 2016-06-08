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
	connection.query('USE amazon', function(error, results) {
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

function select() {
	var values = null;
	connection.query(
			'SELECT id, link FROM amazon.xunleitai WHERE title IS NULL; ', function(error, results, fields) {
				if (error) {
					console.log("select Error: " + error.message);
					connection.end();
					return;
				}
				values = results;
				
				for ( var i = 0 ; i < values.length ; i ++ ) {
					var fetch = URL.create(values[i].link);
					fetch.id = values[i].id
					us.addFetchUrl(fetch);
				}
				
				us.loopFetch();
				//console.log('Inserted: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id inserted: ' + results.insertId);
			});
}

function update(id, magnet, qulity, downloads, image, name, type, publish, area, directors, actors) {
	if (!dbReady)
		return;

	var values = [ downloads+'', magnet+'', qulity, image, name+'', type, publish, area, directors+'', actors+'', id ];
	console.log(">>>>>>>>>> update |values:"+values + "<<<<<<<<<<");
	connection.query(
			'UPDATE xunleitai SET download = ?, downtxt = ?, qulity = ?, image = ?, title = ?, type = ?, publishtime = ?, area = ?, director = ?, actor = ? WHERE id = ?',
			values, function(error, results) {
				if (error) {
					console.log("update Error: " + error.message);
					//connection.end();
					return;
				}
				//console.log('updated: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id updated: ' + results.insertId);
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
		if(res) {
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			var writestrm = request(uri).pipe(fs.createWriteStream(filename));
			writestrm.on('error', function(){
				fs.appendFile('img.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
			});
			writestrm.on('end', callback);
		}
		fs.appendFile('img.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
	});
};

app.post('/detail', upload.array(), function(req, res) {
	
	//console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode)));
	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/detail] '+data.id);
	
	us.visitedFetchUrl(data.id);
	if(data.img) {
		download(data.img, __dirname+'/'+'img/'+data.id+data.img.substr(data.img.lastIndexOf('.')), function(){
			console.log('done');
		});
	}
	update(data.id, data.downtxt, data.down, 'img/'+data.id+data.img.substr(data.img.lastIndexOf('.')), data.name, data.type, data.pub, data.area, data.dir, data.act);

	res.send('OK.');
	if(us.getCountOfFetchs() > 0) {
		us.loopFetch();
	}
});

var server = app
		.listen(
				8081,
				function() {

					var host = server.address().address;
					var port = server.address().port;

					console.log("RUNNING http://%s:%s", host, port);
					
					var d = select();
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
