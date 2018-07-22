const path = require('path');
const fs = require('fs');

module.exports = {
  DEFAULT_GAS: '1000000',
  getContracts() {
    const contractsDir = path.join(__dirname, '..', '..', 'build', 'contracts');
    const contractName = ['Hub', 'TicketSale'];
    const contracts = {};
    contractName.forEach(name => {
      contracts[name] = JSON.parse(
        fs.readFileSync(path.join(contractsDir, `${name}.json`), 'utf8')
      );
    });

    return contracts;
  }
};
