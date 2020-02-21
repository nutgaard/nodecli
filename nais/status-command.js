const Command = require('./../utils/cliutils').Command;
const log = require('./../utils/logging');
const Utils = require('./utils');

class StatusCommand extends Command {
    execute(...args) {
        if (args.length === 0) {
            log.error('Error calling login.');
            log.error('nais login [context] [namespace] <search>');
            process.exit(1);
        }

        const config = Utils.parseInput(args);
        const currentContext = Utils.getContext();

        log.spacer();
        if (!config.context || config.context === currentContext) {
            log.info(`Using existing context: ${currentContext}`)
        } else {
            log.info(Utils.setContext(config.context).join('\n'))
        }
        log.spacer();

        const pods = Utils.getPodsPureOutput(config.namespace);
        log.pure(pods.header);
        pods.data
            .filter((line) => line.includes(config.grep))
            .map((line) => log.pure(line));
    }

    help() {
        return {
            args: '[context] [namespace] <search>',
            msg: 'Prints status of pods in context and namespace'
        }
    }
}

module.exports = new StatusCommand();