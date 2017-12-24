
function Values() {
	var values = {};
	
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
}

function createValues() {
	return new Values();
}

module.exports = {
	values: createValues
};