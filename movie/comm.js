exports.conf = {
	WEB: {
		HOST: '127.0.0.1',
		port: 8082,
		remote: 'http://127.0.0.1:8082',
	},
	DB: {
		HOST: '127.0.0.1',
		user : 'root',
		password : '1234',
		MOVIETABLE: 'amazon.movie',
	}
};

exports.log = function(str) {
	console.log((new Date()).toUTCString()+' '+str);
};

exports.cache_mime = {
	css: "text/css",
	gif: "image/gif",
	xhtml: "text/html",
	ico: "image/x-icon",
	jpeg: "image/jpeg",
	jpg: "image/jpeg",
	js: "text/javascript",
	json: "application/json",
	pdf: "application/pdf",
	png: "image/png",
	svg: "image/svg+xml",
	swf: "application/x-shockwave-flash",
	tiff: "image/tiff",
	txt: "text/plain",
	wav: "audio/x-wav",
	wma: "audio/x-ms-wma",
	wmv: "video/x-ms-wmv",
	xml: "text/xml"
};