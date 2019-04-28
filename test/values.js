
const values = require('../lib/values');

exports['get undefined value'] = function (test) {
	const vals = values.values();
	
	test.equal(vals.value('foo'), null);
}

exports['set and get value'] = function (test) {
	const vals = values.values();
	
	vals.value('foo', 'bar');
	test.equal(vals.value('foo'), 'bar');
}

exports['evaluate expression with constants'] = function (test) {
	const vals = values.values();
	
	test.equal(vals.evaluate('1+2'), 3);
}

exports['evaluate expression with variables'] = function (test) {
	const vals = values.values();
	
	vals.value('one', 1);
	vals.value('two', 2)
	
	test.equal(vals.evaluate('one + two'), 3);
}

exports['evaluate expression with variables and callback'] = function (test) {
	const vals = values.values();
	
	test.async();
	
	vals.value('one', 1);
	vals.value('two', 2)
	
	vals.asyncEvaluate('cb(null, one + two)', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		
		test.done();
	});
}
