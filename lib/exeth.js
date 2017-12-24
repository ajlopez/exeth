
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