
contract Bridge {
	function Bridge() payable {
	}
	
	function transfer(address receiver, uint256 amount) payable {
		receiver.transfer(amount);
	}
}

