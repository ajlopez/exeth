
const solc = require('solc');
const linker = require('solc/linker');
const fs = require('fs');
const path = require('path');

function makeFindImports(currentdir) {
	return function (filepath) {
		let filename;

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
	const currentdir = path.dirname(filename);
	
    const code = fs.readFileSync(filename).toString();
    const sources = {};
    sources[filename] = { content: code };
    const input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': [ '*' ]
                }
            }
        }
    };
	
    const output = JSON.parse(solc.compile(JSON.stringify(input), makeFindImports(currentdir)));
    
	return output.contracts;
}

function getFullname(bytecode, name) {
	var p = bytecode.indexOf(name);
	
	if (p < 0)
		return name;
	
	const p1 = bytecode.substring(0, p).lastIndexOf('_');
	const p2 = bytecode.indexOf('_', p);

	return bytecode.substring(p1 + 1, p2);
}

function linkBytecode(bytecode, libraries) {
	const fullnames = {};
    
	for (let n in libraries) {
		const fullname = getFullname(bytecode, n);
		
		fullnames[fullname] = libraries[n];
	}
	
	return linker.linkBytecode(bytecode, fullnames);
}

module.exports = {
	compileFile: compileContract,
	linkBytecode: linkBytecode
}

