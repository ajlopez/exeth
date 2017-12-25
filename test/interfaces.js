
var interfaces = require('../lib/interfaces');

var counterabi = [{"constant":false,"inputs":[{"name":"v","type":"uint256"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getCounter","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"increment","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

exports['get constructor'] = function (test) {
	var cons = interfaces.getConstructor(counterabi);
	
	test.ok(cons);
	test.equal(typeof cons, 'object');
	test.equal(cons.type, 'constructor');
	test.deepEqual(cons.inputs, []);
}

exports['get constructor using string interface'] = function (test) {
	var cons = interfaces.getConstructor(JSON.stringify(counterabi));
	
	test.ok(cons);
	test.equal(typeof cons, 'object');
	test.equal(cons.type, 'constructor');
	test.deepEqual(cons.inputs, []);
}

exports['parse function signature with two arguments'] = function (test) {
	var result = interfaces.parseSignature('add(uint256,string)');
	
	test.ok(result);
	test.equal(result.name, 'add');
	test.deepEqual(result.types, [ 'uint256', 'string' ]);
}

exports['parse function signature without arguments'] = function (test) {
	var result = interfaces.parseSignature('increment()');
	
	test.ok(result);
	test.equal(result.name, 'increment');
	test.deepEqual(result.types, []);
}

exports['get function definition'] = function (test) {
	var fndef = interfaces.getFunction('increment()', counterabi);
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'increment');
	test.deepEqual(fndef.inputs, []);
	test.deepEqual(fndef.outputs, []);
}

exports['get function definition using string interface'] = function (test) {
	var fndef = interfaces.getFunction('increment()', JSON.stringify(counterabi));
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'increment');
	test.deepEqual(fndef.inputs, []);
	test.deepEqual(fndef.outputs, []);
}

exports['get function definition with one argument'] = function (test) {
	var fndef = interfaces.getFunction('add(uint256)', counterabi);
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'add');
	test.deepEqual(fndef.inputs, [ { name: 'v', type: 'uint256' }]);
	test.deepEqual(fndef.outputs, []);
}

exports['get function definition with one argument using string interface'] = function (test) {
	var fndef = interfaces.getFunction('add(uint256)', JSON.stringify(counterabi));
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'add');
	test.deepEqual(fndef.inputs, [{ name: 'v', type: 'uint256' }]);
	test.deepEqual(fndef.outputs, []);
}

exports['get function definition with return'] = function (test) {
	var fndef = interfaces.getFunction('getCounter()', counterabi);
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'getCounter');
	test.deepEqual(fndef.inputs, []);
	test.deepEqual(fndef.outputs, [ { name: '', type: 'uint256' }]);
}

exports['get function definition with one argument using string interface'] = function (test) {
	var fndef = interfaces.getFunction('getCounter()', JSON.stringify(counterabi));
	
	test.ok(fndef);
	test.equal(typeof fndef, 'object');
	test.equal(fndef.name, 'getCounter');
	test.deepEqual(fndef.inputs, []);
	test.deepEqual(fndef.outputs, [ { name: '', type: 'uint256' }]);
}

