const logging = require('./../utils/logging');

function pad(str, length, padding = ' ') {
    const padSize = length - str.length;
    if (padSize < 1) {
        return str;
    }
    const padStr = new Array(padSize).fill(padding).join('');
    return `${str}${padStr}`;
}

class CmdLogger {
    constructor() {
        this.cmds = [];
    }

    add(cmd, msg) {
        this.cmds.push({ cmd, msg });
    }

    forEach(fn) {
        const maxCmd = this.cmds.reduce((acc, e) => Math.max(acc, e.cmd.length), 0);
        const columnWidth = maxCmd + 8;

        this.cmds.forEach((entry) => {
            fn(`${pad(entry.cmd, columnWidth)}- ${entry.msg}`);
        });
    }
}

module.exports = function () {
    const cmds = new CmdLogger();
    const length = logging.info('Basic usage for `vera`-cli');
    logging.line(length);
    logging.spacer();

    cmds.add('vera sjekk <query> <env1> <envN>', 'Prints the version for application matching `query` and `envs`');
    cmds.add('vera diff <query> <env1> <env2>', 'Prints the difference in versions for application matching `query`');
    cmds.add('vera lift <query> <env1> <env2>', 'Deployes the difference in versions for application matching `query` from `env1` to `env2`');
    cmds.add('vera redeploy <query> <env1>', 'Redeployes applications matchin `query` in `env1`');
    cmds.forEach(logging.pure);
};