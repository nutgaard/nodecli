#!node
const execa = require('execa');
const inquirer = require('inquirer');
const fuzzysearch = require('fuzzysearch');
const logging = require('./../utils/logging');
const chalk = require('chalk');

function getBranches() {
    const branches = execa
        .shellSync('git branch -a')
        .stdout
        .split('\n')
        .map((name) => name.trim())
        .map((name) => name.replace('* ', ''))
        .filter((name) => !name.startsWith('remotes/origin/HEAD'))
        .map((name) => name.replace('remotes/origin/', ''))
        .reduce((branches, name) => {
            branches.add(name);
            return branches;
        }, new Set());
    
    return Array.from(branches);
}

function queryFilter(query) {
    if (!query || query === '') {
        return () => true;
    }

    return (branch) => fuzzysearch(query, branch)
}

function checkoutBranch(branch) {
    execa.shellSync(`git checkout ${branch}`);
}

module.exports = function(query) {
    let branches = getBranches()
        .filter(queryFilter(query));

    if (branches.length === 0) {
        logging.error(`Fant ingen matchende branches for ${query}`);
    } else if (branches.length === 1) {
        logging.info(`Fant 1 match for ${query} -> ${branches[0]}`);
        checkoutBranch(branches[0]);
    } else {
        inquirer.prompt([{
            type: 'list',
            name: 'branch',
            message: 'Hvilken branch vil du gå til?',
            choices: branches
        }]).then((answer) => {
            checkoutBranch(answer.branch);
        });
    }
};