const logging = require('./../utils/logging');
const { basename } = require('path');
const { getGitRoot, hasLocalChanges } = require('./../utils/gitutils');

process.on('message', ({ dirname, path }) => {
    logging.info(`Checking ${dirname}`);
    process.chdir(path);
    const isGitroot = getGitRoot() !== false;

    if (isGitroot) {
        process.send({ dirname, path, changes: hasLocalChanges() });
    } else {
        process.send({ dirname, path, changes: false });
    }
});