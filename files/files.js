#!node
const argv = require('yargs').argv;
const logging = require('./../utils/logging');
const Utils = require('./utils');

const fileQuery = argv._[0];

const files = Utils.getFiles(process.cwd(), fileQuery);

const l = logging.info(`Fant ${files.length} filer...`);
logging.pure(new Array(l).fill('-').join(''));
logging.spacer();

files.forEach((file) => logging.pure(file));
logging.spacer();
logging.info(`Fant ${files.length} filer...`)
logging.spacer();
