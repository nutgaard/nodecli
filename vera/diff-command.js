const chalk = require('chalk');
const fetch = require('node-fetch');
const Table = require('cli-table');
const Utils = require('./utils');

function print(env1, env2) {
    return (data) => {
        const tableRows = Object.entries(data)
            .map(([app, environments]) => {
                return [
                    app,
                    environments[env1][0].version,
                    environments[env2][0].version
                ];
            });

        let table = new Table({
            head: [
                chalk.white.bold('Application'),
                chalk.white.bold(env1),
                chalk.white.bold(env2)
            ]
        });
        table.push(...tableRows);
        console.log(table.toString());
        console.log('');
        console.log('');

        return data;
    };
}


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

    return Utils.getDiff(query, env1, env2)
        .then(print(env1, env2));
};