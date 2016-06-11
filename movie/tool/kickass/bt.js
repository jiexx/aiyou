var express = require('express');
var mysql = require('mysql');
var https = require('https');
//var iconv = require('iconv-lite');

var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});
var dbReady = false;


var fs = require("fs");
var request = require('request');
request = request.defaults({
	'proxy':'https://188.166.247.5:443',
	agentOptions: {
        secureProtocol: 'SSLv3_method'
    }});
request.debug = true;

function download(uri, filename, callback){
	
	request.head(uri, function(err, res, body){
		console.log('begin:'+err+ ' '+uri);
		if(res) {
			console.log('content-type:', res.headers['content-type']);
			console.log('content-length:', res.headers['content-length']);
			var writestrm = request(uri).pipe(fs.createWriteStream(filename));
			writestrm.on('error', function(){
				fs.appendFile('bt.txt', 'ERR_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {});
			});
			writestrm.on('end', callback);
		}
		//fs.appendFile('bt.txt', 'SUC_LINKS_IMG '+uri+'\n', 'utf-8', function (err) {console.log('DOWN IMG SUC_LINKS_IMG:  '+err)});
	});
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var down = function(url, filename, cb) {
  var file = fs.createWriteStream(filename);
  var request = https.get({
	  host: "188.166.247.5",
	  port: 443,
	  path: url,
	}, function(response) {
		response.pipe(file);
		file.on('finish', function() {
		  file.close(cb);
    });
  });
} 

function getURLParameter(uri, name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(uri) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function btDownload(set, i){
	console.log(' rows:'+set[i].uri);
	down(set[i].uri, __dirname+'/'+'bt/'+set[i].id+'/'+getURLParameter(set[i].uri,'title')+'.torrent', function(){
		console.log('done:'+'/'+'bt/'+set[i].id+'/'+getURLParameter(set[i].uri,'title')+'.torrent');
		connection.query('update amazon.xunleitai set clazz="ka" where id="'+set[i].id+'" ; ', function(error, results, fields) {
			if(i >= 0) {
				btDownload(set, i-1);
			} 
		});
	});
}

function downBt(){
	console.log('downBt');
	connection.query(
		'SELECT id, download FROM amazon.xunleitai WHERE download IS NOT NULL and trim(download)<>"" and clazz<>"ka" ; ', function(error, results, fields) {
			if (error) {
				console.log("select Error: " + error.message);
				connection.end();
				return;
			}
			if (!fs.existsSync('bt')) {
				fs.mkdirSync('bt');
			}
			if(fs.exists('bt.txt')) {
				fs.unlink('bt.txt');
			}
		
			console.log('downBT go...'+results.length);
			var rows = [];
			for(var a in results) {
				var row = results[a];
				if (!fs.existsSync('bt/'+row.id)) {
					fs.mkdirSync('bt/'+row.id);
				}
				if(row.download) {
					var link = row.download.split(',');
					for(var c in link) {
						rows.push({id:row.id, uri:'https'+link[c].substring(link[c].indexOf(':'))});
					}
				}
			}
			
			btDownload(rows, rows.length-1);
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
		downBt();
	});
});

