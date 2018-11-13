const chalk = require('chalk');
const strip = require('strip-ansi');

const DEBUG = { level: 1, prefix: chalk.blue('[DEBUG]') };
const INFO = { level: 2, prefix: chalk.white('[INFO]') };
const WARN = { level: 3, prefix: chalk.yellow('[WARN]') };
const ERROR = { level: 4, prefix: chalk.red('[ERROR]') };
const FATAL = { level: 5, prefix: chalk.bold.red('[ERROR]') };
const OK = { level: 5, prefix: chalk.green('[OK]') };
const logLevels = {
    DEBUG,
    INFO,
    WARN,
    ERROR
};

let memory = [];

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

function ok(msg, ...extra) {
    return log(OK, msg, ...extra);
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
function line(length = 15) {
    pure(new Array(length).fill('-').join(''));
}


function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
function padTo(lengths) {
    return (str, index) => {
        const padLength = lengths[index] - strip(str.toString()).length;
        const padding = new Array(padLength).fill(' ').join('');
        return `${str}${padding}`;
    }
}
function table(data, formatter) {
    if (data.length === 0) {
        return;
    }
    const headers = Object.keys(data[0]);
    const columnValues = headers.map((header) => [header].concat(data.map((line) => line[header])));
    const columnWidth = columnValues.map((values, columnIndex) => {
        const columnId = headers[columnIndex];
        const formatting = (formatter && formatter[columnId]) || ((s) => s);
        return values
            .map(formatting)
            .map((s) => strip(s.toString()).length)
            .reduce((a, b) => Math.max(a, b), 0);
    });

    const headerLog = `| ${headers.map(capitalize).map(padTo(columnWidth)).join(' | ')} |`;
    line(headerLog.length);
    pure(headerLog);
    line(headerLog.length);
    data.forEach((row) => {
        const rowLog = Object.keys(row)
            .map((key, columnIndex) => {
                const columnId = headers[columnIndex];
                const formatting = (formatter && formatter[columnId]) || ((s) => s);
                return formatting(row[key]);
            })
            .map(padTo(columnWidth));
        pure(`| ${rowLog.join(' | ')} |`);
    });
    line(headerLog.length);
}

function createCollector(fn) {
    return (...args) => {
        memory.push(() => fn(...args));
    }
}

const collector = {
    debug: createCollector(debug),
    info: createCollector(info),
    warn: createCollector(warn),
    error: createCollector(error),
    ok: createCollector(ok),
    fatal: createCollector(fatal),
    pure: createCollector(pure),
    spacer: createCollector(spacer),
    line: createCollector(line),
    table: createCollector(table),
    flush: () => {
        memory.forEach((fn) => fn());
        memory = [];
    }
};

module.exports = {
    logLevels,
    collector,
    debug,
    info,
    warn,
    error,
    ok,
    fatal,
    pure,
    spacer,
    line,
    table
};