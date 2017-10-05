const cp = require('child_process');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const Fetcher = require('./../utils/fetch');

function loginInto(node) {
    getCredentialsFromFasit(node)
        .then((password) => {
            // Some magic to create a fully-standalone non-blocking process
            let cmd = `-ssh deployer@${node} -pw ${password}`.split(' ');
            const subprocess = cp.spawn('putty', cmd, { detached: true, stdio: 'ignore' });
            subprocess.unref();
        });
}

function getCredentialsFromFasit(node) {
    return Fetcher.fetchJson(`https://fasit.adeo.no/api/v2/nodes/${node}`)
        .then((resp) => Fetcher.fetchText(resp.password.ref));
}

function getHostname(environment, application) {
    return Fetcher.fetchJson(`https://fasit.adeo.no/api/v2/applicationinstances?environment=${environment}&application=${application}`)
        .then((resp) => resp[0].cluster.ref)
        .then((clusterRef) => Fetcher.fetchJson(clusterRef))
        .then((cluster) => cluster.nodes.map((node) => node.name))
        .then((nodes) => { nodes.sort(); return nodes; })
}

module.exports = function(environment, application, num) {
    if (!environment) {
        logging.error("You must specify an environment.");
    } else if (!application) {
        logging.error("You must specify an application.");
    } else {
        getHostname(environment, application)
            .then((nodes) => {
                if (nodes.length === 1) {
                    loginInto(nodes[0]);
                } else if (num) {
                    loginInto(nodes[num - 1]);
                } else {
                    logging.info('There are several nodes for %s in %s. Please specify which one you want to log into', application, environment);
                    inquirer.prompt([{
                        type: 'checkbox',
                        name: 'nodes',
                        message: `Hvilke noder vil du logge inn på?`,
                        choices: nodes
                    }]).then((answer) => answer.nodes.forEach(loginInto));
                }
            });
    }
};