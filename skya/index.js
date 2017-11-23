#!node
const yargs = require('yargs');

const yargsconfig = yargs
    .usage('skya <command> [options]')
    .command('ssh', 'Log in to a node')
    .command('nodes', 'List nodes')
    .command('restart', 'Restarts application in environment')
    .example('skya ssh t4 henvendelse', 'Log into henvendelse in t4. Prompts you if more than one node')
    .example('skya ssh t1 henvendelse 1', 'Log into the first node of henvendelse in t1 ')
    .example('skya nodes t4 henvendelse', 'Lists all nodes for henvendelse in t4')
    .example('skya restart t4 henvendelse', 'Restarts all instances of henvendelse in t4')
    .help('h')
    .alias('h', 'help');

const argv = yargsconfig.argv;

/*--- PROGRAM START ---*/
const command = argv._.splice(0, 1);

const actions = {};
actions['ssh'] = require('./login');
actions['nodes'] = require('./nodes');
actions['restart'] = require('./restart');

(actions[command] || yargsconfig.showHelp)(...argv._);
