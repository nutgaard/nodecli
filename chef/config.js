const jsonMap = require('json-source-map');
const Command = require('./../utils/cliutils').Command;
const Log = require('./../utils/logging');
const ChefUtils = require('./utils');
const configmapResolver = require('./configmap-resolver');
const FileUtils = require('./../utils/fileutils');

function search(query, env) {
    return (file) => {
        return FileUtils.getContent(file, true)
            .then((content) => {
                const {data, pointers} = jsonMap.parse(content);
                const searcher = isOpenshiftJson(data) ? searchOpenshiftConfig : searchTomcatConfig;
                return searcher(file, query, env, data, pointers);
            });
    };
}

function searchOpenshiftConfig(file, query, env, data, pointers) {
    const appConfigs = data.environments[env].artifacts;
    const apps = Object.keys(appConfigs).filter((appName) => appName.includes(query));

    return apps
        .map((app) => appConfigs[app]);
}

function searchTomcatConfig(file, query, env, data, pointers) {
    const artifacts = data[env].cluster_artifacts
        .map((cluster, clusterIdx) => {
            return cluster.artifacts
                .map((artifact, artifactIdx) => ({
                    artifact,
                    artifactIdx,
                    clusterIdx
                }))
        })
        .reduce((a, b) => a.concat(b));

    return artifacts
        .filter((artifactConfig) => artifactConfig.artifact.artifact_id.includes(query))
        .map((artifactConfig) => artifactConfig.artifact)
}

function isOpenshiftJson(json) {
    return !!json.environments;
}

function joinResult(results) {
    return results
        .reduce((a, b) => a.concat(b))
        .filter((res) => !!res);
}

module.exports = class ConfigCommand extends Command {
    execute(query, env = 'test') {
        const files = env === 'prod' ? ChefUtils.getProdArtifactFiles() : ChefUtils.getQAArtifactFiles();

        Promise.all(files.map(search(query, env)))
            .then(joinResult)
            .then((res) => {
                const result = res[0];
                const config = configmapResolver(env, result.config.config_map);

                Log.table(config, {
                    value(str) {
                        if (str.length > 120) {
                            return `${str.substr(0, 117)}...`;
                        }
                        return str;
                    }
                });

                Log.pure(`Config for ${result.artifact_final_name} in ${env}`);
                Log.spacer();
                Log.collector.flush();
                Log.spacer();
            })
    }

    help() {
        return {
            args: '<query>',
            msg: "Searches for an artifact/appname in all chef-configs"
        };
    }
};