
function toInterface(interface) {
	if (typeof interface === 'string')
		return JSON.parse(interface);
	
	return interface;
}

function getConstructor(interface) {
	interface = toInterface(interface);
	
	for (var n in interface) {
		var fndef = interface[n];
		
		if (fndef.type === 'constructor')
			return fndef;
	}
	
	return null;
}

function parseSignature(signature) {
	var p = signature.indexOf('(');
	var p2 = signature.lastIndexOf(')');
	
	var name = signature.substring(0, p);
	var args = signature.substring(p + 1, p2);
	
	return {
		name: name,
		types: args.length === 0 ? [] : args.split(',')
	}
}

function getFunction(signature, interface) {
	var sign = parseSignature(signature);
	interface = toInterface(interface);
	
	for (var n in interface) {
		var fndef = interface[n];
		
		if (sign.name !== fndef.name)
			continue;
		
		if (sign.types.length !== fndef.inputs.length)
			continue;
		
		var sametypes = true;
		
		for (var m in sign.types) {
			if (sign.types[m] !== fndef.inputs[m].type) {
				sametypes = false;
				break;
			}
		}
		
		if (sametypes)
			return fndef;
	}
	
	return null;
}

module.exports = {
	getConstructor: getConstructor,
	parseSignature: parseSignature,
	getFunction: getFunction
}

