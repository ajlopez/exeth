
var solc = require('solc');
var fs = require('fs');
var path = require('path');

function makeFindImports(currentdir) {
	return function (filepath) {
		var filename;

		if (fs.existsSync(filepath))
			filename = filepath;
		else if (path.isAbsolute(filepath))
			filename = filepath;
		else if (fs.existsSync(path.join('contracts', filepath)))
			filename = path.join('contracts', filepath);
		else
			filename = path.join(currentdir, filepath);
		
		return { contents: fs.readFileSync(filename).toString() };
		// return { error: 'File not found' }
	}
}

function compileContract(filename) {
	var currentdir = path.dirname(filename);
	
    var input = fs.readFileSync(filename).toString();
    var sources = {};
    sources[filename] = input;
	
    var output = solc.compile({ sources: sources }, 1, makeFindImports(currentdir)); // 1 activates the optimiser

	return output.contracts;
}

function getFullname(bytecode, name) {
	var p = bytecode.indexOf(name);
	
	if (p < 0)
		return name;
	
	var p1 = bytecode.substring(0, p).lastIndexOf('_');
	var p2 = bytecode.indexOf('_', p);

	return bytecode.substring(p1 + 1, p2);
}

function linkBytecode(bytecode, libraries) {
	var fullnames = {};
	for (var n in libraries) {
		var fullname = getFullname(bytecode, n);
		
		fullnames[fullname] = libraries[n];
	}
	
	return solc.linkBytecode(bytecode, fullnames);
}

module.exports = {
	compileFile: compileContract,
	linkBytecode: linkBytecode
}

