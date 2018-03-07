const Command = require('./../utils/cliutils').Command;
const GitUtils = require('./../utils/gitutils');
const openCi = require('./../open/ci');


class CiCommand extends Command {
    execute(...args) {
        const appname = GitUtils.getAppname();
        return openCi(appname);
    }

    help() {
        return {
            args: '',
            msg: 'Opens bekkCI for current application'
        };
    }
}

module.exports = new CiCommand();