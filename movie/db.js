var mysql = require('mysql');
var pool  = mysql.createPool({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});

function exec(conn, sql, params, callback) {
	conn.query(sql, params, function(err, results) {
		conn.release(); // always put connection back in pool after last query
		if(err) { 
			console.log(err); 
			callback(true); 
			return; 
		}
		callback(false, results);
	});
}

exports.getWaterfalls = function(page, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var start, offset = 4;
		switch(page){
		case 0:
			start = Math.ceil(Math.random()*900);
			break;
		case 1:
			start = Math.ceil(Math.random()*900);
			break;
		case 2:
			start = Math.ceil(Math.random()*900);
			break;
		default:
			start = page*offset;
		}
		var sql = "SELECT id, SUBSTRING_INDEX(title,'Ñ¸À×ÏÂÔØ',1) as title, image, publishtime FROM amazon.xunleitai LIMIT ?, ?; ";
		exec(connection, sql, [start, offset], callback);
	});
};

exports.getDetail = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM amazon.xunleitai WHERE id = ?; ";
		exec(connection, sql, [id], callback);
	});
};