const fs = require('fs');
const path = require('path');
const Logging = require('./../utils/logging');
const Command = require('./../utils/cliutils').Command;
const Utils = require('./utils');

class FilterCommand extends Command {
    help() {
        return {
            args: '[file]',
            msg: 'Cleans file from dependency:tree into something more manageble'
        };
    }


    execute(filename = 'tree.txt') {
        const file = path.join(process.cwd(), filename);
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        Utils
            .cleanup(lines)
            .forEach((line) => Logging.pure(line));
    }
}

module.exports = new FilterCommand();