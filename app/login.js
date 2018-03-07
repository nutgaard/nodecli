const Command = require('./../utils/cliutils').Command;
const GitUtils = require('./../utils/gitutils');
const login = require('./../skya/login');


class LoginCommand extends Command {
    execute(environment) {
        const appname = GitUtils.getAppname();
        return login(environment, appname);
    }

    help() {
        return {
            args: '<env>',
            msg: 'Log into server for current application'
        };
    }
}

module.exports = new LoginCommand();