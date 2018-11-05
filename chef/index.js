#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const SearchCommand = require('./search');
const GotoCommand = require('./goto');

new Cli('chef', {
    search: new SearchCommand(),
    goto: new GotoCommand()
}).run();