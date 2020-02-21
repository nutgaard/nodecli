const Command = require('./../utils/cliutils').Command;
const clip = require('clipboardy');
const log = require('./../utils/logging');
const Utils = require('./utils');

class LoginCmdCommand extends Command {
    execute(...args) {
        const config = Utils.parseInput(args);

        const namespace = config.namespace ? ` -n${config.namespace}` : '';
        const cmd = `kubectl exec ${config.grep || '<pod>'} -i -t${namespace} -- bash -il`;
        clip.write(cmd);

        log.info("Writter to clipboard: ", cmd);
    }

    help() {
        return {
            args: '[namespace] [pod]',
            msg: 'Prints command for logging into bash-shell of container'
        }
    }
}

module.exports = new LoginCmdCommand();