const Utils = require('./utils');
const inquirer = require('inquirer');
const request = require('request-promise');
const open = require('open');
const diffCommand = require('./diff-command');
const miljoMapper = require('./miljoer');

const brukernavn = process.env.domenebrukernavn;
const passord = process.env.domenepassord;

const jiraUrl = 'https://jira.adeo.no';
const auth = brukernavn + ':' + passord;

function promptApps(query, env1, env2) {
    return (data) => inquirer.prompt([{
        type: 'checkbox',
        name: 'apps',
        message: `Hvilke applikasjoner vil du løfte til ${env2}?`,
        choices: Object.keys(data)
    }]).then((apps) => ({ apps: apps.apps, data, query, env1, env2 }))
}

function deployApps({ apps, data, query, env1, env2 }) {
    const deploys = apps.map((app) => {
        Utils.info(`Bestiller til ${app}:${data[app][env1][0].version} til ${env2} (${miljoMapper[env2]})`);
        return deploy(app, data[app][env1][0].version, miljoMapper[env2])
            .then((res) => {
                Utils.info(`Bestilt ${res.key} (${app})`);
                return res;
            });
    });

    Utils.settled(...deploys).then((results) => {
        const feiledDeploys = results.filter((result) => !result.ok);
        const okDeploys = results.filter((result) => result.ok);

        if (feiledDeploys.length !== 0) {
            Utils.error(`${feiledDeploys.length} deploys feilet...`);
        }
        if (okDeploys.length !== 0) {
            Utils.info(`${okDeploys.length} deploys bestilt ok...`);
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

function deploy(app, version, miljo) {
    const json = {
        fields: {
            project: {
                key: 'DEPLOY'
            },
            issuetype: {
                id: '10902'
            },
            customfield_14811: {
                id: miljo,
                value: miljo
            },
            customfield_14812: app + ':' + version,
            summary: 'Automatisk deploy'
        }
    };

    return post(`${jiraUrl}/rest/api/2/issue`, brukernavn, passord, json)
        .catch((error) => {
            Utils.error("Noe gikk feil", error);
            return {
                ok: false
            };
        });
}

function post(url, username, password, json) {
    return request({
        method: 'POST',
        uri: url,
        body: json,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            user: username,
            pass: password
        }
    });
}

module.exports = function (query, env1, env2) {
    if (!query || query.length === 0) {
        Utils.error('Må sende med query...');
        return;
    }
    if (!env1 || env1.length === 0) {
        Utils.error('Må sende med env1...');
        return;
    }
    if (!env2 || env2.length === 0) {
        Utils.error('Må sende med env2...');
        return;
    }

    diffCommand(query, env1, env2)
        .then(promptApps(query, env1, env2))
        .then(deployApps)
    ;
};