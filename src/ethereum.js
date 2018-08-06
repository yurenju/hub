import Web3 from 'web3';

import HubContract from './contracts/Hub';
import TicketSaleContract from './contracts/TicketSale';

const web3js = new Web3(Web3.givenProvider);

export const hub = new web3js.eth.Contract(
  HubContract.abi,
  '0x456d2E97291C0073691d2f3cA7F58fBF2bB7f4Cd'
);

export function TicketSale(address) {
  return new web3js.eth.Contract(TicketSaleContract.abi, address);
}

export function getAccounts() {
  return web3js.eth.getAccounts();
}

export function toWei(number, unit) {
  return web3js.utils.toWei(number, unit);
}

export function fromWei(val, unit) {
  return web3js.utils.fromWei(val, unit);
}

export function sign(message, account) {
  return web3js.eth.personal.sign(message, account);
}

export function recover(message, signature) {
  return web3js.eth.personal.ecRecover(message, signature);
}
