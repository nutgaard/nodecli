#!node
const fetch = require('node-fetch');
const logging = require('./../utils/logging');
const appname = (() => {
    const appnameArg = process.argv[2];
    if (!appnameArg || appnameArg === '.') {
        try {
            return require("../utils/gitutils").getAppname();
        } catch (e) {
            return undefined;
        }
    }
    return appnameArg;
})();

if (!appname) {
    logging.error('Must be in an git-folder.');
    process.exit(1);
}

const origin = require("../utils/gitutils").getOrigin();
if (!origin.isGithub) {
    logging.error('Repository must be hosted on github.');
    process.exit(1);
}

const deploymentsUrl = `https://api.github.com/repos/${origin.project}/${origin.repo}/deployments`;
(async () => {
    try {
        const response = await fetch(deploymentsUrl);
        const json = await response.json();
        console.log('gh-diff', json);
    } catch (e) {
        logging.error(e);
    }
    // https://api.github.com/repos/navikt/henvendelse-les/deployments
})();

