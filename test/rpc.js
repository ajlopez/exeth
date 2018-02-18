
var exeth = require('..');
var path = require('path');

exports['execute rpc eth_accounts'] = function (test) {
	var provider = createProvider();
	var accounts = [ '0x01', '0x02', '0x03' ];
	
	provider.eth_accounts = function () {
		return accounts;
	};

	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('rpc eth_accounts', function (err, data) {
		test.ok(!err);
		test.deepEqual(data, accounts);
		test.deepEqual(executor.value('result'), accounts);
		
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

