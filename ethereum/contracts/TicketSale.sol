pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./Hub.sol";

contract TicketSale is ERC721Token {
  Hub hub;
  mapping(address => bool) public hosts;
  uint256 public tradings = 0;
  mapping(uint256 => Trade) public tradingList;
  mapping(address => uint256) public tradingTicketsOfOwner;
  mapping(uint256 => bool) public usedTickets;

  uint256 public tickets = 0;
  uint256 public price;
  uint8 public limit = 1;
  uint256 public maxAttendees = 10;
  uint16 public tradeFee = 0;
  uint8 public maxMarkedTickets = 10;

  uint256 public startTime;
  uint256 public dueTime;

  // serviceFeeRatio / 10000 = ratio
  uint16 public serviceFeeRatio = 100;
  uint256 public serviceFee = 0;

  struct Trade {
    address owner;
    uint256 ticketId;
    uint256 value;
  }

  constructor (string name, address hubAddr, uint16 ratio, uint256 _startTime, uint256 _dueTime, uint256 _price) public
      ERC721Token(name, name)
  {
    hub = Hub(hubAddr);
    hosts[msg.sender] = true;
    serviceFeeRatio = ratio;
    startTime = _startTime;
    dueTime = _dueTime;
    price = _price;
  }

  modifier onlyHost() {
    require(hosts[msg.sender] == true, "only host can access it");
    _;
  }

  function register(uint8 ticketAmount) external payable {
    require(msg.value >= price * ticketAmount, "not enough value");
    require(balanceOf(msg.sender) + ticketAmount <= limit, "too many ticket amount");
    require(tickets < maxAttendees, "register is ended");

    if (startTime != 0) {
      require(now >= startTime, "ticket sale is not started yet");
    }
    if (dueTime != 0) {
      require(now <= dueTime, "ticket sale is ended");
    }

    serviceFee += msg.value * serviceFeeRatio / 10000;
    for (uint index = 0; index < ticketAmount; index++) {
      tickets++;
      _mint(msg.sender, tickets);
    }

    uint256 rest = msg.value - (ticketAmount * price);
    if (rest > 0) {
      msg.sender.transfer(rest);
    }
  }

  function setMaxAttendees(uint256 _maxAttendees) external {
    maxAttendees = _maxAttendees;
  }

  function setHost(address host) external onlyHost {
    hosts[host] = true;
  }

  function setLimit(uint8 _limit) external  onlyHost {
    limit = _limit;
  }

  function setPrice(uint256 _price) external  onlyHost {
    price = _price;
  }

  function setTradeFee(uint16 _fee) external  onlyHost {
    tradeFee = _fee;
  }

  function requestTrading(uint256 ticketId, uint256 value) external {
    tradings++;
    tradingList[tradings] = Trade({ticketId: ticketId, value: value, owner: msg.sender});
    tradingTicketsOfOwner[msg.sender]++;
  }

  function _cancelTrade(uint256 tradeId, address owner) internal {
    tradingTicketsOfOwner[owner]--;
    delete tradingList[tradeId];
    tradings--;
  }

  function cancelTrade(uint256 tradeId) external {
    Trade memory t = tradingList[tradeId];
    require(t.owner == msg.sender, "only owner can cancel trading");
    _cancelTrade(tradeId, msg.sender);
  }

  function trade(uint256 tradeId) public payable {
    require(tradingList[tradeId].ticketId != 0, "");

    Trade memory t = tradingList[tradeId];
    require(t.value <= msg.value, "ticket price is nout enough");

    _cancelTrade(t.ticketId, t.owner);
    removeTokenFrom(t.owner, t.ticketId);
    addTokenTo(msg.sender, t.ticketId);
  }

  function setUsedTickets(uint256[] ticketIds) external onlyHost {
    require(ticketIds.length <= maxMarkedTickets, "set too many tickets in the same time");

    for (uint8 index = 0; index < ticketIds.length; index++) {
      usedTickets[ticketIds[index]] = true;
    }
  }

  function isUsedTicket(uint256 ticketId) external view returns (bool) {
    return usedTickets[ticketId];
  }

  function withdraw() external onlyHost {
    // BUGGY HERE
    msg.sender.transfer(address(this).balance - serviceFee);
  }

  function withdrawFee() external {
    require(address(hub) != address(0), "hub contract does not exist");
    require(serviceFee > 0, "service fee is not required");
    require(serviceFee <= address(this).balance, "balance is not enough");

    hub.deposite.value(serviceFee)();
    serviceFee = 0;
  }
}
