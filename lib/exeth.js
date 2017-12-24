
var values = require('./values');
var simpledsl = require('simpledsl');

function Executor() {
	var vals = values.values();
	var dsl = simpledsl.dsl();
	
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
	
	this.value = function (name, val) { return vals.value(name, val); };
	
	this.execute = function (text, cb) {
		dsl.execute(text, cb);
	}
}

function createExecutor() {
	return new Executor();
}

module.exports = {
	executor: createExecutor
};