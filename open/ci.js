const Command = require('./../utils/cliutils').Command;
const Levenshtein = require('levenshtein');
const open = require('open');
const { fetchJson } = require('./../utils/fetch');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const getAppname = require("../utils/gitutils").getAppname;

function openJob(jobDesc) {
    const jobUrl = jobDesc
        .split(' ')
        .map((fragment) => `job/${fragment}/`)
        .join('');

    open(`https://ci.adeo.no/${jobUrl}`);
}

module.exports = class CiCommand extends Command {
    execute(query) {
        if (!query || query === '.') {
            query = getAppname();
        }

        fetchJson(`https://ci.adeo.no/search/suggest?query=${query}`)
            .then((data) => data.suggestions)
            .then((rawsuggestions) => {
                const suggestions = rawsuggestions
                    .filter(({ name }) => !name.includes('-triggere-'));
                if (suggestions.length === 0) {
                    logging.error('Fant ingen resultater for:', query);
                } else if (suggestions.length === 1) {
                    openJob(suggestions[0].name);
                } else {
                    const choices = suggestions
                        .map((s) => s.name)
                        .sort((aname, bname) => {
                            const alev = new Levenshtein(aname, query).distance;
                            const blev = new Levenshtein(bname, query).distance;
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