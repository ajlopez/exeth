
var exeth = require('..');

exports['get undefined value'] = function (test) {
	var executor = exeth.executor();
	
	test.equal(executor.value('from'), null);
};

exports['set and get value'] = function (test) {
	var executor = exeth.executor();
	
	executor.value('host', 'http://localhost:8545');

	test.equal(executor.value('host'), 'http://localhost:8545');
};

exports['execute evaluate'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.execute('evaluate 1+2', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('value'), 3);
		
		test.done();
	});
};

exports['execute with variables'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.value('one', 1);
	executor.value('two', 2);
	
	executor.execute('evaluate one + two', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('value'), 3);
		
		test.done();
	});
};

exports['execute set variable to constant expression'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.execute('set x 3', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('x'), 3);
		
		test.done();
	});
};

exports['execute set variable to arithmetic expression using variables'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.value('one', 1);
	executor.value('two', 2);
	
	executor.execute('set x one + two', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('x'), 3);
		
		test.done();
	});
};

exports['execute accounts'] = function (test) {
	var provider = createProvider();
	var accounts = [ '0x01', '0x02', '0x03' ];
	
	provider.eth_accounts = function (hash) {
		return accounts;
	};

	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('accounts', function (err, data) {
		test.ok(!err);
		test.deepEqual(data, accounts);
		test.deepEqual(executor.value('accounts'), accounts);
		test.deepEqual(executor.value('value'), accounts);
		
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






