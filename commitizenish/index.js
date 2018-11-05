#!/usr/local/bin/node
const inquirer = require('inquirer');
const execa = require('execa');
const fuzzysearch = require('fuzzysearch');
const logging = require('./../utils/logging');
const lastCommitMessages = require('./../utils/gitutils').getLastCommitMessages;
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
    return `${issue} ${msg}`;
}

const previousIssues = (localstorage.get('issues') || []).map((ans) => `${ans} `);

function saveState(state) {
    const { issue } = parseResponse(state.issue);

    const newIssues = [
        issue,
        ...previousIssues.filter((prev) => prev !== issue)
    ].slice(0, 10);

    localstorage.setAll({ issues: newIssues });
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

if (process.argv[2] === 'last') {
    inquirer.prompt([
        {
            type: 'list',
            name: 'message',
            message: 'Commit?',
            suggestOnly: true,
            choices: lastCommitMessages(3)
        }
    ]).then((resp) => {
        try {
            execa.shellSync(`git commit -m "${resp.message}" -e`, { stdio: 'inherit' })
        } catch (e) {
            logging.error("Could not commit", e);
        }
    });
} else {
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
}

