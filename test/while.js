
const exeth = require('..');

exports['execute if'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	const pgm = [
		"set n 0",
		"while n < 10",
		"set n n + 1",
		"end"
	];
	
	executor.execute(pgm, function (err, data) {
		test.ok(!err);
		test.equal(executor.value('n'), 10);
		test.done();
	});
}
