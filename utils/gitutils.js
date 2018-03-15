const path = require('path');
const execa = require('execa');
const fetchJson = require('./fetch').fetchJson;

function exec(str) {
    return execa.shellSync(str)
        .stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
}

function max(...args) {
    return args
        .reduce((a, b) => Math.max(a, b), Number.MIN_SAFE_INTEGER);
}

function getGitRoot() {
    try {
        return execa.shellSync('git rev-parse --show-toplevel').stdout;
    } catch (e) {
        return false;
    }
}

function getOrigin() {
    const remoteOrigin = exec('git remote -v')
        .find((line) => line.startsWith('origin') && line.endsWith('(push)'));

    if (!remoteOrigin) {
        throw new Error('Could not find remote origin...');
    }

    const isGithub = remoteOrigin.includes('github.com');
    const isStash = remoteOrigin.includes('stash.devillo.no');

    const remoteFragments = remoteOrigin.split(/[/.]/);
    const repo = remoteFragments[remoteFragments.length - 2];

    if (isGithub) {
        return { isGithub, isStash, repo };
    } else if (isStash) {
        const project = remoteFragments[remoteFragments.length - 3];
        return { isGithub, isStash, repo, project };
    }
}

function getPRUrl(fromBranch) {
    const origin = getOrigin();

    if (origin.isGithub) {
        return Promise.resolve(`https://github.com/navikt/${origin.repo}/compare/${fromBranch}?expand=1`);
    } else {
        return fetchJson(`http://stash.devillo.no/rest/api/1.0/projects/${origin.project}/repos/${origin.repo}/pull-requests`)
            .then((json) => {
                const openPr = json.values
                    .find((pr) => pr.fromRef.displayId === fromBranch);

                if (openPr) {
                    return `http://stash.devillo.no/projects/${origin.project}/repos/${origin.repo}/pull-requests/${openPr.id}/overview`;
                } else {
                    return `http://stash.devillo.no/projects/${origin.project}/repos/${origin.repo}/pull-requests?create&sourceBranch=refs%2Fheads%2F${fromBranch}&targetBranch=refs%2Fheads%2Fmaster`;
                }
            });
    }
}

function hasLocalChanges() {
    const diff = exec('git diff --name-only').length;
    const diffcache = exec('git diff --cached --name-only').length;
    const untracked = exec('git ls-files --exclude-standard --other').length;

    const changes = max(diff, diffcache, untracked);
    if (changes > 0) {
        return { diff, diffcache, untracked };
    }
    return false;
}

function getAppname() {
    return path.basename(getGitRoot());
}

module.exports = {
    hasLocalChanges,
    getOrigin,
    getGitRoot,
    getAppname,
    getPRUrl
};