#!/usr/local/bin/node
const logging = require('./../utils/logging');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    list: require('./list'),
    prune: require('./prune'),
    checkout: require('./checkout'),
    co: require('./checkout')
};

if (!commands[command]) {
    logging.error('Unknown command');
    return;
}

commands[command](...argv._);
logging.spacer();
