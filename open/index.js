#!node
const chalk = require('chalk');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    vera: require('./vera'),
    stash: require('./stash'),
    fasit: require('./fasit'),
    cisbl: require('./cisbl')
};

if (!commands[command]) {
    console.log(`${chalk.red('ERROR')} Unknown command`);
    return;
}

commands[command](...argv._);
console.log('');
