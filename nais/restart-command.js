const Command = require('./../utils/cliutils').Command;
const log = require('./../utils/logging');
const Utils = require('./utils');

class RestartCommand extends Command {
    execute(context, namespace, appname) {
        if (!context || !namespace || !appname) {
            log.error("All args must be defined; <context> <namespace> <appname>");
            process.exit(1);
        }
        if (appname.length < 10) {
            log.error("Too short appname...");
            process.exit(1);
        }

        Utils.setContext(context);
        Utils.getPods(namespace)
            .filter(({ name }) => name.startsWith(appname))
            .filter(({ status }) => status === "Running")
            .forEach(({ name }) => {
                log.info(`Restarting ${name}`);
                log.pure(Utils.deletePod(namespace, name));
            });
    }

    help() {
        return {
            args: '<context> <namespace> <appname>',
            msg: 'Restarts app given context and namespace'
        }
    }
}

module.exports = new RestartCommand();