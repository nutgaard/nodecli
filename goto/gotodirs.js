#!node
const argv = require('yargs').argv;
const path = require('path');
const logging = require('./../utils/logging');
const Localstorage = require('./../utils/localstorage');

const storage = new Localstorage("goto");

if (!storage.has('dirs')) {
    storage.setAll({ dirs: [], cache: [] });
    logging.info("Could not find existing config. Creating default...");
}

const command = argv._.splice(0, 1);

function add() {
    const current = storage.get('dirs');
    const newDir = process.cwd();

    if (!current.includes(newDir)) {
        storage.set('dirs', [...current, newDir]);
        logging.info(`Added '${newDir}...'`);
    } else {
        logging.info(`Already added...`);
    }
}
function remove() {
    let found = false;
    const current = storage.get('dirs');
    const rmdir = process.cwd();
    const newDirs = current
        .filter((dir) => dir !== rmdir);

    if (newDirs.length !== current.length) {
        storage.set('dirs', newDirs);
        logging.info(`Removed '${rmdir}...'`);
    } else {
        logging.info(`'${rmdir}' not found`);
    }
}
function list() {
    const l = logging.info('Listing scanned packages');
    logging.line(l);
    storage.get('dirs')
        .forEach((dir) => logging.pure(`* ${dir}`))
}


const commandMap = {
    add: add,
    del: remove,
    list: list
};

const execFn = commandMap[command[0].toLowerCase()];

execFn();