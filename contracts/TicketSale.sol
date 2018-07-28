pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract TicketSale is ERC721Token {
  mapping(address => bool) hosts;

  uint256 public tradings = 0;
  mapping(uint256 => Trade) tradingList;
  mapping(address => uint256) tradingTicketsOfOwner;

  uint256 public tickets = 0;
  uint256 public price;
  uint32 public limit = 1;
  uint256 public maxAttendees = 10;
  uint16 public tradeFee = 0;

  struct Trade {
    address owner;
    uint256 ticketId;
    uint256 value;
  }

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
    require(msg.value >= price * ticketAmount && balanceOf(msg.sender) + ticketAmount <= limit && tickets < maxAttendees);

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

  function setLimit(uint32 _limit) onlyHost external {
    limit = _limit;
  }

  function setPrice(uint256 _price) onlyHost external {
    price = _price;
  }

  function setTradeFee(uint16 _fee) onlyHost external {
    tradeFee = _fee;
  }

  function requestTrading(uint256 ticketId, uint256 value) external {
    tradings++;
    tradingList[tradings] = Trade({ticketId: ticketId, value: value, owner: msg.sender});
    tradingTicketsOfOwner[msg.sender]++;
  }

  function _cancelTrade(uint256 tradeId) internal {
    require(tradingList[tradeId].ticketId != 0);

    tradingTicketsOfOwner[msg.sender]--;
    delete tradingList[tradeId];
    tradings--;
  }

  function cancelTrade(uint256 tradeId) external {
    _cancelTrade(tradeId);
  }

  function trade(uint256 tradeId) external payable {
    require(tradingList[tradeId].ticketId != 0);

    Trade memory t = tradingList[tradeId];
    require(t.value <= msg.value);

    _cancelTrade(t.ticketId);
    removeTokenFrom(t.owner, t.ticketId);
    addTokenTo(msg.sender, t.ticketId);
  }
}
