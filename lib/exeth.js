
var values = require('./values');
var simpledsl = require('simpledsl');
var rskapi = require('rskapi');
var chalk = require('chalk');
var simpleabi = require('simpleabi');
var interfaces = require('./interfaces');
var compiler = require('./compiler');
var path = require('path');

var DEFAULT_HOST = "http://localhost:8545";

function Executor() {
	var self = this;
	var vals = values.values();
	var dsl = simpledsl.dsl({ comment: '#' });
	var logger = console;
	var logging = false;
	var host;
	var filepath;
	
	var contracts = {};
	var instances = {};
	
	vals.value('contracts', contracts);
	vals.value('instances', instances);
	
	dsl.define('evaluate', function (cmd, cb) {
		var val = vals.evaluate(cmd.arguments()[0]);
		
		vals.value('result', val);
		
		cb(null, val);
	}, { arguments: 1 });
	
	dsl.define('set', function (cmd, cb) {
		var args = cmd.arguments();
		var name = args[0];
		var expr = args[1];
		
		var val = vals.evaluate(expr);
		
		vals.value(name, val);
		
		cb(null, val);
	}, { arguments: 2 });
	
	dsl.define('accounts', function (cmd, cb) {
		self.host();
		
		host.getAccounts(function (err, data) {
			if (err)
				return cb(err, null);
			
			log('accounts', data);
			
			vals.value('accounts', data);
			vals.value('result', data);
			
			cb(null, data);
		});
	});
	
	dsl.define('balance', function (cmd, cb) {
		self.host();

		var acc = vals.evaluate(cmd.arguments()[0]);
		
		host.getBalance(acc, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('balance', data);

			data = simpleabi.asSafeInteger(data);
			
			vals.value('result', data);
			
			cb(null, data);
		});
	}, { arguments: 1 });

	dsl.define('accountnew', function (cmd, cb) {
		self.host();

		var passphrase = vals.evaluate(cmd.arguments()[0]);
		
		host.newPersonalAccount(passphrase, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('new account', data);
			
			vals.value('result', data);
			
			cb(null, data);
		});
	}, { arguments: 1 });

	dsl.define('blocknumber', function (cmd, cb) {
		self.host();
		
		host.getBlockNumber(function (err, data) {
			if (err)
				return cb(err, null);
			
			log('block number', data);
			
			vals.value('result', data);
			
			cb(null, data);
		});
	});

	dsl.define('block', function (cmd, cb) {
		self.host();
		
		host.getBlockByNumber(vals.evaluate(cmd.arguments()[0]), function (err, data) {
			if (err)
				return cb(err, null);
			
			log('block', data);
			
			vals.value('result', data);
			
			cb(null, data);
		});
	}, { arguments: 1 });
	
	dsl.define('transfer', function (cmd, cb) {
		var txdata = { };
		
		txdata.from = vals.evaluate(cmd.arguments()[0]);
		txdata.to = vals.evaluate(cmd.arguments()[1]);
		txdata.value = vals.evaluate(cmd.arguments()[2]);
		txdata.gas = vals.value('gas') || 3000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		
		if (cmd.arguments().length > 3)
			txdata.data = vals.evaluate(cmd.arguments()[3]);
		
		self.host();
		
		log('send transaction', txdata);
		
		host.sendTransaction(txdata, function (err, txhash) {
			if (err)
				return cb(err, null);
			
			log('transaction hash', txhash);
			
			vals.value('result', txhash);
			
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err)
					return next(err, null);
			
				log('transaction receipt', txreceipt);
				
				cb(null, txhash);
			})
		});
	});
	
	dsl.define('link', function (cmd, cb) {
		var contractname = cmd.arguments()[0];
		var instancename = cmd.arguments()[1];
		
		var mapping = {};
		mapping[instances[instancename].contract] = instances[instancename].address;
		
		var newbytecode = compiler.linkBytecode(contracts[contractname].bytecode, mapping);

		contracts[contractname].bytecode = newbytecode;
		
		cb(null, null);
	});
	
	dsl.define('compile', function (cmd, cb) {
		var filename = vals.evaluate(cmd.arguments()[0]);

		if (!path.isAbsolute(filename) && filepath)
			filename = path.join(filepath, filename);
		
		var value = compiler.compileFile(filename);
		var basename = path.basename(filename);
		
		for (var n in value) {
			contracts[n] = value[n];

			var p = n.lastIndexOf(':');
			
			if (p >= 0) {
				var contractname = n.substring(p + 1);
				contracts[contractname] = value[n];
				contracts[contractname].fullname = basename + ':' + contractname;
			}
		}
		
		vals.value('result', value);
		
		cb(null, value);
	}, { arguments: 1 });

	dsl.define('deploy', function (cmd, cb) {
		var args = cmd.arguments();
		var contractname = args[0];
		var instancename = args[1];
		
		var fnargs = [];
		
		for (var k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));
		
		var txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.value = vals.value('ether') || 0;
		txdata.gas = vals.value('gas') || 3000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = contracts[contractname].bytecode + simpleabi.encodeValues(fnargs);
		
		self.host();
		
		log('deploy transaction', txdata);
		
		host.sendTransaction(txdata, function (err, txhash) {
			if (err) {
				console.log(err);
				return cb(err, null);
			}
			
			log('transaction', txhash);
			
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err)
					return next(err, null);
			
				log('transaction receipt', txreceipt);

				var instance = {
					contract: contractname,
					address: txreceipt.contractAddress
				};
				
				vals.value('result', instance.address);
				
				instances[instancename] = instance;
				
				cb(null, txhash);
			})
		});
	});
	
	dsl.define('call', function (cmd, cb) {
		var args = cmd.arguments();
		var instancename = args[0];
		var fnname = args[1];
		var instance = instances[instancename];
		var contract = contracts[instance.contract];
		
		var fnargs = [];
		
		for (var k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));

		var txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.to = instance.address;
		txdata.value = vals.value('ether') || 0;
		txdata.gas = vals.value('gas') || 3000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = contract.functionHashes[fnname] + simpleabi.encodeValues(fnargs);
		
		self.host();
		
		log('call transaction', txdata);
		
		host.callTransaction(txdata, function (err, data) {
			if (err) {
				console.log(err);
				return cb(err, null);
			}
			
			log('call result', data);
			
			var fndef = interfaces.getFunction(fnname, contract.interface);
			
			if (typeof data === 'string' && fndef && fndef.outputs && fndef.outputs.length) {
				var types = [];
				
				for (var no in fndef.outputs)
					types.push(fndef.outputs[no].type);
				
				data = simpleabi.decodeValues(data, types);
			}
			
			vals.value('result', data);
			
			cb(null, data);
		});
	});
	
	dsl.define('invoke', function (cmd, cb) {
		var args = cmd.arguments();
		var instancename = args[0];
		var fnname = args[1];
		
		var fnargs = [];
		
		for (var k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));

		var txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.to = instances[instancename].address;
		txdata.value = vals.value('ether') || 0;
		txdata.gas = vals.value('gas') || 3000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = contracts[instances[instancename].contract].functionHashes[fnname] + simpleabi.encodeValues(fnargs);
		
		self.host();
		
		log('invoke transaction', txdata);

		host.sendTransaction(txdata, function (err, txhash) {
			if (err) {
				console.log(err);
				return cb(err, null);
			}
			
			log('transaction', txhash);
			
			vals.value('result', txhash);
				
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err)
					return next(err, null);
			
				log('transaction receipt', txreceipt);
				
				cb(null, txhash);
			})
		});
	});

	dsl.define('message', function (cmd, cb) {
		var exprs = [];
		var args = cmd.arguments();
		
		for (var k = 0; k < args.length; k++)
			exprs.push(vals.evaluate(args[k]));
		
		logger.log.apply(logger, exprs);
		
		cb(null, null);
	});

	dsl.define('assert', function (cmd, cb) {
		var expr = cmd.arguments()[0];
		var value = vals.evaluate(expr);
		
		if (value)
			return cb(null, value);
		
		cb(new Error('failed assertion ' + expr), null);
	}, { arguments: 1 });

	dsl.define('dump', function (cmd, cb) {
		logger.log(JSON.stringify(vals.evaluate(cmd.arguments()[0]), null, 4));
		
		cb(null, null);
	}, { arguments: 1 });

	dsl.define('if', function (cmd, cb) {
		var value = vals.evaluate(cmd.arguments()[0]);

		vals.value('result', value);
		
		cb(null, value);
	}, { conditional: true, arguments: 1 });
	
	dsl.define('while', function (cmd, cb) {
		var value = vals.evaluate(cmd.arguments()[0]);

		vals.value('result', value);
		
		cb(null, value);
	}, { loop: true, arguments: 1 });
	
	dsl.define('end', { close: true });

	dsl.define('else', { else: true });

	this.host = function (h) { 
		if (h)
			host = rskapi.host(h);
		else if (!host)
			host = rskapi.host(DEFAULT_HOST);
		
		return host;
	};
	
	this.logger = function (l) {
		if (l)
			logger = l;
		
		return logger;
	}
	
	this.value = function (name, val) { return vals.value(name, val); };
	
	this.execute = function (text, cb) {
		dsl.execute(text, cb);
	}
	
	this.executeFile = function (filename, cb) {
		var originalfilepath = filepath;
		filepath = path.dirname(filename);
		
		dsl.executeFile(filename, function (err, data) {
			filepath = originalfilepath;
			cb(err, data);
		});
	}
	
	this.logging = function (value) {
		logging = value;
	}
	
	function log(message, data) {
		if (!logging)
			return;
		
		logger.log(chalk.green(message));
		logger.log(chalk.green(JSON.stringify(data, null, 4)));
	}

	function getTransactionReceipt(hash, ntry, cb) {
		self.host();
		
		if (ntry <= 0)
			return cb(new Error('transaction ' + hash + ' not mined'));
		
		host.getTransactionReceiptByHash(hash, function (err, data) {
			if (err)
				return cb(err, null);
				
			if (data)
				return cb(null, data);
				
			setTimeout(function () {
				getTransactionReceipt(hash, ntry - 1, cb);
			}, 1000);
		});
	}
}

function createExecutor() {
	return new Executor();
}

module.exports = {
	executor: createExecutor
};

