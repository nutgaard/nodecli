const Command = require('./../utils/cliutils').Command;
const openStash = require('./../open/stash');


class CiCommand extends Command {
    execute(...args) {
        return openStash('.');
    }

    help() {
        return {
            args: '',
            msg: 'Opens stash/github for current application'
        };
    }
}

module.exports = new CiCommand();