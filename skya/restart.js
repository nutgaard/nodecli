const cp = require('child_process');
const Levenshtein = require('levenshtein');
const logging = require('./../utils/logging');
const inquirer = require('inquirer');
const Fetcher = require('./../utils/fetch');

function restartNode(node, appname) {
    getCredentialsFromFasit(node)
        .then((password) => {
            // Some magic to create a fully-standalone non-blocking process
            let cmd = `-ssh deployer@${node} -pw ${password} sudo /etc/init.d/jboss-${appname} restart`.split(' ');
            cp.spawn('plink', cmd, { stdio: 'inherit' });
        });
}

function getCredentialsFromFasit(node) {
    return Fetcher.fetchJson(`https://fasit.adeo.no/api/v2/nodes/${node}`)
        .then((resp) => Fetcher.fetchText(resp.password.ref));
}

function getHostname(environment, application) {
    return Fetcher.fetchJson(`https://fasit.adeo.no/api/v2/applicationinstances?environment=${environment}&application=${application}&usage=true`)
        .then((resp) => resp.sort((a, b) => new Levenshtein(a.application, b.application).distance))
        .then((resp) => ({ clusterRef: resp[0].cluster.ref, application: resp[0].application}))
        .then(({ clusterRef, application }) => Fetcher.fetchJson(clusterRef).then((cluster) => ({ cluster, application })))
        .then(({ cluster, application }) => ({ nodes: cluster.nodes.map((node) => node.name), application }))
        .then(({ nodes, application }) => { nodes.sort(); return { nodes, application}; })
}

module.exports = function(environment, application) {
    if (!environment) {
        logging.error("You must specify an environment.");
    } else if (!application) {
        logging.error("You must specify an application.");
    } else {
        getHostname(environment, application)
            .then(({ nodes, application: applicationName}) => {
                nodes.forEach((node) => restartNode(node, applicationName));
            });
    }
};