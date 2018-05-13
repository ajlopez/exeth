
contract ProofOfExistence {
	mapping (bytes32 => uint256) public timestamps;
	
	function exists(bytes32 hash) public constant returns(bool) {
		return timestamps[hash] != 0;
	}
	
	function register(bytes32 hash) public {
		if (timestamps[hash] != 0)
			return;
			
		timestamps[hash] = now;
	}
}
