var mysql = require('mysql');
var crypto = require('crypto');

var pool  = mysql.createPool({
	host : '10.101.1.163',
	user : 'root',
	password : '123456',
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

exports.login = function(item, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM commonbook.tab_sysuser WHERE UserName = ? and lower(UserPWD) = ?; ";
		var pwd = crypto.createHash('md5').update(item.UserPWD).digest('hex');
		//console.log(pwd);
		exec(connection, sql, [item.UserName, pwd], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.getRoles = function(item, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT UserName, UserID FROM traveldb.tab_userinfo WHERE IfRobot='Y'; ";
		exec(connection, sql, [], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.getALFs = function(type, no, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var offset = 25;
		var start = no*offset;
		var sql = "SELECT a.SpotsID as id, b.RegionCnName as Country, c.RegionCnName as City, a.* FROM traveldb.tab_travelspots as a LEFT JOIN traveldb.tab_travelregion as b ON a.CountryID=b.RegionID LEFT JOIN traveldb.tab_travelregion as c ON a.CityID=c.RegionID WHERE a.SpotsTypeID = ? order by a.SpotsID desc LIMIT ?, ? ; ";
		exec(connection, sql, [type, start, offset], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.getPhoto = function(id, no, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var offset = 25;
		var start = no*offset;
		var sql = "SELECT * FROM traveldb.tab_travelspotsdetail WHERE SpotsID = ? LIMIT ?, ? ; ";
		exec(connection, sql, [id, start, offset], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.getPhotoMaster = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM traveldb.tab_travelspots WHERE SpotsID = ?; ";
		exec(connection, sql, [id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.insertPhoto = function(id, url, sum, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "INSERT INTO traveldb.tab_travelspotsdetail(SpotsID, PicURL, Summary, CreateDate, UpdateDate) VALUES(?,?,?,NOW(),NOW()); ";
		exec(connection, sql, [id, url, sum], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.updatePhoto = function(id, url, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "UPDATE traveldb.tab_travelspotsdetail SET PicURL = ?, UpdateDate = NOW() WHERE SpotsDetailID = ?; ";
		exec(connection, sql, [url,id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.updatePhotoTitle = function(id, intro, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "UPDATE traveldb.tab_travelspotsdetail SET Summary = ?, UpdateDate = NOW() WHERE SpotsDetailID = ?; ";
		exec(connection, sql, [intro,id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.removePhoto = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "DELETE FROM traveldb.tab_travelspotsdetail WHERE  SpotsDetailID = ?; ";
		exec(connection, sql, [id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.enablePhoto = function(id, url, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "UPDATE traveldb.tab_travelspots SET PicURL = ? WHERE SpotsID = ?; ";
		exec(connection, sql, [url, id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.getALF = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT a.*, b.RegionCnName as country, c.RegionCnName as city FROM traveldb.tab_travelspots as a LEFT JOIN  traveldb.tab_travelregion as b ON a.CountryID=b.RegionID LEFT JOIN traveldb.tab_travelregion as c ON a.CityID=c.RegionID  WHERE SpotsID = ?; ";
		exec(connection, sql, [id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.getCountry = function(callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM traveldb.tab_travelregion WHERE IfLeaf = 0 ORDER BY CONVERT(RegionCnName USING gbk); ";
		exec(connection, sql, [], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.getCityByCountry = function(id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM traveldb.tab_travelregion WHERE IfLeaf = 1 and ParentID=? ORDER BY CONVERT(RegionCnName USING gbk); ";
		exec(connection, sql, [id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};
exports.getCity = function(callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "SELECT * FROM traveldb.tab_travelregion WHERE IfLeaf = 1 ORDER BY CONVERT(RegionCnName USING gbk); ";
		exec(connection, sql, [], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.enableALF = function(status, type, id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "UPDATE traveldb.tab_travelspots SET Status = ? WHERE SpotsType = ? AND SpotsID = ?; ";
		exec(connection, sql, [status, type, id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.removeALF = function(type, id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "DELETE FROM traveldb.tab_travelspots WHERE SpotsType = ? AND SpotsID = ?; ";
		exec(connection, sql, [type, id], callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.editALF = function(item, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "UPDATE traveldb.tab_travelspots SET CountryID = ?, CityID = ?, SpotsTypeID = ?, CommondReason = ?, NameEn = ?, NameCh = ?, UpdateDate = NOW() WHERE SpotsID = ?; ";
		
		var it = [	item.CountryID    ,
					item.CityID       ,
					item.SpotsTypeID  ,
					item.CommondReason,
					item.NameEn       ,
					item.NameCh       ,
					item.SpotsID          ];
		console.log(it);
		exec(connection, sql, it, callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};

exports.insertALF = function(item, callback) {
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			callback(true); 
			return;
		}
		var sql = "INSERT INTO traveldb.tab_travelspots(UserID, CountryID, CityID, SpotsTypeID, CommondReason, NameEn, NameCh, Status, UpdateDate, CreateDate) VALUES(?,?,?,?,?,?,?,?,NOW(), NOW()); ";
		
		var it = [item.UserID       ,
					item.CountryID    ,
					item.CityID       ,
					item.SpotsTypeID  ,
					item.CommondReason,
					item.NameEn       ,
					item.NameCh       ,
					item.Status          ];
		console.log(it);
		exec(connection, sql, it, callback);
		//console.log(sql + ' ' + start + ' ' +offset +" search:"+search+ ' type:"+type);
	});
};