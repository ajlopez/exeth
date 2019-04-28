
const exeth = require('..');
const path = require('path');

exports['compile contract'] = function (test) {
	test.async();
	
	const filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	const executor = exeth.executor();
	
	executor.execute('compile ' + JSON.stringify(filename), function (err, data) {
		test.ok(!err);
		
		test.ok(executor.value('contracts'));
		
		const contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 2);
		test.ok(contracts.Counter);
		test.ok(contracts[filename + ':Counter']);

		test.equal(contracts.Counter.fullname, 'counter.sol:Counter');
		
		test.done();
	});
};

exports['execute compile script'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.executeFile(getScriptFile('compile'), function (err, data) {
		test.ok(!err);

		const contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 4);
		test.ok(contracts.MetaCoin);

		test.equal(contracts.MetaCoin.fullname, 'MetaCoin.sol:MetaCoin');
		test.ok(contracts.MetaCoin.bytecode.indexOf('_') >= 0);
		
		test.done();
		
		test.done();
	});
};

exports['execute link script'] = function (test) {
	test.async();
	
	const executor = exeth.executor();
	
	executor.executeFile(getScriptFile('link'), function (err, data) {
		test.ok(!err);

		const contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 4);
		test.ok(contracts.MetaCoin);

		test.equal(contracts.MetaCoin.fullname, 'MetaCoin.sol:MetaCoin');
		test.ok(contracts.MetaCoin.bytecode.indexOf('_') < 0);
		
		test.done();
	});
};

function getScriptFile(name) {
	return path.join(__dirname, 'scripts', name + '.eth');
}

