pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract TicketSale is ERC721Token {
  mapping(address => bool) hosts;
  uint256 price;
  uint256 ticketId = 0;
  uint32 limit = 3;

  constructor (string name) public
      ERC721Token(name, name)
  {
  }

  function register(uint8 ticketAmount) external payable {
    require(msg.value * ticketAmount >= price && ticketAmount <= limit);

    for (uint index = 0; index < ticketAmount; index++) {
      ticketId++;
      _mint(msg.sender, ticketId);
    }
  }

  // function setMaxAttendees(uint32 max) external {}

  // function setLimit(uint8 limit) external {}

  function setPrice(uint256 _price) external {
    price = _price;
  }
}

