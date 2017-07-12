#!node
const execa = require('execa');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');

function deleteBranch(force) {
    return (name) => {
        try {
            if (force) {
                execa.shellSync(`git branch -D ${name}`);
            } else {
                execa.shellSync(`git branch -d ${name}`);
            }
        } catch (e) {
            logging.error(e);
        }
    }
}

function fixRemoteNames(name) {
    if (name.includes('->')) {
        const parts = name.split("/");
        return parts[parts.length - 1];
    } else {
        const parts = name.split("/").filter((_, i) => i >= 2).join("/");
        return parts;
    }
}

module.exports = function (args) {
    execa.shellSync('git remote prune origin');
    const branches = execa
        .shellSync('git branch -a')
        .stdout
        .split('\n')
        .map((name) => name.slice(2));

    const remote = branches.filter((name) => name.startsWith('remotes/')).map(fixRemoteNames);
    const local = branches.filter((name) => !name.startsWith('remotes/'));

    const localNotInRemote = local.filter((l) => !remote.includes(l));

    if (localNotInRemote.length === 0) {
        logging.info("No branches to prune...");
        return;
    }

    inquirer.prompt([{
        type: 'checkbox',
        name: 'branches',
        message: `Delete branches?`,
        choices: localNotInRemote,
        pageSize: localNotInRemote.length + 10
    }]).then(({ branches }) => branches.forEach(deleteBranch(args.force)))
};