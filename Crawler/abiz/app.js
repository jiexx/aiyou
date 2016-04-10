var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
//var iconv = require('iconv-lite');
var app = express();
var router = express.Router();
var fs = require("fs");
var dv = require('dv');

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');
eval(fs.readFileSync('reg.js') + '');
var us = UrlSet.create();
var rus = RegUserSet.create();

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
		//us.loadCookies(connection, 'SELECT cookie FROM amazon.reg WHERE cookie <>""', cookie);
		//rus.save(connection, 'amazon.reg');
		rus.loadFromDBAndNext(connection, 'amazon.reg', 'http://www.abiz.com/reg/step1/afternew', 'https://www.abiz.com/session/new');
		dbReady = true;
	});
});

function select() {
	var values = null;
	connection.query(
			'SELECT id, link,descr FROM amazon.abiz WHERE descr IS NULL; ', function(error, results, fields) {
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

function update(id, contact, link) {
	if (!dbReady)
		return;
	
	var values = [ contact, link ];
	console.log(">>>>>>>>>> update |email:"+email + " |phone:" + phone + " |left:" +left+  "|addr:"+addr +"<<<<<<<<<<");
	connection.query(
			'UPDATE abiz SET descr = ? WHERE link = ?',
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

function save(id, title, company, amount, days, fetchLink, currLink) {
	if (!dbReady)
		return;
	var values = [ id, title, company, amount, days, fetchLink, currLink ];
	console.log("save:"+values);
	connection.query(
			'INSERT INTO abiz SET id = ?, title = ? , producer = ?, amount = ?, days = ?, link = ?, redirect = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					//connection.end();
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

var ACOUNTER = 0, ACOUNTLIMIT = 50;
app.post('/redirect', upload.array(), function(req, res) {
	/*
	 * fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
	 * console.log( data ); res.end( data ); });
	 */
	 //console.log(">>>>>>>>>>>>>>"+JSON.stringify(req.body));
	 	 
	//console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode)));
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
		save(fetch.getId(), data.fetchTitles[i], data.fetchComs[i], data.fetchAmounts[i], data.fetchDays[i], data.fetchLinks[i], data.currLink);
		COUNTER ++;
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}
	
	res.send('OK.');

	if(data.redirectLinks.length > 0) {
		us.loopRedirect();
	}else {
		us.loopFetch();
	}
	

})

app.post('/detail', upload.array(), function(req, res) {
	
	//console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode)));
	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/detail] '+data.id);
	
	us.visitedFetchUrl(data.id);
	
	if(data.contact.length == 0) {
		data.contact = 'ERR_CONTACT';
	}
	update(data.id, data.contact, data.link );

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

function ocr(filename) {
	var image = new dv.Image('png', fs.readFileSync(filename));
	
	var i = filename.indexOf('/')+1;
	var mask = image.threshold(108).toGray().rankFilter(2, 2, 0.5);

	fs.writeFile('mask'+filename.substring(i), mask.toBuffer('png'));

	var tesseract = new dv.Tesseract('eng', mask);

	console.log('-------------');
	var res = tesseract.findText('plain');
	res = res.replace(/[^0-9a-zA-Z]/g, '');
	console.log(res);
	return res;
}
app.post('/registe', upload.array(), function(req, res) {
	var data = req.body;
	console.log('[app] [REST/ocr] '+JSON.stringify(data));
	var str = 'OK.';
	if(data.ocr == 3){
		rus.updateOne(connection, 'amazon.reg', data.id, 1, decodeURIComponent(decodeURIComponent(data.cookie)));
		//rus.next();
	}
	else if(data.ocr == 2){
		rus.updateOne(connection, 'amazon.reg', data.id, 0, null);
		//rus.next();
	}
	else if(data.ocr == 1){
		str = 'OK.['+ocr(data.fileCode)+']';
		
	}
	res.send(str);
})

var server = app
		.listen(
				8082,
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
					
					//rus.load('500acpwd.csv', 'http://www.abiz.com/reg/step1/afternew', 'https://www.abiz.com/session/new');
										
					/*for(var i in banks) {
						var url = URL.create(banks[i]);
						us.addRedirectUrl(url);
					}
					
					us.loopRedirect();
					
					var d = select();*/

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
