var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data


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

eval(fs.readFileSync('url.js') + '');
eval(fs.readFileSync('urlset.js') + '');

var us = UrlSet.create();

function select() {
	var values = null;
	connection.query(
			'SELECT id, link WHERE desc<>""; ', function(error, results, fields) {
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

function save(id, name, pic, desc, link) {
	if (!dbReady)
		return;
	var values = [ id, name, pic, desc, link ];
	connection.query(
			'INSERT INTO product SET id = ?, name = ? , pic = ?, descr = ?, link = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					connection.end();
					return;
				}
				//console.log('Inserted: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id inserted: ' + results.insertId);
			});
}

function update(id, desc, producer, score, review) {
	if (!dbReady)
		return;
	var values = [ desc, producer, score, review, id ];
	connection.query(
			'UPDATE product SET descr = ?, producer = ?, score = ?, review = ? WHERE id = ?',
			values, function(error, results) {
				if (error) {
					console.log("update Error: " + error.message);
					connection.end();
					return;
				}
				//console.log('updated: ' + results.affectedRows + ' row.' +' id:'+ id);
				//console.log('Id updated: ' + results.insertId);
			});
}

function saveBank(id, curr, link, hit, hitPage, hitLink) {
	if (!dbReady)
		return;
	var values = [ id, curr, link, hit, hitPage, hitLink ];
	connection.query(
			'INSERT INTO bank SET id = ?, curr = ? , link = ?, hit = ?, hitPage = ?, hitLink = ?',
			values, function(error, results) {
				if (error) {
					console.log("save Error: " + error.message);
					connection.end();
					return;
				}
			});
}
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function (req, res) {
	console.log('Hello World!');
	res.send('Hello World!');
});


app.post('/redirect', upload.array(), function(req, res) {
	/*
	 * fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
	 * console.log( data ); res.end( data ); });
	 */
	var data = req.body;
	console.log('[app] [REST/redirect] '+data.id);
	
	if(data.error == 1) {
		us.errorRedirectUrl(data.id);
		fs.appendFile('redirects.txt', 'ERR_LINKS_IMG '+data.currLink.toString()+'\n', function (err) {});
		
		for ( var i in data.redirectLinks) {
			us.addRedirectUrl(URL.create(data.redirectLinks[i]));
		}
	
		res.send('OK.');
		
		us.loopRedirect();
		return;
	}
	us.visitedRedirectUrl(data.id);
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.redirectLinks.toString()+'\n', function (err) {});
	
	for ( var i = 0 ; i < data.fetchLinks.length ; i ++ ) {
		var fetch = URL.create(data.fetchLinks[i]);
		us.addFetchUrl(fetch);
		save(fetch.getId(), data.names[i], data.linksImage[i], '', data.fetchLinks[i]);
	}

	for ( var i in data.redirectLinks) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i]));
	}
	
	
	res.send('OK.');

	us.loopRedirect();

})

app.post('/detail', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('[app] [REST/detail] '+data.id);
	
	us.visitedFetchUrl(data.id);
	
	if(data.desc.length == 0) {
		data.desc = 'ERR_DESC';
	}else if(data.producer.length == 0){
		data.producer = 'ERR_PRODUCER';
	}else if(data.score.length == 0){
		data.score = 'ERR_SCORE';
	}else if(data.review.length == 0){
		data.review = 'ERR_REVIEW';
	}
	update(data.id, data.desc, data.producer, data.score, data.review, data.link );

	res.send('OK.');
	
	us.loopFetch();
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

app.post('/bank', upload.array(), function(req, res) {
	
	var data = req.body;
	console.log('[app] [REST/bank] ');
	
	us.visitedRedirectUrl(data.id);
	fs.appendFile('redirects.txt', 'SUCCESS       '+data.currLink.toString()+'\n', function (err) {});
	
	for ( var i = 0 ; i < data.redirectLinks.length ; i ++ ) {
		us.addRedirectUrl(URL.create(data.redirectLinks[i].link));
		saveBank(data.id, data.currLink, data.redirectLinks[i].link, data.redirectLinks[i].hit, data.hitPage, data.hitLink);
	}

	res.send('DO...');
	
	us.loopRedirect();
})
var banks = 
[
"http://www.ajzq.com","http://www.essence.com.cn","http://www.ghsl.cn","http://www.ewww.com.cn","http://www.s10000.com","http://www.cfzq.com","http://www.ctsec.com","http://www.ctzg.com","http://www.gwgsc.com","http://www.cgws.com","http://www.95579.com","http://www.cjfinancing.com.cn","http://www.cjsc.com","http://www.cczq.com","http://www.estock.com.cn","http://www.dtsbc.com.cn","http://www.tebon.com.cn","http://www.jpmfc.com","http://www.firstcapital.com.cn","http://www.nesc.cn","http://www.citiorient.com","http://www.dfzq.com.cn","http://www.longone.com.cn","http://www.dwzq.com.cn","http://www.dxzq.net","http://www.dgzq.com.cn","http://www.foundersc.com","http://www.gsgh.cn","http://www.ebscn.com","http://www.gf.com.cn","http://www.gzs.com.cn","http://www.guodu.com","http://www.ghzq.com.cn","http://www.gjzq.com.cn","http://www.gkzq.com.cn","http://www.glsc.com.cn","http://www.gsstock.com","http://www.gtja.com","http://www.guosen.com.cn","http://www.gyzq.com.cn","http://www.haijizq.com","http://www.htsec.com","http://www.cczq.net","http://www.cnht.com.cn","http://www.hxzq.cn","http://www.hongtazq.com","http://www.hazq.com","http://www.cnhbstock.com","http://www.hczq.com","http://www.hfzq.com.cn","http://www.huajinsc.cn","http://www.chinalions.com","http://www.hlzqgs.com","http://www.hrsec.com.cn","http://www.lhzq.com","http://htamc.htsc.com.cn","http://www.htsc.com.cn","http://www.hx168.com.cn","http://www.jhzq.com.cn","http://www.cfsc.com.cn","http://www.huayingsc.com","http://www.jyzq.cn","http://www.jzsec.com","http://www.kysec.cn","http://www.zczq.com","http://www.lxsec.com","http://www.mszq.com","http://www.morganstanleyhuaxin.com","http://www.njzq.com.cn","http://stock.pingan.com","http://www.qlzqzg.com","http://www.rxzq.com.cn","http://www.csfounder.com","http://www.ubssecurities.com","http://www.sxzq.net","http://www.dfham.com","http://www.ebscn-am.com","http://www.gtjazg.com","http://www.htsamc.com","http://www.shhxzq.com","http://www.shzq.com","http://www.swhysc.com","http://www.csco.com.cn","http://www.sczq.com.cn","http://www.tpyzq.com","http://www.tfzq.com","http://www.wanhesec.com.cn","http://www.wlzq.com.cn","http://www.wxzq.com","http://www.wkzq.com.cn","http://www.westsecu.com","http://www.xzsec.com","http://www.swsc.com.cn","http://www.xcsc.com","http://www.xsdzq.cn","http://www.cindasc.com","http://www.xyzq.com.cn","http://xyzq.com.cn","http://yhjh.chinastock.com.cn","http://www.ytzq.com","http://www.ydsc.com.cn","http://www.newone.com.cn","http://www.stocke.com.cn","http://www.zdzq.com.cn","http://www.cicc.com.cn","http://e5618.com","Http://www.chinastock.com.cn","http://www.china-invs.cn","http://www.avicsec.com","http://www.zszq.com","http://www.zts.com.cn","http://www.stockren.com","http://www.csc108.com","http://www.zxwt.com.cn","http://www.cs.ecitic.com","http://www.bocichina.com","http://www.cnpsec.com","http://www.ccnew.com"
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
					
					for(var i in banks) {
						var url = URL.create(banks[i]);
						us.addRedirectUrl(url);
					}
					
					us.loopRedirect();
					
					/*var d = select();*/

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
