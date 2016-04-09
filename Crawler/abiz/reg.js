var User = {
	
	clear: function() {
		this.id = '';
		this.email = '';
		this.loginname = '';
		this.password = '';
		this.company = '';
		this.username = '';
		this.phone = '';
	},
	
	_registe: function( url, login) {
		var args=[];
		var _this = this;
		var g = Math.floor(Math.random()*10) > 5 ? 1 : 0;
		var t = Math.floor(Math.random()*10) > 5 ? 1 : 0;
		var r = JSON.stringify({
			id : _this.id,
			type: 1,
			gender: g,
			email : _this.email,
			loginname : _this.loginname,
			password : _this.password,
			company : _this.company,
			username : _this.username,
			phone : _this.phone,
			link : url,
			loginlink: login
		});
		r = encodeURIComponent(r);
		r = encodeURIComponent(r);
		args.push(this.which);
		args.push(r);
		var exec = require('child_process');
		
		var proc = exec.spawn('casperjs', args);
		
		var pid = proc.pid;
		console.log('[BROWSER] OPEN registe pid: '+pid);
		proc.on('uncaughtException', function (err) { 
			console.log('Caught exception: ' + err); 
		}); 
		proc.stdout.on('data', function(data) {
			//var str = iconv.decode(data,'utf8');
		    console.log('[BROWSER] INFO '+_this.which+' pid: '+pid +' '+  data );
		});
		
		proc.stderr.on('data', function(data) {
			//var str = iconv.decode(data,'utf8');
			console.log('[BROWSER] ERROR '+_this.which+' pid: '+pid +' '+  data );
		});

		
		proc.on('exit', function(data) {
			//var str = iconv.decode(data,'GBK');
			console.log('[BROWSER] EXIT '+_this.which+' pid: '+pid +' '+  data );
			if(_this.parent != null) {
				_this.parent.exitAndNext();
			}
		});
	},
	
	create: function(parent, which, id, email, loginname, password, company, username, phone) {
		function F() {};
		F.prototype = User;
		var f = new F();
		f.parent = parent;
		f.which = which;
		f.id = id;
		f.email = email;
		f.loginname = loginname;
		f.password = password;
		f.company = company;
		f.username = username;
		f.phone = phone;
		return f;
	}
}

var RegUserSet =  {
	
	load: function(file, url, login) {
		var fs = require("fs");
		var str = fs.readFileSync(file).toString();
		var big = str.split(',');
		for(var i in big){
			var small = big[i].split(';');
			var company = small[0].replace(/[\r\n]/g, '');
			var username = small[1];
			var phone = small[2];
			var loginname = small[3];
			var password = small[4];
			var usr = User.create(this, 'browser-reg.js', i, loginname+'@qq.com', loginname, password, company, username, phone);
			if(usr != null) {
				this.users.push(usr);
			}
		}
		this.link = url;
		this.login = login;
	},
	
	exitAndNext: function() {
		console.log('exitAndNext:'+this.conn+' '+this.table+' '+ this.link+' '+this.login);
		if(this.conn != null && this.table != '' && this.link != '' && this.login != null )
			this.loadFromDBAndNext(this.conn, this.table, this.link, this.login);
	},
	
	loadFromDBAndNext: function(connection, table, url, login) {
		var _this = this;
		this.link = url;
		this.login = login;
		this.conn = connection;
		this.table = table;
		connection.query(
			'SELECT * FROM '+table+' WHERE registed=0 LIMIT 0, 1; ', function(error, results, fields) {
				if (error) {
					console.log("select Error: " + error.message);
					connection.end();
					return;
				}
				
				/*for ( var i = 0 ; i < results.length ; i ++ ) {
					var usr = User.create(_this, 'browser-reg.js', results[i].id, results[i].email, results[i].loginname, results[i].password, results[i].company, results[i].username, results[i].phone);
					if(usr != null) {
						_this.users.push(usr);
					}
				}
				_this.next();*/
				var i = 0;
				var usr = User.create(_this, 'browser-reg.js', results[i].id, results[i].email, results[i].loginname, results[i].password, results[i].company, results[i].username, results[i].phone);
				usr._registe(_this.link, _this.login);
			});
	},
	
	updateOne: function(connection, table, id, ocr, cookie) {
		var values = [ocr, cookie, id];
		console.log(">>>>>>>>>> update |id:"+id +"<<<<<<<<<<");
		connection.query(
				'UPDATE '+table+' SET registed =  ?, cookie = ? WHERE id = ?',
				values, function(error, results) {
					if (error) {
						console.log("update Error: " + error.message);
						return;
					}
				});
	},
	
	_saveOne: function(connection, table, i) {
		var values = [ this.users[i].id, this.users[i].email, this.users[i].loginname, this.users[i].password, this.users[i].company, this.users[i].username, this.users[i].phone ];
		console.log("save:"+values);
		connection.query(
				'INSERT INTO '+table+' SET id = ?, email = ? , loginname = ?, password = ?, company = ?, username = ?, phone = ?',
				values, function(error, results) {
					if (error) {
						console.log("save Error: " + error.message);
						return;
					}
				});
	},
	
	save: function(connection, table) {
		for(var i in this.users) {
			if(this.users[i].loginname != null) {
				console.log("loginname:"+this.users[i].loginname);
				this._saveOne(connection, table, i);
			}
		}
	},
	
	reset: function(){
		this.curr = 0;
	},
	
	getUsers: function(){
		return this.users;
	},
	
	next: function(){
		if(this.curr >= this.users.length)
			return;
		var usr = this._get();
		usr._registe(this.link, this.login);
		this.curr ++;
	},
	
	_get: function() {
		return this.users[this.curr];
	},
	
	create: function() {
		function F() {};
		F.prototype = RegUserSet;
		var f = new F();
		f.users = [];
		f.curr = 0;
		f.link = '';
		f.login = '';
		f.conn = null;
		f.table = '';
		return f;
	}
};