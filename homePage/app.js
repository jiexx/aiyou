var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var FdfsClient = require('fdfs');
var fs = require("fs");

var upload = multer({ dest: 'uploads/' }); 
var app = express();
//app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});
eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

app.get('/lessons', upload.array(), function(req, res) {
	
	var data = select();
	var result = [];
	for(var i in data) {
		var t = convert(data[i].LessonType);
		console.log(t);
		result.push({day:data[i].day,id:data[i].id,type:t});
	}
	
	res.render('list', {
		items : result
	});
})