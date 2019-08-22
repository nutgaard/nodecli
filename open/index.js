#!node
const CliUtils = require('./../utils/cliutils');
// const logging = require('./../utils/logging');
// const argv = require('yargs').argv;
const Cli = CliUtils.Cli;

const VeraCommand = CliUtils.migrate(require('./vera'), { args: '<query> <env>', msg: 'Opens Vera with predefined search' });
const StashCommand = CliUtils.migrate(require('./stash'), { args: '<query>', msg: 'Opens Stash with predefined search' });
const FasitCommand = CliUtils.migrate(require('./fasit'), { args: '<query>', msg: 'Opens Fasit with predefined search' });
const CiCommand = require('./ci');
const PrCommand = CliUtils.migrate(require('./pr'), { args: '', msg: 'Opens PR for current branch' });
const JiraCommand = CliUtils.migrate(require('./jira'), { args: '<issue>', msg: 'Opens Jira-issue' });

const cli = new Cli('open', {
    'vera': VeraCommand,
    'stash': StashCommand,
    'fasit': FasitCommand,
    'ci': new CiCommand(),
    'pr': PrCommand,
    jira: JiraCommand
});

cli.run();

//
// const command = argv._.splice(0, 1);
// const commands = {
//     vera: require('./vera'),
//     stash: require('./stash'),
//     fasit: require('./fasit'),
//     cisbl: require('./cisbl'),
//     ci: require('./ci'),
//     app: require('./app'),
//     pr: require('./pr'),
//     jira: require('./jira'),
// };
//
// if (!commands[command]) {
//     logging.error('Unknown command');
//     return;
// }
//
// commands[command](...argv._);
// logging.spacer();
