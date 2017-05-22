const fetch = require('node-fetch');
const chalk = require('chalk');

global.debug = false;

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

function format(data) {
    return Object.entries(
        data.reduce(groupBy('application'), {})
    )
        .filter(notSameVersion)
        .map(([app, environments]) => {
            return { [app]: environments.reduce(groupBy('environment'), {}) }
        })
        .reduce(mergeToObject, {});
}
function getDiff(query, env1, env2) {
    return fetch('https://vera.adeo.no/api/v1/deploylog?onlyLatest=true&filterUndeployed=true')
        .then((resp) => resp.json())
        .then((deployments) => deployments
            .filter((deployment) => deployment.application.includes(query))
            .filter((deployment) => deployment.environment === env1 || deployment.environment === env2)
        ).then(format)
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

function debug(msg, ...extra) {
    global.debug && console.log(`${chalk.white('[INFO]')} ${msg}`, ...extra)
}

function info(msg, ...extra) {
    console.log(`${chalk.white('[INFO]')} ${msg}`, ...extra)
}

function error(msg, ...extra) {
    console.log(`${chalk.red('[ERROR]')} ${msg}`, ...extra)
}

module.exports = {
    getDiff,
    info,
    error,
    debug,
    settled
};