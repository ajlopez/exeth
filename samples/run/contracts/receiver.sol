
contract Receiver {
	struct Vote {
		uint256 txhash;
		uint256 blkhash;
		address target;
		uint256 value;
		address voter;
	}
	
	Vote[] public votes;
	
	function vote(uint256 txhash, uint256 blkhash, address target, uint256 value) {
		uint16 k;
		uint16 counter;
		
		for (k = 0; k < votes.length; k++) {
			Vote vote = votes[k];
			
			if (vote.txhash != txhash || vote.blkhash != blkhash || vote.target != target || vote.value != value)
				continue;
				
			counter++;
			
			if (vote.voter == msg.sender)
				return;
		}
		
		votes.push(Vote(txhash, blkhash, target, value, msg.sender));
	}
}

