pragma solidity ^0.4.24;

import "./TicketSale.sol";

contract Hub {
  mapping (address => bool) admins;
  mapping (uint256 => address) public eventList;
  uint256 public events;
  uint16 public serviceFeeRate = 500;

  constructor() public {
    admins[msg.sender] = true;
  }

  modifier onlyAdmin() {
    require(admins[msg.sender] == true);
    _;
  }

  function isAdmin() view external returns (bool) {
    return admins[msg.sender];
  }

  function setFeeRate(uint16 rate) onlyAdmin external {
    serviceFeeRate = rate;
  }

  function createEvent(string name, uint256 startTime, uint256 dueTime, uint256 price) external {
    events++;
    TicketSale ts = new TicketSale(name, address(this), serviceFeeRate, startTime, dueTime, price);
    ts.setHost(msg.sender);
    eventList[events] = ts;
  }

  function withdraw() onlyAdmin external {
    msg.sender.transfer(address(this).balance);
  }

  function getBalance() view external returns (uint256) {
    return address(this).balance;
  }

  function() payable external {}

  function deposite() external payable {}
}
