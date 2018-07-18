const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const contracts = require('../../utils/compile');
const DEFAULT_GAS = '1000000';

function generateID() {
  return (
    '0x' +
    new Array(40)
      .fill(0)
      .map(_ => Math.floor(Math.random() * 16).toString(16))
      .join('')
  );
}

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

Given('{string} set ticket sales fee to {float}%', async function(role, fee) {
  try {
    await this.hub.methods.setFee(`${fee}`).send({ from: this[role], ges: DEFAULT_GAS });
  } catch (err) {
    this.setFeeError = err;
  }
});

When('{string} create an event with ticket price {float} ETH', async function(role, price) {
  const { interface } = contracts['TicketSale.sol:TicketSale'];
  const id = generateID();
  await this.hub.methods.createEventContract(id).send({ from: this[role], gas: DEFAULT_GAS });
  this.contractAddr = await this.hub.methods.events(id).call();
  this.ticketSale = await new web.eth.Contract(interface, this.contractAddr);

  return ticketSale.methods.setPrice(`${price}`).send({ from: this[role], gas: DEFAULT_GAS });
});

Then('service fee per ticket is {float} ETH', async function(fee) {
  const balance = await web3.eth.getBalance(this.contractAddr);
  expect(balance).equal(fee);
});
