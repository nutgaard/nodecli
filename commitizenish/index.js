#!node
const inquirer = require('inquirer');
const execa = require('execa');
const logging = require('./../utils/logging');

const types = {
    feat: 'A new feature',
    fix: 'A bug fix',
    docs: 'Documentation only changes',
    style: 'Changes that do not affect the meaning of the code\n(white-space, formatting, missing semi-colons etc)',
    refactor: 'A code change that neither fixes a bug or adds a feature',
    perf: 'A code change that improves performance',
    test: 'Adding missing tests',
    chore: 'Changes to the build process og auxiliary tools\nand libraries such as documentation generation'
};

function align(start, stop) {
    return ' '.repeat(stop - start + 1);
}

function fixValue(value, alignPos) {
    return value.split('\n')
        .map((line, index) => index === 0 ? line : `${align(0, alignPos + 3)}${line}`)
        .join('\n');
}

function toChoiceList(obj) {
    const maxLength = Object.keys(obj)
        .map((key) => key.length)
        .reduce((a, b) => Math.max(a, b), -1);

    return Object.entries(obj)
        .map(([key, value]) => [key, fixValue(value, maxLength)])
        .map(([key, value]) => ({
            value: key,
            short: key,
            name: `${key}:${align(key.length, maxLength)}${value}`
        }));
}

function lagCommitMelding(resp) {
    return `[${resp.changetype}][${resp.issue || '-'}] `;
}

inquirer.prompt([
    {
        type: 'list',
        name: 'changetype',
        message: `Type of change?`,
        choices: toChoiceList(types),
        pageSize: 4 * Object.keys(types).length
    },
    {
        type: 'input',
        name: 'issue',
        message: 'Issue (PK/PKULV etc)?',
        when: (resp) => ['feat', 'fix', 'perf', 'test'].includes(resp.changetype)
    }
]).then((resp) => {
    try {
        execa.shellSync(`git commit -m ${lagCommitMelding(resp)} -e`, { stdio: 'inherit' })
    } catch (e) {
        logging.error("Could not commit", e);
    }
});
