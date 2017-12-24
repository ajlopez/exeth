
var exeth = require('..');

exports['get undefined value'] = function (test) {
	var executor = exeth.executor();
	
	test.equal(executor.value('from'), null);
};

exports['set and get value'] = function (test) {
	var executor = exeth.executor();
	
	executor.value('host', 'http://localhost:8545');
	test.equal(executor.value('host'), 'http://localhost:8545');
};

