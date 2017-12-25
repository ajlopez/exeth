
var exeth = require('..');
var path = require('path');

exports['compile. deploy and call contract'] = function (test) {
	test.async();
	
	var filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	var executor = exeth.executor();
	var provider = createProvider();

	var sent = false;
	var retr = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, '0x0100');
		test.ok(!txdata.to);
		test.equal(txdata.value, 0);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 3000000);
		sent = true;
		return '0x0200';
	};

	provider.eth_call = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, '0x0100');
		test.ok(txdata.to);
		test.equal(txdata.value, 0);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 3000000);
		test.ok(txdata.data);
		test.equal(txdata.data.length, 10);
		sent = true;
		return 1;
	};

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x0200');
		
		retr = true;
		
		return { hash: txhash, contractAddress: '0x0300' };
	};

	executor.host(provider);
	
	executor.value('from', '0x0100');
	
	executor.execute(['compile ' + JSON.stringify(filename), 'deploy Counter counter', 'call counter increment()'], function (err, data) {
		test.ok(!err);
		test.equal(data, 1);
		
		test.ok(executor.value('contracts'));
		
		var contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 2);
		test.ok(contracts.Counter);
		test.ok(contracts[filename + ':Counter']);
		
		test.ok(executor.value('instances'));
		
		var instances = executor.value('instances');
		
		test.equal(Object.keys(instances).length, 1);
		test.ok(instances.counter);
		test.ok(instances.counter.address);
		test.equal(instances.counter.address, '0x0300');
		test.equal(instances.counter.contract, 'Counter');
		
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

