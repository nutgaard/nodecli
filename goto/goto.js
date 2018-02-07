#!node
const fs = require('fs');
const path = require('path');
const clip = require('clipboardy');
const argv = require('yargs').argv;
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const Localstorage = require('./../utils/localstorage');

const storage = new Localstorage("goto");

function isDirectory(dir) {
    return fs.lstatSync(dir).isDirectory();
}

function scan(dirs) {
    const foundDirs = dirs
        .map((dir) => {
            return fs.readdirSync(dir)
                .map((name) => path.join(dir, name))
                .filter(isDirectory)
        })
        .reduce((list, sublist) => [...list, ...sublist], []);
    storage.set('cache', foundDirs);

    logging.info(`Found ${foundDirs.length} directories.`);
}
function changeTo(dir) {
    console.log('changeTo', dir);
    clip.writeSync(`cd ${dir}\r`);
}

if (!storage.has('cache')) {
    logging.error('Could not find directories to scan... ');
    logging.error('Please use `godirs add <directory>`');
    return;
}

const cache = storage.get('cache');
const query = argv._.splice(0, 1)[0];

let matches = cache
    .filter((cacheline) => cacheline.includes(query));

if (matches.length === 0) {
    logging.info('Found no matches, rescanning dirs...');
    scan(storage.get('dirs'));
}

if (matches.length === 0) {
    logging.info('Found no matches after rescanning...');
} else if (matches.length === 1) {
    changeTo(matches[0]);
} else {
    inquirer.prompt([{
        type: 'list',
        name: 'dir',
        message: `Which directory would you jump to?`,
        pageSize: matches.length + 50,
        choices: matches
    }]).then((answer) => changeTo(answer.dir));
}

console.log('goto', query);
