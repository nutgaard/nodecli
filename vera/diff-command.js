const fetch = require('node-fetch');
const Utils = require('./utils');

module.exports = function (query, env1, env2) {
    if (!query || query.length === 0) {
        Utils.error('Må sende med query...');
        return;
    }
    if (!env1 || env1.length === 0) {
        Utils.error('Må sende med env1...');
        return;
    }
    if (!env2 || env2.length === 0) {
        Utils.error('Må sende med env2...');
        return;
    }

    return Utils.getVersions(query, [env1, env2], true)
        .then(Utils.printApplicationTableFor([env1, env2]));
};