// http://bekkci.devillo.no/job/forenklet_oppfolging/job/veilarbdialog/job/master/
const open = require('open');
const fetch = require('node-fetch');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');

function openJob(jobDesc) {
    const jobUrl = jobDesc
        .split(' ')
        .map((fragment) => `job/${fragment}/`)
        .join('');

    open(`http://bekkci.devillo.no/${jobUrl}`);
}

module.exports = function (query, suffix) {
    if (!query || query === '.') {
        const path = process.cwd().split('\\');
        query = path[path.length - 1] + '-' + suffix;
    }
    fetch(`http://bekkci.devillo.no/search/suggest?query=${query}`)
        .then((resp) => resp.json())
        .then((data) => data.suggestions)
        .then((suggestions) => {
            if (suggestions.length === 0) {
                logging.error('Fant ingen resultater for:', query);
            } else if (suggestions.length === 1) {
                openJob(suggestions[0].name);
            } else {
                inquirer.prompt([{
                    type: 'list',
                    name: 'app',
                    message: `Hvilken jobb vil du åpne?`,
                    choices: suggestions.map((s) => s.name)
                }])
                    .then((answer) => openJob(answer.app));
            }
        });
};
