import Web3 from 'web3';

import HubContract from './contracts/Hub';
import TicketSaleContract from './contracts/TicketSale';

const web3js = new Web3(Web3.givenProvider);

export const hub = new web3js.eth.Contract(
  HubContract.abi,
  '0xad4776B1Ef2cBE2d539E049a19a2EacA221977aD'
);

export function TicketSale(address) {
  return new web3js.eth.Contract(TicketSaleContract.abi, address);
}

export function getAccounts() {
  return web3js.eth.getAccounts();
}
