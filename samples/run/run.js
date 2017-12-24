
var executor = require('../..').executor();

executor.executeFile(process.argv[2], function (err, data) {
	if (err)
		console.error(err);
	else
		console.dir(data);
});

