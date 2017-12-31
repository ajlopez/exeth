
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

module.exports = {
	compileFile: compileContract,
	linkBytecode: solc.linkBytecode
}

