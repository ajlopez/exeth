
var executor = require('../..').executor();
var sargs = require('simpleargs');

sargs
    .define('h', 'host', null, 'Host JSON RPC entry point')
    .define('f', 'from', null, 'From account address or number')
	.define('l', 'logging', false, 'Enable logging', { flag: true })

var options = sargs(process.argv.slice(2));
var args = options._;

if (options.logging)
	executor.logging(true);

if (options.host)
	executor.host(options.host);

executor.executeFile(args[0], function (err, data) {
	if (err)
		console.error(err);
	else if (data)
		console.dir(data);
});

