#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const LostdocUpdate = require('./lostdoc-update');
const Checkdocks = require('./checkdocs');
const Prepare = require('./prepare');

const cli = new Cli('start', {
    'update': new LostdocUpdate(),
    'check': new Checkdocks(),
    'prepare': new Prepare()
});


cli.run();