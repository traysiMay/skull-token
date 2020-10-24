pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Skull is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

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

    constructor() public ERC721("SkullToken", "SKL") {
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
        uint8 _b,
        address skullChanger,
        string memory tokenURI
    ) public {
        Color memory _color = Color(_r, _g, _b);
        _tokenIds.increment();
        uint256 newSkullId = _tokenIds.current();
        _mint(skullChanger, newSkullId);
        _setTokenURI(newSkullId, tokenURI);
        color = _color;
        emit ColorChange(msg.sender, _r, _g, _b);
    }

    function setMessage(string memory _message) public {
        message = _message;
        emit MessageChange(msg.sender, _message);
    }
}
