#!node
const inquirer = require('inquirer');
const execa = require('execa');
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const localstorage = new LocalStorage('commitizenish');

function lagCommitMelding(resp) {
    return `[${resp.issue}] `.toUpperCase();
}

function saveState(state) {
    const issue = state.issue;
    localstorage.setAll({ issue });
}

inquirer.prompt([
    {
        type: 'input',
        name: 'issue',
        default: localstorage.get('issue'),
        message: 'Issue (PK/PKULV etc)?'
    }
]).then((resp) => {
    saveState(resp);
    try {
        execa.shellSync(`git commit -m "${lagCommitMelding(resp)}" -e`, { stdio: 'inherit' })
    } catch (e) {
        logging.error("Could not commit", e);
    }
});
