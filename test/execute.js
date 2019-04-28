
const exeth = require('..');
const path = require('path');

exports['execute script with two execute commands'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.executeFile(getScriptFile('execute'), function (err, data) {
		test.ok(!err);

		test.equal(executor.value('first'), true);
		test.equal(executor.value('second'), true);
		
		test.done();
	});
};

exports['execute script with many nested execute commands'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.executeFile(getScriptFile('executemany'), function (err, data) {
		test.ok(!err);

		test.equal(executor.value('first'), true);
		test.equal(executor.value('second'), true);
		test.equal(executor.value('third'), true);
		test.equal(executor.value('fourth'), true);
		test.equal(executor.value('fifth'), true);
		
		test.done();
	});
};

function getScriptFile(name) {
	return path.join(__dirname, 'scripts', name + '.eth');
}

