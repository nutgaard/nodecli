const open = require('open');
const logging = require('./../utils/logging');
const fetchImpl = require('node-fetch');
const inquirer = require('inquirer');
const fetch = (...args) => fetchImpl(...args)
    .then((resp) => {
        if (!resp.ok) {
            logging.error(resp);
            throw new Error('Fetch failed', resp)
        } else {
            return resp.json();
        }
    }, (error) => {
        logging.error(resp);
        throw new Error('Fetch failed', resp)
    });



const fasitApi = 'https://fasit.adeo.no/api/v2';
function getApplications(query, env) {
    return fetch(`${fasitApi}/applicationinstances?environment=${env}&application=${query}&usage=true`);
}

function openInBrowser(app) {
    const lbConfigs = app.usedresources.filter((resource) => resource.type === 'loadbalancerconfig');
    if (lbConfigs.length === 0) {
        logging.error('Fant ingen LoadBalancerConfig...');
        return;
    }
    const lbConfigId = lbConfigs[0].id;

    fetch(`${fasitApi}/resources/${lbConfigId}`)
        .then((lbConfig) => `https://${lbConfig.properties.url}/${lbConfig.properties.contextRoots}`)
        .then((url) => open(url));
}

// open app internarb t6
module.exports = function(query, environment) {
    if (query === '.') {
        const path = process.cwd().split('\\');
        query = path[path.length - 1];
    }
    getApplications(query, environment)
        .then((apps) => {
            if (apps.length === 0) {
                logging.info(`Fant ingen tref for '${query}:${environment}'`);
                return;
            } else if (apps.length === 1) {
                openInBrowser(apps[0]);
            } else {
                inquirer.prompt([{
                    type: 'list',
                    name: 'app',
                    message: 'Hvilken app vil du åpne?',
                    choices: apps.map((a) => ({ name: a.application, value: a }))
                }]).then((answer) => {
                    openInBrowser(answer.app);
                })
            }
        })
};