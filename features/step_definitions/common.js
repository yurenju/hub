const { When } = require('cucumber');

When('user buy {int} tickets for {float} ETH', async function(num, total) {
  return this.ticketSale.methods
    .buy(`${num}`)
    .send({ from: this.user, gas: DEFAULT_GAS, value: web3.utils.toWei(`${total}`, 'ether') });
});

When('user buy a ticket for {float} ETH', async function(price) {
  return this.ticketSale.methods
    .buy('1')
    .send({ from: this.user, gas: DEFAULT_GAS, value: web3.utils.toWei(`${price}`, 'ether') });
});
