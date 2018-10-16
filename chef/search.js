const path = require('path');
const homedir = require('os').homedir();
const minimatch = require('minimatch');

const Command = require('./../utils/cliutils').Command;
const Log = require('./../utils/logging');
const FileUtils = require('./../utils/fileutils');

function search(query) {
    const queryRegex = new RegExp(`\\s[":,]*?([^\\s":,]*${query}[^\\s":,]*)[":,]*?\\s`);
    return (file) => {
        return FileUtils.getContent(file, true)
            .then((content) => {
                const match = queryRegex.exec(content);
                if (match) {
                    return match[1];
                }
                return null;
            });
    }
}
function joinResult(results) {
    return Array.from(new Set(results.filter((result) => !!result)));
}

module.exports = class SearchCommand extends Command {
    execute(query) {
        const filter = (file) => minimatch(file, "**/data_bags/artifacts*/*.json") || minimatch(file, '**/data_bags/artifacts_openshift_sikkersone_dev/*.json');
        const files = FileUtils.getFiles(path.join(homedir, 'code', 'chef'), filter);

        Promise.all(files.map(search(query)))
            .then(joinResult)
            .then((result) => {
                const l = Log.info(`Found ${result} matches`);
                Log.line(l);
                result.forEach((r) => Log.pure(`\t${r}`));
                Log.spacer(2)
            });

    }

    help() {
        return {
            args: '<query>',
            msg: "Searches for an artifact/appname in all chef-configs"
        };
    }
};