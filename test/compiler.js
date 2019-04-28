
const compiler = require('../lib/compiler');
const path = require('path');

exports['compile contract'] = function (test) {
	const filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	const contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};

exports['compile library'] = function (test) {
	const filename = path.join(__dirname, 'contracts', 'Math.sol');
	
	const contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};

exports['compile contract with library'] = function (test) {
	const filename = path.join(__dirname, 'contracts', 'PullPayment.sol');
	
	const contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};

