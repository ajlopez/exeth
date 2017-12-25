
var values = require('./values');
var simpledsl = require('simpledsl');
var rskapi = require('rskapi');

var DEFAULT_HOST = "http://localhost:8545";

function Executor() {
	var self = this;
	var vals = values.values();
	var dsl = simpledsl.dsl({ comment: '#' });
	var logger = console;
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
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});

	dsl.define('blocknumber', function (cmd, cb) {
		self.host();
		
		host.getBlockNumber(function (err, data) {
			if (err)
				return cb(err, null);
			
			vals.value('value', data);
			
			cb(null, data);
		});
	});

	dsl.define('block', function (cmd, cb) {
		self.host();
		
		host.getBlockByNumber(vals.evaluate(cmd.argumentsText()), function (err, data) {
			if (err)
				return cb(err, null);
			
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
}

function createExecutor() {
	return new Executor();
}

module.exports = {
	executor: createExecutor
};