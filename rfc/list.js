const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const data = new LocalStorage('RFC-Checker');


module.exports = class ListCommand extends Command {
    execute() {
        const apps = data.get('apps') || [];
        apps.forEach((app) => logging.info(app))
    }

    help() {
        return {
            args: '',
            msg: 'Lists all current RFC watches'
        };
    }
}