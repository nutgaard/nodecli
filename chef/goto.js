const jsonMap = require('json-source-map');
const path = require('path');
const execa = require('execa');
const Command = require('./../utils/cliutils').Command;
const Log = require('./../utils/logging');
const ChefUtils = require('./utils');
const FileUtils = require('./../utils/fileutils');

function isOpenshiftJson(json) {
    return !!json.environments;
}

function searchOpenshiftConfig(file, query, env, data, pointers) {
    const appConfigs = data.environments[env].artifacts;
    const apps = Object.keys(appConfigs).filter((appName) => appName.includes(query));

    return apps.map((app) => {
        const jsonPointer = `/environments/${env}/artifacts/${app}`;
        const line = pointers[jsonPointer].key.line;

        return {
            file,
            line,
            app
        };
    });
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


    const apps = artifacts.filter((artifactConfig) => artifactConfig.artifact.artifact_id.includes(query));

    return apps.map((app) => {
        const jsonPointer = `/${env}/cluster_artifacts/${app.clusterIdx}/artifacts/${app.artifactIdx}/artifact_id`;
        const line = pointers[jsonPointer].key.line;

        return {
            file,
            line,
            app: app.artifact.artifact_id
        };
    });
}

function search(query, env) {
    return (file) => {
        return FileUtils.getContent(file, true)
            .then((content) => {
                const {data, pointers} = jsonMap.parse(content);
                const searcher = isOpenshiftJson(data) ? searchOpenshiftConfig : searchTomcatConfig;
                return searcher(file, query, env, data, pointers);
            })
    };
}

function joinResult(results) {
    return results
        .reduce((a, b) => a.concat(b))
        .filter((res) => !!res);
}

module.exports = class GotoCommand extends Command {
    execute(query, env = 'test') {
        const files = ChefUtils.getQAArtifactFiles();


        Promise.all(files.map(search(query, env)))
            .then(joinResult)
            .then((result) => {
                Log.pure(`Found ${result.length} matches`);
                Log.table(result, { file(name) { return path.basename(name); } });
                Log.spacer(2);

                Log.pure("...TESTING...");
                Log.pure("Starting first");
                const first = result[0];
                console.log('first', first); // eslint-disable-line

                execa('idea', [
                    ChefUtils.getChefPath(),
                    `${first.file}:${first.line + 1}`
                ]);
            });
    }

    help() {
        return {
            args: '<query>',
            msg: "Searches for an artifact/appname in all chef-configs, and opens it in idea"
        };
    }
}