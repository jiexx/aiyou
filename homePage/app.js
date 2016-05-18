eval(fs.readFileSync('def.js') + '');

var pn = Petri.create('company', app, upload);

var p1 = pn.Place('data');
var p2 = pn.Place('data_more');
var p3 = pn.Place('data_detail');
var p4 = pn.Place('login');
var p5 = pn.Place('register');

var t1 = pn.Trasition('/data_more', [p1], [p1, p4]);
var t2 = pn.Trasition('/data_detail', [p1], [p3, p4]);
var t3 = pn.Trasition('/register', [p4], [p5]);
var t4 = pn.Trasition('/login', [p5], [p4]);
var t5 = pn.Trasition('/login_commit', [p4], [p1, p3, p4]);

var before = null;

t1.outputs[0].onFire = function(finish) {
	if (!pn.req.session.user_id) {
		before = {place:p1};
		return false;
	}
	var data = pn.req.body;
	DB.select('customs', data.num, finish);
	return true;
}

t2.outputs[0].onFire = function(finish) {
	var data = pn.req.body;
	if (!pn.req.session.user_id) {
		before = {place:p3, id:data.id};
		return false;
	}
	DB.select('custom_detail', data.id, finish);
	return true;
}

t5.outputs[0].onFire = function(finish) {
	var data = pn.req.body;
	if (data.user === '123' && data.password === '123') {
		pn.req.session.user_id = 1;
		if(before != null && before.place != null) {
			
		}
		DB.select('customs', 1, finish);
		return true;
	}
	return false;
}

