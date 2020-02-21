const Command = require('./../utils/cliutils').Command;
const log = require('./../utils/logging');
const Utils = require('./utils');

class ContextCommand extends Command {
    execute(...args) {
        const config = Utils.parseInput(args);
        if (args.length === 0 || !config.context) {
            log.error('Error calling login.');
            log.error('nais context [context]');
            process.exit(1);
        }

        log.pure(Utils.setContext(config.context).join('\n'));
    }

    help() {
        return {
            args: '[context]',
            msg: 'Sets current context'
        }
    }
}

module.exports = new ContextCommand();