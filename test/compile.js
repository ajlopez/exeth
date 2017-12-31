
var exeth = require('..');
var path = require('path');

exports['compile contract'] = function (test) {
	test.async();
	
	var filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	var executor = exeth.executor();
	
	executor.execute('compile ' + JSON.stringify(filename), function (err, data) {
		test.ok(!err);
		
		test.ok(executor.value('contracts'));
		
		var contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 2);
		test.ok(contracts.Counter);
		test.ok(contracts[filename + ':Counter']);

		test.equal(contracts.Counter.fullname, 'counter.sol:Counter');
		
		test.done();
	});
};