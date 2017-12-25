
var exeth = require('..');
var path = require('path');

exports['execute transfer'] = function (test) {
	test.async();
	
	var provider = createProvider();
	var sent = false;
	var retr = false;
	
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

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x100');
		
		retr = true;
		
		return { hash: txhash };
	};
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('transfer 100 200 42', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('value'), '0x100');
		
		test.ok(sent);
		test.ok(retr);
		
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

