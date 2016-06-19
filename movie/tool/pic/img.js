var express = require('express');
var mysql = require('mysql');
var https = require('https');
var im = require('lwip');
var path = require('path');
var constants = require('constants')
//var iconv = require('iconv-lite');
var fs = require("fs");

var rows ;
function imgDownload(set, i){
	console.log(' rows:'+JSON.stringify(set[i]));
	var imgFile = __dirname+'/img/'+set[i];
	console.log('callback '+imgFile);
	if (fs.existsSync(imgFile)) {
		var stats = fs.statSync(imgFile);
		var fileSizeInBytes = stats["size"];
		if(fileSizeInBytes < 1000 && i >= 1) {
			imgDownload(set, i-1);
			return;
		}
		console.log('image resizing file:'+imgFile);
		im.open(imgFile, function(err, image){
			console.log('image resized file: '+err);
			if(!image){
				fs.appendFile('img.txt', 'ERR_THUMB_IMG '+set[i]+'\n', 'utf-8', function (err) {});
				return;
			}
			var h = (130.0/ image.width() ) * image.height();
			image.batch()
			.resize(130, h)
			.writeFile(__dirname+'\\'+'thumb\\'+set[i],function(err, image){
				console.log('done '+set[i]);
				if(i >= 1) {
					imgDownload(set, i-1);
				}else {
					console.log('FINISHED');
				}
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
	
}

function downImg(){
	if (!fs.existsSync('thumb')) {
		fs.mkdirSync('thumb');
	}
	if(fs.exists('img.txt')) {
		fs.unlink('img.txt');
	}
	
    fs.readdir('img/', function(err, files){
		if(!err) {
			console.log(files);
			rows = files;
			imgDownload(rows, rows.length-1);
		} else {
			console.log(err)
		}
		
	})
			
	
}
downImg();