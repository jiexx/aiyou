exports.conf = {
	WEB: {
		HOST: '127.0.0.1',
	},
	DB: {
		HOST: '127.0.0.1',
		user : 'root',
		password : '1234',
	}
};

exports.log = function(str) {
	console.log((new Date()).toUTCString()+' '+str);
};