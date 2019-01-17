#!/usr/local/bin/node
const Cli = require('./../utils/cliutils').Cli;
const Command = require('./../utils/cliutils').Command;
const daemon = require('./daemon');

const AddCommand = require('./add');
const RemoveCommand = require('./remove');
const ListCommand = require('./list');

function daemonCommand(fn, helpData) {
    return class DaemonCommand extends Command {
        execute(...args) {
            return fn(...args);
        }

        help() {
            return helpData;
        }
    };
}

const StartCommand = daemonCommand(() => daemon.start(), {args: '', msg: 'Starts the checker-daemon'});
const StopCommand = daemonCommand(() => daemon.stop(), {args: '', msg: 'Stops the checker-daemon'});
const StatusCommand = daemonCommand(() => {
    if (daemon.status() !== 0) {
        console.log('RFC-Checker is running');
    } else {
        console.log('RFC-Checker is not running');
    }
}, {args: '', msg: 'Status of the checker-daemon'});

const cli = new Cli('rfc', {
    'add': new AddCommand(),
    'remove': new RemoveCommand(),
    'list': new ListCommand(),
    'start': new StartCommand(),
    'stop': new StopCommand(),
    'status': new StatusCommand()
});


cli.run();