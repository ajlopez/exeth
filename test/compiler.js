
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

exports['compile contract with unlinked library'] = function (test) {
	var filename = path.join(__dirname, 'contracts', 'MetaCoin.sol');
	
	var contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
	
	var bytecode = contracts[Object.keys(contracts)[0]].bytecode;
	
	test.ok(bytecode.indexOf('_') > 0);
	test.ok(bytecode.indexOf('ConvertLib') > 0);
	
	var linked = compiler.linkBytecode(bytecode, { 'ConvertLib.sol:ConvertLib' : '0x0102030405060708090a0b0c0d0e0f1011121314' });
	
	test.ok(linked.indexOf('_') < 0);
	test.ok(linked.indexOf('ConvertLib') < 0);
};