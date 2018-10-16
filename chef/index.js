#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const SearchCommand = require('./search');

new Cli('chef', {
    search: new SearchCommand()
}).run();