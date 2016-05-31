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

app.get('/', upload.array(), function(req, res) {
	var page = req.body.page;
	
	connection.query('SELECT id, title, image, publishtime FROM amazon.xunleitai; ', function(error, results, fields) {
		if (error) {
			console.log("select Error: " + error.message);
			connection.end();
			return;
		}
		var count = 1, item = [], data = [];
		for(var i in results) {
			if(count <= 4){
				item.push(results[i]);
				count ++;
			}else{
				data.push(item);
				item = [];
				count = 1;
			}
		}
		res.render('home', {
			items : data
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