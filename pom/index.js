#!node
const Cli = require('./../utils/cliutils').Cli;

const cli = new Cli('pom', {
    filter: require('./filter'),
    unique: require('./unique')
});

cli.run();
