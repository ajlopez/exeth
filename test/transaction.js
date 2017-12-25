
var exeth = require('..');
var path = require('path');

exports['execute transfer'] = function (test) {
	test.async();
	
	var provider = createProvider();
	var sent = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 3000000);
		sent = true;
		return '0x100';
	};

	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('transfer 100 200 42', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('value'), '0x100');
		
		test.done();
	});
};

function createProvider() {
	return {
		call: function (method, args, cb) {
			cb(null, this[method].apply(this,args));
		}
	}
}

