
contract Federation {
    address[] federators;
	
    function Federation(address[] feds) public {
        federators = feds;
    }
	
	function federationSize() constant public returns (uint) {
		return federators.length;
	}
}

