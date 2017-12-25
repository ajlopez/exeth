
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
}

function parseSignature(signature) {
	var p = signature.indexOf('(');
	var p2 = signature.lastIndexOf(')');
	
	var name = signature.substring(0, p);
	var args = signature.substring(p + 1, p2);
	
	return {
		name: name,
		types: args.indexOf(',') >= 0 ? args.split(',') : []
	}
}

module.exports = {
	getConstructor: getConstructor,
	parseSignature: parseSignature
}

