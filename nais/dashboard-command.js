const Command = require('./../utils/cliutils').Command;
const Utils = require('./utils');
const execa = require('execa');
const open = require('open');

function startDashboard() {
    const cmd = execa('kubectl', 'port-forward deployment/kubernetes-dashboard 9090:9090 --namespace kubernetes-dashboard'.split(' '));
    cmd.stdout.pipe(process.stdout);
    cmd.catch((error) => console.log('error', error));
}

class DashboardCommand extends Command {
    execute(...args) {
        const config = Utils.parseInput(args);
        if (config.context) {
            console.log(Utils.setContext(config.context).join('\n'));
        }

        startDashboard();
        if (config.namespace || config.grep) {
            open(`http://localhost:9090/#!/search?namespace=${config.namespace || 'default'}&q=${config.grep || ''}`);
        } else {
            open('http://localhost:9090');
        }
    }

    help() {
        return {
            args: '[context] [namespace] [application]',
            msg: 'Open kubernetes dashboard for current/or given context, namespace and application'
        }
    }
}

module.exports = new DashboardCommand();