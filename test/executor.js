
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

exports['execute evaluate'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.execute('evaluate 1+2', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('value'), 3);
		
		test.done();
	});
};

exports['execute with variables'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	
	executor.value('one', 1);
	executor.value('two', 2);
	
	executor.execute('evaluate one + two', function (err, data) {
		test.ok(!err);
		test.equal(data, 3);
		test.equal(executor.value('value'), 3);
		
		test.done();
	});
};



