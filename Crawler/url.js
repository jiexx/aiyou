var crypto = require('crypto');
//------------------------------------------------------
var URL = {
	link: '',
	id: '',
	proc: null,
	
	URL: function(link) {
		this.link = link;
		this.id = crypto.createHash('md5').update(link).digest('hex');;
	},
	
	open: function(type) {
		var exec = require('child_process'),
	    path = require('path');

		var phantomjs = path.resolve(__dirname, 'bins', 'phantomjs');
		var casperjs = path.resolve(__dirname, 'bins', 'casperjs', 'bin');
	
		// console.log(process.env.PATH);
		process.env.PATH = process.env.PATH + ':' + phantomjs;
		process.env.PATH = process.env.PATH + ':' + casperjs;
		console.log(process.env.PATH);
	
		// Now launch a casperjs script and get result.
		this.proc = exec.spawn('casperjs', ['browser.js', this.id, this.link, type]);
	
		this.proc.stdout.on('data', function(data) {
		    console.log(data.toString());
		});
	},
	
	close: function() {
		if(this.proc.connected()) {
			this.proc.disconnect()
		}
	},
	
	getId: function() {
		return this.id;
	}
}