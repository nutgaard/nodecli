const Levenshtein = require('levenshtein');
const logging = require('./../utils/logging');
const Fetcher = require('./../utils/fetch');

function getHostname(environment, application) {
    return Fetcher.fetchJson(`https://fasit.adeo.no/api/v2/applicationinstances?environment=${environment}&application=${application}&usage=true`)
        .then((resp) => resp.sort((a, b) => {
            const d1 = new Levenshtein(application, a.application).distance;
            const d2 = new Levenshtein(application, b.application).distance;
            return d1 - d2;
        }))
        .then((resp) => resp[0].cluster.ref)
        .then((clusterRef) => Fetcher.fetchJson(clusterRef))
        .then((cluster) => cluster.nodes.map((node) => node.name))
        .then((nodes) => { nodes.sort(); return nodes; })
}

module.exports = function(environment, application) {
    if (!environment) {
        logging.error("You must specify an environment.");
    } else if (!application) {
        logging.error("You must specify an application.");
    } else {
        getHostname(environment, application)
            .then((nodes) => {
                const length = logging.info(`Found ${nodes.length} nodes for ${application} in ${environment}`);
                logging.line(length);

                nodes.forEach((node, i) => logging.pure(`${i+1}: ${node}`))
            });
    }
};
