
const exeth = require('..');
const path = require('path');

exports['execute rpc eth_accounts'] = function (test) {
	const provider = createProvider();
	const accounts = [ '0x01', '0x02', '0x03' ];
	
	provider.eth_accounts = function () {
		return accounts;
	};

	test.async();
	
	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('rpc eth_accounts', function (err, data) {
		test.ok(!err);
		test.deepEqual(data, accounts);
		test.deepEqual(executor.value('result'), accounts);
		
		test.done();
	});
};

exports['execute rpc eth_sum with arguments'] = function (test) {
	const provider = createProvider();
	
	provider.eth_sum = function (a, b) {
		return a + b;
	};

	test.async();
	
	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('rpc eth_sum 20*2 1+1', function (err, data) {
		test.ok(!err);
		test.equal(data, 42);
		test.equal(executor.value('result'), 42);
		
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

