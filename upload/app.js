var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var FdfsClient = require('fdfs');
var fs = require("fs");
w=0;
var upload = multer({ dest: 'uploads/' }); 

var connection = mysql.createConnection({
	host : '10.101.1.163',
	user : 'root',
	password : '123456',
});

var fdfs = new FdfsClient({
    // tracker servers
    trackers: [
        {
            host: '10.101.1.165',
            port: 22122
        }
    ],
    timeout: 10000,
    //defaultExt: 'txt',
    charset: 'utf8'
});

var dbReady = false;
connection.connect(function(error, results) {
	if (error) {
		console.log('Connection Error: ' + error.message);
		return;
	}
	console.log('Connected to MySQL');
	connection.query('USE traveldb;', function(error, results) {
		if (error) {
			console.log('ClientConnectionReady Error: ' + error.message);
			connection.end();
			console.log("Error: " + error.message);
			return;
		}
		dbReady = true;
	});
});
function counter(arr) {
	var cn = 0;
	for(var i in arr) {
		if(arr[i] != null) {
			cn ++;
		}
	}
	return cn;
};
function saveLesson(val1, val2, onSuccess, onFail) {
	if (!dbReady)
		return;
	//var values = [ clazz, type, date ];
	var id = null;
	var cn = counter(val2) - 1;
	connection.beginTransaction(function(err) {
		console.log('val1'+JSON.stringify(val1));
		console.log('val2'+JSON.stringify(val2));
		
		/*connection.query('INSERT INTO tab_dailylesson SET LessonType=?, SubTypeName=?, CreateDate=?, Status="Y", UpdateDate=now()', val1, function(error, results) {
			if (error) { 
			  connection.rollback(function() {
				if(onFail != null){
					onFail(error.message);
				}
				throw error;
			  });
			  console.log("Error: " + error.message);
			}
			console.log(JSON.stringify(results));
			id = results.insertId;*/
			
			//var values = [ id, pagetype, title, subtitle, content, pic, pictex, audiotex, audio, video, index, date ];
			for(var i in val2) {
				(function(k){
					var arr = [id];
					var values = arr.concat(val2[k]);
					console.log('INSERT	tab_pictures val:'+JSON.stringify(values));
					var val = [values[7].substring(0,values[7].indexOf('-')), values[8], values[7], values[6] ];
					console.log(val);
					/*'INSERT INTO tab_pictures SET LessionId=?, Type=?, MainTitle=?, SubTitle=?, Desc=?, PicURL=?, ParaText=?, ParaGraph=?, AudioURL=?, VideoURL=?, Sequence=?, CreateDate=?' for debug*/
					connection.query('INSERT INTO tab_pictures SET Type=?, PictureURL=?, Title=?, Description=?', val, function(error, results) {
						if (error) { 
						  connection.rollback(function() {
							if(onFail != null){
								onFail(error.message);
							}
							throw error;
						  });
						  console.log("Error: " + error.message);
						}
						//console.log('INSERT	tab_dailylessondetail:'+JSON.stringify(results));
						connection.commit(function(error) {
							if (error) { 
								connection.rollback(function() {
									if(onFail != null){
										onFail(error.message);
									}
									throw error;
								});
								console.log("Error: " + error.message);
							}
							console.log('Transaction Complete.');
							if(k == cn && onSuccess != null){
								onSuccess();
							}
						});
					});
				})(i);
			}
		//});
	});
};

function select(onCallBack) {
	var data = null;
	connection.query('SELECT date_format(CreateDate,"%Y-%c-%d") AS day, LessonType, LessonID FROM tab_dailylesson;', function(err, rows, fields) {
	  //if (err) throw err;
	  data = rows;
	  console.log('SELECT is: ', JSON.stringify(rows));
	  onCallBack(data);
	});
	return data;
}
var fs = require('fs');
//var templateList = fs.readFileSync('list.ejs', 'utf-8');
var app = express();
//app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});
//app.set("views", ".");
var ind = [];
ind['pagetype'] = 0;
ind['title'] = 1;
ind['subtitle'] = 2;
ind['content'] = 3; 
ind['pic'] = 4;

ind['audiotitle'] = 5;
ind['audiotex'] = 6;
ind['audio'] = 7;

ind['video'] = 8;
ind['index'] = 9;
ind['date'] = 10;
function makePage(t, idx, data, audio, audio_thumb, video, thumbnail,video_thumb, x, y, z, w,p) {
	//[ id, pagetype, title, subtitle, content, pic, pictex, audiotex, audio, video, index, date ];
	
	
	
	var a = [];
	for(var i = 0; i < 10; i++) {
		a[i] = '';
	}
	if(t == 1) {
		a[ind['pagetype']] = 1;
		a[ind['title']] = data['title_'+idx];
		a[ind['subtitle']] = data['subtitle_'+idx];
		a[ind['content']] = data['content_'+idx];
		a[ind['index']] = idx;
		a[ind['date']] = data.date;
	}else if(t == 2) {
		a[ind['pagetype']] = 2;
		a[ind['audiotex']] = data['title_'+idx];
		a[ind['audiotitle']] = data['content_'+idx];
		a[ind['audio']] = audio[x];
		a[ind['index']] = idx;
		a[ind['date']] = data.date;
	}else if(t == 3) {
		a[ind['pagetype']] = 3;
		console.log('w:'+w);
		a[ind['pic']] = thumbnail[w++];
		a[ind['audio']] = audio_thumb[y++];
		a[ind['index']] = idx;
		a[ind['date']] = data.date;
	}else if(t == 4) {
		a[ind['pagetype']] = 4;
		a[ind['pic']] = video_thumb[p++];
		a[ind['video']] = video[z++];
		a[ind['index']] = idx;
		a[ind['date']] = data.date;
	}
	return a;
};
function uploadOne(arr, onFinish) {
	var result = [];
	if(arr == null) {
		onFinish(result);
	}
	var cn = counter(arr) - 1;
	var index = -1;
	
	for(var i in arr) {	
			(function(k){		
				  console.log('current k:'+k);
			       var name = arr[k].originalname;
					var e = name.substring(name.lastIndexOf('.')+1);
					fdfs.upload(arr[k].path, {ext: e}).then(function(fileId) {
						console.log('fileId:'+fileId);
						index++;
						console.log('index:'+index);
						result.push(fileId);
						if(cn == index) {
						onFinish(result);
						}
					});	
				  })(i);
	}
	
};
function uploadFiles(a1, a2, a3, a4,a5, onFinish) {
	uploadOne(a1, function(result1){
		console.log('audio_thumb:'+JSON.stringify(a2));
		uploadOne(a2, function(result2){
			console.log('video      :'+JSON.stringify(a3));
			uploadOne(a3, function(result3){
				console.log('thumbnail  :'+JSON.stringify(a4));
				uploadOne(a4, function(result4){		
					console.log('video_thumbnail  :'+JSON.stringify(a5));
					uploadOne(a5,function(result5){
						onFinish(result1, result2, result3, result4,result5);
					})
				});
			});
		});
	});
};

app.get('/add', upload.array(), function(req, res) {
	
	/*var tmp_path = req.files.thumbnail.path;

    var target_path = './public/images/' + req.files.thumbnail.name;
 
    fs.unlink(tmp_path, function() {
        if (err) throw err;
         //res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
	});*/
	res.render('add');
	
})
var cpUpload = upload.fields([{ name: 'audio', maxCount: 50 }, 
                              { name: 'thumbnail', maxCount: 50 }, 
                              { name: 'audio_thumb', maxCount: 50 }, { name: 'video', maxCount: 50 },
                              {name:'video_thumbnail',maxCount:50}]);
app.post('/lessondaily', cpUpload, function(req, res) {
	console.log(JSON.stringify(req.body));
	var data = req.body;
	 //[ clazz, type, date ]
	var val1 = [data.clazz, data.type/*for debug data.type*/, data.date ];
	var val2 = []  ;
	var audio ;
	var audio_thumb ;
	var thumbnail ;
	var video ;
	var video_thumbnail ;

	

//	var audio = req.files['audio'];
//	var audio_thumb = req.files['audio_thumb'];
//	var video = req.files['video'];
//	var video_thumbnail = req.files['video_thumbnail'];
//	var thumbnail = req.files['thumbnail'];
	
	
	 var audio = req.files['audio'];
	 audio_thumb = req.files['audio_thumb'];
	 thumbnail = req.files['thumbnail'];
	 video = req.files['video'];
	 video_thumbnail = req.files['video_thumbnail'];
		
	uploadFiles(audio, audio_thumb, video, thumbnail,video_thumbnail, function(aud, aud_t, vid, thumb,video_thumb){
		var x=0, y=0, z=0,  p=0;
		w=0;
		console.log('audio      :'+JSON.stringify(aud));
		console.log('audio_thumb:'+JSON.stringify(aud_t));
		console.log('video      :'+JSON.stringify(vid));
		console.log('thumbnail  :'+JSON.stringify(thumb));
		console.log('video_thumbnail  :'+JSON.stringify(video_thumb));
		for(var i in data.a) {
			var item = data.a[i]+'';
			var pagetype = item.substring(0,1);
			var pageindex = item.substring(1);
			console.log('>>>>>>item:'+item+' pagetype:'+pagetype+' idx:'+pageindex+'<<<<<<' );			
			var a =  makePage(pagetype, pageindex, data, aud, aud_t, vid, thumb, video_thumb,x, y, z, w,p);
			 if(pagetype == 2) {				
					x++;			
				}else if(pagetype == 3) {			
					w++;
					y++;				
				}else if(pagetype == 4) {			
					p++;
					z++;			
				}
			console.log('makePage:'+JSON.stringify(a));
			val2.push(a);
		}
		saveLesson(val1, val2, function(){
			res.send('<div><a href="/lessons">每日一课清单</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/add">每日一课添加</a></div><br>'+'SUCCESS');
		}, function(err){
			res.send('<div><a href="/lessons">每日一课清单</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="/add">每日一课添加</a></div><br>ERR:'+err);
		});
	});
	
})

function convert(LessonType) {
	if(LessonType == 1) {
		return '每日一课';
	}else if(LessonType == 2) {
		return '儿童故事';
	}else if(LessonType == 3) {
		return '古诗国学';
	}else if(LessonType == 4) {
		return '字词成语';
	}
	return '';
}

app.get('/lessons', upload.array(), function(req, res) {
	
	   select(function (data){
		var result = [];
		for(var i in data) {
			var t = convert(data[i].LessonType);
			console.log(t);
			result.push({day:data[i].day,id:data[i].LessonID,type:t});
		}
		
		res.render('list', {
			items : result
		});
	});

})

app.get('/delete', upload.array(), function(req, res) {
	
	var id = req.query.id;	

	  console.log('id: ', id);
//    var target_path = './public/images/' + req.files.thumbnail.name;
// 
//	if(fs.exists(tmp_path)) {
//		fs.unlink(tmp_path, function() {
//			if (err) throw err;
//			 //res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
//		});
//	}
	
	
		connection.query('delete from tab_dailylesson where LessonID = ' + id, function(err, result) {
			  //if (err) throw err;
			if (err) {
				console.log('ClientConnectionReady Error: ' + err.message);
				connection.end();
				console.log("Error: " + err.message);
				return;
			}
			  console.log('rusult1: ', JSON.stringify(result));
			  connection.query('delete from tab_dailylessondetail where LessionID = ' + id,function(err,result){
				  console.log('rusult2: ', JSON.stringify(result));
				  res.send('SUCCESS');
			  });
			});
	
	
})

var server = app
		.listen(
				9081,
				function() {
					var host = server.address().address;
					var port = server.address().port;
					console.log("RUNNING http://%s:%s", host, port);
				});
