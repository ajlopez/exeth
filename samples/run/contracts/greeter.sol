
contract Greeter {
    string public message;

    constructor(string memory _msg) public {
        message = _msg;
    }
    
    function setMessage(string memory _msg) public {
        message = _msg;
    }
}

