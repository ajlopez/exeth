
var compiler = require('../lib/compiler');
var path = require('path');

exports['compile contract'] = function (test) {
	var filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	var contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};

exports['compile library'] = function (test) {
	var filename = path.join(__dirname, 'contracts', 'Math.sol');
	
	var contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};

exports['compile contract with library'] = function (test) {
	var filename = path.join(__dirname, 'contracts', 'PullPayment.sol');
	
	var contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
};