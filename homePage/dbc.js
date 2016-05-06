var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : '1234',
});

var DB = {
	select: function(table, num, handle) {
		var _this = this;
		connection.query(
			'SELECT * FROM '+table+' WHERE registed=0 LIMIT 0, '+10*num+'; ', function(error, results, fields) {
				if (error) {
					console.log("select Error: " + error.message);
					return;
				}
				var data = {cnt:num, res:results};
				handle(data);
			});
	},
}