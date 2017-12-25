
var exeth = require('..');

exports['execute dump with simple value'] = function (test) {
	test.async();
	
	var executor = exeth.executor();
	var done = false;
	
	executor.logger({
		log: function() {
			test.equal(arguments.length, 1);
			test.equal(arguments[0], 42);
			done = true;
		}
	});
	
	executor.execute('dump 40+2', function (err, data) {
		test.ok(!err);
		test.ok(!data);
		test.ok(done);
		test.done();
	});
}

exports['execute dump with object'] = function (test) {
	test.async();
	
	var obj = { name: "Adam", age: 900 };
	var json = JSON.stringify(obj, null, 4);
	
	var executor = exeth.executor();
	var done = false;
	
	executor.logger({
		log: function() {
			test.equal(arguments.length, 1);
			test.equal(arguments[0], json);
			done = true;
		}
	});
	
	executor.value("adam", obj);
	
	executor.execute('dump adam', function (err, data) {
		test.ok(!err);
		test.ok(!data);
		test.ok(done);
		test.done();
	});
}
