var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var iconv = require('iconv-lite');

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

function update(id, desc, producer, addr, left, link) {
	if (!dbReady)
		return;
	var values = [ desc, producer, addr, left, link ];
	connection.query(
			'UPDATE hc360 SET descr = ?, producer = ?, addr = ?, days = ? WHERE link = ?',
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

function save(id, title, price, amount, days, currLink) {
	if (!dbReady)
		return;
	var values = [ id, title, price, amount, days, currLink ];
	console.log("save:"+values);
	connection.query(
			'INSERT INTO hc360 SET id = ?, title = ? , price = ?, amount = ?, days = ?, link = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					connection.end();
					return;
				}
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
	 //console.log(">>>>>>>>>>>>>>"+JSON.stringify(req.body));
	 	 
	console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode))));
	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/redirect] '+data.id);
	
	if(data.error == 1) {
		us.errorRedirectUrl(data.id);
		fs.appendFile('redirects.txt', 'ERR_LINKS_IMG '+data.currLink.toString()+'\n', 'utf-8', function (err) {});
		
		for ( var i in data.redirectLinks) {
			us.addRedirectUrl(URL.create(data.redirectLinks[i]));
		}
	
		res.send('OK.');
		
		us.loopRedirect();
		return;
	}
	us.visitedRedirectUrl(data.id);
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.redirectLinks.toString()+'\n', 'utf-8', function (err) {});
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.create(data.fetchLinks[i]);
		us.addFetchUrl(fetch);
		var fetchTitles = iconv.decode(data.fetchTitles[i],'GBK');
		var fetchPrices = iconv.decode(data.fetchPrices[i],'GBK');
		var fetchAmounts = iconv.decode(data.fetchAmounts[i],'GBK');
		var fetchDays = iconv.decode(data.fetchDays[i],'GBK');
		save(fetch.getId(), fetchTitles, fetchPrices, fetchAmounts, fetchDays, data.currLink);
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}
	
	var buf = iconv.encode('OK.', 'GBK');
	res.send('OK.');

	//us.loopRedirect();

})

app.post('/detail', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('[app] [REST/detail] '+data.id);
	
	us.visitedFetchUrl(data.id);
	
	if(data.desc.length == 0) {
		data.desc = 'ERR_DESC';
	}else if(data.producer.length == 0){
		data.producer = 'ERR_PRODUCER';
	}else if(data.addr.length == 0){
		data.addr = 'ERR_ADDR';
	}else if(data.left.length == 0){
		data.left = 'ERR_LEFT';
	}
	update(data.id, data.desc, data.producer, data.addr, data.left, data.link );

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

var banks = 
[
"http://s.hc360.com/?w=%C3%AB%BD%ED&mc=buyer&ee=2"
];
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
					
					for(var i in banks) {
						var url = URL.create(banks[i]);
						us.addRedirectUrl(url);
					}
					
					us.loopRedirect();
					
					/*var d = select();*/

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
