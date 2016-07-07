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
	connection.query('update amazon.xunleitai set subtitle = REPLACE(subtitle,",", " ")  where subtitle like "%,%";', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			return;
		}
		dbReady = true;
	});
	connection.query('update amazon.xunleitai set subtitle = REPLACE(subtitle,"\'", " ")  where subtitle like "%\'%";', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			return;
		}
		dbReady = true;
	});
	/*connection.query('update amazon.xunleitai set sub = "" ; ', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			return;
		}
		dbReady = true;
	});
	connection.query('update amazon.xunleitai set subtxt = ""; ', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			return;
		}
		dbReady = true;
	});*/
});
var app = express();
var router = express.Router();
var fs = require("fs");
var request = require('request');

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

var rows = [];
function selectSubRows(){
	console.log('downSub');
	connection.query(
		'SELECT distinct subtitle, id,  link FROM amazon.xunleitai where (subtitle is not null and subtitle <> "") and sub=""  group by id; ', function(error, results, fields) {
			if (error) {
				console.log("select Error: " + error.message);
				connection.end();
				return;
			}
			if (!fs.existsSync('sub')) {
				fs.mkdirSync('sub');
			}
			if(fs.exists('sub.txt')) {
				fs.unlink('sub.txt');
			}
		
			
			
			for(var a in results) {
				var row = results[a];
				
				if(row.subtitle) {
					rows.push({id:row.id, link:row.link, uri:'http://www.subhd.com/search/'+encodeURI(row.subtitle)});
				}
			}
			if (rows.length > 0) {
				us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
				rows.splice(0,1);
			}
			console.log('downSub go...'+results.length);
			us.loopRedirect();
		});
}

app.use(bodyParser.json({limit: '50mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '50mb', extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
	console.log('Hello World!');
	res.send('Hello World!');
});

function download(uri, filename, callback){
	request.head(uri, function(err, res, body){
		console.log('----------------------------------------   >>   uri:'+ decodeURI(uri));
		if(res) {
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			/*request(uri, function (error, response, body) {
				console.log('####'+error+' '+body.length);
				if(error){
					fs.appendFile('sub.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
				}else {
					fs.writeFileSync(filename, body);
				}
			});*/
			var writestrm = request(uri).pipe(fs.createWriteStream(filename));
			writestrm.on('error', function(err){
				console.log('----------------------------------------   >>'+err);
				fs.appendFile('sub.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
			});
			writestrm.on('finish', callback);
		}
	});
};

app.post('/detail', upload.array(), function(req, res) {
	
	//console.log(">>>>>>>>>>>>>>"+decodeURI(decodeURI(req.body.encode)));
	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));

	us.visitedFetchUrl(data.id);
	if(data.sub) {
		var suffile = data.sub.substr(data.sub.lastIndexOf('/')+1);
		console.log('----------------------------------------   >>   download from uri:'+data.sub+' :'+fs.existsSync('sub/'+data.parent)+' '+data.parent);
		console.log('----------------------------------------   >>   download to:'+ __dirname+'/'+'sub/'+data.parent+'/'+suffile);
		download(data.sub, __dirname+'/'+'sub/'+data.parent+'/'+suffile, function(){
			console.log('----------------------------------------   >>  update amazon.xunleitai set sub = concat("'+suffile+';", sub) where id='+data.parent+'; ');
			connection.query('update amazon.xunleitai set sub = concat("'+suffile+';", sub) where id="'+data.parent+'"; ', function(error, results) {
				if (error) {
					console.log('ClientConnectionReady Error: ' + error.message);
					return;
				}
			});
			console.log('done');
			if(us.getCountOfFetchs() > 0) {
				us.loopFetch();
			}else {
				if (rows.length > 0) {
					console.log('----------------------------------------   >>   loopRedirect:'+decodeURI(rows[0].uri)+' getCountOfRedirects:'+us.getCountOfRedirects()+' '+rows[0].id);
					if(!rows[0].uri) {
						rows.splice(0,1);
					}
					while(us.getCountOfRedirects() <= 0) {
						us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
						rows.splice(0,1);
					}
					if(us.getCountOfRedirects() > 0) {
						console.log('----------------------------------------   >>   loopRedirect:'+decodeURI(rows[0].uri)+' getCountOfRedirects:'+us.getCountOfRedirects()+' '+rows[0].id);
						us.loopRedirect();
					}
				}
			}
		});
	}else {
		console.log('----------------------------------------   >>   visitedFetchUrl:'+JSON.stringify(data));
	}
	
	res.send('OK.');
});
var crypto = require('crypto');
app.post('/redirect', upload.array(), function(req, res) {

	var data = JSON.parse(decodeURI(decodeURI(req.body.encode)));
	console.log('[app] [REST/redirect] '+data.id);
	
	if(data.error == 1) {
		//us.errorRedirectUrl(data.id);
		//fs.appendFile('redirects.txt', 'ERR_LINKS_SUB '+data.currLink.toString()+'\n', 'utf-8', function (err) {});
		connection.query('update amazon.xunleitai set sub = "empty" where id="'+data.parent+'"; ', function(error, results) {
			console.log('update amazon.xunleitai set sub = "empty" where id="'+data.parent+'"; ');
		});
		if (rows.length > 0) {
			while(us.getCountOfRedirects() <= 0) {
				us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
				rows.splice(0,1);
			}
			if(us.getCountOfRedirects() > 0) {
				console.log('----------------------------------------   >>   loopRedirect:'+decodeURI(rows[0].uri)+' getCountOfRedirects:'+us.getCountOfRedirects()+' '+rows[0].id);
				us.loopRedirect();
			}
		}
	
		res.send('OK.');
		return;
	}

	us.visitedRedirectUrl(data.id);
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		if (!fs.existsSync('sub/'+data.parent)) {
			(function(i) {
			console.log('----------------------------------------   >>   update subtxt:'+data.fetchTitles[i]+' id:'+data.parent);
			connection.query('update amazon.xunleitai set subtxt = CONCAT_WS(";","'+data.fetchTitles[i]+'",subtxt) where id= "'+data.parent+'"; ', function(error, results) {
				if (error) {
					console.log('ClientConnectionReady Error: ' + error.message);
					return;
				}
			});
			fs.mkdir('sub/'+data.parent, function(){
				fs.appendFile('mkdir.txt', 'mkdir '+JSON.stringify(data)+'\n', 'utf-8', function (err) {});
				var fetch = URL.createByParent(data.fetchLinks[i], data.parent);
				us.addFetchUrl(fetch);
			});
			}(i));
		}else {
			(function(i) {
			console.log('----------------------------------------   >>   update subtxt:'+data.fetchTitles[i]+' id:'+data.parent);
			connection.query('update amazon.xunleitai set subtxt = CONCAT_WS(";","'+data.fetchTitles[i]+'",subtxt) where id= "'+data.parent+'"; ', function(error, results) {
				if (error) {
					console.log('ClientConnectionReady Error: ' + error.message);
					return;
				}
			});
			fs.appendFile('mkdir.txt', 'mkdir '+JSON.stringify(data)+'\n', 'utf-8', function (err) {});
			var fetch = URL.createByParent(data.fetchLinks[i], data.parent);
			us.addFetchUrl(fetch);
			}(i));
		}
	}	
	console.log(decodeURI(JSON.stringify(rows[0])));
	
	res.send('OK.');

	if(us.getCountOfFetchs() > 0) {
		console.log('----------------------------------------   >>   loopFetch:'+decodeURI(rows[0].uri)+' getCountOfRedirects:'+us.getCountOfRedirects()+' '+rows[0].id);
		us.loopFetch();
	}else {
		if (rows.length > 0) {
			while(us.getCountOfRedirects() <= 0) {
				us.addRedirectUrl(URL.createByParent(rows[0].uri, rows[0].id));
				rows.splice(0,1);
			}
			if(us.getCountOfRedirects() > 0) {
				console.log('----------------------------------------   >>   loopRedirect:'+decodeURI(rows[0].uri)+' getCountOfRedirects:'+us.getCountOfRedirects()+' '+rows[0].id);
				us.loopRedirect();
			}
		}
	}
});

var server = app
		.listen(
				8082,
				function() {

					var host = server.address().address;
					var port = server.address().port;

					console.log("RUNNING http://%s:%s", host, port);
					if(fs.exists('sub.txt')) {
						fs.unlink('sub.txt');
					}
					if (!fs.existsSync('sub')) {
						fs.mkdirSync('sub');
					}
					selectSubRows();
				});
server.on('error', function(err) { 
	console.log('SERVER ERR:  '+err);
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
    console.log('----------------------------------------   >>   uncaughtException:'+err);
    //server.kill();
   // process.kill();
});
