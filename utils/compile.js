const path = require('path');
const fs = require('fs');
const solc = require('solc');
const shell = require('shelljs');

const dirPath = path.resolve(__dirname, '..', 'contracts');
const contracts = shell.ls(dirPath);
const sources = {};

contracts.forEach(contractName => {
  const contractPath = path.resolve(dirPath, contractName);
  sources[contractName] = fs.readFileSync(contractPath, 'utf8');
});

module.exports = solc.compile({ sources }, 1).contracts;
