const { Then, When } = require('cucumber');
const { expect } = require('chai');

const { DEFAULT_GAS } = require('../support/helpers.js');

When('admin set the ticket as used', async function() {
  this.ticketId = await this.ticketSale.tickets().call();
  return this.ticketSale.methods
    .setUsedTickets([this.ticketId])
    .send({ from: this.host, gas: DEFAULT_GAS });
});

Then('the ticket is not marked as used', async function() {
  const actual = await this.ticketSale.methods.isUsedTicket(100);
  expect(actual).to.be.false;
});

Then('the ticket is marked as used', async function() {
  const actual = await this.ticketSale.methods.isUsedTicket(this.ticketId);
  expect(actual).to.be.true;
});
