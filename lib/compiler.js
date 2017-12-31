
var solc = require('solc');
var fs = require('fs');
var path = require('path');

var currentdir;

function findImports(filepath) {
	var filename;
	
	if (path.isAbsolute(filepath))
		filename = path;
	else
		filename = path.join(currentdir, filepath);
	
    return { contents: fs.readFileSync(filename).toString() };
    // return { error: 'File not found' }
}

function compileContract(filename) {
	currentdir = path.dirname(filename);
	
    var input = fs.readFileSync(filename).toString();
    var sources = {};
    sources[filename] = input;
	
    var output = solc.compile({ sources: sources }, 1, findImports); // 1 activates the optimiser

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

