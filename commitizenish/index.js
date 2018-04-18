#!node
const inquirer = require('inquirer');
const execa = require('execa');
const fuzzysearch = require('fuzzysearch');
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const localstorage = new LocalStorage('commitizenish');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

function lagCommitMelding(resp) {
    return `[${resp.issue}] `.toUpperCase();
}

const previousIssues = localstorage.get('issues') || [];
console.log('previousIssues', previousIssues);


function saveState(state) {
    const issue = { issue: state.issue, time: new Date().getTime() };
    const issues = new Set(previousIssues);
    issues.add(issue);

    const issueArray = Array.from(issues)
        .sort((a, b) => a.time - b.time)
        .slice(0, 10);

    localstorage.setAll({ issues: issueArray });
}

function getAns(answersSoFar, input) {
    return new Promise((resolve) => {
        const matching = previousIssues
            .filter((issue) => fuzzysearch(input, issue));

        resolve(matching);
    });
}

inquirer.prompt([
    {
        type: 'autocomplete',
        name: 'issue',
        message: 'Issue?',
        suggestOnly: true,
        source: getAns
    }
]).then((resp) => {
    saveState(resp);
    try {
        execa.shellSync(`git commit -m "${lagCommitMelding(resp)}" -e`, { stdio: 'inherit' })
    } catch (e) {
        logging.error("Could not commit", e);
    }
});
