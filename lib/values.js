
function Values() {
	const values = {};
	
	this.value = function (name, value) {
		if (value !== undefined)
			values[name] = value;
		else
			return values[name];
	}
	
	this.evaluate = function (expr) {
		with (values) {
			return eval(expr);
		}
	}

	this.asyncEvaluate = function (expr, cb) {
		with (values) {
			eval(expr);
		}
	}
}

function createValues() {
	return new Values();
}

module.exports = {
	values: createValues
};