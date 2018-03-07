#!node
const Cli = require('./../utils/cliutils').Cli;

const cli = new Cli('vera', {
    lift: require('./lift-command'),
    diff: require('./diff-command'),
    sjekk: require('./sjekk-command'),
    redeploy: require('./redeploy-command')
});

cli.run();
