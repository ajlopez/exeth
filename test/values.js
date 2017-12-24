
var values = require('../lib/values');

exports['get undefined value'] = function (test) {
	var vals = values.values();
	
	test.equal(vals.value('foo'), null);
}

exports['set and get value'] = function (test) {
	var vals = values.values();
	
	vals.value('foo', 'bar');
	test.equal(vals.value('foo'), 'bar');
}

