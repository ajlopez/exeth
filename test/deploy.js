
const exeth = require('..');
const path = require('path');

exports['compile and deploy contract'] = function (test) {
	test.async();
	
	const filename = path.join(__dirname, 'contracts', 'counter.sol');
	
	const executor = exeth.executor();
	const provider = createProvider();

	let sent = false;
	let retr = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, '0x0100');
		test.ok(!txdata.to);
		test.equal(txdata.value, 0);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);

		test.ok(txdata.data);
		test.equal(txdata.data, '0x' + executor.value('contracts').Counter.evm.bytecode.object);

		sent = true;
		return '0x0200';
	};

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x0200');
		
		retr = true;
		
		return { hash: txhash, contractAddress: '0x0300' };
	};

	executor.host(provider);
	
	executor.value('from', '0x0100');
	
	executor.execute(['compile ' + JSON.stringify(filename), 'deploy Counter counter'], function (err, data) {
		test.ok(!err);
		
		test.ok(executor.value('contracts'));
		
		const contracts = executor.value('contracts');
		
		test.equal(Object.keys(contracts).length, 1);
		test.ok(contracts.Counter);
		
		test.ok(executor.value('instances'));
		
		const instances = executor.value('instances');
		
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

