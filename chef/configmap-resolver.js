const Log = require('./../utils/logging');
const ChefUtils = require('./utils');
const FileUtils = require('./../utils/fileutils');
const chalk = require('chalk');

const databagCache = { test: {}, qa: {}, prod: {} };
const QADatabags = ChefUtils.getQADatabags();
const ProdDatabags = ChefUtils.getProdDatabags();

function getDatabag(src, env) {
    const filesource = env === 'prod' ? ProdDatabags : QADatabags;

    const cached = databagCache[env][src];
    if (cached) {
        return cached;
    }

    const databag = filesource.filter((file) => file.includes(src));
    if (databag.length !==  1) {
        throw new Error(`Unknown databag: ${src}, found ${databag.length} matches`);
    }

    const content = JSON.parse(FileUtils.getContent(databag[0]));
    Object.keys(content)
        .filter((key) => ['test', 'qa', 'prod'].includes(key))
        .forEach((key) => {
            databagCache[key][src] = {
                content: content[key],
                source: databag[0],
                src,
                env
            };
        });

    return databagCache[env][src];
}

function resolveDatabagValue(env, value) {
    const [ _, databagSrc, ...path ] = value.split('|');
    if (path.length > 1) {
        //console.log('path', value, path); // eslint-disable-line
    }
    const databag = getDatabag(databagSrc, env);

    const index = path[0];
    if (!databag.content) {
        throw new Error(`Could not resolve ${value} in ${env}. Not databag found`);
    }
    const resolved = databag.content[index];

    if (!resolved) {
        Log.collector.error(`Missing value: ${index}`);
        return chalk.red('Not found');
    }
    return resolved;
}

function resolve(env, configMap) {
    return configMap
        .map((entry) => {
            const splitPoint = entry.indexOf("=");
            const key = entry.substr(0, splitPoint);
            const valueStr = entry.substr(splitPoint + 1);

            let value = 'ERROR NOT FOUND';

            if (valueStr.endsWith('.properties')) {
                Log.collector.warn(`Found unsupported value, reference to file: ${valueStr}`);
                value = chalk.yellow(valueStr);
            } else if (valueStr.startsWith("databag")) {
                value = resolveDatabagValue(env, valueStr);
            } else if (valueStr.startsWith("vault")) {
                if (!valueStr.startsWith("vault|krypterte_passord")) {
                    Log.collector.error("Unrecognized vault-space: ", valueStr)
                }
                value = '**********';
            } else if (valueStr.startsWith('chef_cert')) {
                value = '**********';
            } else {
                value = valueStr;
            }

            return { key, value };

        });
}

module.exports = resolve;