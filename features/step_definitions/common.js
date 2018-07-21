const { Given, When } = require('cucumber');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const contracts = require('../../utils/compile');
const { DEFAULT_GAS } = require('../support/helpers.js');

Given('hub contract is deployed', async function() {
  this.accounts = await web3.eth.getAccounts();
  this.admin = this.accounts[0];
  this.host = this.accounts[1];
  this.user = this.accounts[2];
  this.userBalance = await web3.eth.getBalance(this.user);
  const { interface, bytecode } = contracts['Hub.sol:Hub'];
  this.hub = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: this.admin, gas: DEFAULT_GAS });
});

Given('ticket sale contract is deployed', async function() {
  this.accounts = await web3.eth.getAccounts();
  this.admin = this.accounts[0];
  this.host = this.accounts[1];
  this.user = this.accounts[2];
  this.userBalance = await web3.eth.getBalance(this.user);
  const { interface, bytecode } = contracts['TicketSale.sol:TicketSale'];
  this.ticketSale = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: this.host, gas: DEFAULT_GAS });
});

When('user buy {int} tickets for {float} ETH', async function(num, total) {
  return this.ticketSale.methods
    .register(`${num}`)
    .send({ from: this.user, gas: DEFAULT_GAS, value: web3.utils.toWei(`${total}`, 'ether') });
});

When('user buy a ticket for {float} ETH', async function(price) {
  return this.ticketSale.methods
    .register('1')
    .send({ from: this.user, gas: DEFAULT_GAS, value: web3.utils.toWei(`${price}`, 'ether') });
});

Given('{string} set ticket sales price to {float} ETH', async function(role, price) {
  try {
    await this.ticketSale.methods.setPrice(`${price}`).send({ from: this[role], gas: DEFAULT_GAS });
  } catch (err) {
    this.err = err;
  }
});
