var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var fs = require("fs");

var upload = multer({ dest: 'uploads/' }); 

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
	connection.on("close", function (err) {
        console.log("SQL CONNECTION CLOSED.");
    });
    connection.on("error", function (err) {
        console.log("SQL CONNECTION ERROR: " + err);
    });
});
var app = express();
var router = express.Router();
var fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('view options', {layout: false});
app.set('views', __dirname + '');
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/', upload.array(), function(req, res) {
	res.render('home', {
		HOST : 'http://127.0.0.1:8080'
	});
});

app.get('/detail', function(req, res) {
	var id = req.query.id;
	console.log('id:'+JSON.stringify(req.query.id));
	connection.query('SELECT * FROM amazon.xunleitai WHERE id = ?; ', [id], function(error, results, fields) {
		if (error) {
			console.log("select Error: " + error.message);
			connection.end();
			return;
		}
		console.log(''+JSON.stringify(results));
		res.render('detail', {
			item : results
		});
	});
})

app.get('/waterfall', upload.array(), function(req, res) {
	var page = req.body.page;
	console.log('page:'+page);
	var start, end;
	if(page){
		start = page*16;
		end = (page+1)*16;
	}else {
		start = 0;
		end = 16;
	}
	connection.query('SELECT id, title, image, publishtime FROM amazon.xunleitai LIMIT ?, ?; ', [start, end], function(error, results, fields) {
		if (error) {
			console.log("select Error: " + error.message);
			connection.end();
			return;
		}
		res.render('waterfall', {
			items : results
		});
	});
})

var server = app.listen(
	8080,
	function() {
		var host = server.address().address;
		var port = server.address().port;
		console.log("RUNNING http://%s:%s", host, port);
	});