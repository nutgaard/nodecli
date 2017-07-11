#!node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    lift: require('./lift-command'),
    diff: require('./diff-command'),
    sjekk: require('./sjekk-command'),
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer(2);
