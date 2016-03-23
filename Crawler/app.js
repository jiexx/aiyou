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

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

function select() {
	var values = null;
	connection.query(
			'SELECT id, link WHERE desc<>""; ', function(error, results, fields) {
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

function save(id, name, pic, desc, link) {
	if (!dbReady)
		return;
	var values = [ id, name, pic, desc, link ];
	connection.query(
			'INSERT INTO product SET id = ?, name = ? , pic = ?, descr = ?, link = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					connection.end();
					return;
				}
				//console.log('Inserted: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id inserted: ' + results.insertId);
			});
}

function update(id, desc, producer, score, review) {
	if (!dbReady)
		return;
	var values = [ desc, producer, score, review, id ];
	connection.query(
			'UPDATE product SET descr = ?, producer = ?, score = ?, review = ? WHERE id = ?',
			values, function(error, results) {
				if (error) {
					console.log("update Error: " + error.message);
					connection.end();
					return;
				}
				//console.log('updated: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id updated: ' + results.insertId);
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
	console.log('[app] [REST/redirect] '+data.id);
	
	if(data.error == 1) {
		us.errorRedirectUrl(data.id);
		fs.appendFile('redirects.txt', 'ERR_LINKS_IMG '+data.currLink.toString()+'\n', function (err) {});
		
		for ( var i in data.redirectLinks) {
			us.addRedirectUrl(URL.create(data.redirectLinks[i]));
		}
	
		res.send('OK.');
		
		us.loopRedirect();
		return;
	}
	us.visitedRedirectUrl(data.id);
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.redirectLinks.toString()+'\n', function (err) {});
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.create(data.fetchLinks[i]);
		us.addFetchUrl(fetch);
		save(fetch.getId(), data.names[i], data.linksImage[i], '', data.fetchLinks[i]);
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}
	
	
	res.send('OK.');

	us.loopRedirect();

})

app.post('/detail', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('[app] [REST/detail] '+data.id);
	
	us.visitedFetchUrl(data.id);
	
	if(data.desc.length == 0) {
		data.desc = 'ERR_DESC';
	}else if(data.producer.length == 0){
		data.producer = 'ERR_PRODUCER';
	}else if(data.score.length == 0){
		data.score = 'ERR_SCORE';
	}else if(data.review.length == 0){
		data.review = 'ERR_REVIEW';
	}
	update(data.id, data.desc, data.producer, data.score, data.review, data.link );

	res.send('OK.');
	
	us.loopFetch();
})

app.get('/resumedetail', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('[app] [REST/resumedetail] ');
	us.clearFetch();
	
	var d = select();
	
	for ( var i = 0 ; i < d.length ; i ++ ) {
		var fetch = URL.create(d[i].link);
		us.addFetchUrl(fetch);
	}

	res.send('DO...');
	
	us.loopFetch();
})

var server = app
		.listen(
				8081,
				function() {

					var host = server.address().address;
					var port = server.address().port;

					console.log("RUNNING http://%s:%s", host, port);
					if(fs.exists('redirects.txt')) {
						fs.unlink('redirects.txt');
					}
					if(fs.exists('fetches.txt')) {
						fs.unlink('fetches.txt');
					}

					/*var url = URL.create('http://www.amazon.com/Tea/b/ref=dp_bc_3?ie=UTF8&node=16318401');
					us.addRedirectUrl(url);
					us.loopRedirect();*/
					
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
