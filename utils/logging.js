const chalk = require('chalk');
const strip = require('strip-ansi');

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
    if (test(level)) {
        const message = `${level.prefix} ${msg}`;
        console.log(message, ...extra);
        return strip(message).length;
    }
    return -1;
}

function debug(msg, ...extra) {
    return log(DEBUG, msg, ...extra);
}

function info(msg, ...extra) {
    return log(INFO, msg, ...extra);
}

function warn(msg, ...extra) {
    return log(WARN, msg, ...extra);
}

function error(msg, ...extra) {
    return log(ERROR, msg, ...extra);
}

function fatal(msg, ...extra) {
    return log(FATAL, msg, ...extra);
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