const Command = require('./../utils/cliutils').Command;
const log = require('./../utils/logging');
const Utils = require('./utils');

class LoginCommand extends Command {
    execute(...args) {
        if (args.length === 0) {
            log.error('Error calling login.');
            log.error('nais login [context] [namespace] <search>');
            process.exit(1);
        }
        const config = Utils.parseInput(args);
        console.log('config', config);

        log.pure(Utils.setContext(config.context).join('\n'));

        const podMatches = Utils.getPods(config.namespace)
            .filter((pod) => {
                if (config.grep) {
                    return pod.name.includes(config.grep);
                }
                return true;
            });

        console.log(podMatches);
        if (podMatches.length === 1) {
            Utils.login(podMatches[0].name);
            log.info(`Logged into ${podMatches[0].name}`);
        } else {
            log.info(`Found ${podMatches.length} matches to query. Please refine search`);
            podMatches
                .forEach(({ name }) => log.pure(`\t${name}`));
        }
    }

    help() {
        return {
            args: '[context] [namespace] <search>',
            msg: 'Open kubernetes dashboard for current/or given context'
        }
    }
}

module.exports = new LoginCommand();