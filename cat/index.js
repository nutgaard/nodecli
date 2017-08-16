#!node
const argv = require('yargs').argv;
const fs = require('fs');
const path = require('path');
const logging = require('./../utils/logging');

const fileQuery = argv._[0];

if (!fileQuery) {
    logging.info(`Usage: cat <file>`);
    return;
}

const file = path.join(process.cwd(), fileQuery);

if (!fs.existsSync(file)) {
    logging.error(`File not found: ${file}`);
    return;
}

const stats = fs.statSync(file);
if (!stats.isFile()) {
    logging.error(`File not found: ${file}`);
    return;
}

fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .forEach((line) => logging.pure(line));

