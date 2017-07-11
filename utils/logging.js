const chalk = require('chalk');

const DEBUG = { level: 1, prefix: chalk.blue('[DEBUG]') };
const INFO = { level: 2, prefix: chalk.white('[INFO]') };
const WARN = { level: 3, prefix: chalk.yellow('[WARN]') };
const ERROR = { level: 4, prefix: chalk.red('[ERROR]') };
const FATAL = { level: 5, prefix: chalk.bold.red('[ERROR]') };
const logLevels = {
    DEBUG,
    INFO,
    WARN,
    ERROR
};

global.logLevel = logLevels.INFO;

function test(level) {
    return level.level >= global.logLevel.level;
}

function log(level, msg, ...extra) {
    test(level) && console.log(`${level.prefix} ${msg}`, ...extra);
}

function debug(msg, ...extra) {
    log(DEBUG, msg, ...extra);
}

function info(msg, ...extra) {
    log(INFO, msg, ...extra);
}

function warn(msg, ...extra) {
    log(WARN, msg, ...extra);
}

function error(msg, ...extra) {
    log(ERROR, msg, ...extra);
}

function fatal(msg, ...extra) {
    log(FATAL, msg, ...extra);
}
function pure(...args) {
    console.log(...args);
}
function spacer(nof = 1) {
    for (let i = 0; i < nof; i++) {
        console.log('');
    }
}

module.exports = {
    logLevels,
    debug,
    info,
    warn,
    error,
    fatal,
    pure,
    spacer
};