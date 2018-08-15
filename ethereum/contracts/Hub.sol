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
    require(admins[msg.sender] == true, "only admin can access it");
    _;
  }

  function isAdmin() external view returns (bool) {
    return admins[msg.sender];
  }

  function setFeeRate(uint16 rate) external onlyAdmin {
    serviceFeeRate = rate;
  }

  function createEvent(string name, uint256 startTime, uint256 dueTime, uint256 price) external {
    events++;
    TicketSale ts = new TicketSale(name, address(this), serviceFeeRate, startTime, dueTime, price);
    ts.setHost(msg.sender);
    eventList[events] = ts;
  }

  function withdraw() external onlyAdmin {
    msg.sender.transfer(address(this).balance);
  }

  function getBalance() external view returns (uint256) {
    return address(this).balance;
  }

  function() external payable {}

  function deposite() external payable {}
}
