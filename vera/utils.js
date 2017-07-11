const fetch = require('node-fetch');
const chalk = require('chalk');
const Table = require('cli-table');
const logging = require('./../utils/logging');

function groupBy(key) {
    return (acc, element) => {
        const value = element[key];
        const group = acc[value] || [];
        group.push(element);
        acc[value] = group;
        return acc;
    };
}

function mergeToObject(acc, obj) {
    return Object.assign(acc, obj);
}

function notSameVersion([app, environments]) {
    const baseVersion = environments[0].version;
    return !environments.every((env) => env.version === baseVersion);
}

function groupApplication(diffOnly = false) {
    const diffOnlyFn = diffOnly ? notSameVersion : () => true;
    return (data) => {
        return Object.entries(data.reduce(groupBy('application'), {}))
            .filter(diffOnlyFn)
            .map(([app, environments]) => {
                return { [app]: environments.reduce(groupBy('environment'), {}) }
            })
            .reduce(mergeToObject, {});
    }
}

function printApplicationTableFor(envs) {
    return (data) => {
        const tableRows = Object.entries(data)
            .map(([app, environments]) => {
                return [
                    app,
                    ...(envs.map((env) => environments[env][0].version))
                ];
            });

        let table = new Table({
            head: [
                chalk.white.bold('Application'),
                ...(envs.map((env) => chalk.white.bold(env)))
            ]
        });
        table.push(...tableRows);
        logging.pure(table.toString());
        logging.spacer(2);

        return data;
    };
}

function getVersions(query, envs, diffOnly = false) {
    return fetch('https://vera.adeo.no/api/v1/deploylog?onlyLatest=true&filterUndeployed=true')
        .then((resp) => resp.json())
        .then((deployments) => deployments
            .filter((deployment) => deployment.application.includes(query))
            .filter((deployment) => envs.includes(deployment.environment)))
        .then(groupApplication(diffOnly));
}

function settled(...promises) {
    let counter = promises.length;
    let result = new Array(counter);
    return new Promise((resolve, reject) => {
        promises.forEach((promise, index) => {
            promise
                .then((res) => {
                    counter--;
                    result[index] = { ok: true, data: res };
                    if (counter === 0) {
                        resolve(result);
                    }
                }, (err) => {
                    counter--;
                    result[index] = { ok: false, data: err };
                    if (counter === 0) {
                        resolve(result);
                    }
                });
        })
    });
}

module.exports = {
    settled,
    getVersions,
    groupApplication,
    printApplicationTableFor
};