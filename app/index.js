#!node
const Cli = require('./../utils/cliutils').Cli;

const cli = new Cli('app', {
    ci: require('./ci'),
    stash: require('./stash'),
    login: require('./login')
});
cli.run();
