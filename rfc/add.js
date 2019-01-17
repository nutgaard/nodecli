const Command = require('./../utils/cliutils').Command;
const logging = require('./../utils/logging');
const LocalStorage = require('./../utils/localstorage');

const data = new LocalStorage('RFC-Checker');

module.exports = class AddCommand extends Command {
    execute(app) {
        const apps = data.get('apps') || [];
        if (apps.includes(app)) {
            logging.info(`${app} already exists`);
        } else {
            apps.push(app);
            data.set('apps', apps);
            logging.info(`${app} added`);
        }
    }

    help() {
        return {
            args: '<app-name>',
            msg: 'Adds app to RFC-watchlist'
        };
    }
}