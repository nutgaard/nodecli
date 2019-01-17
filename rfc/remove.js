const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');
const data = new LocalStorage('RFC-Checker');

module.exports = class RemoveCommand extends Command {
    execute(app) {
        const apps = data.get('apps');
        const index = apps.indexOf(app);
        if (index < 0) {
            logging.info(`Could not find ${app}`);
        } else {
            apps.splice(index, 1);
            data.set('apps', apps);
            logging.info(`${app} removed`);
        }
    }

    help() {
        return {
            args: '<app-name>',
            msg: 'Removes app from RFC-watchlist'
        };
    }
}