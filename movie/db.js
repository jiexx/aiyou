var mysql = require('mysql');
var comm = require("./comm");

var pool  = mysql.createPool({
	host : comm.conf.DB.HOST,
	user : comm.conf.DB.user,
	password : comm.conf.DB.password,
});

function exec(conn, sql, params, callback) {
	conn.query(sql, params, function(err, results) {
		conn.release(); // always put connection back in pool after last query
		if(err) { 
			comm.log(err); 
			callback(true); 
			return; 
		}
		callback(false, results);
	});
}

exports.getWaterfalls = function(opt, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			comm.log(err); 
			callback(true); 
			return;
		}
		var start, offset = 16, type = opt.type, search = opt.search;
		switch(opt.page){
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
			start = opt.page*offset;
		}
		if(type && type != '类型'){
			start = opt.page*offset;
			var sql = "SELECT id, SUBSTRING_INDEX(title,'迅雷下载',1) as title, image, publishtime FROM "+comm.conf.DB.MOVIETABLE+" WHERE type = ? LIMIT ?, ?; ";
			exec(connection, sql, [type, start, offset], callback);
		}else if(search){
			start = 0;
			var sql = "SELECT id, SUBSTRING_INDEX(title,'迅雷下载',1) as title, image, publishtime FROM "+comm.conf.DB.MOVIETABLE+" WHERE title LIKE '%"+search+"%' LIMIT ?, ?; ";
			exec(connection, sql, [ start, offset], callback);
		}else{
			var sql = "SELECT id, SUBSTRING_INDEX(title,'迅雷下载',1) as title, image, publishtime FROM "+comm.conf.DB.MOVIETABLE+" LIMIT ?, ?; ";
			exec(connection, sql, [start, offset], callback);
		}
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.getDetail = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			comm.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM "+comm.conf.DB.MOVIETABLE+" WHERE id = ?; ";
		exec(connection, sql, [id], callback);
	});
};

exports.getType = function(callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			comm.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT distinct(type) FROM "+comm.conf.DB.MOVIETABLE+" WHERE type is not null AND  type <>''; ";
		exec(connection, sql, [], callback);
	});
};