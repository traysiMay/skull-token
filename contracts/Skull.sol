pragma solidity >=0.4.21 <0.7.0;

contract Skull {
    address public owner;
    Color public color;
    string public message;

    struct Color {
        uint8 r;
        uint8 g;
        uint8 b;
    }

    event ColorChange(address indexed _changer, uint8 _r, uint8 _g, uint8 _b);
    event MessageChange(address indexed _changer, string _message);

    constructor() public {
        owner = msg.sender;
        color = Color(255, 0, 0);
        message = "henlo";
    }

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function setColor(
        uint8 _r,
        uint8 _g,
        uint8 _b
    ) public {
        Color memory _color = Color(_r, _g, _b);
        color = _color;
        emit ColorChange(msg.sender, _r, _g, _b);
    }

    function setMessage(string memory _message) public {
        message = _message;
        emit MessageChange(msg.sender, _message);
    }
}
