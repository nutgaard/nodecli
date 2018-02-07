#!node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    vera: require('./vera'),
    stash: require('./stash'),
    fasit: require('./fasit'),
    cisbl: require('./cisbl'),
    ci: require('./ci'),
    app: require('./app'),
    pr: require('./pr'),
    jira: require('./jira'),
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer();
