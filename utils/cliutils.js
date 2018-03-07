const logging = require('./../utils/logging');
const argv = require('yargs').argv;

function pad(str, length, padding = ' ') {
    const padSize = length - str.length;
    if (padSize < 1) {
        return str;
    }
    const padStr = new Array(padSize).fill(padding).join('');
    return `${str}${padStr}`;
}
function array(value) {
    return Array.isArray(value) ? value : [value];
}

class CmdLogger {
    constructor(name, cmds) {
        this.name = name;
        this.cmds = cmds || [];
    }

    add(cmd, msg) {
        this.cmds.push({ cmd, msg });
    }

    print() {
        logging.spacer(2);
        const length = logging.info(`Basic usage for \`${this.name}\`-cli`);
        logging.line(length);
        logging.spacer();

        const maxCmd = this.cmds.reduce((acc, e) => Math.max(acc, e.cmd.length), 0);
        const columnWidth = maxCmd + 8;

        this.cmds.forEach((entry) => {
            logging.pure(`${pad(entry.cmd, columnWidth)}- ${entry.msg}`);
        });

        logging.spacer(2);
    }
}

class Command {
    constructor(execFn, helpFn) {
        this.execFn = execFn;
        this.helpFn = helpFn;
    }

    execute(...args) {
        if (this.execFn) {
            return this.execFn(...args);
        } else {
            logging.error('You have to implement `execute`', args);
        }
    }
    help() {
        if (this.helpFn) {
            return this.helpFn();
        } else {
            logging.error('You have to implement `help`');
        }
    }
}

class Cli {
    constructor(name, commands, debug = false) {
        if (commands.hasOwnProperty('help')) {
            logging.error('`help` command is reserved...');
            return;
        }

        this.name = name;
        const helpCmd = new Command(this.printHelp.bind(this), () => ({ args: '', msg: 'Print the help' }));
        this.commands = Object.assign({}, commands, {help: helpCmd});

        if (debug) {
            global.logLevel = logging.logLevels.DEBUG;
        }
    }

    run() {
        const command = argv._.splice(0, 1)[0] || '';
        logging.debug('Found command', command);
        const commandExec = this.commands[command];

        if (!commandExec) {
            this.printHelp();
        } else {
            commandExec.execute(...argv._);
            logging.spacer();
        }
    }

    printHelp() {
        const helplines = Object.entries(this.commands)
            .map(([cmdName, cmdImpl]) => [cmdName, array(cmdImpl.help())])
            .map(([cmdName, cmdHelplines]) => {
                return cmdHelplines
                    .map(({ args, msg}) => ({
                        cmd: `${this.name} ${cmdName} ${args}`,
                        msg
                    }))
            })
            .reduce((acc, list) => [...acc, ...list], []);

        const cmdLogger = new CmdLogger(this.name, helplines);
        cmdLogger.print();
    }
}

module.exports = {
    Cli,
    Command
};