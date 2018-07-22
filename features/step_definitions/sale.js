const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { DEFAULT_GAS } = require('../support/helpers.js');

Then('user can buy a ticket', async function() {
  expect(err).to.be.null;
});

Given('{string} set ticket limit to {int}', async function(role, limit) {
  try {
    await this.ticketSale.methods.setLimit(`${limit}`).send({ from: this[role], gas: DEFAULT_GAS });
  } catch (err) {
    this.err = err;
  }
});

Then('{string} owns {int} tickets', async function(role, num) {
  const actual = await this.ticketSale.methods.balanceOf(this[role]).call();
  expect(actual).equal(num);
});

Then('{string} received a {float} ETH refund', async function(role, refund) {
  const prev = web3.utils.fromWei(this.userBalance, 'ether');
  const balance = await web3.eth.getBalance(this[role]);
  const now = web3.utils.fromWei(balance, 'ether');
  expect(now - prev).to.equal(refund);
});

Then('{string} cannot set ticket limit', function(role) {
  expect(this.err).to.be.an('error');
});

Then('{string} cannot set ticket price', function(role) {
  expect(this.err).to.be.an('error');
});

Given('{string} set max attendees to {int}', function(role, max) {
  return this.ticketSale.methods.setMaxAttendees(max).send({ from: this[role], gas: DEFAULT_GAS });
});
