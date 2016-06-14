var express = require('express');
var mysql = require('mysql');
var https = require('https');
var im = require('lwip');
var constants = require('constants')
//var iconv = require('iconv-lite');

var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});
var dbReady = false;
var db_table = 'amazon.movie';

var fs = require("fs");
var request = require('request');

var down = function(url, filename, cb) {
	console.log(url+'--->>'+filename);
	var file = fs.createWriteStream(filename);
	var writestrm = request(url).pipe(file);
	writestrm.on('error', function(){
		fs.appendFile('img.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
	});
	writestrm.on('finish', cb);
};

var down2 = function(url, filename, cb) {
  var file = fs.createWriteStream(filename);
  var options = {
		headers:{
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
			"Accept-Language":"en-US,en;q=0.8",
			"Cache-Control":"no-cache",
			"Connection":"keep-alive",
			"Cookie":'bid="Hpsg9Z7SGXA"; ll="108296"; viewed="11229103_1477932"; gr_user_id=b6ebe87f-cbae-4b65-8d9a-af0dd505dae0; _pk_ref.100001.4cf6=%5B%22%22%2C%22%22%2C1465625000%2C%22http%3A%2F%2Fwww.subhd.com%2Fa%2F313384%22%5D; _pk_id.100001.4cf6=84931053ded43215.1462889423.8.1465625197.1465616347.; __utma=30149280.1852834160.1452963338.1465616347.1465625001.13; __utmc=30149280; __utmz=30149280.1465616347.12.11.utmcsr=subhd.com|utmccn=(referral)|utmcmd=referral|utmcct=/a/313384; __utma=223695111.646540277.1463759481.1465616347.1465625001.6; __utmc=223695111; __utmz=223695111.1465616347.5.4.utmcsr=subhd.com|utmccn=(referral)|utmcmd=referral|utmcct=/a/313384',
			"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36"
		},
		hostname:"img3.doubanio.com",
		agent:false,
		path: url,
		method: 'GET',
		agentOptions: {
			secureProtocol: 'SSLv3_method'
		}
	};
  var request = https.get(options, function(response) {
		response.pipe(file);
		file.on('finish', function() {
		  file.close(cb);
    });
  });
  request.end();
} 

function isJson(text) {
	return /^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''));
}

function download(item, filename, callback){
	/*request.get(uri, function(err, res, body){
		console.log('download err:'+err +' res:'+res.statusCode);
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
	});*/
	var options = {
		headers:{
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
			"Accept-Language":"en-US,en;q=0.8",
			"Cache-Control":"no-cache",
			"Connection":"keep-alive",
			"Cookie":'bid="Hpsg9Z7SGXA"; ll="108296"; viewed="11229103_1477932"; gr_user_id=b6ebe87f-cbae-4b65-8d9a-af0dd505dae0; _pk_ref.100001.4cf6=%5B%22%22%2C%22%22%2C1465625000%2C%22http%3A%2F%2Fwww.subhd.com%2Fa%2F313384%22%5D; _pk_id.100001.4cf6=84931053ded43215.1462889423.8.1465625197.1465616347.; __utma=30149280.1852834160.1452963338.1465616347.1465625001.13; __utmc=30149280; __utmz=30149280.1465616347.12.11.utmcsr=subhd.com|utmccn=(referral)|utmcmd=referral|utmcct=/a/313384; __utma=223695111.646540277.1463759481.1465616347.1465625001.6; __utmc=223695111; __utmz=223695111.1465616347.5.4.utmcsr=subhd.com|utmccn=(referral)|utmcmd=referral|utmcct=/a/313384',
			"User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36"
		},
		hostname:"movie.douban.com",
		agent:false,
		path: item.uri,
		method: 'GET',
		agentOptions: {
			secureProtocol: 'SSLv3_method'
		}
	};
	console.log('download json:'+ JSON.stringify(item));
	var req = https.request(options, function(res) {
		//console.log("statusCode: ", res.statusCode);
		//console.log("headers: ", res.headers);
		var data = '';
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('chunk:'+chunk);
			data += chunk;
		});

		res.on('end', function(){
			if(!isJson(data)) {
				fs.appendFile('img.txt', 'ERR_JSON_IMG '+uri+'\n', 'utf-8', function (err) {});
				callback();
				return;
			}else {
				console.log('end '+data + ' '+item.uri);
				var result = JSON.parse(data);
				if(result && result[0] && result[0].img) {
					var img = result[0].img;
					var val = [result[0].title,item.id];
					connection.query('update '+db_table+' set subtitle=? where id=? ; ', val, function(err, results, fields) {
						console.log('update '+result[0].title);
					});
					var real = /*'https://img3.doubanio.com*/'/view/photo/photo/public/'+img.substring(img.lastIndexOf('/')+1);
					var mime = '.jpg';//img.substr(img.lastIndexOf('.'));
					console.log('image: '+'https://img3.doubanio.com/view/photo/photo/public/'+img.substring(img.lastIndexOf('/')+1));
					down2(real, filename+mime, callback);
				}
				else{
					callback();
				}
			}
		});
	});
	req.end();
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


function getURLParameter(uri, name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(uri) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function imgDownload(set, i){
	console.log(' rows:'+JSON.stringify(set[i]));
	var imgFile = __dirname+'/'+'img/'+set[i].id+'.jpg';
	download(set[i], imgFile, function(){
		console.log('callback '+set[i].uri);
		if (fs.existsSync(imgFile)) {
			console.log('image down file:'+imgFile);
			im.open(imgFile, function(err, image){
				if(!image){
					fs.appendFile('img.txt', 'ERR_THUMB_IMG '+set[i].id+'\n', 'utf-8', function (err) {});
					return;
				}
				var h = (200.0/ image.width() ) * image.height();
				image.batch()
				.resize(200, h)
				.writeFile(__dirname+'\\'+'thumb\\'+set[i].id+'.jpg',function(err, image){
					connection.query('update '+db_table+' set clazz="ka" where id="'+set[i].id+'" ; ', function(err, results, fields) {
						if (!err) console.log('resized done:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg ');
						else console.log('resized err:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg '+err);
					});
				});
			});
			/*im.resize({
				srcPath: __dirname+'\\'+'img\\'+set[i].id+'.jpg',
				dstPath: __dirname+'\\'+'thumb\\'+set[i].id+'.jpg',
				width: 200
			}, function(err, stdout, stderr){
				//if(!err) {
					connection.query('update amazon.xunleitai set clazz="ka" where id="'+set[i].id+'" ; ', function(err, results, fields) {
						if (!err) console.log('resized done:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg ');
						else console.log('resized err:'+__dirname+'\\'+'thumb\\'+set[i].id+'.jpg '+err);
					});
				//}
			});*/
		}
		if(i >= 1) {
			setTimeout(function(){imgDownload(set, i-1);},5);
		}else {
			console.log('FINISHED');
		}
	});
}

function downImg(){
	console.log('downImg');
	connection.query(
		'SELECT id, title FROM '+db_table+'  where clazz is  null or clazz<>"ka"; ', function(error, results, fields) {
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
					rows.push({id:row.id, uri:/*'https://movie.douban.com*/'/j/subject_suggest?q='+encodeURI(row.title)});
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
    console.log('uncaughtException:'+err);
}); 
