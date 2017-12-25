
var exeth = require('..');

exports['execute if'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	var pgm = [
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
