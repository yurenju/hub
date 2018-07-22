pragma solidity ^0.4.24;

contract Hub {
  mapping (uint256 => address) events;

  constructor() public {}
  function setFee(uint16 ratio) external {}
  function createEvent() external {}
  function latestEvent() external returns (uint256 eventId) {}
}
