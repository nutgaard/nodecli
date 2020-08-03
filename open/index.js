#!node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    stash: require('./stash'),
    pr: require('./pr'),
    jira: require('./jira'),
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer();
