#!node
const argv = require('yargs').argv;
const logging = require('./../utils/logging');
const Utils = require('./utils');

const fileQuery = argv._[0];

const lineCounter = Utils.getFiles(process.cwd(), fileQuery)
    .map((file) => Utils.getLineCount(file).then((lines) => ({ file, lines })));

Promise.all(lineCounter)
    .then((files) => {
        const l = logging.info(`Fant ${files.length} filer...`);
        logging.pure(new Array(l).fill('-').join(''));
        logging.spacer();

        files
            .forEach((file) => logging.pure(`${file.lines}\t${file.file}`));

        logging.spacer();
        logging.pure(new Array(l).fill('-').join(''));
        const sum = files
            .reduce((a, b) => a + b.lines, 0);
        logging.pure(`${sum}\tSUM LINES`);
        logging.pure(`${files.length}\tFILES`);
        logging.spacer();
    });
