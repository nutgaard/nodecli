#!/usr/bin/node
const execa = require('execa');
const logging = require('./../utils/logging');
const chalk = require('chalk');

function processBranchName(name) {
    if (name.startsWith('*')) {
        return `* ${chalk.green(name.slice(2))}`;
    } else if (name.startsWith('remotes')) {
        return '  ' + name.split(' ')
            .map((part, index) => index === 0 ? chalk.red(part) : part)
            .join(' ');
    } else {
        return '  '+name;
    }
}

module.exports = function() {
    const output = execa
        .shellSync('git branch -a')
        .stdout
        .split('\n')
        .map((name) => name.trim())
        .map(processBranchName)
        .join('\n');

    logging.pure(output);
};