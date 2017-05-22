#!node
const inquirer = require('inquirer');
const chalk = require('chalk');
const argv = require('yargs').argv;

const command = argv._.splice(0, 1);
const commands = {
    lift: require('./lift-command'),
    diff: require('./diff-command'),
};

if (!commands[command]) {
    console.log(`${chalk.red('ERROR')} Unknown command`);
    return;
}

commands[command](...argv._);
console.log('');
console.log('');
