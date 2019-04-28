
const exeth = require('..');

exports['execute if'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	const pgm = [
		"if 1 % 2 == 1",
		"set odd true",
		"end",
		"if 1 % 2 == 0",
		"set odd false",
		"end"
	];
	
	executor.execute(pgm, function (err, data) {
		test.ok(!err);
		test.equal(executor.value('odd'), true);
		test.done();
	});
}
