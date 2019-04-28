
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

exports['compile contract with unlinked library'] = function (test) {
	const filename = path.join(__dirname, 'contracts', 'MetaCoin.sol');
	
	const contracts = compiler.compileFile(filename);
	
	test.ok(contracts);
	
	const bytecode = contracts[Object.keys(contracts)[0]].bytecode;
	
	test.ok(bytecode.indexOf('_') > 0);
	test.ok(bytecode.indexOf('ConvertLib') > 0);
	
	const linked = compiler.linkBytecode(bytecode, { 'ConvertLib' : '0x0102030405060708090a0b0c0d0e0f1011121314' });
	
	test.ok(linked.indexOf('_') < 0);
	test.ok(linked.indexOf('ConvertLib') < 0);
};

