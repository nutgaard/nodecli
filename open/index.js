#!/usr/bin/node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    jira: require('./jira'),
    pr: require('./pr'),
    stash: require('./stash')
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer();
