const path = require('path');
const fs = require('fs');
const solc = require('solc');

const hubPath = path.resolve(__dirname, '..', 'contracts', 'Hub.sol');
const source = fs.readFileSync(hubPath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':Hub'];
