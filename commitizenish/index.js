#!node
const inquirer = require('inquirer');
const execa = require('execa');
const fuzzysearch = require('fuzzysearch');
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const localstorage = new LocalStorage('commitizenish');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

function parseResponse(resp) {
    const spaceIndex = resp.indexOf(' ');

    if (spaceIndex >= 0) {
        const issue = resp.slice(0, spaceIndex).toUpperCase();
        const msg = resp.slice(spaceIndex + 1);
        return { issue, msg };
    } else {
        return { issue: resp, msg: '' };
    }
}

function lagCommitMelding(resp) {
    const { issue, msg } = parseResponse(resp.issue);
    return `[${issue}] ${msg}`;
}

const previousIssues = localstorage.get('issues') || [];

function saveState(state) {
    const issues = new Set(previousIssues);
    const { issue } = parseResponse(state.issue);
    issues.add(issue);

    const issueArray = Array.from(issues)
        .slice(0, 10);

    localstorage.setAll({ issues: issueArray });
}

function getAns(answersSoFar, input) {
    if (input == null) {
        return Promise.resolve(previousIssues);
    }
    const search = parseResponse(input).issue.toLowerCase();
    return new Promise((resolve) => {
        const matching = previousIssues
            .filter((issue) => fuzzysearch(search, issue.toLowerCase()));

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
