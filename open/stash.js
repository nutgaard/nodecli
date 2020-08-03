// http://stash.devillo.no/plugins/servlet/search?q=veilarbportefolje
const open = require('open');
const fetch = require('node-fetch');
const inquirer = require('inquirer');
const getOrigin = require('./../utils/gitutils').getOrigin;
const logging = require('./../utils/logging');

module.exports = function (query) {
    if (!query || query === '.') {
        const origin = getOrigin();
        if (origin.isStash) {
            open(`http://stash.devillo.no/projects/${origin.project}/repos/${origin.repo}/browse`);
        } else if (origin.isGithub) {
            open(`https://github.com/${origin.project}/${origin.repo}`);
        } else {
            throw new Error("Could not find origin: " + JSON.stringify(origin, null, 2));
        }
    } else {
        logging.debug(`Searching for ${query}`);
        fetch(`http://stash.devillo.no/rest/api/latest/repos?name=${query}`, { method: 'GET' })
            .then((res) => res.json())
            .then(({ values }) => values.map(({ name, links }) => ({ name, value: links.self[0].href })))
            .then((choices) => {
                logging.debug('Choices', choices);
                if (choices.length === 0) {
                    throw new Error(`Fant ingen treff for: ${query}`);
                }
                else if (choices.length === 1) {
                    logging.info(`Found one match; ${choices[0].name}. Opening...`);
                    return { href: choices[0].value };
                }
                else {
                    logging.info(`Found ${choices.length} matches for ${query}`);
                    return inquirer.prompt([
                        {
                            type: 'list',
                            name: 'href',
                            message: `Applikasjon?`,
                            choices: choices,
                            pageSize: choices.length + 10
                        }]
                    );
                }
            })
            .then((choice) => open(choice.href))
            .catch((err) => logging.error(err));
    }
};
