#!node
const yargs = require('yargs');

const yargsconfig = yargs
    .usage('login <command> [options]')
    .command('ssh', 'Log in to a node')
    .example('login ssh t4 henvendelse', 'Log into henvendelse in t4. Prompts you if more than one node')
    .example('login ssh t1 henvendelse 1', 'Log into the first node of henvendelse in t1 ')
    .example('login nodes t4 henvendelse', 'Lists all nodes for henvendelse in t4')
    .help('h')
    .alias('h', 'help');

const argv = yargsconfig.argv;

/*--- PROGRAM START ---*/
const command = argv._.splice(0, 1);

const actions = {};
actions['ssh'] = require('./login');
actions['nodes'] = require('./nodes');

(actions[command] || yargsconfig.showHelp)(...argv._);
