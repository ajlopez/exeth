
const exeth = require('..');

exports['execute message with an argument'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	let done = false;
	
	executor.logger({
		log: function() {
			test.equal(arguments.length, 1);
			test.equal(arguments[0], 42);
			done = true;
		}
	});
	
	executor.execute('message 40+2', function (err, data) {
		test.ok(!err);
		test.ok(!data);
		test.ok(done);
		test.done();
	});
}

exports['execute message with two arguments'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	let done = false;
	
	executor.logger({
		log: function() {
			test.equal(arguments.length, 2);
			test.equal(arguments[0], "the answer is");
			test.equal(arguments[1], 42);
			done = true;
		}
	});
	
	executor.execute('message "the answer is" 40+2', function (err, data) {
		test.ok(!err);
		test.ok(!data);
		test.ok(done);
		test.done();
	});
}
