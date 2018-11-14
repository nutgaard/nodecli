const fs = require('fs');
const path = require('path');
const os = require('os');
const properties = require('properties-parser');

const CI = "jenkins" === (os.userInfo && os.userInfo().username);

if (CI) {
    module.exports = {domenebrukernavn: process.env.USER, domenepassord: process.env.PASSWORD};
} else {
    const fileContent = fs.readFileSync(path.join(os.homedir(), 'fasit.properties'), 'UTF-8');
    module.exports = properties.parse(fileContent);
}

