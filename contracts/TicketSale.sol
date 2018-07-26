pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract TicketSale is ERC721Token {
  mapping(address => bool) hosts;
  uint256 public price;
  uint256 public ticketId = 0;
  uint32 public limit = 1;
  uint256 public maxAttendees = 10;

  constructor (string name) public
      ERC721Token(name, name)
  {
    hosts[msg.sender] = true;
  }

  modifier onlyHost() {
    require(hosts[msg.sender] == true);
    _;
  }

  function register(uint8 ticketAmount) external payable {
    require(msg.value >= price * ticketAmount && balanceOf(msg.sender) + ticketAmount <= limit && ticketId < maxAttendees);

    for (uint index = 0; index < ticketAmount; index++) {
      ticketId++;
      _mint(msg.sender, ticketId);
    }

    uint256 rest = msg.value - (ticketAmount * price);
    if (rest > 0) {
      msg.sender.transfer(rest);
    }
  }

  function setMaxAttendees(uint256 _maxAttendees) external {
    maxAttendees = _maxAttendees;
  }

  function setLimit(uint32 _limit) onlyHost external {
    limit = _limit;
  }

  function setPrice(uint256 _price) onlyHost external {
    price = _price;
  }
}
