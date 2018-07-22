const { expect } = require('chai');

const Hub = artifacts.require('Hub');
const TicketSale = artifacts.require('TicketSale');

contract('Hub', function(accounts) {
  it('should take service fee per ticket', async function() {
    const admin = accounts[0];
    const host = accounts[1];
    const user = accounts[2];
    const hub = await Hub.new({ from: admin });
    await hub.setFee(50, { from: admin });
    await hub.createEvent({ from: host });
    const eventId = await hub.latestEvent();
    const eventAddress = await hub.events(eventId);
    const ticketSale = await TicketSale.at(eventAddress);
    await ticketSale.register(1, { from: user });
    await ticketSale.withdrawFee({ from: admin });
    const balance = await web3.eth.getBalance(hub._address);
    expect(balance).equal(fee);
  });
});
