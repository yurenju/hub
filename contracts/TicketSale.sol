pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract TicketSale is ERC721 {
  mapping(address => bool) hosts;

  constructor() public {
    hosts[msg.sender] = true;
  }
}
