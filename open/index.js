#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;

const StashCommand = require('./stash');
const CiCommand = require('./ci');
const PrCommand = require('./pr');
const JiraCommand = require('./jira');
const RFCCommand = require('./rfc');

const cli = new Cli('start', {
    'stash': new StashCommand(),
    'ci': new CiCommand(),
    'pr': new PrCommand(),
    'jira': new JiraCommand(),
    'rfc': new RFCCommand()
});


cli.run();