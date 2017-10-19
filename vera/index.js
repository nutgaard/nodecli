#!node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const helpCmd = require('./help-command');
const commands = {
    lift: require('./lift-command'),
    diff: require('./diff-command'),
    sjekk: require('./sjekk-command'),
    redeploy: require('./redeploy-command'),
    help: helpCmd
};

let cmd = commands[command];
if (!cmd) {
    logging.error('Unknown command');
    logging.spacer();
    cmd = helpCmd;
}

cmd(...argv._);
logging.spacer(2);
