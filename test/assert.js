
const exeth = require('..');

exports['execute assert'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.execute('assert 2 > 1', function (err, data) {
		test.ok(!err);
		test.equal(data, true);

		test.done();
	});
}

exports['execute failed assert'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.execute('assert 2 < 1', function (err, data) {
		test.ok(err);
		test.equal(err, "Error: failed assertion 2 < 1");

		test.done();
	});
}
