const Hub = artifacts.require('Hub');
const TicketSale = artifacts.require('TicketSale');

module.exports = function(deployer) {
  deployer.deploy(Hub);
  deployer.deploy(TicketSale);
};
