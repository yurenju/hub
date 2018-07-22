pragma solidity ^0.4.24;

// import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract TicketSale {
  mapping(address => bool) hosts;

  constructor() public {
    hosts[msg.sender] = true;
  }

  function register(uint8 ticketAmount) external payable {}

  function setMaxAttendees(uint32 max) external {}

  function setLimit(uint8 limit) external {}
}
