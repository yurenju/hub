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
  // 目前正在二級市場交易的票數，一開始為 0 張。
  uint256 public tradings = 0;
  // 儲存目前所有正在二級市場交易的活動票券資訊，Trade struct 包含擁有者（購買者）、票券 Id，販售價格資訊。
  mapping(uint256 => Trade) public tradingList;
  // 紀錄此活動票券擁有者（購買者）正在二級市場販售的活動票券數。
  mapping(address => uint256) public tradingTicketsOfOwner;
  mapping(uint256 => bool) public usedTickets;

  // 目前已販售的票數，一開始為販售 0 張。
  uint256 public tickets = 0;
  // 此活動票券價格，單位是 wei。
  uint256 public price;
  // 限定同一個買家最多可購買此活動票券的數量。
  uint8 public limit = 1;
  // 可賣出的活動票券數量上限值。
  uint256 public maxAttendees = 10;
  // tradeFee 為二級市場的交易服務費（團隊營運費），單位是 wei。
  uint16 public tradeFee = 0;
  // 在使用 setUsedTickets(uint256[]) 函數時，限制輸入的矩陣長度，以防止交易手續費過高。
  uint8 public maxMarkedTickets = 10;

  uint256 public startTime;
  uint256 public dueTime;

  // serviceFeeRatio / 10000 = ratio
  // 收取的服務費（團隊營運費）serviceFee 為：票價 * serviceFeeRatio / 10000，單位是 wei。
  uint16 public serviceFeeRatio = 100;
  uint256 public serviceFee = 0;

  // 儲存目前正在二級市場交易的活動票券資訊，包含擁有者（購買者）、票券 Id，販售價格資訊。
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

  // 條飾詞：只能是這個活動票券的 Host。
  // 在這邊使用 Hub 合約來建立 TicketSale 子合約，其 Host 為 Hub 合約地址、以及建立 Hub 合約的人。細節請查看 Hub 合約內的 createEvent(string,uint256,uint256,uint256) 函數。
  modifier onlyHost() {
    require(hosts[msg.sender] == true, "only host can access it");
    _;
  }

  // ticketAmount 是購買者 msg 想要一次購買的票券數量。
  function register(uint8 ticketAmount) external payable {
    // 購買者發起的交易，傳入的 ETH 要大於「票價 * 購買數量」。
    require(msg.value >= price.mul(ticketAmount), "not enough value");
    // 每一個購買者所持有的活動票數，必須大於 limit 變數。
    require(balanceOf(msg.sender).add(ticketAmount) <= limit, "too many ticket amount");
    // 賣出的活動票券總數量一定要小於 maxAttendees 變數。
    //require(tickets < maxAttendees, "register is ended");
    // 是否要更改為：
    require(tickets.add(ticketAmount) <= maxAttendees, "too many ticket register");

    // 是否在可以買票的開放時間內。
    if (startTime != 0) {
      require(now >= startTime, "ticket sale is not started yet");
    }
    if (dueTime != 0) {
      require(now <= dueTime, "ticket sale is ended");
    }

    // 收取的服務費（團隊營運費）serviceFee 為：票價 * serviceFeeRatio / 10000。
    serviceFee = serviceFee.add(msg.value.mul(serviceFeeRatio).div(10000));

    // 這邊的 index 只是迴圈用的暫時變數，與 ticket id 無關。
    for (uint256 index = 0; index < ticketAmount; index++) {
      // 目前的總票券數量（ticketId）加 1。
      tickets++;
      // 函數：_mint(address _to, uint256 _tokenId)：買家從 0x0 地址取得 Id 為 tickets 的票券
      _mint(msg.sender, tickets);
    }

    // 如果買家傳入合約的 ETH 超過「票價 * 購買數量」，就將多出來的費用退還給買家。
    uint256 rest = msg.value.sub(ticketAmount.mul(price));
    if (rest > 0) {
      msg.sender.transfer(rest);
    }
  }

  // 設置可賣出的活動票券數量上限值。
  //function setMaxAttendees(uint256 _maxAttendees) external {
  // 是否要更改、新增為：
  function setMaxAttendees(uint256 _maxAttendees) external onlyHost {
    require(_maxAttendees > maxAttendees, "maxAttendees must be greater than original");
    maxAttendees = _maxAttendees;
  }

  // 新增這個活動票券的 Host。
  function setHost(address host) external onlyHost {
    hosts[host] = true;
  }

  // 是否要新增：
  // 將指定的 Address 從這個這個活動票券的 Host 中移除。
  function removeHost(address addr) external onlyHost {
    require(hosts[addr] == true, "only host can be remove");
    hosts[addr] = false;
  }

  // 設置同一個買家最多可購買此活動票券的數量。
  function setLimit(uint8 _limit) external onlyHost {
  // 是否要新增：
    require(_limit > limit, "limit must be greater than original");
    limit = _limit;
  }

  // 設置此活動票券的價格，單位是 wei。
  function setPrice(uint256 _price) external onlyHost {
    price = _price;
  }

  // 設置二級市場的交易手續費（團隊營運費）serviceFee 為：票價 * tradeFeeRatio / 10000。
  function setTradeFee(uint16 _fee) external onlyHost {
    tradeFee = _fee;
  }

  // 活動票券的擁有者（購買者）在二級市場發出想將此活動票券賣出的資訊。
  function requestTrading(uint256 _ticketId, uint256 _value) external {
    // 是否要新增：
    address owner = ownerOf(_ticketId);
    require(msg.sender == owner || isApprovedForAll(owner, msg.sender), "only owner can sell");
    // 目前正在二級市場交易的票數加 1。
    tradings++;
    // 儲存目前正在二級市場交易的活動票券資訊，包含擁有者（購買者）、票券 Id，販售價格。
    tradingList[tradings] = Trade({ticketId: _ticketId, value: _value, owner: msg.sender});
    // 此活動票券擁有者（購買者）正在二級市場販售的活動票券數加 1。
    tradingTicketsOfOwner[msg.sender]++;
  }

  // 在二級市場完成交易，或活動票券擁有者（購買者）欲中途取消交易時，執行此程式。
  function _cancelTrade(uint256 _tradeId, address _owner) internal {
    // 此張活動票券擁有者（購買者）正在二級市場販售的活動票券數減 1。
    tradingTicketsOfOwner[_owner]--;
    // 刪除此張目前正在二級市場交易的活動票券資訊。
    delete tradingList[_tradeId];
    // 目前正在二級市場交易的票數減 1。
    tradings--;
  }

  // 取消目前正在二級市場交易的活動票券。
  function cancelTrade(uint256 _tradeId) external {
    // 取出目前正在二級市場交易的活動票券資訊。
    Trade memory t = tradingList[_tradeId];
    // 發起活動票券取消在二級市場交易的地址必須為票券擁有者（購買者）。
    require(t.owner == msg.sender, "only owner can cancel trading");
    // 執行取消交易。
    _cancelTrade(_tradeId, msg.sender);
  }

  // 有買家相中目前正在二級市場交易的活動票券，執行此購買票券函數。
  function trade(uint256 _tradeId) public payable {
    // 此票券必須正在 tradingList 的列表中，表示確實正在二級市場販售。
    require(tradingList[_tradeId].ticketId != 0, "");
    // 取出目前正在二級市場交易的活動票券資訊。
    Trade memory t = tradingList[_tradeId];
    // 買家（msg.sender）所傳入的 ETH 必須要大於此活動票券的購買價格。
    require(t.value <= msg.value, "ticket price is not enough");

    // 是否要新增：
    // 當在二級市場活動票券成交後，買家需向賣方支付購票費用。
    t.owner.transfer(t.value - tradeFee);
    // 收取的交易服務費（團隊營運費）serviceFee 為：tradeFee。
    serviceFee = serviceFee.add(tradeFee);
    // 如果買家傳入合約的 ETH 超過「二級市場交易的票價」，就將多出來的費用退還給買家。
    uint256 rest = msg.value.sub(t.value);
    if (rest > 0) {
      msg.sender.transfer(rest);
    }

    // 取消此活動票券可在二級市場販售的狀態。
    _cancelTrade(t.ticketId, t.owner);
    // 移除此活動票券的舊擁有者（擁有者將設置為 0x0 地址）。
    removeTokenFrom(t.owner, t.ticketId);
    // 此活動票券的擁有者設置為新買家（msg.sender）。
    addTokenTo(msg.sender, t.ticketId);
  }

  // 設定哪一些 ticket id 要被設置成已使用（買家已掃描 QR Code 並參與活動）。
  function setUsedTickets(uint256[] _ticketIds) external onlyHost {
    // 限制批次設置已使用票券票的數量，不能大於 maxMarkedTickets，以避免手續費過高。
    require(_ticketIds.length <= maxMarkedTickets, "set too many tickets in the same time");
    // 將 _ticketIds 矩陣內的 ticket id 設置為已使用。
    for (uint8 index = 0; index < _ticketIds.length; index++) {
      usedTickets[_ticketIds[index]] = true;
    }
  }

  // 查看此票券是否已使用。
  function isUsedTicket(uint256 _ticketId) external view returns (bool) {
    return usedTickets[_ticketId];
  }

  // 此 TicketSale 合約的 Host 可取出扣除 serviceFee 手續費（= 票價 * serviceFeeRatio / 10000）的活動票價金額。
  function withdraw() external onlyHost {
    // BUGGY HERE
    msg.sender.transfer(address(this).balance.sub(serviceFee));
  }

  // 從 TicketSale 合約發送 serviceFee 手續費（= 票價 * serviceFeeRatio / 10000）至 Hub 合約。
  function withdrawFee() external {
    // Hub 合約地址必須不為 0x0 地址。
    require(address(hub) != address(0), "hub contract does not exist");
    // 儲存的 serviceFee 手續費的量必須要大於 0。
    require(serviceFee > 0, "service fee is not required");
    // 此 TicketSale 合約內的 ETH 必須要大於 serviceFee 手續費的量。
    require(serviceFee <= address(this).balance, "balance is not enough");

    // 從 TicketSale 合約發送 serviceFee 手續費（= 票價 * serviceFeeRatio / 10000）至 Hub 合約。
    hub.deposit.value(serviceFee)();
    // serviceFee 手續費的量清為 0。
    serviceFee = 0;
  }
}
