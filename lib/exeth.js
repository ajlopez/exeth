
var values = require('./values');
var simpledsl = require('simpledsl');
var rskapi = require('rskapi');
var chalk = require('chalk');

var DEFAULT_HOST = "http://localhost:8545";

function Executor() {
	var self = this;
	var vals = values.values();
	var dsl = simpledsl.dsl({ comment: '#' });
	var logger = console;
	var logging = false;
	var host;
	
	dsl.define('evaluate', function (cmd, cb) {
		var val = vals.evaluate(cmd.argumentsText());
		
		vals.value('value', val);
		
		cb(null, val);
	});
	
	dsl.define('set', function (cmd, cb) {
		var args = cmd.arguments();
		var name = args[0];
		var argstext = cmd.argumentsText();
		var p = argstext.indexOf(name);
		var expr = argstext.substring(p + name.length).trim();
		
		var val = vals.evaluate(expr);
		
		vals.value(name, val);
		
		cb(null, val);
	});
	
	dsl.define('accounts', function (cmd, cb) {
		self.host();
		
		host.getAccounts(function (err, data) {
			if (err)
				return cb(err, null);
			
			log('accounts', data);
			
			vals.value('accounts', data);
			vals.value('value', data);
			
			cb(null, data);
		});
	});
	
	dsl.define('balance', function (cmd, cb) {
		self.host();

		var acc = vals.evaluate(cmd.argumentsText());
		
		host.getBalance(acc, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('balance', data);
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});

	dsl.define('accountnew', function (cmd, cb) {
		self.host();

		var passphrase = vals.evaluate(cmd.argumentsText());
		
		host.newPersonalAccount(passphrase, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('new account', data);
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});

	dsl.define('blocknumber', function (cmd, cb) {
		self.host();
		
		host.getBlockNumber(function (err, data) {
			if (err)
				return cb(err, null);
			
			log('block number', data);
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});

	dsl.define('block', function (cmd, cb) {
		self.host();
		
		host.getBlockByNumber(vals.evaluate(cmd.argumentsText()), function (err, data) {
			if (err)
				return cb(err, null);
			
			log('block', data);
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});
	
	dsl.define('transfer', function (cmd, cb) {
		var txdata = { };
		
		txdata.from = vals.evaluate(cmd.arguments()[0]);
		txdata.to = vals.evaluate(cmd.arguments()[1]);
		txdata.value = vals.evaluate(cmd.arguments()[2]);
		txdata.gas = vals.value('gas') || 3000000;
		txdata.gasPrice = vals.value('gasPrice') || 0;
		
		self.host();
		
		host.sendTransaction(txdata, function (err, data) {
			if (err)
				return cb(err, null);
			
			log('transaction', data);
			
			vals.value('value', data);
			
			cb(null, data);
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

	dsl.define('dump', function (cmd, cb) {
		logger.log(JSON.stringify(vals.evaluate(cmd.argumentsText()), null, 4));
		
		cb(null, null);
	});

	dsl.define('if', function (cmd, cb) {
		var value = vals.evaluate(cmd.argumentsText());

		vals.value('value', value);
		
		cb(null, value);
	}, { conditional: true });
	
	dsl.define('while', function (cmd, cb) {
		var value = vals.evaluate(cmd.argumentsText());

		vals.value('value', value);
		
		cb(null, value);
	}, { loop: true });
	
	dsl.define('end', { close: true });

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
		dsl.executeFile(filename, cb);
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
}

function createExecutor() {
	return new Executor();
}

module.exports = {
	executor: createExecutor
};