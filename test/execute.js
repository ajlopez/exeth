
var exeth = require('..');
var path = require('path');

exports['execute script with two execute commands'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.executeFile(getScriptFile('execute'), function (err, data) {
		test.ok(!err);

		test.equal(executor.value('first'), true);
		test.equal(executor.value('second'), true);
		
		test.done();
	});
};

function getScriptFile(name) {
	return path.join(__dirname, 'scripts', name + '.eth');
}

