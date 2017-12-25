
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

module.exports = {
	getConstructor: getConstructor
}