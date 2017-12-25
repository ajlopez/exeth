
contract Greeter {
    string public message;

    function Greeter(string msg) {
        message = msg;
    }
    
    function setMessage(string msg) {
        message = msg;
    }
}

