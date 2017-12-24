
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

exports['evaluate expression with constants'] = function (test) {
	var vals = values.values();
	
	test.equal(vals.evaluate('1+2'), 3);
}

exports['evaluate expression with variables'] = function (test) {
	var vals = values.values();
	
	vals.value('one', 1);
	vals.value('two', 2)
	
	test.equal(vals.evaluate('one + two'), 3);
}
