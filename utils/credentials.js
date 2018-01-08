const fs = require('fs');
const path = require('path');
const os = require('os');
const properties = require('properties-parser');

const fileContent = fs.readFileSync(path.join(os.userInfo().homedir, 'fasit.properties'), 'UTF-8');
const fasitProperies = properties.parse(fileContent);

module.exports = fasitProperies;