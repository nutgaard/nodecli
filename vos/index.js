#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const LostdocUpdate = require('./lostdoc-update');

const cli = new Cli('start', {
    'update': new LostdocUpdate()
});


cli.run();