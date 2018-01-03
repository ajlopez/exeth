
var exeth = require('..');

exports['execute loop with break'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	var pgm = [
		"set n 0",
		"loop",
			"if n >= 10",
				"break",
			"end",
			"set n n+1",
		"end"
	];
	
	executor.execute(pgm, function (err, data) {
		test.ok(!err);
		test.equal(executor.value('n'), 10);
		test.done();
	});
}
