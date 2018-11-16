const fs = require('fs');
const path = require('path');
const fuzzysearch = require('fuzzysearch');
const GeneratorUtils = require('./generator-utils');

const defaultOptions = {
    exclusions: ['node_modules', '.'],
    maxDepth: 10
};

function filterFn(filter) {
    if (typeof filter === 'string') {
        return (file) => fuzzysearch(filter, file);
    }
    return filter;
}

function getFiles(dir, filter, opts = {}) {
    const basename = path.basename(dir);
    const workingOpts = Object.assign({}, { depth: 0 }, opts, defaultOptions);

    if (workingOpts.depth > workingOpts.maxDepth) {
        return [];
    }
    if (workingOpts.exclusions.find((exclusion) => basename.startsWith(exclusion))) {
        return [];
    }

    const isDirectory = fs.lstatSync(dir).isDirectory();
    if (!isDirectory) {
        return [dir];
    }

    let newOpts = Object.assign({}, workingOpts, { depth: workingOpts.depth + 1 });

    let allFiles = fs.readdirSync(dir)
        .map((file) => path.join(dir, file))
        .map((file) => getFiles(file, filter, newOpts))
        .reduce((acc, files) => [...acc, ...files], []);

    if (filter) {
        return allFiles
            .filter(filterFn(filter));
    }
    return allFiles;
}

function getContent(file, async = false) {
    if (async) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }
    return fs.readFileSync(file, 'utf-8');
}

function getLineCount(file, async = true) {
    if (async) {
        return new Promise((resolve, reject) => {
            let lineCount = 0;
            fs.createReadStream(file)
                .on('data', (buffer) => {
                    let idx = -1;
                    lineCount--;
                    do {
                        idx = buffer.indexOf(10, idx + 1);
                        lineCount++;
                    } while (idx !== -1);
                })
                .on('end', () => {
                    resolve(lineCount);
                })
                .on('error', reject);
        });
    }

    return getContent(file).split('\n').length;
}

function getContentReader(file) {
    const lines = getContent(file)
        .split('\n')
        .map((line) => line.trim());
    return GeneratorUtils.ofArray(lines);
}

function writeContent(file, ...content) {
    fs.writeFileSync(file, content.join('\n'), 'utf-8');
}

function remove(file) {
    try {
        fs.unlinkSync(file)
    } catch (e) {}
}

function createDir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

module.exports = {
    getFiles,
    getContent,
    getLineCount,
    getContentReader,
    writeContent,
    remove,
    createDir
};