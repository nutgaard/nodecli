#!node
const fetchImpl = require('node-fetch');
const chalk = require('chalk');
const logging = require('./../utils/logging');
const Table = require('cli-table');
const argv = require('yargs').argv;

const fetch = (...args) => fetchImpl(...args)
    .then((resp) => {
        if (!resp.ok) {
            const error = new Error('Fetch failed...');
            error.body = resp.text();
            throw error;
        } else {
            return resp.json();
        }
    }, (error) => {
        throw new Error('Fetch failed', resp.text())
    });

const fasitApi = 'https://fasit.adeo.no/api/v2';

const command = argv._.splice(0, 1);
const commands = {
    app: checkApp,
    list: listApps
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer(2);


function checkApp(application, env) {
    logging.info(`Finding cluster from ${application}.`);

    fetch(`${fasitApi}/applicationinstances/application/${application}?usage=true&page=0&pr_page=100`)
        .then((appInfos) => {
            if (env) {
                const appInfo = appInfos.find((appInfo) => appInfo.environment === env);
                if (!appInfo) {
                    logging.error(`Fant ikke ${application} in ${env}.`)
                } else {
                    logging.info(`Application ${application} in ${env}.`);
                    logging.info(`Clustername ${appInfo.cluster.name}`);
                }
            } else {
                let table = new Table({
                    head: [
                        chalk.white.bold('Environment'),
                        chalk.white.bold('Cluster')
                    ]
                });
                const data = appInfos
                    .map((appInfo) => ({
                        [appInfo.environment]: appInfo.cluster.name
                    }));

                table.push(...data);
                logging.pure(table.toString());
                logging.spacer(2);
            }
        }, (error) => {
            error.body.then((message) => logging.error(message));
        });
}
function listApps(clusterName, env) {
    logging.info(`Finding apps in ${clusterName}.`);
    fetch(`${fasitApi}/environments/${env}/clusters/${clusterName}`)
        .then((clusterInfo) => {
            const length = logging.info(`Clustername ${clusterName} for ${env}`);

            logging.pure(new Array(length).fill('-').join(''));

            clusterInfo.applications.forEach((app) => logging.info(app.name));
        }, (error) => {
            error.body.then((message) => logging.error(message));
        });
}