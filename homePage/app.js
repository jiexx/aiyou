eval(fs.readFileSync('def.js') + '');

var pn = Petri.create('company', app, upload);

var p1 = pn.Place('data');
var p2 = pn.Place('data_more');
var p3 = pn.Place('data_detail');
var p4 = pn.Place('login');
var p5 = pn.Place('register');

var t1 = pn.Trasition('/data_more', [p1], [p1, p4]);
var t2 = pn.Trasition('/data_detail', [p1], [p3, p4]);
var t3 = pn.Trasition('/register', [p4], [p5, p4]);
var t4 = pn.Trasition('/login', [p5], [p4, p5]);

t1.outputs[0].test = function() {
	if (!pn.req.session.user_id) {
		return false;
	}
	var data = pn.req.body;
	data.num
	return true;
}

t2.outputs[0].test = function() {
	if (!pn.req.session.user_id) {
		return false;
	}
	return true;
}

