const path = require('path');
const homedir = require('os').homedir();
const minimatch = require('minimatch');
const FileUtils = require('./../utils/fileutils');
const JsonUtils = require('./../utils/jsonutils');

function and(predicate1, predicate2) {
    return (...args) => predicate1(...args) && predicate2(...args);
}

function getQAArtifactFiles() {
    const filter = (file) => minimatch(file, "**/data_bags/artifacts*/*.json") || minimatch(file, '**/data_bags/artifacts_openshift_sikkersone_dev/*.json');
    return FileUtils.getFiles(getChefPath(), and(filter, (file) => !file.includes('_prod')));
}

function getProdArtifactFiles() {
    const filter = (file) => minimatch(file, "**/data_bags/artifacts*/*_prod.json") || minimatch(file, '**/data_bags/artifacts_openshift_sikkersone_prod/*.json');
    return FileUtils.getFiles(getChefPath(), filter);
}

function getAllArtifactFiles() {
    return getQAArtifactFiles().concat(getProdArtifactFiles());
}

function search(query) {
    const queryRegex = new RegExp(`\\s[":,]*?([^\\s":,]*${query}[^\\s":,]*)[":,]*?\\s`);
    return (file) => {
        return FileUtils.getContent(file, true)
            .then((content) => {
                const match = queryRegex.exec(content);
                if (match) {
                    const expanded = match[0];
                    const upIncludingMatch = content.substring(0, match.index + expanded.length);
                    return [{ file, key: match[1] }];
                }
                return [];
            });
    }
}
function search2(query) {
    return (file)  => {
        return [];
        return FileUtils.getContent(file, true)
            .then((content) => JsonUtils.searchJsonKeys(content, query))
            .then((keys) => keys.map((key) => ({file, key})))
            .then((pairs) => {
                const set = {};
                pairs.forEach((pair) => {
                    set[JSON.stringify(pair)] = pair;
                });
                return Object.keys(set).map((key) => set[key]);
            });
    };
}

function getChefPath() {
    return path.join(homedir, 'code', 'chef');
}

module.exports = {
    getQAArtifactFiles,
    getProdArtifactFiles,
    getAllArtifactFiles,
    search,
    search2,
    getChefPath
};