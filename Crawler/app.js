var express = require('express');
var app = express();
var fs = require("fs");

eval(fs.readFileSync('url.js')+'');
eval(fs.readFileSync('urlset.js')+'');

var us = new UrlSet();

app.get('/redirect', function (req, res) {
/*	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
       console.log( data );
       res.end( data );
   });*/
	var data = JSON.parse(req);
	us.addFetchUrls(data.fetchLinks);
	us.addRedirectUrls(data.redirectLinks);
	us.visited('redirect', data.id);
	
	us.loop();
	
	console.log(data.name+'  '+us.counter());
})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("应用实例，访问地址为 http://%s:%s", host, port)
  
  var url = URL.newRedirectUrl('http://www.amazon.com/Tea/b/ref=dp_bc_3?ie=UTF8&node=16318401');
  url.open();

})
