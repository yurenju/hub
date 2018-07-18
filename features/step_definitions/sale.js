const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const contracts = require('../../utils/compile');
const DEFAULT_GAS = '1000000';

Given('ticket sale contract is deployed', async function() {
  this.accounts = await web3.eth.getAccounts();
  this.admin = this.accounts[0];
  this.user = this.accounts[1];
  this.userBalance = await web3.eth.getBalance(this.user);
  const { interface, bytecode } = contracts['TicketSale.sol:TicketSale'];
  this.ticketSale = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: this.admin, gas: DEFAULT_GAS });
});

Given('{string} set ticket sales price to {float} ETH', async function(role, price) {
  try {
    await this.ticketSale.methods.setPrice(`${price}`).send({ from: this[role], gas: DEFAULT_GAS });
  } catch (err) {
    this.err = err;
  }
});

When('user buy a ticket for {float} ETH', async function(price) {
  try {
    await this.ticketSale.methods
      .buy('1')
      .send({ from: this.user, gas: DEFAULT_GAS, value: web3.utils.toWei(`${price}`, 'ether') });
  } catch (err) {
    this.err = err;
  }
});

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

Then('user cannot buy a ticket', async function() {
  expect(this.err).to.be.an('error');
});

Then('user received a {float} ETH refund', async function(refund) {
  const prev = web3.utils.fromWei(this.userBalance, 'ether');
  const balance = await web3.eth.getBalance(this.user);
  const now = web3.utils.fromWei(balance, 'ether');
  expect(now - prev).to.equal(refund);
});

Then('user cannot set ticket limit', function() {
  expect(this.err).to.be.an('error');
});

Then('user cannot set ticket price', function() {
  expect(this.err).to.be.an('error');
});
