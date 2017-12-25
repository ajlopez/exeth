
var exeth = require('..');
var path = require('path');

exports['execute blocknumber'] = function (test) {
	var provider = createProvider();
	
	provider.eth_blockNumber = function () {
		return '0x2a';
	};

	test.async();
	
	var executor = exeth.executor();
	
	executor.host(provider);
	
	executor.execute('blocknumber', function (err, data) {
		test.ok(!err);
		test.equal(data, '0x2a');
		test.equal(executor.value('value'), '0x2a');
		
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

