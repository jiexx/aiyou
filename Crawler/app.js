var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data


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
	connection.query('USE crawler', function(error, results) {
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

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

function save(id, name, pic, desc) {
	if (!dbReady)
		return;
	var values = [ id, name, pic, desc ];
	connection.query(
			'INSERT INTO product SET id = ?, name = ? , pic = ?, descr = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					connection.end();
					return;
				}
				console.log('Inserted: ' + results.affectedRows + ' row.');
				console.log('Id inserted: ' + results.insertId);
			});
}

function update(id, desc) {
	if (!dbReady)
		return;
	var values = [ desc, id ];
	connection.query(
			'UPDATE product SET descr = ? WHERE id = ?',
			values, function(error, results) {
				if (error) {
					console.log("update Error: " + error.message);
					connection.end();
					return;
				}
				console.log('updated: ' + results.affectedRows + ' row.');
				console.log('Id updated: ' + results.insertId);
			});
}

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
	console.log('Hello World!');
	res.send('Hello World!');
});


app.post('/redirect', upload.array(), function(req, res) {
	/*
	 * fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
	 * console.log( data ); res.end( data ); });
	 */
	var data = req.body;
	console.log('REST redirect: '+data.id);
	if(us.isVisited(data.id))
		return;
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.create(data.fetchLinks[i]);
		us.addFetchUrl(fetch);
		save(fetch.getId(), data.names[i], data.linksImage[i], '');
		console.log('REST redirect save: '+fetch.getId()+data.names[i]+data.linksImage[i]);
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}

	us.visited('redirect', data.id);

	us.loop();

	console.log(data.name + '  ' + us.counter());
	res.send('');
})

app.post('/detail', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('REST fetch: '+data.id);
	if(us.isVisited(data.id))
		return;
	
	update(data.id, data.desc);

	us.visited('fetch', data.id);

	console.log(data.id + '  ' + us.counter());
	res.send('');
})

var server = app
		.listen(
				8081,
				function() {

					var host = server.address().address
					var port = server.address().port

					console.log("RUNNING http://%s:%s", host, port)

					var url = URL.create('http://www.amazon.com/Tea/b/ref=dp_bc_3?ie=UTF8&node=16318401');
					us.addRedirectUrl(url);
					url.open('redirect');

				});

				
process.on('SIGINT', function() {
    console.log('Naughty SIGINT-handler');
});
process.on('exit', function () {
    console.log('exit');
    us.close();
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
