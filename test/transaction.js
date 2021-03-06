
const exeth = require('..');
const path = require('path');

exports['execute transfer'] = function (test) {
	test.async();
	
	const provider = createProvider();
	let sent = false;
	let retr = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);
		sent = true;
		return '0x100';
	};

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x100');
		
		retr = true;
		
		return { hash: txhash };
	};
	
	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('transfer 100 200 42', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('result'), '0x100');
		
		test.ok(sent);
		test.ok(retr);
		
		test.done();
	});
};

exports['execute transfer with data'] = function (test) {
	test.async();
	
	const provider = createProvider();
	let sent = false;
	let retr = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);
		test.equal(txdata.data, "0x60606040");
		sent = true;
		return '0x100';
	};

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x100');
		
		retr = true;
		
		return { hash: txhash };
	};
	
	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('transfer 100 200 42 "60606040"', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('result'), '0x100');
		
		test.ok(sent);
		test.ok(retr);
		
		test.done();
	});
};

exports['execute transfer with data using 0x prefix'] = function (test) {
	test.async();
	
	const provider = createProvider();
	let sent = false;
	let retr = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);
		test.equal(txdata.data, "0x60606040");
		sent = true;
		return '0x100';
	};

	provider.eth_getTransactionReceipt = function (txhash) {
		test.equal(txhash, '0x100');
		
		retr = true;
		
		return { hash: txhash };
	};
	
	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('transfer 100 200 42 "0x60606040"', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('result'), '0x100');
		
		test.ok(sent);
		test.ok(retr);
		
		test.done();
	});
};

exports['execute send'] = function (test) {
	test.async();
	
	const provider = createProvider();
	let sent = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);
		sent = true;
		return '0x100';
	};

	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('send 100 200 42', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('result'), '0x100');
		
		test.ok(sent);
		
		test.done();
	});
};

exports['execute send with data'] = function (test) {
	test.async();
	
	const provider = createProvider();
	let sent = false;
	
	provider.eth_sendTransaction = function (txdata) {
		test.ok(txdata);
		test.equal(txdata.from, 100);
		test.equal(txdata.to, 200);
		test.equal(txdata.value, 42);
		test.equal(txdata.gasPrice, 0);
		test.equal(txdata.gas, 5000000);
		test.equal(txdata.data, "0x60606040");
		sent = true;
		return '0x100';
	};

	const executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('send 100 200 42 "60606040"', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x100');
		test.deepEqual(executor.value('result'), '0x100');
		
		test.ok(sent);
		
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

