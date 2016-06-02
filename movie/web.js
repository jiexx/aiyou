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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', upload.array(), function(req, res) {
	console.log('[HOME]:'+req.ip);
	res.render('home', {
		HOST : 'http://127.0.0.1:8080'
	});
});

app.get('/detail', function(req, res) {
	console.log('[HOME]:'+req.ip);
	var id = req.query.id;
	console.log('id:'+JSON.stringify(req.query.id));
	connection.query('SELECT * FROM amazon.xunleitai WHERE id = ?; ', [id], function(error, results, fields) {
		if (error) {
			console.log("detail Error: " + error.message);
			connection.end();
			return;
		}
		var download = [];
		var a = results[0].download.split(',');
		var b = results[0].downtxt.split(',');
		if(a.length == b.length) {
			for(var i in a) {
				var big = (/[^【]*【([^】]*)】.*/gi).exec(b[i]);
				var pwd = (/[^密码]*密码[^A-Za-z0-9]*([A-Za-z0-9]*)/gi).exec(b[i]);

				download.push({'link':a[i], 'pwd': '大小:' + big[1] + ' 密码:' + pwd[1]});
			}
		}
		console.log(JSON.stringify(download));
		res.render('detail', {
			item : results,
			down : download
		});
	});
})

app.get('/waterfall', upload.array(), function(req, res) {
	var page = parseInt(req.query.page)-1;//req.body.page;
	
	var start, offset = 4;
	if(page){
		start = page*offset;
	}else {
		start = 0;
	}
	connection.query('SELECT id, SUBSTRING_INDEX(title,"迅雷下载",1) as title, image, publishtime FROM amazon.xunleitai LIMIT ?, ?; ', [start, offset], function(error, results, fields) {
		if (error) {
			console.log("waterfall Error: " + error.message);
			connection.end();
			return;
		}
		console.log(JSON.stringify(results));
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