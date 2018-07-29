const { expect } = require('chai');

const Hub = artifacts.require('Hub');
const TicketSale = artifacts.require('TicketSale');
const { DEFAULT_PRICE } = require('./helpers');

contract('Hub', function(accounts) {
  const admin = accounts[0];
  const host = accounts[1];
  const user = accounts[2];

  it('should take service fee per ticket', async function() {
    const ratio = 500;
    const fee = Number.parseInt((DEFAULT_PRICE * ratio) / 10000, 10);
    const hub = await Hub.new({ from: admin });
    await hub.setFeeRatio(ratio, { from: admin });
    await hub.createEvent('ticket sale', 0, 0, { from: host });
    const eventId = await hub.events();
    const eventAddress = await hub.eventList(eventId);
    const ticketSale = await TicketSale.at(eventAddress);
    await ticketSale.setPrice(DEFAULT_PRICE, { from: host });
    await ticketSale.register(1, { from: user, value: DEFAULT_PRICE });
    await ticketSale.withdrawFee({ from: admin });
    const balance = await web3.eth.getBalance(hub.address);
    expect(balance.toNumber()).equal(fee);
  });
});
