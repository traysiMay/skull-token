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

    mapping(uint256 => Color) public claimedColors;

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
        for (uint256 i = 1; i < _tokenIds.current() + 1; i++) {
            uint8 r = claimedColors[i].r;
            uint8 g = claimedColors[i].g;
            uint8 b = claimedColors[i].b;
            require(_r != r && _g != g && _b != b, "Color is used");
        }
        Color memory _color = Color(_r, _g, _b);
        color = _color;
        _tokenIds.increment();
        uint256 newSkullId = _tokenIds.current();
        _mint(skullChanger, newSkullId);
        _setTokenURI(newSkullId, tokenURI);

        emit ColorChange(msg.sender, _r, _g, _b);
    }

    function setMessage(string memory _message) public {
        message = _message;
        emit MessageChange(msg.sender, _message);
    }
}
