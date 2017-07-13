#!node
const argv = require('yargs').argv;
const logging = require('./../utils/logging');
const jiradeploy = require('./../utils/jiradeploy');
const miljoMapper = require('./../utils/miljoer');
const inquirer = require('inquirer');
const LocalStorage = require('./../utils/localstorage');
const localstorage = new LocalStorage('deploy');
const open = require('open');

const jiraUrl = 'https://jira.adeo.no';
const apps = localstorage.get('apps') || [];

const [application, environment, version] = argv._;

if (argv._.length === 0 || argv._[0] === 'help' || argv._[0] === '?' || argv._[0] === 'h') {
    logging.info('Usage: deploy <appname> <environment> <version>');
    return;
}

if (!version) {
    logging.error('Version must be defined');
    return;
}

if (!Object.keys(miljoMapper).includes(environment)) {
    logging.error('Could not find environment: ', environment);
    return;
}

let appnamePromise = null;
let hadAppname = true;
if (!apps.includes(application)) {
    logging.info('Unknown application, verify name...');
    hadAppname = false;
    appnamePromise = inquirer.prompt([{
        type: 'input',
        name: 'application',
        default: application,
        message: 'Application name',
    }]);
} else {
    appnamePromise = Promise.resolve(({ application }));
}

appnamePromise
    .then(({ application }) => {
        if (!hadAppname) {
            localstorage.setAll({ apps: [...apps, application ]});
        }

        jiradeploy(application, version, miljoMapper[environment])
            .then((data) => {
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'open',
                    message: 'Åpne i browser?',
                    'default': true
                }]).then((prompt) => {
                    if (prompt.open) {
                        open(jiraUrl + '/browse/' + data.key);
                    }
                })
            });
    });
