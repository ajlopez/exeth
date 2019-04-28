
function toInterface(interface) {
	if (typeof interface === 'string')
		return JSON.parse(interface);
	
	return interface;
}

function getConstructor(interface) {
	interface = toInterface(interface);
	
	for (let n in interface) {
		const fndef = interface[n];
		
		if (fndef.type === 'constructor')
			return fndef;
	}
	
	return null;
}

function parseSignature(signature) {
	const p = signature.indexOf('(');
	const p2 = signature.lastIndexOf(')');
	
	const name = signature.substring(0, p);
	const args = signature.substring(p + 1, p2);
	
	return {
		name: name,
		types: args.length === 0 ? [] : args.split(',')
	}
}

function getFunction(signature, interface) {
	const sign = parseSignature(signature);
	interface = toInterface(interface);
	
	for (let n in interface) {
		const fndef = interface[n];
		
		if (sign.name !== fndef.name)
			continue;
		
		if (sign.types.length !== fndef.inputs.length)
			continue;
		
		let sametypes = true;
		
		for (let m in sign.types) {
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

