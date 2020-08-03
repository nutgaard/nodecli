const open = require('open');
const getOrigin = require('./../utils/gitutils').getOrigin;
const logging = require('./../utils/logging');

module.exports = function (query) {
    if (!query || query === '.') {
        const origin = getOrigin();
        if (origin.isStash) {
            logging.error('Repository on internal stash is not supported.');
            process.exit(1);
        } else if (origin.isGithub) {
            open(`https://github.com/${origin.project}/${origin.repo}`);
        } else {
            throw new Error("Could not find origin: " + JSON.stringify(origin, null, 2));
        }
    }
};
