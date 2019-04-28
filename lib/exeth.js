
const values = require('./values');
const interfaces = require('./interfaces');
const compiler = require('./compiler');
const keccak = require('./sha3').keccak_256;

const chalk = require('chalk');
const simpledsl = require('simpledsl');
const rskapi = require('rskapi');
const simpleabi = require('simpleabi');

const path = require('path');

const DEFAULT_HOST = "http://localhost:8545";

function functionHash(signature) {
    return keccak(signature).substring(0, 8);
}

function Executor() {
	const self = this;
	const vals = values.values();
	const dsl = simpledsl.dsl({ comment: '#' });
	let logger = console;
	let logging = false;
	let host;
	let filepath;
	
	const contracts = {};
	const instances = {};
	
	vals.value('contracts', contracts);
	vals.value('instances', instances);

    function sendTransaction(txdata, cb) {
        self.host();
        
        host.sendTransaction(txdata, cb);
    }
	
	dsl.define('evaluate', function (cmd, cb) {
		const val = vals.evaluate(cmd.arguments()[0]);
		
		vals.value('result', val);
		
		cb(null, val);
	}, { arguments: 1 });
	
	dsl.define('async', function (cmd, cb) {
		vals.asyncEvaluate(cmd.arguments()[0], function (err, data) {
			if (!err)
				vals.value('result', data);
			
			cb(err, data);
		});
	}, { arguments: 1 });
	
	dsl.define('set', function (cmd, cb) {
		const args = cmd.arguments();
		const name = args[0];
		const expr = args[1];
		
		const val = vals.evaluate(expr);
		
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

		const acc = vals.evaluate(cmd.arguments()[0]);
		
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

		const passphrase = vals.evaluate(cmd.arguments()[0]);
		
		host.newPersonalAccount(passphrase, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('new account', data);
			
			vals.value('result', data);
			
			cb(null, data);
		});
	}, { arguments: 1 });

	dsl.define('accountunlock', function (cmd, cb) {
		self.host();

		const acc	 = vals.evaluate(cmd.arguments()[0]);
		const passphrase = vals.evaluate(cmd.arguments()[1]);
		const time = vals.evaluate(cmd.arguments()[2]);
		
		host.unlockPersonalAccount(acc, passphrase, time, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('unlocked account', acc);
			
			cb(null, null);
		});
	});

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
		const txdata = { };
		
		txdata.from = vals.evaluate(cmd.arguments()[0]);
		txdata.to = vals.evaluate(cmd.arguments()[1]);
		txdata.value = vals.evaluate(cmd.arguments()[2]);
		txdata.gas = vals.value('gas') || 5000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		
		if (cmd.arguments().length > 3)
			txdata.data = vals.evaluate(cmd.arguments()[3]);
		
		log('send transaction', txdata);
		
		sendTransaction(txdata, function (err, txhash) {
			if (err)
				return cb(err, null);
			
			log('transaction hash', txhash);
			
			vals.value('result', txhash);
			
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err)
					return cb(err, null);
			
				log('transaction receipt', txreceipt);
				
				cb(null, txhash);
			})
		});
	});
	
	dsl.define('send', function (cmd, cb) {
		const txdata = { };
		
		txdata.from = vals.evaluate(cmd.arguments()[0]);
		txdata.to = vals.evaluate(cmd.arguments()[1]);
		txdata.value = vals.evaluate(cmd.arguments()[2]);
		txdata.gas = vals.value('gas') || 5000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		
		if (cmd.arguments().length > 3)
			txdata.data = vals.evaluate(cmd.arguments()[3]);
		
		log('send transaction', txdata);
		
		sendTransaction(txdata, function (err, txhash) {
			if (err)
				return cb(err, null);
			
			log('transaction hash', txhash);
			
			vals.value('result', txhash);
			
			cb(null, txhash);
		});
	});
	
	dsl.define('link', function (cmd, cb) {
		const contractname = cmd.arguments()[0];
		const instancename = cmd.arguments()[1];
		
		const mapping = {};
		mapping[instances[instancename].contract] = instances[instancename].address;
		
		var newbytecode = compiler.linkBytecode(contracts[contractname].evm.bytecode.object, mapping);

		contracts[contractname].evm.bytecode.object = newbytecode;
		
		cb(null, null);
	});
	
	dsl.define('execute', function (cmd, cb) {
		let filename = vals.evaluate(cmd.arguments()[0]);

		if (!path.isAbsolute(filename) && filepath)
			filename = path.join(filepath, filename);

		self.executeFile(filename, cb);
	}, { arguments: 1 });

	dsl.define('compile', function (cmd, cb) {
		let filename = vals.evaluate(cmd.arguments()[0]);

		if (!path.isAbsolute(filename) && filepath)
			filename = path.join(filepath, filename);
		
		const value = compiler.compileFile(filename);
		const basename = path.basename(filename);
		
		for (let n in value) 
            for (let m in value[n]) {
                const contract = value[n][m];
                
                if (!contract.evm)
                    continue;
                    
                contracts[m] = contract;
            }
		
		vals.value('result', value);
		
		cb(null, value);
	}, { arguments: 1 });

	dsl.define('deploy', function (cmd, cb) {
		var args = cmd.arguments();
		var contractname = args[0];
		var instancename = args[1];
		
		const fnargs = [];
		
		for (var k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));
		
		const txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.value = vals.value('value') || 0;
		txdata.gas = vals.value('gas') || 5000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = contracts[contractname].evm.bytecode.object + simpleabi.encodeValues(fnargs);
		
		log('deploy transaction', txdata);
		
		sendTransaction(txdata, function (err, txhash) {
			if (err) {
				log('error', err);
				return cb(err, null);
			}
			
			log('transaction', txhash);
			
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err)
					return cb(err, null);
			
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
		const args = cmd.arguments();
		const instancename = args[0];
		const fnname = args[1];
		const instance = instances[instancename];
		const contract = contracts[instance.contract];
		
		const fnargs = [];
		
		for (let k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));

		const txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.to = instance.address;
		txdata.value = vals.value('value') || 0;
		txdata.gas = vals.value('gas') || 5000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = '0x' + functionHash(fnname) + simpleabi.encodeValues(fnargs);
		
		self.host();
		
		log('call transaction', txdata);
		
		host.callTransaction(txdata, function (err, data) {
			if (err) {
				log('error', err);
				return cb(err, null);
			}
			
			log('call result', data);
			
			const fndef = interfaces.getFunction(fnname, contract.interface);
			
			if (typeof data === 'string' && fndef && fndef.outputs && fndef.outputs.length) {
				const types = [];
				
				for (let no in fndef.outputs)
					types.push(fndef.outputs[no].type);
				
				data = simpleabi.decodeValues(data, types);
			}
			
			vals.value('result', data);
			
			cb(null, data);
		});
	});
	
	dsl.define('invoke', function (cmd, cb) {
		const args = cmd.arguments();
		const instancename = args[0];
		const fnname = args[1];
		
		const fnargs = [];
		
		for (let k = 2; k < args.length; k++)
			fnargs.push(vals.evaluate(args[k]));

		const txdata = { };
		
		txdata.from = vals.value('from') || vals.evaluate('accounts[0]');
		txdata.to = instances[instancename].address;
		txdata.value = vals.value('value') || 0;
		txdata.gas = vals.value('gas') || 5000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		txdata.data = '0x' + functionHash(fnname) + simpleabi.encodeValues(fnargs);
		
		log('invoke transaction', txdata);

		sendTransaction(txdata, function (err, txhash) {
			if (err) {
				log('error', err);
				return cb(err, null);
			}
			
			log('transaction', txhash);
			
			vals.value('result', txhash);
				
			getTransactionReceipt(txhash, vals.value('timeout') || 60, function (err, txreceipt) {
				if (err) {
					log('error', err);
					return cb(err, null);					
				}
			
				log('transaction receipt', txreceipt);
				
				cb(null, txhash);
			})
		});
	});

	dsl.define('message', function (cmd, cb) {
		const exprs = [];
		const args = cmd.arguments();
		
		for (let k = 0; k < args.length; k++)
			exprs.push(vals.evaluate(args[k]));
		
		logger.log.apply(logger, exprs);
		
		cb(null, null);
	});

	dsl.define('rpc', function (cmd, cb) {
		const exprs = [];
		const args = cmd.arguments();
		const verb = args[0];
		
		for (let k = 1; k < args.length; k++)
			exprs.push(vals.evaluate(args[k]));

		log(verb, exprs);
		
		self.host();
		
		host.provider().call(verb, exprs, function (err, data) {
			if (!err)
				vals.value('result', data);
			
			cb(err, data);
		});
	});

	dsl.define('assert', function (cmd, cb) {
		const expr = cmd.arguments()[0];
		const value = vals.evaluate(expr);
		
		if (value)
			return cb(null, value);
		
		cb(new Error('failed assertion ' + expr), null);
	}, { arguments: 1 });

	dsl.define('dump', function (cmd, cb) {
		logger.log(JSON.stringify(vals.evaluate(cmd.arguments()[0]), null, 4));
		
		cb(null, null);
	}, { arguments: 1 });

	dsl.define('if', function (cmd, cb) {
		const value = vals.evaluate(cmd.arguments()[0]);

		vals.value('result', value);
		
		cb(null, value);
	}, { conditional: true, arguments: 1 });
	
	dsl.define('while', function (cmd, cb) {
		const value = vals.evaluate(cmd.arguments()[0]);

		vals.value('result', value);
		
		cb(null, value);
	}, { loop: true, arguments: 1 });
	
	dsl.define('end', { close: true });

	dsl.define('else', { else: true });

	dsl.define('loop', function (cmd, cb) { cb(null, true); }, { loop: true });
	dsl.define('break', { break: true });
	dsl.define('continue', { continue: true });

	dsl.define('fail', { fail: true });

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
		const originalfilepath = filepath;
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

