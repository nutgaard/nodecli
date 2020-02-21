#!node --max-buffer 20971520
const Cli = require('./../utils/cliutils').Cli;

const cli = new Cli('app', {
    ci: require('./ci'),
    stash: require('./stash'),
    login: require('./login'),
    sensitive: require('./sensitive')
});
cli.run();
