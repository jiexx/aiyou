var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var fs = require("fs");

var upload = multer({ dest: 'uploads/' }); 

var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '123456',
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


app.get('/', upload.array(), function(req, res) {
	var page = req.body.page;
	
	connection.query('SELECT title, image, publishtime FROM amazon.xunleitai; ', function(error, results, fields) {
		if (error) {
			console.log("select Error: " + error.message);
			connection.end();
			return;
		}
		res.render('list', {
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