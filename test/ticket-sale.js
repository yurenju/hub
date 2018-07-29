const { expect } = require('chai');

const TicketSale = artifacts.require('TicketSale');
const { DEFAULT_PRICE } = require('./helpers');

contract('TicketSale', function(accounts) {
  const admin = accounts[0];
  const host = accounts[1];
  const user1 = accounts[2];
  const user2 = accounts[3];

  it('should sell tickets', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });

    const prevBalance = await ticketSale.balanceOf(user1);
    expect(prevBalance.toNumber()).to.equal(0);

    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE });
    const num = await ticketSale.balanceOf(user1);
    expect(num.toNumber()).to.equal(1);
  });

  it('should not sell ticket with below fare', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    try {
      await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE - 10 });
    } catch (err) {}
    const num = await ticketSale.balanceOf(user1);
    expect(num.toNumber()).to.equal(0);
  });

  it('should refund with over fare', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE + 100 });
    const num = await ticketSale.balanceOf(user1);
    expect(num.toNumber()).to.equal(1);
    const balance = await web3.eth.getBalance(ticketSale.address);
    expect(balance.toNumber()).to.equal(DEFAULT_PRICE);
  });

  it('should sell multiple tickets for same user', async function() {
    const limit = 3;
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.setLimit(limit, { from: host });

    await ticketSale.register(limit, { from: user1, value: DEFAULT_PRICE * 3 });
    const num = await ticketSale.balanceOf(user1);
    expect(num.toNumber()).to.equal(limit);
  });

  it('should disallow to sell multiple tickets when reach limit', async function() {
    const limit = 3;
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.setLimit(limit, { from: host });
    try {
      await ticketSale.register(limit + 1, { from: user1, value: DEFAULT_PRICE });
    } catch (err) {}
    const num = await ticketSale.balanceOf(user1);
    expect(num.toNumber()).to.equal(0);
  });

  it('should disallow user to set ticket limit', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });

    try {
      await ticketSale.setLimit(1, { from: host });
      await ticketSale.setLimit(2, { from: user1 });
    } catch (err) {}

    const limit = await ticketSale.limit();
    expect(limit.toNumber()).to.equal(1);
  });

  it('should disallow user to set ticket price', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });

    try {
      await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
      await ticketSale.setPrice(200, { from: user1 });
    } catch (err) {}

    const price = await ticketSale.price({ from: host });
    expect(price.toNumber()).to.equal(DEFAULT_PRICE);
  });

  it('should not let user register when reach max attendees', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.setMaxAttendees(1, { from: host });

    try {
      await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE });
      await ticketSale.register(1, { from: user2, value: DEFAULT_PRICE });
    } catch (err) {}

    const user1Ticket = await ticketSale.balanceOf(user1);
    const user2Ticket = await ticketSale.balanceOf(user2);
    const attendees = await ticketSale.tickets();
    expect(attendees.toNumber()).to.equal(1);
    expect(user1Ticket.toNumber()).to.equal(1);
    expect(user2Ticket.toNumber()).to.equal(0);
  });

  it('should be able to mark ticket as used', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE });
    const ticketId = await ticketSale.tickets();
    await ticketSale.setUsedTickets([ticketId.toNumber()], { from: host });
    const used = await ticketSale.isUsedTicket(ticketId);
    expect(used).to.be.true;
  });

  it('should trade ticket', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setTradeFee(500, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE });
    const ticketId = await ticketSale.tickets();
    await ticketSale.requestTrading(ticketId, DEFAULT_PRICE + 100, { from: user1 });
    await ticketSale.trade(1, { from: user2, value: DEFAULT_PRICE + 100 });
    const balance1 = await ticketSale.balanceOf(user1);
    const balance2 = await ticketSale.balanceOf(user2);
    expect(balance1.toNumber()).to.equal(0);
    expect(balance2.toNumber()).to.equal(1);
  });

  it('should not trade non-exist trade id', async function() {
    const NON_EXIST_TRADE_ID = 12345;
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setTradeFee(500, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    try {
      await ticketSale.trade(NON_EXIST_TRADE_ID, { from: user2, value: DEFAULT_PRICE + 100 });
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('cannot trade a ticket which is not owned by them', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setTradeFee(500, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });

    try {
      await ticketSale.requestTrading(ticketId, DEFAULT_PRICE + 100, { from: user1 });
    } catch (err) {
      expect(err).to.be.an('error');
    }
  });

  it('should cancel ticket trading', async function() {
    const ticketSale = await TicketSale.new('Ticket Sale', 0, 0, 0, 0, { from: host });
    await ticketSale.setTradeFee(500, { from: host });
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user1, value: DEFAULT_PRICE });
    const ticketId = await ticketSale.tickets();
    await ticketSale.requestTrading(ticketId, DEFAULT_PRICE + 100, { from: user1 });
    let ticketCount = await ticketSale.tradingTicketsOfOwner(user1);
    expect(ticketCount.toNumber()).to.equal(1);
    await ticketSale.cancelTrade(1, { from: user1 });
    ticketCount = await ticketSale.tradingTicketsOfOwner(user1);
    expect(ticketCount.toNumber()).to.equal(0);
  });
});
