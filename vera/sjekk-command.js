const fetch = require('node-fetch');
const Utils = require('./utils');

module.exports = function (query, ...envs) {
    if (!query || query.length === 0) {
        Utils.error('Må sende med query...');
        return;
    }
    if (!envs || envs.length === 0) {
        Utils.error('Må sende med envs...');
        return;
    }

    return Utils.getVersions(query, envs)
        .then(Utils.printApplicationTableFor(envs));
};