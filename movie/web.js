var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var fs = require("fs");
var url = require("url");
var path = require("path");
var cache = require("memory-cache");
var db = require("./db");
var comm = require("./comm");

var upload = multer({ dest: 'uploads/' }); 

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
//app.use('/img', express.static(__dirname + '/img'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	var pathname = url.parse(req.url).pathname;
	var realPath = path.join(__dirname, pathname);
	var ext = path.extname(realPath);
	var contentType = comm.cache_mime[ext];
	ext = ext ? ext.slice(1) : null;
	if(contentType) {
		fs.exists(realPath, function (exist) {
			if(exist){
				var expires = new Date();
				expires.setTime(expires.getTime() + 3600000);
				res.setHeader("Content-Type", contentType);
				res.setHeader("Expires", expires.toUTCString());
				res.setHeader("Cache-Control", "max-age=" + 3600000);
				var file = cache.get(pathname);
				if(file) {
					comm.log('HIT '+pathname);
					res.writeHead(200, "Ok");
					res.write(file, "binary");
					res.end();
				}else {
					fs.readFile(realPath, "binary", function(err, file) {
                        if (err) {
							comm.log('ERR '+pathname);
                            res.writeHead(500, "Internal Server Error", {'Content-Type': 'text/plain'});
                            res.end(err);
                        } else {
							cache.put(pathname, file, 3600000*24);
                            res.writeHead(200, "Ok");
                            res.write(file, "binary");
                            res.end();
                        }
                    });
				}
			}
		});
	}else {
		next();
	}
});

app.get('/', upload.array(), function(req, res) {
	comm.log('[HOME]:'+req.ip);
	db.getType(function(error, results){
		res.render('home', {
			HOST : comm.conf.WEB.remote,
			items : results
		});
	})
});

app.get('/detail', function(req, res) {
	comm.log('[DETAIL]:'+req.ip);
	var id = req.query.id;
	db.getDetail(id, function(error, results){
		if(!error) {
			var download = [];
			var a = results[0].download.split(',');
			var b = results[0].downtxt.split(',');
			if(a.length == b.length) {
				for(var i in a) {
					var big = (/[^【]*【([^】]*)】.*/gi).exec(b[i]);
					var pwd = (/[^密码]*密码[^A-Za-z0-9]*([A-Za-z0-9]*)/gi).exec(b[i]);
					if(big && big[1] && pwd && pwd[1] ){
						download.push({'link':a[i], 'pwd': '大小:' + big[1] + ' 密码:' + pwd[1]});
					}else{
						download.push({'link':a[i], 'pwd': ''});
					}
				}
			}
			res.render('detail', {
				item : results,
				down : download
			});
		}
	});
})

app.get('/waterfall', upload.array(), function(req, res) {
	var pg = parseInt(req.query.page)-1;//req.body.page;
	var t = req.query.type;
	var s = req.query.search;
	
	db.getWaterfalls({page:pg,type:t,search:s}, function(error, results){
		if(!error && results.length > 0) {
			res.render('waterfall', {
				items : results
			});
		}else {
			res.end('');
		}
	});
})

var server = app.listen(
	comm.conf.WEB.port,
	function() {
		var host = server.address().address;
		var port = server.address().port;
		comm.log("RUNNING http://"+host+':'+port);
	});
