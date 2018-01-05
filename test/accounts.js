
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
		test.deepEqual(executor.value('result'), accounts);
		
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
		test.deepEqual(executor.value('result'), accounts);
		
		test.done();
	});
};

exports['execute balance'] = function (test) {
	var provider = createProvider();
	
	test.async();
	
	provider.eth_getBalance = function (address, block) {
		test.equal(address, '0x123456')
		test.equal(block, 'latest');
		return '0x2a'
	};
	
	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('balance 0x123456', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x2a');
		test.deepEqual(executor.value('result'), '0x2a');
		
		test.done();
	});
};

exports['execute accountnew'] = function (test) {
	var provider = createProvider();
	
	test.async();
	
	provider.personal_newAccount = function (passphrase) {
		test.equal(passphrase, 'passphrase');
		return '0x2a';
	};
	
	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('accountnew "passphrase"', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x2a');
		test.deepEqual(executor.value('result'), '0x2a');
		
		test.done();
	});
};

exports['execute accountnew and account unlock'] = function (test) {
	var provider = createProvider();
	
	test.async();
	
	var unlocked = false;
	
	provider.personal_newAccount = function (passphrase) {
		test.equal(passphrase, 'passphrase');
		return '0x2a';
	};
	
	provider.personal_unlockAccount = function (address, passphrase, duration) {
		test.equal(address, '0x2a');
		test.equal(passphrase, 'passphrase');
		test.equal(duration, 10000);
		unlocked = true;
	};

	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute(['accountnew "passphrase"', 'accountunlock result "passphrase" 10000'], function (err, data) {
		test.ok(!err);
		test.ok(unlocked);
		
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

