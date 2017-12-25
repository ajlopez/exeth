
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



