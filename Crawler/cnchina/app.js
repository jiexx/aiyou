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

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

function select() {
	var values = null;
	connection.query(
			'SELECT id, link,descr FROM amazon.cnchina WHERE descr IS NULL; ', function(error, results, fields) {
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

function extract() {
	connection.query(
			'SELECT id, link,descr FROM amazon.cnchina WHERE descr IS NOT NULL; ', function(error, results, fields) {
				if (error) {
					console.log("select Error: " + error.message);
					connection.end();
					return;
				}
				for ( var i = 0 ; i < results.length ; i ++ ) {
					var email = (/[^a-z]*([0-9a-z]*([-.\w]*[0-9a-z])*@([0-9a-z]+\.)+[a-z]{2,9}).*/gi).exec(results[i].descr);
					var phone = (/[^1]*(1[3578]{1}[0-9]{9}).*/g).exec(results[i].descr);
					var e = '', p = '';
					console.log(results[i].descr);
					if(email != null && email[1] != null) {
						e = email[1];
					}
					if(phone != null && phone[1] != null && phone[1].length>=11) {
						p = phone[1];
					}
					var values = [  e, p, results[i].link ];
					console.log(values.toString());
					console.log(">>>>>>>>>> update |email:"+e + " |phone:" + p +"<<<<<<<<<<");
					connection.query(
						'UPDATE amazon.cnchina SET email = ?, phone = ? WHERE link = ?',
						values, function(error, res) {
						if (error) {
							console.log("update Error: " + error.message);
							return;
						}
					});
				}
			});
}

function update(id, desc, producer, phone, email, left, link) {
	if (!dbReady)
		return;

	var values = [ desc, email, phone, producer, left, link ];
	console.log(">>>>>>>>>> update |email:"+email + " |phone:" + phone + " |left:" +left+ " |producer:"+producer+"<<<<<<<<<<");
	connection.query(
			'UPDATE cnchina SET descr = ?, email = ?, phone = ?, producer = ?, days = ? WHERE link = ?',
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

function save(id, title, price, days, fetchLink, currLink) {
	if (!dbReady)
		return;
	var values = [ id, title, price, days, fetchLink, currLink ];
	console.log("save:"+values);
	connection.query(
			'INSERT INTO cnchina SET id = ?, title = ? , price = ?, publishtime = ?, link = ?, redirect = ?',
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
		save(fetch.getId(), data.fetchTitles[i], data.fetchAddr[i], data.fetchDays[i], data.fetchLinks[i], data.currLink);
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}
	
	res.send('OK.');
	var x = us.getCountOfRedirects();

	if(us.getCountOfRedirects() > 0) {
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
	
	if(data.desc.length == 0) {
		data.desc = 'ERR_DESC';
	}else if(data.company.length == 0){
		data.company = 'ERR_PRODUCER';
	}else if(data.phone.length == 0){
		data.phone = 'ERR_PONE';
	}else if(data.email.length == 0){
		data.email = 'ERR_PONE';
	}else if(data.left.length == 0){
		data.left = 'ERR_LEFT';
	}
	update(data.id, data.desc, data.company, data.phone, data.email, data.left, data.link );

	res.send('OK.');
	if(us.getCountOfFetchs() > 0) {
		us.loopFetch();
	}
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
"http://cn.china.cn/buy/purchase/"
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

					//var d = select();
					
					/*extract();*/

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
