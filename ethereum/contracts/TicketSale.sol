pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Hub.sol";

contract TicketSale is ERC721Token {
  using SafeMath for uint8;
  using SafeMath for uint16;
  using SafeMath for uint256;

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
    require(msg.value >= price.mul(ticketAmount), "not enough value");
    require(balanceOf(msg.sender).add(ticketAmount) <= limit, "too many ticket amount");
    require(tickets.add(ticketAmount) <= maxAttendees, "too many ticket register");

    if (startTime != 0) {
      require(now >= startTime, "ticket sale is not started yet");
    }
    if (dueTime != 0) {
      require(now <= dueTime, "ticket sale is ended");
    }

    serviceFee = serviceFee.add(msg.value.mul(serviceFeeRatio).div(10000));
    for (uint256 index = 0; index < ticketAmount; index++) {
      tickets++;
      _mint(msg.sender, tickets);
    }

    uint256 rest = msg.value.sub(ticketAmount.mul(price));
    if (rest > 0) {
      msg.sender.transfer(rest);
    }
  }
  
  function setMaxAttendees(uint256 _maxAttendees) external onlyHost {
    require(_maxAttendees > maxAttendees, "maxAttendees must be greater than original");
    maxAttendees = _maxAttendees;
  }

  function setHost(address host) external onlyHost {
    hosts[host] = true;
  }

  function removeHost(address addr) external onlyHost {
    require(hosts[addr] == true, "only host can be remove");
    hosts[addr] = false;
  }

  function setLimit(uint8 _limit) external onlyHost {
    require(_limit > limit, "limit must be greater than original");
    limit = _limit;
  }

  function setPrice(uint256 _price) external onlyHost {
    price = _price;
  }

  function setTradeFee(uint16 _fee) external  onlyHost {
    tradeFee = _fee;
  }

  function requestTrading(uint256 _ticketId, uint256 _value) external {
    address owner = ownerOf(_ticketId);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "only owner can sell");
    tradings++;
    tradingList[tradings] = Trade({ticketId: _ticketId, value: _value, owner: msg.sender});
    tradingTicketsOfOwner[msg.sender]++;
  }

  function _cancelTrade(uint256 _tradeId, address _owner) internal {
    tradingTicketsOfOwner[_owner]--;
    delete tradingList[_tradeId];
    tradings--;
  }

  function cancelTrade(uint256 _tradeId) external {
    Trade memory t = tradingList[_tradeId];
    require(t.owner == msg.sender, "only owner can cancel trading");
    _cancelTrade(_tradeId, msg.sender);
  }

  function trade(uint256 _tradeId) public payable {
    require(tradingList[_tradeId].ticketId != 0, "");

    Trade memory t = tradingList[_tradeId];
    require(t.value <= msg.value, "ticket price is not enough");

    t.owner.transfer(t.value - tradeFee);
    serviceFee = serviceFee.add(tradeFee);
    uint256 rest = msg.value.sub(t.value);
    if (rest > 0) {
      msg.sender.transfer(rest);
    }

    _cancelTrade(t.ticketId, t.owner);
    removeTokenFrom(t.owner, t.ticketId);
    addTokenTo(msg.sender, t.ticketId);
  }

  function setUsedTickets(uint256[] _ticketIds) external onlyHost {
    require(_ticketIds.length <= maxMarkedTickets, "set too many tickets in the same time");

    for (uint8 index = 0; index < _ticketIds.length; index++) {
      usedTickets[_ticketIds[index]] = true;
    }
  }

  function isUsedTicket(uint256 _ticketId) external view returns (bool) {
    return usedTickets[_ticketId];
  }

  function withdraw() external onlyHost {
    // BUGGY HERE
    msg.sender.transfer(address(this).balance.sub(serviceFee));
  }

  function withdrawFee() external {
    require(address(hub) != address(0), "hub contract does not exist");
    require(serviceFee > 0, "service fee is not required");
    require(serviceFee <= address(this).balance, "balance is not enough");

    hub.deposit.value(serviceFee)();
    serviceFee = 0;
  }
}
