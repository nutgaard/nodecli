const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const Utils = require('./utils');

class SjekkCommand extends Command {
    execute(query, ...envs) {
        if (!query || query.length === 0) {
            logging.error('Må sende med query...');
            return;
        }
        if (!envs || envs.length === 0) {
            logging.error('Må sende med envs...');
            return;
        }

        return Utils.getVersions(query, envs)
            .then(Utils.printApplicationTableFor(envs));
    }

    help() {
        return {
            args: '<query> <env1> <envN>',
            msg: 'Prints the version for application matching `query` and `envs`'
        }
    }
}

module.exports = new SjekkCommand();