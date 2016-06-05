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
			'SELECT id, redirect FROM amazon.xunleitai WHERE download IS NULL; ', function(error, results, fields) {
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
			'SELECT id, link,descr FROM amazon.toocle WHERE descr IS NOT NULL; ', function(error, results, fields) {
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
						'UPDATE amazon.toocle SET email = ?, phone = ? WHERE link = ?',
						values, function(error, res) {
						if (error) {
							console.log("update Error: " + error.message);
							return;
						}
					});
				}
			});
}

function update(id, downtxt, downloads, image, name, type, publish, area, directors, actors) {
	if (!dbReady)
		return;

	var values = [ downloads+'', downtxt+'', image, name+'', type, publish, area, directors+'', actors+'', id ];
	console.log(">>>>>>>>>> update |values:"+values + "<<<<<<<<<<");
	connection.query(
			'UPDATE xunleitai SET download = ?, downtxt = ?, image = ?, title = ?, type = ?, publishtime = ?, area = ?, director = ?, actor = ? WHERE id = ?',
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

function save(id, fetchLink, currLink) {
	if (!dbReady)
		return;
	var values = [ id, fetchLink, currLink ];
	console.log("save:"+values);
	connection.query(
			'INSERT INTO xunleitai SET id = ?, link = ?, redirect = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					//connection.end();
					return;
				}
			});
}
app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded

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
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.fetchLinks+'\n', 'utf-8', function (err) {});
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.create(data.fetchLinks[i]);
		us.addFetchUrl(fetch);
		save(fetch.getId(), data.fetchLinks[i], data.currLink);
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
		//download(data.img, __dirname+'/'+'img/'+data.id+data.img.substr(data.img.lastIndexOf('.')), function(){
		//	console.log('done');
		//});
	}
	update(data.id, data.downtxt, data.down, 'img/'+data.id+data.img.substr(data.img.lastIndexOf('.')), data.name, data.type, data.pub, data.area, data.dir, data.act);

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
"http://www.xunleitai.com/top/all.html"
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
					if(fs.exists('img.txt')) {
						fs.unlink('img.txt');
					}
					if (!fs.existsSync('img')) {
						fs.mkdirSync('img');
					}
										
					for(var i in banks) {
						var url = URL.create(banks[i]);
						us.addRedirectUrl(url);
					}
					
					us.loopRedirect();
					/*select();*/

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
