
pragma solidity >=0.4.21 <0.6.0;

// Simple counter contract

contract Counter {
    uint counter;
	
    constructor() public {
        counter = 1;
    }
    
    function increment() public {
        counter++;
    }
	
    function add(uint v) public {
        counter += v;
    }
	
    function getCounter() public view returns (uint) {
        return counter;
    }
}

