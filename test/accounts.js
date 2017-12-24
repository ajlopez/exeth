
var exeth = require('..');
var path = require('path');

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

exports['execute accounts script'] = function (test) {
	var provider = createProvider();
	var accounts = [ '0x01', '0x02', '0x03' ];
	
	provider.eth_accounts = function (hash) {
		return accounts;
	};

	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.executeFile(getScriptFile('accounts'), function (err, data) {
		test.ok(!err);
		test.deepEqual(data, accounts);
		test.deepEqual(executor.value('accounts'), accounts);
		test.deepEqual(executor.value('value'), accounts);
		
		test.done();
	});
};

function getScriptFile(name) {
	return path.join(__dirname, 'scripts', name + '.eth');
}

function createProvider() {
	return {
		call: function (method, args, cb) {
			cb(null, this[method].apply(this,args));
		}
	}
}

