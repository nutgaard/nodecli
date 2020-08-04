#!/usr/bin/env node
const logging = require('./../utils/logging');
const open = require('open');
const argv = require('yargs').argv;

const isUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
function validURL(str) {
    return !!pattern.test(str);
}

const command = argv._.splice(0, 1);
const commands = {
    jira: require('./jira'),
    pr: require('./pr'),
    stash: require('./stash')
};

if (!commands[command]) {
    if (!!isUrl.test(command[0])) {
        open(command[0]);
        return;
    } else {
        logging.error('Unknown command');
        return;
    }
}

commands[command](...argv._);
logging.spacer();
