const Command = require('./../utils/cliutils').Command;
const Levenshtein = require('levenshtein');
const open = require('open');
const { fetchJson } = require('./../utils/fetch');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const getAppname = require('./../utils/gitutils').getAppname;

function openJob(jobDesc) {
    console.log('jobDesc', jobDesc); // eslint-disable-line
    const name = jobDesc.name;
    const baseUrl = jobDesc.baseUrl;

    const jobUrl = name
        .split(' ')
        .map((fragment) => `job/${fragment}/`)
        .join('');

    open(`${baseUrl}/${jobUrl}`);
}

function findJobs(baseUrl, query) {
    return fetchJson(`${baseUrl}/search/suggest?query=${query}`)
        .then((data) => data.suggestions)
        .then((suggestions) => suggestions.map(({ name }) => ({ baseUrl, name })));
}

module.exports = class CiCommand extends Command {
    execute(query) {
        if (!query || query === '.') {
            query = getAppname();
        }

        Promise.all([
            findJobs('https://ci.intra.eika.no', query),
            findJobs('https://jenkins.intra.eika.no', query),
        ]).then(([ci, jenkins]) => Array.from(new Set(ci.concat(jenkins))))
            .then((rawsuggestions) => {
                const suggestions = rawsuggestions
                    .filter(({ name }) => !name.includes('-triggere-'));
                if (suggestions.length === 0) {
                    logging.error('Fant ingen resultater for:', query);
                } else if (suggestions.length === 1) {
                    openJob(suggestions[0]);
                } else {
                    const choices = suggestions
                        .map((value)     => ({ name: value.name, value }))
                        .sort((aname, bname) => {
                            const alev = new Levenshtein(aname.name, query).distance;
                            const blev = new Levenshtein(bname.name, query).distance;
                            return alev - blev;
                        });

                    inquirer.prompt([{
                        type: 'list',
                        name: 'app',
                        message: `Hvilken jobb vil du åpne?`,
                        pageSize: choices.length + 50,
                        choices: choices
                    }])
                        .then((answer) => openJob(answer.app));
                }
            });
    }

    help() {
        return {
            args: '<query>',
            msg: 'Search query'
        };
    }
};