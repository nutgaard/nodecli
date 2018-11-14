const fs = require('fs');
const path = require('path');
const os = require('os');

const CI = "jenkins" === (os.userInfo && os.userInfo().username);

if (CI) {
    module.exports = {domenebrukernavn: process.env.USER, domenepassord: process.env.PASSWORD};
} else {
    const homedir = require('os').homedir();
    const content = fs.readFileSync(path.join(homedir, 'fasit.properties'), 'utf-8');

    module.exports = content.split('\n')
        .map((line) => line.split('='))
        .filter((fragments) => fragments.length === 2)
        .reduce((acc, [key, value]) => Object.assign(acc, {[key]: value}), {});
}