var express = require('express');
var mysql = require('mysql');
var https = require('https');
var im = require('lwip');
//var iconv = require('iconv-lite');

var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});
var dbReady = false;


var fs = require("fs");
var request = require('request');

var down = function(url, filename, cb) {
	console.log(url);
	var file = fs.createWriteStream(filename);
	var writestrm = request(url).pipe(file);
	writestrm.on('error', function(){
		fs.appendFile('img.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
	});
	writestrm.on('finish', cb);
};

function download(uri, filename, callback){
	request.get(uri, function(err, res, body){
		console.log(''+err);
		if(!err && res && res.statusCode == 200) {
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			var result = JSON.parse(body);
			if(result[0] && result[0].img) {
				var img = result[0].img;
				var real = 'https://img3.doubanio.com/view/photo/photo/public/'+img.substring(img.lastIndexOf('/')+1);
				var mime = '.jpg';//img.substr(img.lastIndexOf('.'));
				down(real, filename+mime, callback);
			}
			else{
				callback();
			}
		}
		//fs.appendFile('bt.txt', 'SUC_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {console.log('DOWN IMG SUC_LINKS_IMG:  '+err)});
	});
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


function getURLParameter(uri, name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(uri) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function imgDownload(set, i){
	console.log(' rows:'+set[i].uri);
	download(set[i].uri, __dirname+'/'+'img/'+set[i].id, function(){
		console.log('callback '+set[i].uri);
		connection.query('update amazon.xunleitai set clazz="ka" where id="'+set[i].id+'" ; ', function(error, results, fields) {
			console.log(__dirname+'\\'+'img\\'+set[i].id+'.jpg');
			im.open(__dirname+'\\'+'img\\'+set[i].id+'.jpg', function(err, image){
				var h = (200.0/ image.width() ) * image.height();
				image.batch()
				.resize(200, h)
				.writeFile(__dirname+'\\'+'thumb\\'+set[i].id+'.jpg',function(err, image){
					if (!err) console.log('resized done:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg ');
					else console.log('resized err:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg '+err);
				});
			
			});
			if(i >= 0) {
				imgDownload(set, i-1);
			} 
		});
	});
}

function downImg(){
	console.log('downImg');
	connection.query(
		'SELECT id, title FROM amazon.xunleitai  where clazz<>"ka"; ', function(error, results, fields) {
			if (error) {
				console.log("select Error: " + error.message);
				connection.end();
				return;
			}
			if (!fs.existsSync('img')) {
				fs.mkdirSync('img');
			}
			if (!fs.existsSync('thumb')) {
				fs.mkdirSync('thumb');
			}
			if(fs.exists('img.txt')) {
				fs.unlink('img.txt');
			}
		
			console.log('downBT go...'+results.length);
			var rows = [];
			for(var a in results) {
				var row = results[a];
				if(row.title) {
					rows.push({id:row.id, uri:'https://movie.douban.com/j/subject_suggest?q='+row.title});
				}
			}
			
			imgDownload(rows, rows.length-1);
		});
}

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
		downImg();
	});
});
process.on('uncaughtException', function (err) {
    console.log(err);
}); 
