const { Given, When, Then } = require('cucumber');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const contracts = require('../../utils/compile');
const { DEFAULT_GAS } = require('../support/helpers.js');

Given('{string} set ticket trade fee to {float}%', function(role, percent) {
  const ratio = percent / 100;
  return this.ticketSale.methods.setTradeFee(ratio).send({ from: this[role], gas: DEFAULT_GAS });
});

When('{string} request to trade the ticket for {float} ETH', async function(role, price) {
  this.ticketId = await this.ticketSale.tickets().call();
  return this.ticketSale.methods
    .requestTrading(this.ticketId, price)
    .send({ from: this[role], gas: DEFAULT_GAS });
});

When('{string} take the ticket for {float} ETH', async function(role, price) {
  return this.ticketSale.methods
    .trade(this.ticketId)
    .send({ from: this[role], gas: DEFAULT_GAS, value: `${price}` });
});

Then('balance of hub contract increase {float} ETH', async function(fee) {
  const balance = await web3.eth.getBalance(this.hub._address);
  expect(balance).to.equal(fee);
});
