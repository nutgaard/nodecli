#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const Prepare = require('./prepare');
const Checkdocks = require('./check');
const LostdocUpdate = require('./update');

const cli = new Cli('start', {
    'prepare': new Prepare(),
    'check': new Checkdocks(),
    'update': new LostdocUpdate()
});

cli.run();