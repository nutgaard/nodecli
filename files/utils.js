const fs = require('fs');
const path = require('path');
const fuzzysearch = require('fuzzysearch');

const defaultOptions = {
    exclusions: ['node_modules', '.'],
    maxDepth: 10
};

function getFiles(dir, filter, opts = {}) {
    const basename = path.basename(dir);
    const workingOpts = Object.assign({}, { depth: 0 },  opts, defaultOptions);

    if (workingOpts.depth > workingOpts.maxDepth) {
        return [];
    }
    if (workingOpts.exclusions.find((exclusion) => basename.startsWith(exclusion))) {
        return [];
    }

    const isDirectory = fs.lstatSync(dir).isDirectory();
    if (!isDirectory) {
        return [ dir ];
    }

    let newOpts = Object.assign({}, workingOpts, { depth: workingOpts.depth + 1 });

    let allFiles = fs.readdirSync(dir)
        .map((file) => path.join(dir, file))
        .map((file) => getFiles(file, filter, newOpts))
        .reduce((acc, files) => [...acc, ...files], []);

    if (filter) {
        return allFiles
            .filter((file) => fuzzysearch(filter, file));
    }
    return allFiles;
}

function getContent(file) {
    return fs.readFileSync(file, 'utf-8');
}

module.exports = {
    getFiles,
    getContent
};