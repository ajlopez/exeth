
var values = require('./values');

function Executor() {
	var vals = values.values();
	
	this.value = function (name, val) { return vals.value(name, val); };
}

function createExecutor() {
	return new Executor();
}

module.exports = {
	executor: createExecutor
};