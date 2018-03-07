const Utils = require('./utils');
const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const open = require('open');
const miljoMapper = require('./../utils/miljoer');
const jiradeploy = require('./../utils/jiradeploy');

const jiraUrl = 'https://jira.adeo.no';

function promptApps(query, env1) {
    return (data) => inquirer.prompt([{
        type: 'checkbox',
        name: 'apps',
        message: `Hvilke applikasjoner vil du løfte til ${env1}?`,
        choices: Object.keys(data)
    }]).then((apps) => ({ apps: apps.apps, data, query, env1 }))
}

function deployApps({ apps, data, env1 }) {
    const deploys = apps.map((app) => {
        logging.info(`Bestiller til ${app}:${data[app][env1][0].version} til ${env1} (${miljoMapper[env1]})`);
        return jiradeploy(app, data[app][env1][0].version, miljoMapper[env1])
            .then((res) => {
                logging.info(`Bestilt ${res.key} (${app})`);
                return res;
            });
    });

    Utils.settled(...deploys).then((results) => {
        const feiledDeploys = results.filter((result) => !result.ok);
        const okDeploys = results.filter((result) => result.ok);

        if (feiledDeploys.length !== 0) {
            logging.error(`${feiledDeploys.length} deploys feilet...`);
        }
        if (okDeploys.length !== 0) {
            logging.info(`${okDeploys.length} deploys bestilt ok...`);
            inquirer.prompt([{
                type: 'confirm',
                name: 'open',
                message: 'Åpne i browser?',
                'default': true
            }]).then((prompt) => {
                if (prompt.open) {
                    okDeploys.forEach((deploy) => {
                        open(jiraUrl + "/browse/" + deploy.data.key);
                    })
                }
            })
        }
    })
}

class RedeployCommand extends Command {
    execute(query, env1) {
        if (!query || query.length === 0) {
            logging.error('Må sende med query...');
            return;
        }
        if (!env1 || env1.length === 0) {
            logging.error('Må sende med env1...');
            return;
        }

        Utils.getVersions(query, [env1], false)
            .then(promptApps(query, env1))
            .then(deployApps);
    }

    help() {
        return {
            args: '<query> <env1>',
            msg: 'Redeployes applications matchin `query` in `env1`'
        }
    }
}

module.exports = new RedeployCommand();